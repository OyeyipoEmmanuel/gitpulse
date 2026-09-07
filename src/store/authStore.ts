import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js"
import { create } from "zustand"
import { supabase } from "../lib/supabase"
import { saveProviderToken, getProviderToken, TokenPersistenceError } from "../lib/tokenStore"
import { validateGithubToken } from "../lib/validateGithubToken"
import { GitHubReconnectError } from "../lib/authErrors"
import { queryClient } from "../lib/queryClient"

interface AuthState {
  user: User | null
  session: Session | null
  providerToken: string | null
  tokenStatus: "idle" | "loading" | "ready" | "reconnect" | "error"
  loading: boolean
  signingOut: boolean
  authError: string | null
  tokenError: string | null
  tokenWarning: string | null
  savingToken: boolean
  revision: number
  initialize: () => () => void
  getToken: () => Promise<string | null>
  retryTokenRecovery: () => Promise<void>
  retryTokenPersistence: () => Promise<void>
  dismissTokenWarning: () => void
  invalidateProviderToken: (token: string) => void
  signOut: () => Promise<void>
}

export function createAuthStore() {
  return create<AuthState>((set, get) => {
    let generation = 0
    let pendingProviderToken: string | null = null
    let rejectedToken: string | null = null
    let recovery: Promise<string | null> | null = null
    let controller = new AbortController()

    const resetRequests = () => {
      generation++
      controller.abort()
      controller = new AbortController()
      recovery = null
    }

    const acceptSession = (event: AuthChangeEvent, session: Session | null) => {
      // Focus/token-refresh events must not reopen the account during logout.
      if (get().signingOut && session?.user.id === get().user?.id) return
      const changedUser = get().user?.id !== session?.user.id
      const incoming = event === "SIGNED_IN" || event === "INITIAL_SESSION" ? session?.provider_token : null
      const freshToken = incoming && (changedUser || incoming !== rejectedToken) && incoming !== get().providerToken && incoming !== pendingProviderToken
      if (changedUser || !session || freshToken) {
        resetRequests()
        if (changedUser || !session) rejectedToken = null
        pendingProviderToken = freshToken ? incoming : null
        set({
          session, user: session?.user ?? null, providerToken: null,
          tokenStatus: session ? "loading" : "idle", loading: false, signingOut: false,
          authError: null, tokenError: null, tokenWarning: null, savingToken: false, revision: generation,
        })
        queryClient.clear()
      } else {
        set({ session, user: session?.user ?? null, loading: false, authError: null })
      }
      if (session && !get().signingOut && ["idle", "loading"].includes(get().tokenStatus)) {
        const current = generation
        // Auth events hold Supabase's auth lock. Start database work after it releases.
        setTimeout(() => {
          if (current === generation) void get().getToken()
        }, 0)
      }
    }

    return {
      user: null, session: null, providerToken: null, tokenStatus: "idle",
      loading: true, signingOut: false, authError: null, tokenError: null,
      tokenWarning: null, revision: 0,
      savingToken: false,

      initialize: () => {
        let active = true
        let receivedEvent = false
        const initialGeneration = generation
        // Remove only our obsolete duplicate persisted state, never all storage.
        try { globalThis.localStorage?.removeItem("auth-store") } catch { /* Storage may be blocked. */ }
        const timeout = setTimeout(() => {
          if (active && get().loading) set({ loading: false, authError: "Session recovery timed out. Please reload or sign in again." })
        }, 15000)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (!active) return
          receivedEvent = true
          clearTimeout(timeout)
          acceptSession(event, session)
        })
        void supabase.auth.getSession().then(({ data, error }) => {
          if (!active || receivedEvent || generation !== initialGeneration) return
          clearTimeout(timeout)
          if (error) set({ loading: false, authError: "Your session could not be restored. Please sign in again." })
          else acceptSession("INITIAL_SESSION", data.session)
        }).catch(() => {
          if (active && !receivedEvent && generation === initialGeneration) {
            clearTimeout(timeout)
            set({ loading: false, authError: "Your session could not be restored. Please sign in again." })
          }
        })
        return () => {
          active = false
          clearTimeout(timeout)
          subscription.unsubscribe()
          resetRequests()
        }
      },

      getToken: async () => {
        const { user, session, providerToken, signingOut, tokenStatus } = get()
        if (!user || !session || signingOut || tokenStatus === "reconnect") return null
        if (providerToken && tokenStatus === "ready") return providerToken
        if (recovery) return recovery
        const current = generation
        const candidate = pendingProviderToken
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15000)])
        set({ tokenStatus: "loading", tokenError: null })
        recovery = (async () => {
          try {
            const token = candidate ?? await getProviderToken(user.id, signal)
            if (current !== generation) return null
            if (signal.aborted) throw new Error("Token recovery timed out")
            if (!token || token === rejectedToken) throw new GitHubReconnectError()
            await validateGithubToken(token, user, signal)
            if (current !== generation) return null
            if (signal.aborted) throw new Error("Token recovery timed out")
            let warning: string | null = null
            if (candidate) {
              const saveSignal = AbortSignal.any([controller.signal, AbortSignal.timeout(10000)])
              try { await saveProviderToken(user.id, token, saveSignal) }
              catch (error) {
                const reference = error instanceof TokenPersistenceError && error.code ? ` (Reference: ${error.code})` : ""
                warning = `Your GitHub connection could not be saved. You may need to reconnect after reloading.${reference}`
                if (import.meta.env.DEV && error instanceof TokenPersistenceError) {
                  console.error("GitHub token persistence failed", {
                    code: error.code,
                    message: error.databaseMessage,
                    details: error.details,
                    hint: error.hint,
                  })
                }
              }
            }
            if (current !== generation) return null
            pendingProviderToken = null
            set({ providerToken: token, tokenStatus: "ready", tokenError: null, tokenWarning: warning })
            return token
          } catch (error) {
            if (current !== generation) return null
            if (error instanceof GitHubReconnectError) {
              rejectedToken = candidate
              pendingProviderToken = null
            }
            set({
              providerToken: null,
              tokenStatus: error instanceof GitHubReconnectError ? "reconnect" : "error",
              tokenError: error instanceof GitHubReconnectError ? error.message : "Your GitHub connection could not be restored. Check your connection and try again.",
            })
            return null
          } finally {
            if (current === generation) recovery = null
          }
        })()
        return recovery
      },

      retryTokenRecovery: async () => {
        if (get().tokenStatus !== "error") return
        await get().getToken()
      },

      retryTokenPersistence: async () => {
        const { user, providerToken, tokenStatus, signingOut } = get()
        if (!user || !providerToken || tokenStatus !== "ready" || signingOut || get().savingToken) return
        const current = generation
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10000)])
        set({ savingToken: true })
        try {
          await saveProviderToken(user.id, providerToken, signal)
          if (current === generation) set({ tokenWarning: null })
        } catch (error) {
          if (current !== generation) return
          const reference = error instanceof TokenPersistenceError && error.code ? ` (Reference: ${error.code})` : ""
          set({ tokenWarning: `Your GitHub connection could not be saved. You may need to reconnect after reloading.${reference}` })
          if (import.meta.env.DEV && error instanceof TokenPersistenceError) {
            console.error("GitHub token persistence retry failed", {
              code: error.code,
              message: error.databaseMessage,
              details: error.details,
              hint: error.hint,
            })
          }
        } finally {
          if (current === generation) set({ savingToken: false })
        }
      },

      dismissTokenWarning: () => set({ tokenWarning: null }),

      invalidateProviderToken: (token) => {
        if (get().providerToken !== token) return
        resetRequests()
        rejectedToken = token
        pendingProviderToken = null
        set({ providerToken: null, tokenStatus: "reconnect", tokenError: new GitHubReconnectError().message, tokenWarning: null, savingToken: false, revision: generation })
        queryClient.clear()
      },

      signOut: async () => {
        if (get().signingOut) return
        resetRequests()
        const current = generation
        pendingProviderToken = null
        set({ signingOut: true, providerToken: null, tokenStatus: "loading", tokenError: null, tokenWarning: null, savingToken: false, revision: generation })
        queryClient.clear()
        let timeout: ReturnType<typeof setTimeout> | undefined
        try {
          const { error } = await Promise.race([
            supabase.auth.signOut({ scope: "local" }),
            new Promise<never>((_, reject) => {
              timeout = setTimeout(() => reject(new Error("Sign out timed out")), 15000)
            }),
          ])
          if (current !== generation) return
          if (error) throw error
          acceptSession("SIGNED_OUT", null)
        } catch {
          if (current === generation) set({ signingOut: false, tokenStatus: "error", tokenError: "Sign out did not complete. Please try signing out again." })
        } finally {
          clearTimeout(timeout)
        }
      },
    }
  })
}

export const useAuthStore = createAuthStore()

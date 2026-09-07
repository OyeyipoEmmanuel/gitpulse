import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createAuthStore } from "./authStore"
import { queryClient } from "../lib/queryClient"
import { GitHubReconnectError } from "../lib/authErrors"

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(), onAuthStateChange: vi.fn(), signOut: vi.fn(),
  read: vi.fn(), save: vi.fn(), validate: vi.fn(),
}))
vi.mock("../lib/supabase", () => ({ supabase: { auth: mocks } }))
vi.mock("../lib/tokenStore", () => ({ getProviderToken: mocks.read, saveProviderToken: mocks.save }))
vi.mock("../lib/validateGithubToken", () => ({ validateGithubToken: mocks.validate }))

function session(id = "user-a", providerToken?: string): Session {
  return {
    access_token: "test-session", refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600,
    provider_token: providerToken,
    user: { id, aud: "authenticated", app_metadata: { provider: "github" }, user_metadata: { user_name: id }, created_at: "2026-01-01" },
  }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(value => { resolve = value })
  return { promise, resolve }
}

describe("auth lifecycle", () => {
  let store: ReturnType<typeof createAuthStore>
  let emit: (event: AuthChangeEvent, value: Session | null) => void
  let cleanup: () => void
  const unsubscribe = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mocks.getSession.mockReturnValue(new Promise(() => {}))
    mocks.onAuthStateChange.mockImplementation(callback => {
      emit = callback
      return { data: { subscription: { unsubscribe } } }
    })
    mocks.read.mockResolvedValue("stored-token")
    mocks.save.mockResolvedValue(undefined)
    mocks.validate.mockResolvedValue(undefined)
    mocks.signOut.mockResolvedValue({ error: null })
    queryClient.clear()
    store = createAuthStore()
    cleanup = store.getState().initialize()
  })

  afterEach(() => {
    cleanup()
    queryClient.clear()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it("defers Supabase calls outside the synchronous auth callback", async () => {
    expect(emit("SIGNED_IN", session("user-a", "new-token"))).toBeUndefined()
    expect(mocks.save).not.toHaveBeenCalled()
    expect(mocks.validate).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.validate).toHaveBeenCalledWith("new-token", session().user, expect.any(AbortSignal))
    expect(mocks.save).toHaveBeenCalledWith("user-a", "new-token", expect.any(AbortSignal))
    expect(store.getState()).toMatchObject({ tokenStatus: "ready", providerToken: "new-token" })
  })

  it("recovers and validates a saved token even when no token is in memory", async () => {
    emit("INITIAL_SESSION", session())
    expect(store.getState().providerToken).toBeNull()
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.read).toHaveBeenCalledWith("user-a", expect.any(AbortSignal))
    expect(mocks.validate).toHaveBeenCalledWith("stored-token", session().user, expect.any(AbortSignal))
    expect(store.getState().tokenStatus).toBe("ready")
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it("coalesces concurrent token recovery requests", async () => {
    const read = deferred<string>()
    mocks.read.mockReturnValue(read.promise)
    emit("INITIAL_SESSION", session())
    const first = store.getState().getToken()
    const second = store.getState().getToken()
    read.resolve("stored-token")
    await expect(first).resolves.toBe("stored-token")
    await expect(second).resolves.toBe("stored-token")
    expect(mocks.read).toHaveBeenCalledTimes(1)
  })

  it("shows reconnect when the saved token row is absent", async () => {
    mocks.read.mockResolvedValue(null)
    emit("INITIAL_SESSION", session())
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState()).toMatchObject({ loading: false, tokenStatus: "reconnect", providerToken: null })
    await expect(store.getState().getToken()).resolves.toBeNull()
    expect(mocks.read).toHaveBeenCalledTimes(1)
  })

  it("shows a retryable error for database failures, not a reconnect requirement", async () => {
    mocks.read.mockRejectedValueOnce(new Error("network"))
    emit("INITIAL_SESSION", session())
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState().tokenStatus).toBe("error")
    await store.getState().retryTokenRecovery()
    expect(store.getState().tokenStatus).toBe("ready")
  })

  it("rejects revoked or wrong-account tokens before saving them", async () => {
    mocks.validate.mockRejectedValue(new GitHubReconnectError())
    emit("SIGNED_IN", session("user-a", "wrong-token"))
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState().tokenStatus).toBe("reconnect")
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it("allows a validated fresh token with a visible persistence warning", async () => {
    mocks.save.mockRejectedValue(new Error("write denied"))
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState()).toMatchObject({ tokenStatus: "ready", providerToken: "new-token" })
    expect(store.getState().tokenWarning).toContain("could not be saved")
  })

  it("does not revalidate or rewrite a ready token on repeated sign-in/refresh events", async () => {
    const value = session("user-a", "new-token")
    emit("SIGNED_IN", value)
    await vi.advanceTimersByTimeAsync(0)
    emit("SIGNED_IN", value)
    emit("TOKEN_REFRESHED", session())
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.validate).toHaveBeenCalledTimes(1)
    expect(mocks.save).toHaveBeenCalledTimes(1)
    expect(store.getState().providerToken).toBe("new-token")
  })

  it("clears token and query data immediately on sign out", async () => {
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    queryClient.setQueryData(["private"], "user-a-data")
    const signOut = store.getState().signOut()
    expect(store.getState().providerToken).toBeNull()
    expect(queryClient.getQueryData(["private"])).toBeUndefined()
    await signOut
    expect(mocks.signOut).toHaveBeenCalledWith({ scope: "local" })
    expect(store.getState()).toMatchObject({ user: null, session: null, tokenStatus: "idle", signingOut: false })
  })

  it("clears state when Supabase broadcasts sign out from another tab", async () => {
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    queryClient.setQueryData(["private"], "user-a-data")
    emit("SIGNED_OUT", null)
    expect(store.getState()).toMatchObject({ user: null, providerToken: null })
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
  })

  it("reports sign-out failure without claiming the session is gone", async () => {
    mocks.signOut.mockResolvedValue({ error: new Error("network") })
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    await store.getState().signOut()
    expect(store.getState()).toMatchObject({ providerToken: null, signingOut: false, tokenStatus: "error" })
    expect(store.getState().session).not.toBeNull()
    expect(store.getState().tokenError).toContain("Sign out did not complete")
  })

  it("does not hang or let repeated sign-in events reopen a pending logout", async () => {
    mocks.signOut.mockReturnValue(new Promise(() => {}))
    const value = session("user-a", "new-token")
    emit("SIGNED_IN", value)
    await vi.advanceTimersByTimeAsync(0)
    const result = store.getState().signOut()
    emit("SIGNED_IN", value)
    expect(store.getState().signingOut).toBe(true)
    await vi.advanceTimersByTimeAsync(15000)
    await result
    expect(store.getState()).toMatchObject({ signingOut: false, tokenStatus: "error", providerToken: null })
  })

  it("isolates a new account from cached data and late token recovery", async () => {
    const old = deferred<string>()
    mocks.read.mockReturnValueOnce(old.promise)
    emit("INITIAL_SESSION", session())
    const oldRequest = store.getState().getToken()
    queryClient.setQueryData(["private"], "user-a-data")
    emit("SIGNED_IN", session("user-b", "b-token"))
    expect(queryClient.getQueryData(["private"])).toBeUndefined()
    await vi.advanceTimersByTimeAsync(0)
    old.resolve("a-token")
    await expect(oldRequest).resolves.toBeNull()
    expect(store.getState().providerToken).toBe("b-token")
    expect(store.getState().user?.id).toBe("user-b")
  })

  it("does not resurrect a token when recovery finishes after logout", async () => {
    const old = deferred<string>()
    mocks.read.mockReturnValue(old.promise)
    emit("INITIAL_SESSION", session())
    const oldRequest = store.getState().getToken()
    await store.getState().signOut()
    old.resolve("a-token")
    await expect(oldRequest).resolves.toBeNull()
    expect(store.getState().providerToken).toBeNull()
    expect(mocks.validate).not.toHaveBeenCalled()
  })

  it("does not repopulate query cache from a response completed after logout", async () => {
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    const pending = deferred<string>()
    const request = queryClient.fetchQuery({ queryKey: ["private"], queryFn: () => pending.promise }).catch(() => undefined)
    await store.getState().signOut()
    pending.resolve("old private data")
    await request
    expect(queryClient.getQueryData(["private"])).toBeUndefined()
  })

  it("ignores token validation completed after logout", async () => {
    const validation = deferred<void>()
    mocks.validate.mockReturnValueOnce(validation.promise)
    emit("SIGNED_IN", session("user-a", "a-token"))
    const request = store.getState().getToken()
    await store.getState().signOut()
    validation.resolve(undefined)
    await expect(request).resolves.toBeNull()
    expect(mocks.save).not.toHaveBeenCalled()
    expect(store.getState().providerToken).toBeNull()
  })

  it("recovers from getSession when the initial auth event has not arrived", async () => {
    cleanup()
    mocks.getSession.mockResolvedValueOnce({ data: { session: session("user-a", "a-token") }, error: null })
    cleanup = store.getState().initialize()
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState()).toMatchObject({ loading: false, providerToken: "a-token", tokenStatus: "ready" })
  })

  it("reports getSession failure and stops loading", async () => {
    cleanup()
    mocks.getSession.mockRejectedValueOnce(new Error("unavailable"))
    cleanup = store.getState().initialize()
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState().loading).toBe(false)
    expect(store.getState().authError).toContain("could not be restored")
  })

  it("invalidates only the current token and requires explicit reconnect", async () => {
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    store.getState().invalidateProviderToken("old-token")
    expect(store.getState().tokenStatus).toBe("ready")
    store.getState().invalidateProviderToken("new-token")
    emit("SIGNED_IN", session("user-a", "new-token"))
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState()).toMatchObject({ tokenStatus: "reconnect", providerToken: null })
    emit("SIGNED_IN", session("user-a", "replacement-token"))
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState().providerToken).toBe("replacement-token")
  })

  it("ignores a stale getSession result after a newer auth event", async () => {
    cleanup()
    const old = deferred<{ data: { session: Session }; error: null }>()
    mocks.getSession.mockReturnValueOnce(old.promise)
    cleanup = store.getState().initialize()
    emit("SIGNED_IN", session("user-b", "b-token"))
    old.resolve({ data: { session: session() }, error: null })
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState().user?.id).toBe("user-b")
  })

  it("supports StrictMode setup/cleanup/setup without accepting old work", async () => {
    emit("SIGNED_IN", session("user-a", "a-token"))
    const oldEmit = emit
    cleanup()
    cleanup = store.getState().initialize()
    oldEmit("SIGNED_OUT", null)
    emit("INITIAL_SESSION", session("user-a", "a-token"))
    await vi.advanceTimersByTimeAsync(0)
    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(store.getState().providerToken).toBe("a-token")
    expect(mocks.save).toHaveBeenCalledTimes(1)
  })

  it("stops loading with an actionable error if session initialization stalls", async () => {
    await vi.advanceTimersByTimeAsync(15000)
    expect(store.getState().loading).toBe(false)
    expect(store.getState().authError).toContain("timed out")
  })

  it("removes only legacy auth-store storage and never rehydrates its token", () => {
    cleanup()
    const removeItem = vi.fn()
    vi.stubGlobal("localStorage", { removeItem })
    cleanup = store.getState().initialize()
    expect(removeItem).toHaveBeenCalledExactlyOnceWith("auth-store")
    expect(store.getState().providerToken).toBeNull()
  })
})

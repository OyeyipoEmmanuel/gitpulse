import { Outlet } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { LoadingSpinner } from "../ui/spinner"
import GitHubSignInButton from "./GitHubSignInButton"
import SignOutButton from "./SignOutButton"

export default function GitHubConnectionGate() {
  const { tokenStatus, tokenError, tokenWarning, savingToken, signingOut, revision, user, retryTokenRecovery, retryTokenPersistence, dismissTokenWarning } = useAuthStore()
  if (signingOut || tokenStatus === "idle" || tokenStatus === "loading") {
    return <div role="status" className="min-h-screen bg-[#0D1117] p-8 text-white">
      <LoadingSpinner /><p>{signingOut ? "Signing out…" : "Restoring your GitHub connection…"}</p>
    </div>
  }
  if (tokenStatus !== "ready") {
    return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0D1117] p-6 text-white">
      <h1 className="text-2xl font-semibold">GitHub connection needs attention</h1>
      <p role="alert">{tokenError}</p>
      <div className="flex flex-wrap gap-3">
        {tokenStatus === "error" && <button type="button" className="rounded-lg border px-4 py-2" onClick={() => void retryTokenRecovery()}>Try again</button>}
        <GitHubSignInButton label="Reconnect GitHub" />
        <SignOutButton />
      </div>
    </main>
  }
  return <>
    {tokenWarning && <div role="status" className="flex flex-wrap items-center justify-center gap-3 bg-[#172524] p-3 text-center text-white">
      <p>{tokenWarning}</p>
      <button type="button" disabled={savingToken} onClick={() => void retryTokenPersistence()} className="rounded-md border border-[#3FB950] px-3 py-1 text-sm font-semibold text-[#3FB950] hover:bg-[#238636]/20 disabled:cursor-wait disabled:opacity-60">
        {savingToken ? "Saving…" : "Retry saving"}
      </button>
      <button type="button" onClick={dismissTokenWarning} className="rounded-md px-3 py-1 text-sm text-[#C9D1D9] underline-offset-4 hover:underline">
        Dismiss
      </button>
    </div>}
    <Outlet key={`${user?.id}:${revision}`} />
  </>
}

import { Outlet } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { LoadingSpinner } from "../ui/spinner"
import GitHubSignInButton from "./GitHubSignInButton"
import SignOutButton from "./SignOutButton"

export default function GitHubConnectionGate() {
  const { tokenStatus, tokenError, tokenWarning, signingOut, revision, user, retryTokenRecovery } = useAuthStore()
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
    {tokenWarning && <p role="status" className="bg-[#172524] p-3 text-center text-white">{tokenWarning}</p>}
    <Outlet key={`${user?.id}:${revision}`} />
  </>
}

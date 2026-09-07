import { useState } from "react"
import { signInWithGithub } from "../../auth/signInWithGithub"

export default function GitHubSignInButton({ label = "Login with GitHub" }: { label?: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signIn = async () => {
    setPending(true)
    setError(null)
    try { await signInWithGithub() }
    catch { setError("GitHub sign-in could not be started. Please try again.") }
    finally { setPending(false) }
  }
  return (
    <div>
      <button type="button" onClick={() => void signIn()} disabled={pending}
        className="rounded-lg border border-[#30363D] bg-[#238636] px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Connecting…" : label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}

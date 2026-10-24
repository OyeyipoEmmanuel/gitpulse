import { useState } from "react"
import { ArrowUpRight, Code2 } from "lucide-react"
import { signInWithGithub } from "../../auth/signInWithGithub"
import { Button } from "@/components/ui/button"

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
      <Button type="button" size="lg" onClick={() => void signIn()} disabled={pending}
        className="min-h-11 rounded-xl px-4 shadow-lg shadow-black/30 transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-wait">
        <Code2 aria-hidden="true" className="h-4 w-4" />
        {pending ? "Connecting…" : label}
        {!pending && <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
      </Button>
      {error && <p role="alert" className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}

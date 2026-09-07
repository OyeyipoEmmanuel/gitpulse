import { useAuthStore } from "../../store/authStore"

export default function SignOutButton() {
  const { signOut, signingOut } = useAuthStore()
  return (
    <button type="button" onClick={() => void signOut()} disabled={signingOut}
      className="rounded-lg border border-[#30363D] px-4 py-2 text-white disabled:opacity-50">
      {signingOut ? "Signing out…" : "Logout"}
    </button>
  )
}

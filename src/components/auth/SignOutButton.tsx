import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "../../store/authStore"

export default function SignOutButton() {
  const { signOut, signingOut } = useAuthStore()
  return (
    <Button type="button" variant="outline" onClick={() => void signOut()} disabled={signingOut}>
      <LogOut aria-hidden="true" />
      {signingOut ? "Signing out…" : "Logout"}
    </Button>
  )
}

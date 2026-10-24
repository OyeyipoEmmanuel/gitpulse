import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { accountPath } from "../../auth/accountPath"
import GitHubSignInButton from "../auth/GitHubSignInButton"
import SignOutButton from "../auth/SignOutButton"
import Logo from "../ui/Logo"

export default function TopNav() {
  const { user, authError, tokenError } = useAuthStore()

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-5">
        <Link to="/" aria-label="GitPulse home" className="flex items-center gap-2.5 text-white">
          <Logo width={34} height={34}/>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          <a href="/#product" className="transition-colors hover:text-white">Product</a>
          <a href="/#insights" className="transition-colors hover:text-white">Insights</a>
          <a href="/#workflow" className="transition-colors hover:text-white">How it works</a>
          <a href="/#pricing" className="transition-colors hover:text-white">Pricing</a>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {(authError || tokenError) && <p role="alert" className="text-sm text-red-400">{authError || tokenError}</p>}
          {user ? <><Link className="text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground" to={accountPath(user)}>My accounts</Link><SignOutButton /></> : <GitHubSignInButton label="Connect GitHub" />}
        </div>
      </div>
    </nav>
  )
}

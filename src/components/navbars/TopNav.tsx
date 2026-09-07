
import { Link } from "react-router-dom"
import { useAuthStore } from "../../store/authStore"
import { accountPath } from "../../auth/accountPath"
import GitHubSignInButton from "../auth/GitHubSignInButton"
import SignOutButton from "../auth/SignOutButton"
import Logo from "../ui/Logo";

export default function TopNav() {
  const { user, authError, tokenError } = useAuthStore()

  return (
    <nav className='fixed w-full bg-[#0D1117] z-50 px-4 flex flex-row items-center justify-between border-b border-[#0F1C1A] py-4 '>
      <Logo width={36} height={36}/>

      <div className="flex flex-wrap items-center gap-3">
        {(authError || tokenError) && <p role="alert" className="text-sm text-red-400">{authError || tokenError}</p>}
        {user ? <><Link className="text-white" to={accountPath(user)}>My accounts</Link><SignOutButton /></> : <GitHubSignInButton />}
      </div>
    </nav>
  )
}

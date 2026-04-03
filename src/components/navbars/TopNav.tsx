
import { CircleUserRound } from "lucide-react"
import { signInWithGithub } from "../../auth/signInWithGithub"
import { useAuthStore } from "../../store/authStore"

export default function TopNav() {
    const {user, loading} = useAuthStore()
    if(loading) return;

  return (
    <nav className='fixed w-full bg-[#0D1117] z-50 px-4 flex flex-row items-center justify-between border-b border-[#0F1C1A] py-4 '>
      <div className='flex items-center space-x-1'>
        <img src="/images/logo.svg" alt="GitPulse Logo" width={40} height={40} className="animate-pulse"/>
        <h1 className='text-white text-3xl font-semibold'>
          Git<span className='text-secondaryTextColor'>Pulse</span>
        </h1>
      </div>

      <button className="flex text-white items-center space-x-2 border border-[#30363D] rounded-xl px-6 py-2 cursor-pointer hover:scale-105 transition-all duration-200" onClick={signInWithGithub}>
        <CircleUserRound strokeWidth={2.5} size={26}/>
        <h3 className="text-xl font-">Login</h3>
      </button>
    </nav>
  )
}

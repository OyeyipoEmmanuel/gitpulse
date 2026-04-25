
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const Dashboard = () => {
    const {user, loading} = useAuthStore()
    if(!loading){
        console.log(user?.user_metadata)
    }
  return (
    <main className="flex flex-col min-h-screen bg-[#0D1117]">
      {/* <Sidenav /> */}
      <section className="flex-1">
        <Outlet /> 
      </section>
    </main>
  )
}

export default Dashboard
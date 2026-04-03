
import { useAuthStore } from '../../store/authStore'

const Dashboard = () => {
    const {user, loading} = useAuthStore()
    if(!loading){
        console.log(user?.user_metadata)
    }
  return (
    <div>dashboard</div>
  )
}

export default Dashboard
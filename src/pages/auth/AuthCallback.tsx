import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

//Renders when supabase successfully signs in github
const AuthCallback = () => {
    const navigate = useNavigate()
    const { user, loading } = useAuthStore()




    //Navigates to /dashboard when component mounts
    useEffect(() => {
        if (loading) return; // wait until session is resolved

        if (user) {
            navigate(`/${user.user_metadata.user_name}/select-account`, { replace: true })
        } else {
            // something went wrong, send them back to login
            navigate("/login", { replace: true })
        }
    }, [user, loading])
    return (
        <div>Redirecting....</div>
    )
}

export default AuthCallback
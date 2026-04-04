import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '@/components/ui/spinner'

//Renders when supabase successfully signs in github
const AuthCallback = () => {
    const navigate = useNavigate()
    const { user, loading } = useAuthStore()

    //Navigates to /dashboard when component mounts
    useEffect(() => {
        if (loading) {
            <div className='w-screen h-screen bg-primaryBg'>
                <LoadingSpinner className='text-green-500 w-32 h-32' />
            </div>

            return;
        }; // wait until session is resolved

        if (user) {
            navigate(`/${user.user_metadata.user_name}/select-account`, { replace: true })
        } else {
            // something went wrong, send them back to login
            navigate("/login", { replace: true })
        }
    }, [user, loading])
    return (
        <div className='w-screen h-screen bg-primaryBg'>
            <h1 className='text-4xl'>Redirection..</h1>
            <LoadingSpinner className='bg-green-500 w-32 h-32' />
        </div>
    )
}

export default AuthCallback
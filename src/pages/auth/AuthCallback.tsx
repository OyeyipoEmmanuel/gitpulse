import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '@/components/ui/spinner'
import { accountPath, hasOAuthError } from '@/auth/accountPath'
import GitHubSignInButton from '@/components/auth/GitHubSignInButton'

//Renders when supabase successfully signs in github
const AuthCallback = () => {
    const { search, hash } = useLocation()
    const { user, loading, authError } = useAuthStore()
    if (loading) return <div role="status" aria-label="Completing sign-in" className="min-h-screen pt-32"><LoadingSpinner /></div>
    if (hasOAuthError(search, hash) || authError || !user) {
        return <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-white">
            <h1 className="text-2xl font-semibold">GitHub sign-in was not completed</h1>
            <p role="alert">Please try signing in again. You can also return to the home page.</p>
            <GitHubSignInButton />
            <Link to="/" className="underline">Return home</Link>
        </main>
    }
    return <Navigate to={accountPath(user)} replace />
}

export default AuthCallback

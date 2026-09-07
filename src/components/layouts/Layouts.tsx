import { useAuthStore } from "../../store/authStore";
import TopNav from "../navbars/TopNav";
import { Navigate, Outlet } from "react-router-dom";
import GitHubConnectionGate from "../auth/GitHubConnectionGate";
import { LoadingSpinner } from "../ui/spinner";

//Landing page layout
export default function LandingLayout(){
    return (
        <main className="bg-primaryBg min-h-screen">
            <TopNav/>
            <Outlet/>
        </main>
    )
}

//Protected Route
export const ProtectedRoute = ()=>{
    const {session, loading} = useAuthStore()

    if(loading) return <div role="status" aria-label="Restoring session"><LoadingSpinner /></div>;

    return session ? <GitHubConnectionGate/> : <Navigate to="/" replace/>
}

//Dashboards Routes
//Individual Dashboard Routes

import { useAuthStore } from "../../store/authStore";
import TopNav from "../navbars/TopNav";
import { Navigate, Outlet } from "react-router-dom";

//Landing page layout
export default function LandingLayout(){
    return (
        <main className="bg-primaryBg min-h-screen">
            <TopNav/>
            <Outlet/>
        </main>
    )
}
// xVDYWxG2XwYwZTup

//Protected Route
export const ProtectedRoute = ()=>{
    const {session, loading} = useAuthStore()

    if(loading) return "Loading";

    return session ? <Outlet/> : <Navigate to="/" replace/>
}
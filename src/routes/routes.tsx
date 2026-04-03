import type { RouteObject } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import LandingLayout, { ProtectedRoute } from "../components/layouts/Layouts";
import AuthCallback from "../pages/auth/AuthCallback";
import Dashboard from "../pages/Dashboard/Dashboard";
import SelectAcount from "../pages/SelectAccount/SelectAcount";

export const routes: RouteObject[] = [
    {
        element: <LandingLayout />,
        children: [
            { path: "/", element: <LandingPage /> },
        ]
    },
    {
        path: "/auth/callback",
        element: <AuthCallback />
    },
    {
        element: <ProtectedRoute />,
        children: [
            { path: "/:user_name/select-account", element: <SelectAcount /> },
            { path: "/dashboard", element: <Dashboard /> },
        ]
    }
]
import { Navigate, type RouteObject } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import LandingLayout, { ProtectedRoute } from "../components/layouts/Layouts";
import AuthCallback from "../pages/auth/AuthCallback";
import Dashboard from "../pages/Dashboard/Dashboard";
import SelectAcount from "../pages/SelectAccount/SelectAcount";
import IndividualDashboard from "@/pages/Dashboard/individual/IndividualDashboard";
import OrganizationDashboard from "@/pages/Dashboard/organization/OrganizationDashboard";
import IndividualProfile from "@/pages/Dashboard/individual/pages/IndividualProfile";
import OrgProfile from "@/pages/Dashboard/organization/pages/OrgProfile";
import IndividualRepoIntelligence from "@/pages/Dashboard/individual/pages/IndividualRepoIntelligence";
import IndividualProductivity from "@/pages/Dashboard/individual/pages/IndividualProductivity";

export const routes: RouteObject[] = [
    {
        element: <LandingLayout />,
        children: [
            {
                path: "/",
                element: <LandingPage />
            },
            {
                path: "/auth/callback",
                element: <AuthCallback />
            },
        ]
    },

    {
        element: <ProtectedRoute />,
        children: [

            //Account Selection route
            { path: "/:user_name/select-account", element: <SelectAcount /> },

            //Dashboard routes
            {
                path: "/dashboard",
                element: <Dashboard />,
                children: [
                    {
                        path: "personal/:username",
                        element: <IndividualDashboard />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="profile" replace />
                            },
                            { path: "profile", element: <IndividualProfile /> },
                            { path: "repo-intelligence", element: <IndividualRepoIntelligence /> },
                            { path: "productivity", element: <IndividualProductivity /> },
                            { path: "collaborations", element: <div /> },
                            { path: "impact-summary", element: <div /> },
                            { path: "career-snapshot", element: <div /> },
                        ]
                    },
                    {
                        path: "org/:orgname", element: <OrganizationDashboard />,
                        children: [
                            {
                                index: true,
                                element: <Navigate to="profile" replace />
                            },
                            { path: "profile", element: <OrgProfile /> }
                        ]
                    },
                ]
            },
        ]
    }
]
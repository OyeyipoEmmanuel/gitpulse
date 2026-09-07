import { Suspense, type ReactNode } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import LandingLayout, { ProtectedRoute } from "../components/layouts/Layouts";
import { LoadingSpinner } from "@/components/ui/spinner";
import { AskBob, AuthCallback, Dashboard, IndividualCareerSnapshot, IndividualDashboard, IndividualProductivity, IndividualProfile, IndividualRepoIntelligence, IndividualReportCard, LandingPage, NotFoundPage, OrganizationComingSoon, OrganizationDashboard, RouteErrorPage, SelectAcount } from "./LazyPages";

const load = (page: ReactNode) => <Suspense fallback={<LoadingSpinner label="Loading page" />}>{page}</Suspense>;

export const routes: RouteObject[] = [
    {
        element: <LandingLayout />,
        errorElement: load(<RouteErrorPage />),
        children: [
            {
                path: "/",
                element: load(<LandingPage />)
            },
            {
                path: "/auth/callback",
                element: load(<AuthCallback />)
            },
        ]
    },

    {
        element: <ProtectedRoute />,
        errorElement: load(<RouteErrorPage />),
        children: [

            //Account Selection route
            { path: "/:user_name/select-account", element: load(<SelectAcount />) },

            //Dashboard routes
            {
                path: "/dashboard",
                element: load(<Dashboard />),
                children: [
                    {
                        path: "personal/:username",
                        element: load(<IndividualDashboard />),
                        children: [
                            {
                                index: true,
                                element: <Navigate to="profile" replace />
                            },
                            { path: "profile", element: load(<IndividualProfile />) },
                            { path: "repo-intelligence", element: load(<IndividualRepoIntelligence />) },
                            { path: "productivity", element: load(<IndividualProductivity />) },
                            { path: "dev-report-card", element: load(<IndividualReportCard />) },
                            { path: "career-snapshot", element: load(<IndividualCareerSnapshot />) },
                            { path: "ask-bob", element: load(<AskBob />) },
                            { path: "*", element: load(<NotFoundPage />) },
                        ]
                    },
                    {
                        path: "org/:orgname", element: load(<OrganizationDashboard />),
                        children: [
                            {
                                index: true,
                                element: <Navigate to="profile" replace />
                            },
                            { path: "profile", element: load(<OrganizationComingSoon />) },
                            { path: "contributions", element: load(<OrganizationComingSoon />) },
                            { path: "teams", element: load(<OrganizationComingSoon />) },
                            { path: "repos", element: load(<OrganizationComingSoon />) },
                            { path: "prs", element: load(<OrganizationComingSoon />) },
                            { path: "issues", element: load(<OrganizationComingSoon />) },
                            { path: "activity", element: load(<OrganizationComingSoon />) },
                            { path: "*", element: load(<NotFoundPage />) },
                        ]
                    },
                    { path: "*", element: load(<NotFoundPage />) },
                ]
            },
        ]
    },
    { path: "*", element: load(<NotFoundPage />), errorElement: load(<RouteErrorPage />) },
]

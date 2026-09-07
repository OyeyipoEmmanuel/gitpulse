import { Building2, Sparkles } from "lucide-react"
import { useLocation } from "react-router-dom"
import Card from "../../individual/components/Card"

const featureNames: Record<string, string> = {
    profile: "Organization profiles",
    contributions: "Organization contributions",
    teams: "Team analytics",
    repos: "Organization repositories",
    prs: "Pull request analytics",
    issues: "Issue analytics",
    activity: "Organization activity",
}

const OrganizationComingSoon = () => {
    const segment = useLocation().pathname.split("/").filter(Boolean).at(-1) ?? "profile"
    const feature = featureNames[segment] ?? "Organization analytics"

    return (
        <main className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-[#0D1117] px-4 py-10 text-white">
            <Card className="w-full max-w-2xl p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#30363D] bg-[#21262D]">
                    <Building2 aria-hidden="true" className="h-8 w-8 text-[#3FB950]" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#238636]/40 bg-[#238636]/10 px-3 py-1.5 text-sm font-semibold text-[#3FB950]">
                    <Sparkles aria-hidden="true" className="h-4 w-4" />
                    Coming soon
                </div>
                <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{feature}</h1>
                <p className="mx-auto mt-4 max-w-lg leading-7 text-[#8B949E]">
                    This organization feature is not available yet. Personal dashboard analytics remain fully supported while we build it.
                </p>
            </Card>
        </main>
    )
}

export default OrganizationComingSoon

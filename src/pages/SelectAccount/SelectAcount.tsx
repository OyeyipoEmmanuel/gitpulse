// import TopNav from "../../components/navbars/TopNav"
import { LoadingSpinner } from "@/components/ui/spinner"
import ErrorToast from "@/components/ui/error-toast"
import { useGetAccountsToDisplay } from "../../services/fetchAllAccount"
import { useNavigate } from "react-router-dom"
import type { GithubOrg } from "@/types"
import SignOutButton from "@/components/auth/SignOutButton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"


const SelectAcount = () => {
    const navigate = useNavigate()

    //Fetch accounts
    const { isPending, error, data, refetch } = useGetAccountsToDisplay()

    if (isPending) return (
        <div className="w-screen h-screen bg-primaryBg">
            <LoadingSpinner className="text-white w-32 h-32" />
        </div>
    )

    if (error) return <ErrorToast message={error.message} onRetry={() => void refetch()} />

    return (
        <main className="bg-primaryBg w-full">
            {/* <TopNav /> */}
            <section className="pt-32 min-h-screen max-w-sm px-4 mx-auto md:max-w-3xl flex flex-col items-center justify-center text-white">
                <div className="flex flex-col pb-12 space-y-1 text-center justify-center items-center">
                    <img src="/images/logo.svg" alt="GitArc Logo" width={40} height={40} loading="lazy" />

                    <h1 className="font-semibold text-xl md:text-3xl">Select account</h1>
                    <p className="text-graySubtextColor">Choose an account to view analytics for</p>
                    <SignOutButton />
                </div>

                <section className="grid w-full grid-cols-1 gap-3">

                    {/* For User */}
                    {data.user && (
                        <Button type="button" variant="outline" className="flex h-auto w-full min-w-0 items-start justify-between gap-3 whitespace-normal p-4 text-left" onClick={() => navigate(`/dashboard/personal/${data.user.login}/profile`)}>
                            <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-6">
                                {/* img */}
                                <img src={data.user.avatar_url} alt={`${data.user.name ?? data.user.login}`} className="shrink-0 rounded-xl" width={48} height={48} loading="lazy" />
                                {/* name */}
                                <span className="min-w-0 flex-1 space-y-2">
                                    <h1 className="break-words font-semibold md:text-xl">{data.user.name ?? data.user.login}</h1>
                                    <p className="break-words text-sm text-graySubtextColor [overflow-wrap:anywhere]">{data.user.bio}</p>
                                </span>
                            </div>
                            {/* type */}
                            <Badge className="shrink-0">Personal</Badge>
                        </Button>
                    )}

                    {/* For Organizations */}
                    {data.orgs && data.orgs.map((each: GithubOrg) => (
                        <Card className="relative py-0" key={each.login}>
                            <CardContent className="flex w-full min-w-0 items-center justify-between gap-3 p-4 opacity-55">
                                <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-6">
                                    {/* img */}
                                    <img src={each.avatar_url} alt={`${each.name ?? each.login}`} className="shrink-0 rounded-xl" width={48} height={48} />
                                    {/* name */}
                                    <span className="min-w-0 flex-1 space-y-2">
                                        <h1 className="break-words font-semibold capitalize md:text-xl">{each.login}</h1>
                                        <p className="line-clamp-2 break-words text-sm text-graySubtextColor [overflow-wrap:anywhere]">{each.description ?? ""}</p>
                                    </span>
                                </div>
                                {/* type */}
                                <Badge variant="outline" className="shrink-0">Organization</Badge>
                            </CardContent>
                            <Badge variant="secondary" className="absolute right-2 top-2">Coming soon</Badge>
                        </Card>
                    ))}

                </section>
            </section>
        </main>
    )
}

export default SelectAcount

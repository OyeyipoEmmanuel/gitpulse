// import TopNav from "../../components/navbars/TopNav"
import { LoadingSpinner } from "@/components/ui/spinner"
import { useGetAccountsToDisplay } from "../../features/global/fetchAllAccount"
import { useNavigate } from "react-router-dom"


const SelectAcount = () => {
    const navigate = useNavigate()

    //Fetch accounts
    const { isPending, error, data } = useGetAccountsToDisplay()

    if (isPending) return <LoadingSpinner className="text-green-500 w-32 h-32" />

    if (error) return (
        <div className="text-red-500 text-center pt-32">
            Something went wrong. Please try again.
        </div>
    )

    return (
        <main className="bg-primaryBg w-full">
            {/* <TopNav /> */}
            <section className="pt-32 min-h-screen max-w-xs mx-auto md:max-w-3xl flex flex-col items-center justify-center text-white">
                <div className="flex flex-col pb-12 space-y-1 text-center justify-center items-center">
                    <img src="/images/logo.svg" alt="GitPulse Logo" width={40} height={40} className="animate-pulse" />

                    <h1 className="font-semibold text-xl md:text-3xl">Select account</h1>
                    <p className="text-graySubtextColor">Choose an account to view analytics for</p>
                </div>

                <section className="grid grid-cols-1 gap-3">

                    {/* For User */}
                    {data.user && (
                        <div className="bg-[#161B22] border border-[#2A2F36] rounded-md p-3 flex flex-row justify-between items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={()=>navigate(`/dashboard/personal/${data.user.login}`)}>
                            <div className="flex space-x-3 items-center md:space-x-6">
                                {/* img */}
                                <img src={data.user.avatar_url} alt={`${data.user.name}`} className="rounded-xl" width={48} height={48} />
                                {/* name */}
                                <span className="space-y-2">
                                    <h1 className="font-semibold md:text-xl">{data.user.name}</h1>
                                    <p className="line-clamp-2 text-sm text-graySubtextColor">{data.user.bio}</p>
                                </span>
                            </div>
                            {/* type */}
                            <div className=" capitalize bg-[#30363D] rounded-full px-3 py-0.5 h-fit text-[#8B949E] font-semibold text-xs md:text-md">
                                <p>Personal</p>
                            </div>
                        </div>
                    )}

                    {/* For Organizations */}
                    {data.orgs && data.orgs.map((each: any) => (
                        <div className="bg-[#161B22] border border-[#2A2F36] rounded-md p-3 flex flex-row justify-between items-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer" onClick={()=>navigate(`/dashboard/org/${each.login}`)}>
                            <div className="flex space-x-3 items-center md:space-x-6 w-[80%]">
                                {/* img */}
                                <img src={each.avatar_url} alt={`${each.name}`} className="rounded-xl" width={48} height={48} />
                                {/* name */}
                                <span className="space-y-2">
                                    <h1 className="font-semibold md:text-xl capitalize">{each.login}</h1>
                                    <p className="line-clamp-2 text-sm text-graySubtextColor">{each.description ?? ""}</p>
                                </span>
                            </div>
                            {/* type */}
                            <div className=" capitalize bg-[#172524] rounded-full px-3 py-0.5 h-fit text-secondaryTextColor border border-[#1A4029] font-semibold text-xs md:text-md">
                                <p>Organization</p>
                            </div>
                        </div>
                    ))}

                </section>
            </section>
        </main>
    )
}

export default SelectAcount
import { LoadingSpinner } from "@/components/ui/spinner"
import { useFetchProfilePageDatas } from "@/services/individualDashboardCalls/fetchProfilePageDatas"
import { Calendar1, MapPin } from "lucide-react"
import { useParams } from "react-router-dom"
import Card from "../components/Card"
import { LanguageDistributionChart } from "@/components/charts"


const IndividualProfile = () => {
  const param = useParams()

  const { data, isPending, error } = useFetchProfilePageDatas(param.username ?? null)

  if (error) return;

  if (isPending) return (<LoadingSpinner className="text-green-500 w-32 h-32" />)
  console.log(data)

  const user = data?.graphqlData.user
  const repos = data?.graphqlData?.user?.repositories

  const starred = data?.starredRepos
  const events = data?.recentEvents

  //Calc Languages percentage
  const languageMap = repos?.nodes?.reduce((acc: Record<string, { count: number; color: string }>, repo: { primaryLanguage: { name: string; color: string } | null }) => {
    const lang = repo.primaryLanguage
    if (lang) {
      acc[lang.name] = {
        count: (acc[lang.name]?.count || 0) + 1,
        color: lang.color
      }
    }
    return acc
  }, {} as Record<string, { count: number; color: string }>)

  
  const languages = Object.entries(languageMap ?? {}).map(([language, value]) => {
    const { count, color } = value as { count: number; color: string }
    return {
      language,
      count,
      color,
      percentage: Math.round((count / (repos?.nodes?.length ?? 1)) * 100)
    }
  })

  console.log(languages)

  return (
    <main className="flex flex-col py-5 px-4 md:px-0">
      {/* Top */}
      <section className="flex flex-col space-y-5">

        {/* Profile view */}
        <div className="w-full rounded-[8px] border border-[#23282E] md:px-0">

          {/* Infos */}
          <div className="bg-[#161B22] flex p-4 md:p-8 flex-col space-y-3 md:space-y-0 md:flex-row md:space-x-4 items-center">
            {/* img */}
            <img src={user.avatarUrl} alt={user.name} className=" rounded-[8px] " width={140} height={140} loading="lazy" />

            <span className="">
              <aside className="text-center md:text-start">
                <p className="text-3xl font-semibold text-white">{user.name}</p>
                <p className="text-secondaryTextColor">@{user.login}</p>
              </aside>

              <p className="text-graySubtextColor pt-5">{user.bio}</p>

              <aside className="flex items-center space-x-5 pt-5">
                <span className="flex items-center space-x-1 text-graySubtextColor text-sm">
                  {/* icon */}
                  <MapPin color="#8B949E" strokeWidth={0.75} size={16} />
                  <p>{user.location}</p>
                </span>
                <span className="flex items-center space-x-1 text-graySubtextColor text-sm">
                  {/* icon */}
                  <Calendar1 color="#8B949E" strokeWidth={0.75} size={16} />
                  <p>
                    Joined{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                      day: "numeric"
                    })}
                  </p>
                </span>
              </aside>
            </span>
          </div>

          {/* Stats */}
          <div className="w-full flex flex-row items-center justify-between">
            <span className="flex flex-col border-r border-graySubtextColor py-3 space-y-2 w-full items-center">
              <p className="text-sm tracking-wider text-graySubtextColor">Followers</p>
              <p className="text-4xl tracking-wider text-white numbersFont">{user.followers.totalCount}</p>
            </span>
            <span className="flex flex-col border-r border-graySubtextColor py-3 space-y-2 w-full items-center">
              <p className="text-sm tracking-wider text-graySubtextColor">Following</p>
              <p className="text-4xl tracking-wider text-white numbersFont">{user.following.totalCount}</p>
            </span>
            <span className="flex flex-col w-full py-3 space-y-2 items-center">
              <p className="text-sm tracking-wider text-graySubtextColor">Total Repos</p>
              <p className="text-4xl tracking-wider text-white numbersFont">{repos?.totalCount}</p>
            </span>

          </div>

        </div>

        <div>
          {/* lang distribution */}
          <Card className="p-5 md:w-[50%]">
            <div className="flex flex-col space-y-4">
              <p className="text-white font-semibold tracking-wider text-center">TOP LANGUAGES</p>
              <LanguageDistributionChart data={languages}/>
            </div>
          </Card>
          {/* pr status */}
        </div>

      </section>

      {/* Bottom */}
      <section>
        <div>
          {/* Pinned */}
          {/* Starred */}
        </div>
        <div>
          {/* Recent activity */}
        </div>
      </section>

    </main>
  )
}

export default IndividualProfile
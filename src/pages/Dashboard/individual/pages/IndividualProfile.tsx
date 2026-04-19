import { LoadingSpinner } from "@/components/ui/spinner"
import ErrorToast from "@/components/ui/error-toast"
import { useFetchProfilePageDatas } from "@/services/individualDashboardCalls/fetchProfilePageDatas"
import { Calendar1, MapPin } from "lucide-react"
import { useParams } from "react-router-dom"
import Card from "../components/Card"
import { LanguageDistributionChart, PrStatusPieChart } from "@/components/charts"
import { HiBars4 } from "react-icons/hi2";
import { IoMdStarOutline } from "react-icons/io";
import { MdForkRight } from "react-icons/md";
import { RxCounterClockwiseClock } from "react-icons/rx";
import { VscGitCommit, VscGitMerge, VscGitPullRequest, VscRepo, VscIssues, VscComment } from "react-icons/vsc";
import { BiGitBranch } from "react-icons/bi";




const IndividualProfile = () => {
  const param = useParams()

  const { data, isPending, error } = useFetchProfilePageDatas(param.username ?? null)

  if (error) return <ErrorToast message={error.message} />


  if (isPending) return (<LoadingSpinner className="text-green-500 w-32 h-32" />)

    console.log(data)

  const user = data?.graphqlData?.user
  const repos = data?.graphqlData?.user?.repositories
  const pinnedRepos = data?.graphqlData?.user?.pinnedItems?.nodes



  const starred = data?.starredRepos
  
  const recentEvents = data?.recentEvents
  console.log(recentEvents)

  //Calc Languages percentage start
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
  //Calc Languages percentage end

  //Calc pr status percentage start
  const prTotals = repos?.nodes?.reduce(
    (acc: { open: number; closed: number; merged: number }, repo: { openPRs: { totalCount: number }; closedPRs: { totalCount: number }; mergedPRs: { totalCount: number } }) => ({
      open: acc.open + (repo.openPRs?.totalCount ?? 0),
      closed: acc.closed + (repo.closedPRs?.totalCount ?? 0),
      merged: acc.merged + (repo.mergedPRs?.totalCount ?? 0),
    }),
    { open: 0, closed: 0, merged: 0 }
  )

  const prStatusData = [
    { name: "Open", value: prTotals?.open ?? 0, fill: "#3B82F6" },
    { name: "Closed", value: prTotals?.closed ?? 0, fill: "#EF4444" },
    { name: "Merged", value: prTotals?.merged ?? 0, fill: "#22C55E" },
  ]
  //Calc pr status percentage end

  // Recent activity helpers
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getEventInfo = (event: any) => {
    const repo = event.repo?.name
    const p = event.payload
    switch (event.type) {
      case "PushEvent": {
        const branch = p.ref?.replace("refs/heads/", "")
        const msg = p.commits?.[0]?.message?.split("\n")[0]
        return { icon: <VscGitCommit />, color: "#3B82F6", label: `Pushed to ${repo}`, sub: branch ? `on ${branch}` : null, message: msg ?? null }
      }
      case "PullRequestEvent": {
        const merged = p.pull_request?.merged
        const action = merged ? "Merged" : p.action === "opened" ? "Opened" : "Closed"
        const Icon = merged ? VscGitMerge : VscGitPullRequest
        const color = merged ? "#22C55E" : p.action === "opened" ? "#3B82F6" : "#EF4444"
        return { icon: <Icon />, color, label: `${action} PR in ${repo}`, sub: null, message: p.pull_request?.title ?? null }
      }
      case "CreateEvent": {
        const isRepo = p.ref_type === "repository"
        return { icon: isRepo ? <VscRepo /> : <BiGitBranch />, color: "#A855F7", label: `Created ${p.ref_type} ${isRepo ? repo : p.ref}`, sub: isRepo ? null : `in ${repo}`, message: null }
      }
      case "ForkEvent":
        return { icon: <MdForkRight />, color: "#F97316", label: `Forked ${repo}`, sub: `→ ${p.forkee?.full_name}`, message: null }
      case "WatchEvent":
        return { icon: <IoMdStarOutline />, color: "#EAB308", label: `Starred ${repo}`, sub: null, message: null }
      case "IssuesEvent":
        return { icon: <VscIssues />, color: p.action === "opened" ? "#3B82F6" : "#8B949E", label: `${p.action === "opened" ? "Opened" : "Closed"} issue in ${repo}`, sub: null, message: p.issue?.title ?? null }
      case "IssueCommentEvent":
        return { icon: <VscComment />, color: "#8B949E", label: `Commented on issue in ${repo}`, sub: null, message: p.comment?.body?.split("\n")[0] ?? null }
      case "DeleteEvent":
        return { icon: <BiGitBranch />, color: "#EF4444", label: `Deleted ${p.ref_type} ${p.ref}`, sub: `in ${repo}`, message: null }
      default:
        return { icon: <RxCounterClockwiseClock />, color: "#8B949E", label: event.type?.replace("Event", "") ?? "Activity", sub: repo, message: null }
    }
  }

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

        <div className="flex flex-col md:flex-row gap-6 md:justify-between">
          {/* lang distribution */}
          <Card className="p-5 md:w-[67%]">
            <div className="flex flex-col space-y-4">
              <p className="text-graySubtextColor font-semibold tracking-wider text-center">TOP LANGUAGES</p>
              <LanguageDistributionChart data={languages} />
            </div>
          </Card>

          {/* pr status */}
          <Card className="p-5 md:w-[33%]">
            <div>
              <div className="flex flex-col space-y-4">
                <p className="text-graySubtextColor font-semibold tracking-wider text-center">PULL REQUEST STATUS</p>
                <PrStatusPieChart data={prStatusData} />
              </div>
            </div>
          </Card>
        </div>

      </section>

      {/* Bottom */}
      <section className="pt-5 flex flex-col gap-5">
        <div className="flex flex-col md:flex-row gap-5 md:justify-between">
          {/* Pinned */}
          <span className="md:w-[50%] w-full">
            <aside className="flex gap-1 items-center pb-3">
              <HiBars4 className="text-secondaryTextColor text-xl" />
              <h1 className="text-white font-semibold tracking-wider text-center text-lg">Pinned Repositories</h1>
            </aside>

            <aside className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pinnedRepos && pinnedRepos.map((repo: any, idx: number) => (
                <Card key={idx} className="p-5 flex flex-col gap-3">
                  <span className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white capitalize">{repo.name}</h2>
                    <aside className="px-3 py-0.5 text-[10px] rounded-full bg-[#21262D] text-graySubtextColor border border-[#2E343B]">{repo.isPrivate ? "Private" : "Public"}</aside>
                  </span>

                  <p className="line-clamp-2 text-graySubtextColor capitalize text-sm">{repo.description}</p>

                  <span className="flex gap-5 items-center text-graySubtextColor text-xs">

                    <aside className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.primaryLanguage?.color }}></div>
                      <p >{repo.primaryLanguage.name}</p>
                    </aside>

                    <aside className="flex items-center gap-1">
                      <IoMdStarOutline />
                      <p>{repo.stargazerCount}</p>
                    </aside>

                    <aside className="flex items-center gap-1">
                      <MdForkRight />
                      <p>{repo.forkCount}</p>
                    </aside>
                  </span>
                </Card>
              ))}
            </aside>
          </span>

          {/* Starred */}
          <span className="md:w-[50%] w-full">
            <aside className="flex gap-1 items-center pb-3">
              <IoMdStarOutline className="text-secondaryTextColor text-xl" />
              <h1 className="text-white font-semibold tracking-wider text-center text-lg">Recently Starred</h1>
            </aside>

            <aside className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {starred.map((each: any, idx: number) => (
                <Card className="p-3 flex items-center space-x-3" key={idx}>
                  <img src={each?.owner?.avatar_url} alt={each?.owner?.name} className="rounded-sm border border-[#2E343B]" width={40} height={40} />
                  <div className="flex flex-col">
                    <p className="font-semibold text-white capitalize">{each.name}</p>
                    <p className="line-clamp-2 text-sm text-graySubtextColor">{each.description}</p>
                  </div>
                </Card>
              ))}
            </aside>
          </span>
        </div>


        {/* Recent activity */}
        <span className="md:w-[70%] w-full">
          <aside className="flex gap-1 items-center pb-3">
            <RxCounterClockwiseClock className="text-secondaryTextColor text-xl" />
            <h1 className="text-white font-semibold tracking-wider text-center text-lg">Recent Activities</h1>
          </aside>

          <Card className="divide-y divide-[#23282E]">
            {recentEvents?.length > 0 ? recentEvents.map((event: any) => {
              const { icon, color, label, sub, message } = getEventInfo(event)
              return (
                <div key={event.id} className="flex items-start gap-3 p-4">
                  {/* icon */}
                  <span className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: `${color}22`, color }}>
                    {icon}
                  </span>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm font-medium truncate">
                        {label}
                        {sub && <span className="text-graySubtextColor font-normal ml-1">{sub}</span>}
                      </p>
                      <span className="text-xs text-graySubtextColor flex-shrink-0">{timeAgo(event.created_at)}</span>
                    </div>
                    {message && (
                      <p className="text-graySubtextColor text-xs mt-0.5 truncate">"{message}"</p>
                    )}
                  </div>
                </div>
              )
            }) : (
              <p className="text-graySubtextColor text-sm text-center py-8">No recent activity</p>
            )}
          </Card>

        </span>
      </section>

    </main>
  )
}

export default IndividualProfile
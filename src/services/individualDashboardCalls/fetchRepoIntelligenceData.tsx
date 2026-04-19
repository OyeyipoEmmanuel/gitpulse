import { fetchGraphQL } from "@/lib/github"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

const OVERVIEW_QUERY = `
query($username: String!, $since: GitTimestamp!) {
  user(login: $username) {
    repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        pushedAt
        isArchived
        diskUsage
        stargazerCount
        forkCount
        primaryLanguage { name }
        openIssues: issues(states: OPEN) { totalCount }
        openPRs: pullRequests(states: OPEN) { totalCount }
        licenseInfo { name }
        updatedAt
        languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
        defaultBranchRef {
          target {
            ... on Commit {
              committedDate
              history(since: $since) { totalCount }
            }
          }
        }
      }
    }
  }
}
`

const STAR_GROWTH_QUERY = `
query($owner: String!, $repo: String!) {
  repository(owner: $owner, name: $repo) {
    stargazers(last: 100, orderBy: {field: STARRED_AT, direction: ASC}) {
      edges {
        starredAt
      }
    }
  }
}
`

export const useFetchRepoIntelligenceDatas = (username: string | null) => {
    const { getToken, loading } = useAuthStore()

    const since = new Date();
    since.setDate(since.getDate() - 30);

    return useQuery({
        queryKey: ['fetch_repo_intelligence_datas', username],
        enabled: !loading && !!username,
        queryFn: async () => {
            const token = await getToken()
            console.log(username)
            if (!token) throw new Error("No auth token available")

            // step 1: fetch overview
            const overview = await fetchGraphQL(OVERVIEW_QUERY, {
                username,
                since: since.toISOString()
            }, token)            

            const repos = overview?.user?.repositories?.nodes?.map((n:any) => n.name)

            // fetch stars for repos
            const starResults = await Promise.all(
                repos.map((repo:any) =>
                    fetchGraphQL(STAR_GROWTH_QUERY, { owner: username, repo }, token)
                )
            )

            let allStarDates = starResults.flatMap(r =>
                r?.repository?.stargazers?.edges?.map((e:any) => e.starredAt)
            )

            //Filter out undefined
            allStarDates = [...allStarDates.filter((date)=>(
                date != undefined
            ))]

            return { overview, starResults, allStarDates }
        }
    })
}
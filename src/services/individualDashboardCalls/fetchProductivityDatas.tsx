import { fetchGraphQL } from "@/lib/github"
import { githubAllPages } from "@/lib/githubFetch"
import { GitHubDataError } from "@/lib/githubErrors"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

interface ContributionDay { contributionCount: number; date: string }
interface ContributionWeeks { contributionCalendar: { weeks: Array<{ contributionDays: ContributionDay[] }> } }
interface StreakData { user: null | { contributionsCollection: ContributionWeeks } }
interface ConsistencyData {
  user: null | { contributionsCollection: ContributionWeeks & {
    totalCommitContributions: number
    totalPullRequestContributions: number
    totalPullRequestReviewContributions: number
    totalIssueContributions: number
  } }
}
interface YoyData {
  user: null | {
    thisYear: { contributionCalendar: { totalContributions: number } }
    lastYear: { contributionCalendar: { totalContributions: number } }
  }
}

const STREAK_QUERY = `query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}`


const CONSISTENCY_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        contributionCalendar {
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`

const YoY_QUERY = `
  query($username: String!, $thisYearStart: DateTime!, $thisYearEnd: DateTime!, $lastYearStart: DateTime!, $lastYearEnd: DateTime!) {
    user(login: $username) {
      thisYear: contributionsCollection(from: $thisYearStart, to: $thisYearEnd) {
        contributionCalendar { totalContributions }
      }
      lastYear: contributionsCollection(from: $lastYearStart, to: $lastYearEnd) {
        contributionCalendar { totalContributions }
      }
    }
  }
`

export const fetchProductivityDatas = async (username: string, token: string) => {
  const today = new Date()
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  const thisYearStart = `${today.getFullYear()}-01-01T00:00:00Z`
  const thisYearEnd = today.toISOString()
  const lastYearStart = `${today.getFullYear() - 1}-01-01T00:00:00Z`
  const lastYearEnd = new Date(
    today.getFullYear() - 1,
    today.getMonth(),
    today.getDate(),
  ).toISOString()

  const [getStreak, consistencyData, yoyReview, eventsRes] = await Promise.all([
    fetchGraphQL<StreakData>(STREAK_QUERY, { username }, token),

    fetchGraphQL<ConsistencyData>(CONSISTENCY_QUERY, {
      username,
      from: oneYearAgo.toISOString(),
      to: today.toISOString(),
    }, token),

    fetchGraphQL<YoyData>(YoY_QUERY, { username, thisYearStart, thisYearEnd, lastYearStart, lastYearEnd }, token),

    githubAllPages<{ created_at: string }>(`https://api.github.com/users/${username}/events?per_page=100`, token)
  ])

  const streakUser = getStreak.user
  const consistencyUser = consistencyData.user
  const yoyUser = yoyReview.user
  const streakWeeks = streakUser?.contributionsCollection.contributionCalendar.weeks
  const consistencyWeeks = consistencyUser?.contributionsCollection.contributionCalendar.weeks
  const thisYearTotal = yoyUser?.thisYear.contributionCalendar.totalContributions
  const lastYearTotal = yoyUser?.lastYear.contributionCalendar.totalContributions
  if (!Array.isArray(streakWeeks) || !Array.isArray(consistencyWeeks) ||
      !Number.isFinite(thisYearTotal) || !Number.isFinite(lastYearTotal)) {
    throw new GitHubDataError("GitHub returned incomplete productivity data. Please retry the request.")
  }

  return {
    getStreak: { user: streakUser! },
    consistencyData: { user: consistencyUser! },
    yoyReview: { user: yoyUser! },
    eventsData: eventsRes,
  }
}

export const useFetchProductivityDatas = (username: string | null) => {
  const { getToken, loading } = useAuthStore()

  return useQuery({
    queryKey: ['fetch_productivity_datas', username],
    enabled: !loading && !!username,
    queryFn: async () => {
      const token = await getToken()
      if (!token) throw new Error("No auth token available")
      return fetchProductivityDatas(username!, token)
    }
  })
}

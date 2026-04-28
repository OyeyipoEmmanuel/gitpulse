import { fetchGraphQL } from "@/lib/github"
import { useAuthStore } from "@/store/authStore"
import { useQuery } from "@tanstack/react-query"

//Get this time last year date
const today = new Date()
const thisYearStart = `${today.getFullYear()}-01-01T00:00:00Z`
const thisYearEnd = today.toISOString()
const lastYearStart = `${today.getFullYear() - 1}-01-01T00:00:00Z`
const lastYearEnd = new Date(
  today.getFullYear() - 1,
  today.getMonth(),
  today.getDate()
).toISOString()

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


const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

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
  const [getStreak, consistencyData, yoyReview, eventsRes] = await Promise.all([
    fetchGraphQL(STREAK_QUERY, { username }, token),

    fetchGraphQL(CONSISTENCY_QUERY, {
      username,
      from: oneYearAgo.toISOString(),
      to: today.toISOString(),
    }, token),

    fetchGraphQL(YoY_QUERY, { username, thisYearStart, thisYearEnd, lastYearStart, lastYearEnd }, token),

    fetch(`https://api.github.com/users/${username}/events?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }).then(r => r.ok ? r.json() : [])
  ])

  return { getStreak, consistencyData, yoyReview, eventsData: Array.isArray(eventsRes) ? eventsRes : [] }
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
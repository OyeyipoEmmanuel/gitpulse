import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchGraphQL } from "@/lib/github"

interface RepoNode {
  name: string
  description: string | null
  isPrivate: boolean
  stargazerCount: number
  forkCount: number
  updatedAt: string
  primaryLanguage: {
    name: string
    color: string
  } | null
  pullRequests: {
    totalCount: number
  }
  licenseInfo: {
    name: string | null
  } | null
  object: {
    text: string
  } | null
}

interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

interface RepoConnection {
  totalCount: number
  pageInfo: PageInfo
  nodes: RepoNode[]
}

interface ReposQueryData {
  user: {
    repositories: RepoConnection
  } | null
}

const REPOS_QUERY = `query($username: String!, $cursor: String) {
  user(login: $username) {
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, after: $cursor) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        name
        description
        isPrivate
        stargazerCount
        forkCount
        updatedAt
        primaryLanguage {
          name
          color
        }
        pullRequests {
          totalCount
        }
        licenseInfo {
          name
        }
        object(expression: "HEAD:README.md") {
          ... on Blob {
            text
          }
        }
      }
    }
  }
}`

export const useRepos = (username: string, token: string | null) => {
  const [cursor, setCursor] = useState<string | null>(null)
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([])

  const queryKey = useMemo(() => ["repos", username, cursor], [username, cursor])

  const query = useQuery<ReposQueryData>({
    queryKey,
    enabled: !!username && !!token,
    queryFn: async (): Promise<ReposQueryData> => {
      if (!token) throw new Error("Missing GitHub token")
      return fetchGraphQL<ReposQueryData>(REPOS_QUERY, { username, cursor }, token)
    },
  })

  const hasNextPage = query.data?.user?.repositories?.pageInfo?.hasNextPage ?? false
  const hasPreviousPage = cursorHistory.length > 0

  const goToNextPage = () => {
    const endCursor = query.data?.user?.repositories?.pageInfo?.endCursor
    if (!endCursor) return
    setCursorHistory((prev) => [...prev, cursor])
    setCursor(endCursor)
  }

  const goToPreviousPage = () => {
    setCursorHistory((prev) => {
      if (prev.length === 0) return prev
      const newHistory = [...prev]
      const previousCursor = newHistory.pop() ?? null
      setCursor(previousCursor)
      return newHistory
    })
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
  }
}

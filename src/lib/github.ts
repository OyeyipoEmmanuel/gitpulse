import { githubFetch } from "./githubFetch"
import { GitHubDataError, GitHubGraphQLError, GitHubRateLimitError } from "./githubErrors"

interface GraphQLResponse<T> {
  data?: T | null
  errors?: Array<{ message?: string; type?: string }>
}

export const fetchGraphQL = async <T = unknown>(query: string, variables: object, token: string): Promise<T> => {
  const res = await githubFetch("https://api.github.com/graphql", token, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })
  
  let payload: GraphQLResponse<T>
  try {
    payload = await res.json() as GraphQLResponse<T>
  } catch {
    throw new GitHubGraphQLError("GitHub GraphQL returned an invalid response.")
  }

  if (payload.errors?.length) {
    const message = payload.errors.map(error => error.message).filter(Boolean).join("; ") ||
      "GitHub GraphQL could not complete the request."
    if (payload.errors.some(error => error.type === "RATE_LIMITED" || /rate limit/i.test(error.message ?? ""))) {
      throw new GitHubRateLimitError(message, 200)
    }
    throw new GitHubGraphQLError(message)
  }
  if (payload.data == null) throw new GitHubDataError()
  return payload.data
}

export interface GraphQLConnection<TNode> {
  nodes?: TNode[] | null
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null } | null
}

export async function fetchGraphQLConnection<TData, TNode>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
  select: (data: TData) => GraphQLConnection<TNode> | null | undefined,
): Promise<{ firstPage: TData; nodes: TNode[] }> {
  const nodes: TNode[] = []
  let cursor: string | null = null
  let firstPage: TData | null = null
  const seenCursors = new Set<string>()
  let hasNextPage = true

  while (hasNextPage) {
    const data = await fetchGraphQL<TData>(query, { ...variables, cursor }, token)
    firstPage ??= data
    const connection = select(data)
    if (!connection || !Array.isArray(connection.nodes) || !connection.pageInfo) throw new GitHubDataError()
    nodes.push(...connection.nodes)
    hasNextPage = connection.pageInfo.hasNextPage === true
    if (!hasNextPage) break
    const nextCursor = connection.pageInfo.endCursor
    if (!nextCursor || seenCursors.has(nextCursor)) throw new GitHubDataError("GitHub returned invalid pagination metadata.")
    seenCursors.add(nextCursor)
    cursor = nextCursor
  }

  return { firstPage: firstPage as TData, nodes }
}

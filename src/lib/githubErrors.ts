export class GitHubApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = "GitHubApiError"
    this.status = status
  }
}

export class GitHubRateLimitError extends GitHubApiError {
  readonly resetAt: Date | null

  constructor(
    message = "GitHub's API rate limit has been reached. Please try again later.",
    status = 429,
    resetAt: Date | null = null,
  ) {
    super(message, status)
    this.name = "GitHubRateLimitError"
    this.resetAt = resetAt
  }
}

export class GitHubGraphQLError extends GitHubApiError {
  constructor(message: string) {
    super(message, 200)
    this.name = "GitHubGraphQLError"
  }
}

export class GitHubDataError extends Error {
  constructor(message = "GitHub returned incomplete data. Please retry the request.") {
    super(message)
    this.name = "GitHubDataError"
  }
}

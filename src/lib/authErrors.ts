export class GitHubReconnectError extends Error {
  constructor() {
    super("Your GitHub connection is missing or no longer valid. Reconnect GitHub to continue.")
    this.name = "GitHubReconnectError"
  }
}

export class AuthSessionChangedError extends Error {
  constructor() {
    super("The signed-in account changed. This request was discarded.")
    this.name = "AuthSessionChangedError"
  }
}

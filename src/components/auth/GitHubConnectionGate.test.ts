import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import GitHubConnectionGate from "./GitHubConnectionGate"

const state = vi.hoisted(() => ({
  tokenStatus: "loading", tokenError: null as string | null, tokenWarning: null as string | null,
  savingToken: false, signingOut: false, revision: 1, user: { id: "a" }, retryTokenRecovery: vi.fn(),
  retryTokenPersistence: vi.fn(), dismissTokenWarning: vi.fn(), signOut: vi.fn(),
}))
vi.mock("../../store/authStore", () => ({ useAuthStore: () => state }))
vi.mock("../../auth/signInWithGithub", () => ({ signInWithGithub: vi.fn() }))

function renderGate() {
  return renderToString(createElement(MemoryRouter, null,
    createElement(Routes, null,
      createElement(Route, { element: createElement(GitHubConnectionGate) },
        createElement(Route, { index: true, element: createElement("p", null, "Protected dashboard content") }),
      ),
    ),
  ))
}

describe("GitHub connection route gate", () => {
  beforeEach(() => Object.assign(state, { tokenStatus: "loading", tokenError: null, tokenWarning: null, savingToken: false, signingOut: false }))

  it.each(["idle", "loading", "error", "reconnect"])("never renders dashboard content while status is %s", status => {
    state.tokenStatus = status
    expect(renderGate()).not.toContain("Protected dashboard content")
  })
  it("renders dashboard content only after token verification", () => {
    state.tokenStatus = "ready"
    expect(renderGate()).toContain("Protected dashboard content")
  })
  it("offers explicit reconnect and logout for invalid credentials", () => {
    state.tokenStatus = "reconnect"
    state.tokenError = "Reconnect required"
    const html = renderGate()
    expect(html).toContain("Reconnect required")
    expect(html).toContain("Reconnect GitHub")
    expect(html).toContain("Logout")
    expect(html).not.toContain("Try again")
  })
  it("offers retry for a recoverable failure", () => {
    state.tokenStatus = "error"
    expect(renderGate()).toContain("Try again")
  })
  it("hides the dashboard during sign out", () => {
    state.tokenStatus = "ready"
    state.signingOut = true
    const html = renderGate()
    expect(html).toContain("Signing out")
    expect(html).not.toContain("Protected dashboard content")
  })
  it("shows token-saving warnings without hiding a verified dashboard", () => {
    state.tokenStatus = "ready"
    state.tokenWarning = "Saving failed"
    const html = renderGate()
    expect(html).toContain("Saving failed")
    expect(html).toContain("Retry saving")
    expect(html).toContain("Dismiss")
    expect(html).toContain("Protected dashboard content")
  })
})

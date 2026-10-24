import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import IndividualSettings from "./IndividualSettings"

vi.mock("@/store/authStore", () => ({
  useAuthStore: () => ({
    user: { user_metadata: { user_name: "octocat", avatar_url: "https://example.com/avatar.png" } },
    tokenStatus: "ready",
    signOut: vi.fn(),
  }),
}))

vi.mock("@/lib/accountActions", () => ({ performAccountAction: vi.fn() }))

describe("individual settings", () => {
  it("separates GitHub disconnection from permanent account deletion", () => {
    const html = renderToStaticMarkup(<IndividualSettings />)

    expect(html).toContain("Connected accounts")
    expect(html).toContain("@octocat")
    expect(html).toContain("Disconnect GitHub")
    expect(html).toContain("Danger zone")
    expect(html).toContain("Delete account")
  })
})

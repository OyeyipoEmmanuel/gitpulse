import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import LandingPage from "./LandingPage"

describe("landing page", () => {
  it("presents the product story, interactive preview, workflow, and footer branding", () => {
    const html = renderToStaticMarkup(<LandingPage />)

    expect(html).toContain("Your GitHub activity finally tells a")
    expect(html).toContain("Live profile preview")
    expect(html).toContain('aria-pressed="true"')
    expect(html).toContain("landing-interactive-card")
    expect(html).toContain('id="product"')
    expect(html).toContain('id="workflow"')
    expect(html).toContain('id="showcase"')
    expect(html).toContain("Explore my GitHub")
    expect(html).toContain("GITPULSE")
  })
})

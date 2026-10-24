import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import IndividualSideNav from "./IndividualSideNav"

describe("IndividualSideNav", () => {
  it("renders accessible dashboard navigation and keeps settings available", () => {
    const html = renderToStaticMarkup(<MemoryRouter><IndividualSideNav isOpen={false} /></MemoryRouter>)
    expect(html).toContain('aria-label="Personal dashboard"')
    expect(html).toContain('href="/settings"')
  })

  it("renders the same labeled dashboard links when open", () => {
    const html = renderToStaticMarkup(<MemoryRouter><IndividualSideNav isOpen /></MemoryRouter>)
    expect(html).toContain('aria-label="Personal dashboard"')
    expect(html).toContain("Repo Intelligence")
  })
})

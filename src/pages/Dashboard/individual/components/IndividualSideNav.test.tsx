import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import IndividualSideNav from "./IndividualSideNav"

describe("IndividualSideNav", () => {
  it("keeps the closed mobile navigation out of keyboard navigation", () => {
    const html = renderToStaticMarkup(<MemoryRouter><IndividualSideNav isOpen={false} /></MemoryRouter>)
    expect(html).toContain('aria-label="Personal dashboard"')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain("inert=\"\"")
  })

  it("provides labeled controls when the mobile navigation is open", () => {
    const html = renderToStaticMarkup(<MemoryRouter><IndividualSideNav isOpen /></MemoryRouter>)
    expect(html).toContain('aria-label="Close dashboard menu"')
    expect(html).toContain('aria-label="Close menu"')
    expect(html).toContain('<nav aria-label="Personal dashboard" aria-hidden="false"')
  })
})

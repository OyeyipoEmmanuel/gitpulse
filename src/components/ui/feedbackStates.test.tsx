import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import ErrorToast from "./error-toast"
import { LoadingSpinner } from "./spinner"

describe("feedback states", () => {
  it("announces loading state to assistive technology", () => {
    const html = renderToStaticMarkup(<LoadingSpinner label="Loading analytics" />)
    expect(html).toContain('role="status"')
    expect(html).toContain('aria-label="Loading analytics"')
    expect(html).toContain("Loading analytics")
  })

  it("announces errors and exposes a semantic retry action", () => {
    const html = renderToStaticMarkup(<ErrorToast message="Request failed" onRetry={vi.fn()} />)
    expect(html).toContain('role="alert"')
    expect(html).toContain("Request failed")
    expect(html).toContain('<button type="button"')
    expect(html).toContain("Retry")
  })
})

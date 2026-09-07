import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import NotFoundPage from "./NotFoundPage"

describe("not-found page", () => {
    it("explains the missing route and provides a way home", () => {
        const html = renderToStaticMarkup(<MemoryRouter><NotFoundPage /></MemoryRouter>)

        expect(html).toContain("404")
        expect(html).toContain("Page not found")
        expect(html).toContain('href="/"')
        expect(html).toContain("Return home")
    })
})

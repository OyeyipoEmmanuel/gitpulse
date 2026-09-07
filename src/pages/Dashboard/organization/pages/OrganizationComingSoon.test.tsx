import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import OrganizationComingSoon from "./OrganizationComingSoon"

describe("organization unavailable state", () => {
    it("names the selected unfinished feature instead of rendering a blank page", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter initialEntries={["/dashboard/org/acme/teams"]}>
                <OrganizationComingSoon />
            </MemoryRouter>,
        )

        expect(html).toContain("Team analytics")
        expect(html).toContain("Coming soon")
        expect(html).toContain("not available yet")
    })
})

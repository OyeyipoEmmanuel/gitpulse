import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { describe, expect, it } from "vitest"
import AskBob from "./AskBob"

describe("Ask Bob coming-soon page", () => {
    it("renders an accessible coming-soon message", () => {
        const html = renderToStaticMarkup(
            <MemoryRouter initialEntries={["/dashboard/personal/octocat/ask-bob"]}>
                <Routes>
                    <Route path="/dashboard/personal/:username/ask-bob" element={<AskBob />} />
                </Routes>
            </MemoryRouter>,
        )

        expect(html).toContain("Coming Soon")
        expect(html).toContain('id="ask-bob-title"')
        expect(html).toContain('aria-labelledby="ask-bob-title"')
    })
})

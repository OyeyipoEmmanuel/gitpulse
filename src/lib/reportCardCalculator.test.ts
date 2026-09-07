import { describe, expect, it } from "vitest"
import { codeQualityDimension, maintenanceDimension, openSourceDimension } from "./reportCardCalculator"

describe("report card dimensions", () => {
  it("marks code quality unavailable when no pull requests were observed", () => {
    const result = codeQualityDimension([], [])
    expect(result.gradeScore).toBeNull()
    expect(result.stats["PR Merge Rate"]).toBe("Unavailable")
    expect(result.stats["Avg PRs per repo"]).toBe("Unavailable")
  })

  it("marks maintenance unavailable when no repositories were observed", () => {
    const result = maintenanceDimension([])
    expect(result.gradeScore).toBeNull()
    expect(result.bars).toEqual([
      { label: "README Coverage", value: 0, total: 0 },
      { label: "License Coverage", value: 0, total: 0 },
    ])
  })

  it("preserves zero open-source participation as a measured score", () => {
    const result = openSourceDimension([], "octocat")
    expect(result.gradeScore).toBe(0)
    expect(result.grade).toBe("F")
    expect(result.stats["PRs Merged"]).toBe(0)
  })
})

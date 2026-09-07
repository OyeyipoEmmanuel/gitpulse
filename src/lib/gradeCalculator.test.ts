import { describe, expect, it } from "vitest"
import { gradeCalculator } from "./gradeCalculator"

describe("gradeCalculator", () => {
  it("returns no grade when no scores are supplied", () => {
    expect(gradeCalculator([])).toBeNull()
  })

  it.each([
    { scores: [Number.NaN] }, { scores: [Infinity] }, { scores: [-1] }, { scores: [101] },
  ])("rejects invalid score input $scores", ({ scores }) => {
    expect(gradeCalculator(scores)).toBeNull()
  })

  it.each([
    { score: 0, grade: "F", color: "#7D8590" },
    { score: 29.99, grade: "F", color: "#7D8590" },
    { score: 30, grade: "E", color: "#EF4444" },
    { score: 39.99, grade: "E", color: "#EF4444" },
    { score: 40, grade: "D", color: "#F97316" },
    { score: 49.99, grade: "D", color: "#F97316" },
    { score: 50, grade: "C", color: "#EAB308" },
    { score: 64.99, grade: "C", color: "#EAB308" },
    { score: 65, grade: "B", color: "#1F6FEB" },
    { score: 79.99, grade: "B", color: "#1F6FEB" },
    { score: 80, grade: "A", color: "#238636" },
    { score: 100, grade: "A", color: "#238636" },
  ])("maps $score to $grade with its display color", ({ score, grade, color }) => {
    expect(gradeCalculator([score])).toEqual({ totalScore: score, grade, color })
  })

  it("weights each dimension equally, including zero scores", () => {
    expect(gradeCalculator([100, 100, 100, 100, 0])).toEqual({
      totalScore: 80,
      grade: "A",
      color: "#238636",
    })
  })

  it("does not round an average up into a higher grade", () => {
    const result = gradeCalculator([79, 80])
    expect(result?.totalScore).toBe(79.5)
    expect(result?.grade).toBe("B")
  })

  it("preserves fractional averages", () => {
    expect(gradeCalculator([0, 100, 100])?.totalScore).toBeCloseTo(66.6666667)
  })

  it("does not change the supplied scores", () => {
    const scores = [80, 0, 65]
    gradeCalculator(scores)
    expect(scores).toEqual([80, 0, 65])
  })
})

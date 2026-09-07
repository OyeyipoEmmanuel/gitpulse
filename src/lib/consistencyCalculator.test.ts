import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { calculateConsistencyScore } from "./consistencyCalculator"
import { gradeCalculator } from "./gradeCalculator"

function calendar(activeDays: number, totalDays = 100) {
  return Array.from({ length: totalDays }, (_, index) => ({
    date: new Date(Date.UTC(2026, 0, index + 1)).toISOString().slice(0, 10),
    contributionCount: index < activeDays ? 1 : 0,
  }))
}

describe("calculateConsistencyScore", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-09-02T12:00:00Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each([
    { score: 0, remark: "Very Poor", color: "#EF4444" },
    { score: 29, remark: "Very Poor", color: "#EF4444" },
    { score: 30, remark: "Poor", color: "#F97316" },
    { score: 49, remark: "Poor", color: "#F97316" },
    { score: 50, remark: "Average", color: "#EAB308" },
    { score: 59, remark: "Average", color: "#EAB308" },
    { score: 60, remark: "Consistent", color: "#84CC16" },
    { score: 79, remark: "Consistent", color: "#84CC16" },
    { score: 80, remark: "Very Consistent", color: "#22C55E" },
    { score: 100, remark: "Very Consistent", color: "#22C55E" },
  ])("maps $score percent to $remark with its display color", ({ score, remark, color }) => {
    expect(calculateConsistencyScore(calendar(score))).toEqual({ score, remark, color })
  })

  it("rounds the fraction of active days to the nearest integer", () => {
    expect(calculateConsistencyScore(calendar(1, 3)).score).toBe(33)
    expect(calculateConsistencyScore(calendar(2, 3)).score).toBe(67)
  })

  it("counts active days rather than the number of contributions", () => {
    expect(calculateConsistencyScore([
      { date: "2026-09-01", contributionCount: 100 },
      { date: "2026-09-02", contributionCount: 0 },
    ]).score).toBe(50)
  })

  it("includes today's activity and ignores future dates in both counts", () => {
    expect(calculateConsistencyScore([
      { date: "2026-09-01", contributionCount: 0 },
      { date: "2026-09-02", contributionCount: 1 },
      { date: "2026-09-03", contributionCount: 1 },
      { date: "2026-09-04", contributionCount: 0 },
      { date: "2026-09-05", contributionCount: 0 },
    ]).score).toBe(50)
  })

  it("uses the rounded consistency score when grading a report-card dimension", () => {
    const consistency = calculateConsistencyScore(calendar(2, 3))
    expect(consistency.score).not.toBeNull()
    expect(gradeCalculator([consistency.score!])).toEqual({
      totalScore: 67,
      grade: "B",
      color: "#1F6FEB",
    })
  })

  it("does not change the supplied calendar", () => {
    const days = calendar(2, 3)
    const original = structuredClone(days)
    calculateConsistencyScore(days)
    expect(days).toEqual(original)
  })

  it("returns an unavailable result for an empty calendar", () => {
    expect(calculateConsistencyScore([]).score).toBeNull()
  })

  it("returns an unavailable result for a future-only calendar", () => {
    expect(calculateConsistencyScore([
      { date: "2026-09-03", contributionCount: 0 },
    ]).score).toBeNull()
  })
})

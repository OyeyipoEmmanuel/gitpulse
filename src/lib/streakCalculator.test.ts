import { describe, expect, it } from "vitest"
import { getCurrentStreak, getLongestStreak } from "./streakCalculator"

// Complete, ascending daily records, including today as the final entry.
function calendar(counts: number[]) {
  return counts.map((contributionCount, index) => ({
    contributionCount,
    date: new Date(Date.UTC(2026, 7, index + 1)).toISOString().slice(0, 10),
  }))
}

describe("getCurrentStreak", () => {
  it.each([
    { name: "an empty calendar", counts: [], expected: 0 },
    { name: "no activity", counts: [0, 0, 0], expected: 0 },
    { name: "only today with no activity", counts: [0], expected: 0 },
    { name: "only today with activity", counts: [3], expected: 1 },
    { name: "multiple contributions counting as one day", counts: [4, 12, 1], expected: 3 },
    { name: "today remaining open for contributions", counts: [1, 2, 0], expected: 2 },
    { name: "two trailing inactive days breaking a streak", counts: [1, 2, 0, 0], expected: 0 },
    { name: "a previous gap breaking a streak", counts: [1, 0, 2, 3], expected: 2 },
    { name: "a new streak after yesterday was inactive", counts: [3, 0, 1], expected: 1 },
  ])("handles $name", ({ counts, expected }) => {
    expect(getCurrentStreak(calendar(counts))).toBe(expected)
  })

  it("does not change the supplied calendar", () => {
    const days = calendar([1, 0, 2, 0])
    const original = structuredClone(days)
    getCurrentStreak(days)
    expect(days).toEqual(original)
  })
})

describe("getLongestStreak", () => {
  it.each([
    { name: "an empty calendar", counts: [], expected: { count: 0, from: null, to: null } },
    { name: "all inactive days", counts: [0, 0], expected: { count: 0, from: null, to: null } },
    { name: "a single active day", counts: [8], expected: { count: 1, from: "2026-08-01", to: "2026-08-01" } },
    { name: "an uninterrupted streak", counts: [1, 8, 2], expected: { count: 3, from: "2026-08-01", to: "2026-08-03" } },
    { name: "a streak ending before today", counts: [1, 1, 0], expected: { count: 2, from: "2026-08-01", to: "2026-08-02" } },
    { name: "a longer streak ending at the final entry", counts: [1, 0, 1, 1, 1], expected: { count: 3, from: "2026-08-03", to: "2026-08-05" } },
    { name: "a longer streak surrounded by inactive days", counts: [0, 1, 1, 0, 1], expected: { count: 2, from: "2026-08-02", to: "2026-08-03" } },
    { name: "the earliest streak winning a tie", counts: [1, 1, 0, 1, 1], expected: { count: 2, from: "2026-08-01", to: "2026-08-02" } },
  ])("handles $name", ({ counts, expected }) => {
    expect(getLongestStreak(calendar(counts))).toEqual(expected)
  })

  it("preserves the dates across a year boundary", () => {
    const days = [
      { date: "2025-12-31", contributionCount: 2 },
      { date: "2026-01-01", contributionCount: 1 },
    ]
    expect(getLongestStreak(days)).toEqual({ count: 2, from: "2025-12-31", to: "2026-01-01" })
  })

  it("does not change the supplied calendar", () => {
    const days = calendar([1, 0, 2, 0])
    const original = structuredClone(days)
    getLongestStreak(days)
    expect(days).toEqual(original)
  })
})

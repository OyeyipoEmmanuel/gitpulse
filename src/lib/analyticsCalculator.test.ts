import { describe, expect, it } from "vitest"
import { average, percentage } from "./analyticsCalculator"

describe("analytics calculations", () => {
  it("preserves a genuine zero measured against an observed population", () => {
    expect(percentage(0, 5)).toBe(0)
    expect(average(0, 5)).toBe(0)
  })

  it("returns unavailable when there is no observed population", () => {
    expect(percentage(0, 0)).toBeNull()
    expect(average(0, 0)).toBeNull()
  })

  it("rejects invalid inputs instead of propagating NaN or Infinity", () => {
    expect(percentage(Number.NaN, 2)).toBeNull()
    expect(percentage(1, Infinity)).toBeNull()
    expect(average(Infinity, 2)).toBeNull()
  })
})

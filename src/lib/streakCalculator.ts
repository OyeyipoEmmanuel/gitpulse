export interface StreakData {
  count: number
  from: string | null
  to: string | null
}

export function getCurrentStreak(daysArr: { contributionCount: number; date: string }[]): number {
  if (daysArr.length === 0) return 0
  let count = 0
  let i = daysArr.length - 1

  // Skip today if no contributions yet — streak may still be alive
  if (daysArr[i].contributionCount === 0) i--

  while (i >= 0 && daysArr[i].contributionCount > 0) {
    count++
    i--
  }

  return count
}

export function getLongestStreak(daysArr: { contributionCount: number; date: string }[]): StreakData {
  if (daysArr.length === 0) return { count: 0, from: null, to: null }
  let max = 0
  let count = 0
  let start = 0
  let bestFrom: string | null = null
  let bestTo: string | null = null

  for (let i = 0; i < daysArr.length; i++) {
    if (daysArr[i].contributionCount > 0) {
      if (count === 0) start = i
      count++
    } else {
      if (count > max) {
        max = count
        bestFrom = daysArr[start].date
        bestTo = daysArr[i - 1].date
      }
      count = 0
    }
  }

  if (count > max) {
    max = count
    bestFrom = daysArr[start].date
    bestTo = daysArr[daysArr.length - 1].date
  }

  return { count: max, from: bestFrom, to: bestTo }
}

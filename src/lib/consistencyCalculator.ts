interface ContributionDay {
  contributionCount: number
  date: string
}

// Accepts flattened contribution days, not the API's nested weeks.
// The existing calculation is preserved, including its no-data limitation.
export function calculateConsistencyScore(days: ContributionDay[]) {
  const today = new Date()
  const pastDays = days.filter(d => new Date(d.date) <= today)

  const totalDays = pastDays.length
  if (totalDays === 0) return { score: null, remark: "Unavailable", color: "#7D8590" }
  const activeDays = pastDays.filter(d => d.contributionCount > 0).length
  const score = Math.round((activeDays / totalDays) * 100)

  let remark: string = ""
  let color: string = ""

  if (score >= 80) { remark = "Very Consistent"; color = "#22C55E" }
  else if (score >= 60) { remark = "Consistent"; color = "#84CC16" }
  else if (score >= 50) { remark = "Average"; color = "#EAB308" }
  else if (score >= 30) { remark = "Poor"; color = "#F97316" }
  else { remark = "Very Poor"; color = "#EF4444" }

  return { score, remark, color }
}

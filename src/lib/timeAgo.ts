export function getTimeAgo(dateString: string) {
  const past = new Date(dateString)
  const now = new Date()

  let years = now.getFullYear() - past.getFullYear()
  let months = now.getMonth() - past.getMonth()

  // Adjust if current day is before the past day
  if (now.getDate() < past.getDate()) {
    months--
  }

  // Handle negative months
  if (months < 0) {
    years--
    months += 12
  }

  return {
    years,
    months
  }

}


export function percentage(part: number, total: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(total) || part < 0 || total <= 0) return null
  return (part / total) * 100
}

export function average(total: number, count: number): number | null {
  if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) return null
  return total / count
}

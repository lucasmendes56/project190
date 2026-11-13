// Parse the minimum reps from a display string like '8–10' or '12' or '10+10+10'
export function parseMinReps(repsStr) {
  if (!repsStr) return 10
  const str = String(repsStr)
  const match = str.match(/\d+/)
  return match ? parseInt(match[0], 10) : 10
}

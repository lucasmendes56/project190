export function formatWeight(lbs) {
  if (lbs === 0) return 'BW'
  return `${lbs} lbs`
}

export function formatReps(reps) {
  return `${reps} reps`
}

export function formatSets(sets) {
  return `${sets} sets`
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

export function formatStreakDays(days) {
  if (days === 0) return 'No streak yet'
  if (days === 1) return '1 workout streak'
  return `${days} workout streak`
}

export function formatVolume(sets) {
  // sets = [{weight, reps}, ...]
  return sets.reduce((total, s) => total + (s.weight * s.reps), 0)
}

export function pluralize(count, word) {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`
}

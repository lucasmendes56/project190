/** Short label for week strip / day nav (e.g. "Chest + Triceps" → "CHES") */
export function shortWorkoutNavLabel(workoutName) {
  if (!workoutName || typeof workoutName !== 'string') return ''
  return workoutName.split(' + ')[0].split(' ')[0].toUpperCase().slice(0, 4)
}

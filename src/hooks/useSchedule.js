import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getEffectiveWorkoutId, migrateScheduleToV2 } from '../utils/programUtils'

export function useSchedule(programStartDate) {
  const [schedule, setSchedule] = useLocalStorage('wt_schedule', {})

  // Forward-only migration: v1 → v2.
  // Uses functional setter so it always reads the latest stored value.
  // Never touches wt_log or wt_bodyweight.
  useEffect(() => {
    if (!programStartDate) return
    setSchedule(prev => {
      if (prev._v === 2) return prev
      return migrateScheduleToV2(prev, programStartDate)
    })
  }, [programStartDate, setSchedule])

  // Assign a workout to a specific date (replaces any existing assignment)
  const assignWorkout = useCallback((dateStr, workoutId) => {
    setSchedule(prev => ({ ...prev, [dateStr]: workoutId }))
  }, [setSchedule])

  // Remove a workout assignment from a date, making it a rest day
  const unassignWorkout = useCallback((dateStr) => {
    setSchedule(prev => {
      const next = { ...prev }
      delete next[dateStr]
      return next
    })
  }, [setSchedule])

  // Swap the workouts assigned to two dates (only swaps unfinished workouts;
  // caller is responsible for not passing already-completed dates)
  const swapWorkouts = useCallback((dateA, dateB) => {
    setSchedule(prev => {
      const idA = getEffectiveWorkoutId(dateA, programStartDate, prev)
      const idB = getEffectiveWorkoutId(dateB, programStartDate, prev)
      const next = { ...prev }
      if (idB) next[dateA] = idB; else delete next[dateA]
      if (idA) next[dateB] = idA; else delete next[dateB]
      return next
    })
  }, [programStartDate, setSchedule])

  return { scheduleOverrides: schedule, swapWorkouts, assignWorkout, unassignWorkout }
}

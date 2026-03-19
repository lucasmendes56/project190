import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { getEffectiveWorkoutId } from '../utils/programUtils'

export function useSchedule(programStartDate) {
  const [overrides, setOverrides] = useLocalStorage('wt_schedule', {})

  const swapWorkouts = useCallback((dateA, dateB) => {
    const idA = getEffectiveWorkoutId(dateA, programStartDate, overrides)
    const idB = getEffectiveWorkoutId(dateB, programStartDate, overrides)
    setOverrides(prev => ({
      ...prev,
      [dateA]: idB ?? 'rest',
      [dateB]: idA ?? 'rest',
    }))
  }, [overrides, programStartDate, setOverrides])

  return { scheduleOverrides: overrides, swapWorkouts }
}

import { useMemo } from 'react'
import { resolveWorkout, isWorkoutDay, nextWorkoutDate, getPhase } from '../utils/programUtils'
import { today, programWeek } from '../utils/dateUtils'

export function useProgram(programStartDate) {
  const todayStr = today()

  const todayWorkout = useMemo(() => {
    if (!programStartDate) return null
    return resolveWorkout(todayStr, programStartDate)
  }, [programStartDate, todayStr])

  const currentWeek = useMemo(() => {
    if (!programStartDate) return null
    return programWeek(programStartDate, todayStr)
  }, [programStartDate, todayStr])

  const currentPhase = useMemo(() => {
    if (!currentWeek) return null
    return getPhase(currentWeek)
  }, [currentWeek])

  const isProgramComplete = currentWeek !== null && currentWeek > 12

  const isTodayWorkoutDay = isWorkoutDay(todayStr)

  const nextWorkout = useMemo(() => {
    if (!programStartDate) return null
    const nextDate = nextWorkoutDate(todayStr)
    if (!nextDate) return null
    return {
      date: nextDate,
      workout: resolveWorkout(nextDate, programStartDate),
    }
  }, [programStartDate, todayStr])

  const getWorkoutForDate = (dateStr) => {
    if (!programStartDate) return null
    return resolveWorkout(dateStr, programStartDate)
  }

  return {
    todayWorkout,
    currentWeek,
    currentPhase,
    isProgramComplete,
    isTodayWorkoutDay,
    nextWorkout,
    getWorkoutForDate,
  }
}

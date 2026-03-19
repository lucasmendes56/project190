import { useMemo } from 'react'
import { resolveWorkout, isScheduledWorkoutDay, nextWorkoutDate, getPhase } from '../utils/programUtils'
import { today, programWeek } from '../utils/dateUtils'

export function useProgram(programStartDate, scheduleOverrides = {}) {
  const todayStr = today()

  const todayWorkout = useMemo(() => {
    if (!programStartDate) return null
    return resolveWorkout(todayStr, programStartDate, scheduleOverrides)
  }, [programStartDate, todayStr, scheduleOverrides])

  const currentWeek = useMemo(() => {
    if (!programStartDate) return null
    return programWeek(programStartDate, todayStr)
  }, [programStartDate, todayStr])

  const currentPhase = useMemo(() => {
    if (!currentWeek) return null
    return getPhase(currentWeek)
  }, [currentWeek])

  const isProgramComplete = currentWeek !== null && currentWeek > 12

  const isTodayWorkoutDay = isScheduledWorkoutDay(todayStr, programStartDate, scheduleOverrides)

  const nextWorkout = useMemo(() => {
    if (!programStartDate) return null
    const nextDate = nextWorkoutDate(todayStr, programStartDate, scheduleOverrides)
    if (!nextDate) return null
    return {
      date: nextDate,
      workout: resolveWorkout(nextDate, programStartDate, scheduleOverrides),
    }
  }, [programStartDate, todayStr, scheduleOverrides])

  const getWorkoutForDate = (dateStr) => {
    if (!programStartDate) return null
    return resolveWorkout(dateStr, programStartDate, scheduleOverrides)
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

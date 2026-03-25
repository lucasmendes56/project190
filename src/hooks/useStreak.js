import { useMemo } from 'react'
import { today, subtractDays } from '../utils/dateUtils'
import { isScheduledWorkoutDay } from '../utils/programUtils'

// scheduleOverrides required so streak counts against the actual assigned schedule,
// not a hardcoded DOW pattern.
export function useStreak(log, programStartDate, scheduleOverrides = {}) {
  const streak = useMemo(() => {
    if (!programStartDate || log.length === 0) return 0

    const completedDates = new Set(log.map(e => e.date))
    const todayStr = today()

    let count = 0
    let checkDate = todayStr

    // If today is a workout day but not yet completed, start checking from yesterday
    // (don't penalize for not completing today's workout yet)
    if (isScheduledWorkoutDay(todayStr, programStartDate, scheduleOverrides) && !completedDates.has(todayStr)) {
      checkDate = subtractDays(todayStr, 1)
    }

    // Walk backwards counting completed workout days, breaking on any missed day
    for (let i = 0; i < 90; i++) {
      if (checkDate < programStartDate) break

      if (isScheduledWorkoutDay(checkDate, programStartDate, scheduleOverrides)) {
        if (completedDates.has(checkDate)) {
          count++
        } else {
          break
        }
      }
      checkDate = subtractDays(checkDate, 1)
    }

    return count
  }, [log, programStartDate, scheduleOverrides])

  const longestStreak = useMemo(() => {
    if (!programStartDate || log.length === 0) return 0

    const completedDates = new Set(log.map(e => e.date))
    const todayStr = today()

    let maxStreak = 0
    let current = 0

    let checkDate = programStartDate
    while (checkDate <= todayStr) {
      if (isScheduledWorkoutDay(checkDate, programStartDate, scheduleOverrides)) {
        if (completedDates.has(checkDate)) {
          current++
          maxStreak = Math.max(maxStreak, current)
        } else {
          current = 0
        }
      }
      const d = new Date(checkDate)
      d.setDate(d.getDate() + 1)
      checkDate = d.toISOString().split('T')[0]
    }

    return maxStreak
  }, [log, programStartDate, scheduleOverrides])

  return { streak, longestStreak }
}

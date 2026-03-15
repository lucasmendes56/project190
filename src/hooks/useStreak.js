import { useMemo } from 'react'
import { today, subtractDays } from '../utils/dateUtils'
import { isWorkoutDay } from '../utils/programUtils'

export function useStreak(log, programStartDate) {
  const streak = useMemo(() => {
    if (!programStartDate || log.length === 0) return 0

    const completedDates = new Set(log.map(e => e.date))
    const todayStr = today()

    let count = 0
    let checkDate = todayStr

    // If today is a workout day but not yet completed, start checking from yesterday
    // (don't penalize for not completing today's workout yet)
    if (isWorkoutDay(todayStr) && !completedDates.has(todayStr)) {
      checkDate = subtractDays(todayStr, 1)
    }

    // Walk backwards, counting completed workout days, skipping rest days
    for (let i = 0; i < 90; i++) {
      if (checkDate < programStartDate) break

      if (isWorkoutDay(checkDate)) {
        if (completedDates.has(checkDate)) {
          count++
        } else {
          // Missed a workout day — streak broken
          break
        }
      }
      // Rest days are skipped (don't break streak)
      checkDate = subtractDays(checkDate, 1)
    }

    return count
  }, [log, programStartDate])

  const longestStreak = useMemo(() => {
    if (!programStartDate || log.length === 0) return 0

    const completedDates = new Set(log.map(e => e.date))
    const todayStr = today()

    let maxStreak = 0
    let current = 0

    // Go through all days from start to today
    let checkDate = programStartDate
    while (checkDate <= todayStr) {
      if (isWorkoutDay(checkDate)) {
        if (completedDates.has(checkDate)) {
          current++
          maxStreak = Math.max(maxStreak, current)
        } else {
          current = 0
        }
      }
      // Advance by 1 day
      const d = new Date(checkDate)
      d.setDate(d.getDate() + 1)
      checkDate = d.toISOString().split('T')[0]
    }

    return maxStreak
  }, [log, programStartDate])

  return { streak, longestStreak }
}

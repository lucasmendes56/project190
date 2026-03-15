import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { today } from '../utils/dateUtils'

export function useWorkoutLog() {
  const [log, setLog] = useLocalStorage('wt_log', [])

  const addEntry = useCallback((entry) => {
    const newEntry = {
      id: `${entry.date}_${entry.workoutId}_${Date.now()}`,
      completedAt: new Date().toISOString(),
      ...entry,
    }
    setLog(prev => [...prev, newEntry])
    return newEntry
  }, [setLog])

  const getEntryForDate = useCallback((dateStr) => {
    return log.find(e => e.date === dateStr) || null
  }, [log])

  const getEntriesForWorkout = useCallback((workoutId) => {
    return log.filter(e => e.workoutId === workoutId).sort((a, b) => a.date.localeCompare(b.date))
  }, [log])

  const getLastWeightForExercise = useCallback((exerciseId) => {
    const entries = [...log].sort((a, b) => b.date.localeCompare(a.date))
    for (const entry of entries) {
      const exData = entry.exercises?.find(e => e.id === exerciseId)
      if (exData?.sets?.length > 0) {
        const lastSet = exData.sets[exData.sets.length - 1]
        if (lastSet?.weight != null) return lastSet.weight
      }
    }
    return null
  }, [log])

  const isCompletedDate = useCallback((dateStr) => {
    return log.some(e => e.date === dateStr)
  }, [log])

  const getTodayEntry = useCallback(() => {
    return getEntryForDate(today())
  }, [getEntryForDate])

  const clearLog = useCallback(() => {
    setLog([])
  }, [setLog])

  const recentEntries = [...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  return {
    log,
    recentEntries,
    addEntry,
    getEntryForDate,
    getEntriesForWorkout,
    getLastWeightForExercise,
    isCompletedDate,
    getTodayEntry,
    clearLog,
  }
}

import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { today } from '../utils/dateUtils'
import { replaceLogEntry } from '../utils/workoutSession'

export function useWorkoutLog() {
  // ⚠️ SACRED KEY — 'wt_log' stores all workout history.
  // Never auto-clear, reset, or overwrite on app startup, version bump, or config change.
  // The only legitimate call to clearLog() is from Settings > Danger Zone after explicit user confirmation.
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

  const getEntriesForDate = useCallback((dateStr) => {
    return log.filter(e => e.date === dateStr)
  }, [log])

  // Replaces one saved workout by id. Does nothing when that workout is gone,
  // so a finish can never create a second copy by accident.
  const replaceEntryForDate = useCallback((entryId, updates) => {
    let updated = null
    setLog(prev => {
      const result = replaceLogEntry(prev, entryId, updates)
      updated = result.updated
      return result.updated ? result.log : prev
    })
    return updated
  }, [setLog])

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

  // Returns the weight used for an exercise in a specific program week (for week-over-week display).
  // Looks at completed sets first, falls back to any set. Returns null if no data for that week.
  const getWeightForExerciseInWeek = useCallback((exerciseId, weekNum) => {
    const weekEntries = [...log]
      .filter(e => e.weekNum === weekNum)
      .sort((a, b) => b.date.localeCompare(a.date))
    for (const entry of weekEntries) {
      const exData = entry.exercises?.find(e => e.id === exerciseId)
      if (exData?.sets?.length > 0) {
        const completedSets = exData.sets.filter(s => s.completed && s.weight != null)
        if (completedSets.length > 0) return completedSets[completedSets.length - 1].weight
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
    replaceEntryForDate,
    getEntryForDate,
    getEntriesForDate,
    getEntriesForWorkout,
    getLastWeightForExercise,
    getWeightForExerciseInWeek,
    isCompletedDate,
    getTodayEntry,
    clearLog,
  }
}

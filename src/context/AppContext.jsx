import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { usePersistentState } from '../hooks/usePersistentState'
import { useWorkoutLog } from '../hooks/useWorkoutLog'
import { useStreak } from '../hooks/useStreak'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { useProgram } from '../hooks/useProgram'
import { useSchedule } from '../hooks/useSchedule'
import { DEFAULT_WEEK_PATTERN } from '../utils/programUtils'
import { DRAFTS_STORAGE_KEY, normalizeDrafts, removeDraft, upsertDraft } from '../utils/workoutSession'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  programStartDate: null,
  startWeight: 175,
  targetWeight: 190,
  name: '',
  weekPattern: DEFAULT_WEEK_PATTERN,
}

export function AppProvider({ children }) {
  // localStorage key inventory:
  //   'wt_settings'    — program config (start date, weights, name). Safe to reset.
  //   'wt_log'         — ⚠️ SACRED: all workout history. Only cleared by explicit user action below.
  //   'wt_bodyweight'  — ⚠️ SACRED: all bodyweight entries. Only cleared by explicit user action below.
  //   'wt_schedule'    — explicit weekly assignments (v2 flat map). Reset on full data wipe.
  //                      Migration from v1 (DOW overrides) runs automatically in useSchedule.
  //   'wt_last_backup' — when the last backup file was saved. Not workout data.
  //   'wt_exercise_swaps' — usual replacements for a program exercise. Missing key = original plan.
  //   'wt_custom_exercises' — names typed in Swap exercise, so they can be picked again.
  //   'wt_drafts'      — in-progress workouts, one per day. Not history. Cleared when a
  //                      workout is finished and on a full data wipe. Safe to lose only
  //                      if the user discards that day.
  //
  // If the data schema for wt_log or wt_bodyweight needs to change, write a forward-only migration
  // that preserves all existing records and adds new fields with safe defaults. Never destructively
  // overwrite or reinitialize these keys during startup, hot-reload, or any config change.
  const [settings, setSettings, clearSettings] = useLocalStorage('wt_settings', DEFAULT_SETTINGS)
  const [exerciseSwaps, setExerciseSwaps, clearExerciseSwaps] = useLocalStorage('wt_exercise_swaps', {})
  const [customExercises, setCustomExercises, clearCustomExercises] = useLocalStorage('wt_custom_exercises', {})
  const workoutLog = useWorkoutLog()
  const bodyWeight = useBodyWeight()
  const { scheduleOverrides, swapWorkouts, assignWorkout, unassignWorkout, initializeSchedule } = useSchedule(settings.programStartDate)
  const { streak, longestStreak } = useStreak(workoutLog.log, settings.programStartDate, scheduleOverrides)
  const program = useProgram(settings.programStartDate, scheduleOverrides, exerciseSwaps)

  const saveExerciseSwap = useCallback((programId, record) => {
    setExerciseSwaps(prev => ({ ...(prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}), [programId]: record }))
  }, [setExerciseSwaps])

  const clearExerciseSwap = useCallback((programId) => {
    setExerciseSwaps(prev => {
      const source = prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}
      if (!Object.prototype.hasOwnProperty.call(source, programId)) return source
      const next = { ...source }
      delete next[programId]
      return next
    })
  }, [setExerciseSwaps])

  const rememberCustomExercise = useCallback((exercise) => {
    setCustomExercises(prev => ({
      ...(prev && typeof prev === 'object' && !Array.isArray(prev) ? prev : {}),
      [exercise.id]: { id: exercise.id, name: exercise.name, group: exercise.group },
    }))
  }, [setCustomExercises])

  // In-progress workouts, written immediately so a refresh or crash can resume them.
  const [drafts, setDrafts, getDrafts] = usePersistentState(DRAFTS_STORAGE_KEY, {}, normalizeDrafts)

  const putDraft = useCallback((session) => {
    setDrafts(prev => upsertDraft(prev, session))
  }, [setDrafts])

  const mutateDraft = useCallback((date, updater) => {
    setDrafts(prev => {
      const safe = normalizeDrafts(prev)
      const current = safe[date] || null
      const next = updater(current)
      if (!next || next === current) return safe
      return upsertDraft(safe, next)
    })
  }, [setDrafts])

  const clearDraft = useCallback((date) => {
    setDrafts(prev => removeDraft(prev, date))
  }, [setDrafts])

  const clearAllDrafts = useCallback(() => {
    setDrafts({})
  }, [setDrafts])

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [setSettings])

  // Rebuild the full 12-week schedule from a new week pattern and save it
  const regenerateSchedule = useCallback((weekPattern) => {
    if (!settings.programStartDate) return
    updateSettings({ weekPattern })
    initializeSchedule(settings.programStartDate, weekPattern)
  }, [settings.programStartDate, updateSettings, initializeSchedule])

  // ⚠️ resetAllData is ONLY called from Settings > Danger Zone after explicit double-confirmation.
  // Do NOT call this from any initialization path, migration, or version bump.
  const resetAllData = useCallback(() => {
    clearSettings()
    workoutLog.clearLog()
    bodyWeight.clearWeights()
    localStorage.removeItem('wt_schedule')
    clearExerciseSwaps()
    clearCustomExercises()
    clearAllDrafts()
  }, [clearSettings, workoutLog, bodyWeight, clearExerciseSwaps, clearCustomExercises, clearAllDrafts])

  const isOnboarded = !!settings.programStartDate

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      resetAllData,
      isOnboarded,
      // Workout log
      ...workoutLog,
      // Body weight
      ...bodyWeight,
      // Streaks
      streak,
      longestStreak,
      // Program
      ...program,
      // Schedule
      scheduleOverrides,
      swapWorkouts,
      assignWorkout,
      unassignWorkout,
      initializeSchedule,
      regenerateSchedule,
      exerciseSwaps,
      customExercises,
      saveExerciseSwap,
      clearExerciseSwap,
      rememberCustomExercise,
      // In-progress workouts
      drafts,
      getDrafts,
      putDraft,
      mutateDraft,
      clearDraft,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}

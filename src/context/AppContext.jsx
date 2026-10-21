import { createContext, useContext, useState, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useWorkoutLog } from '../hooks/useWorkoutLog'
import { useStreak } from '../hooks/useStreak'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { useProgram } from '../hooks/useProgram'
import { useSchedule } from '../hooks/useSchedule'
import { DEFAULT_WEEK_PATTERN } from '../utils/programUtils'

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
  //
  // If the data schema for wt_log or wt_bodyweight needs to change, write a forward-only migration
  // that preserves all existing records and adds new fields with safe defaults. Never destructively
  // overwrite or reinitialize these keys during startup, hot-reload, or any config change.
  const [settings, setSettings, clearSettings] = useLocalStorage('wt_settings', DEFAULT_SETTINGS)
  const workoutLog = useWorkoutLog()
  const bodyWeight = useBodyWeight()
  const { scheduleOverrides, swapWorkouts, assignWorkout, unassignWorkout, initializeSchedule } = useSchedule(settings.programStartDate)
  const { streak, longestStreak } = useStreak(workoutLog.log, settings.programStartDate, scheduleOverrides)
  const program = useProgram(settings.programStartDate, scheduleOverrides)

  // Active session: in-memory until workout is finished
  const [activeSession, setActiveSession] = useState(null)

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
    setActiveSession(null)
  }, [clearSettings, workoutLog, bodyWeight])

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
      // Active session
      activeSession,
      setActiveSession,
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

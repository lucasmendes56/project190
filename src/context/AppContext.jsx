import { createContext, useContext, useState, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useWorkoutLog } from '../hooks/useWorkoutLog'
import { useStreak } from '../hooks/useStreak'
import { useBodyWeight } from '../hooks/useBodyWeight'
import { useProgram } from '../hooks/useProgram'

const AppContext = createContext(null)

const DEFAULT_SETTINGS = {
  programStartDate: null,
  startWeight: 175,
  targetWeight: 190,
  name: '',
}

export function AppProvider({ children }) {
  const [settings, setSettings, clearSettings] = useLocalStorage('wt_settings', DEFAULT_SETTINGS)
  const workoutLog = useWorkoutLog()
  const bodyWeight = useBodyWeight()
  const { streak, longestStreak } = useStreak(workoutLog.log, settings.programStartDate)
  const program = useProgram(settings.programStartDate)

  // Active session: in-memory until workout is finished
  const [activeSession, setActiveSession] = useState(null)

  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [setSettings])

  const resetAllData = useCallback(() => {
    clearSettings()
    workoutLog.clearLog()
    bodyWeight.clearWeights()
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

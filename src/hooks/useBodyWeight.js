import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { today } from '../utils/dateUtils'

export function useBodyWeight() {
  const [entries, setEntries] = useLocalStorage('wt_bodyweight', [])

  const logWeight = useCallback((weight, dateStr = today()) => {
    setEntries(prev => {
      const filtered = prev.filter(e => e.date !== dateStr)
      return [...filtered, { date: dateStr, weight: parseFloat(weight) }]
        .sort((a, b) => a.date.localeCompare(b.date))
    })
  }, [setEntries])

  const latestWeight = entries.length > 0
    ? [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].weight
    : null

  const clearWeights = useCallback(() => {
    setEntries([])
  }, [setEntries])

  return { entries, logWeight, latestWeight, clearWeights }
}

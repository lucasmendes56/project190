import { useCallback, useRef, useState } from 'react'

function readStored(key, initialValue, normalize) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return initialValue
    const parsed = JSON.parse(raw)
    return normalize ? normalize(parsed) : parsed
  } catch (err) {
    console.error(`usePersistentState: failed to parse key "${key}" — returning default`, err)
    return initialValue
  }
}

// Like useLocalStorage, but functional updates always see the latest value and
// the write happens immediately. Used for in-progress workouts so a crash cannot
// land between a keystroke and the save. Does not touch wt_log or wt_bodyweight.
export function usePersistentState(key, initialValue, normalize) {
  const [state, setState] = useState(() => readStored(key, initialValue, normalize))
  const latest = useRef(state)

  const setValue = useCallback((value) => {
    const nextRaw = typeof value === 'function' ? value(latest.current) : value
    const next = normalize ? normalize(nextRaw) : nextRaw
    latest.current = next
    setState(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch (err) {
      console.error(`usePersistentState set error [${key}]:`, err)
    }
  }, [key, normalize])

  const getValue = useCallback(() => latest.current, [])

  return [state, setValue, getValue]
}

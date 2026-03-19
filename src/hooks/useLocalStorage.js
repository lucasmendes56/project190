import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      // JSON.parse failed — data is corrupted in storage. Log visibly so this is never silent.
      // ⚠️ For sacred keys (wt_log, wt_bodyweight) this means stored data is unreadable,
      // NOT that it should be erased. The raw value remains in localStorage untouched until
      // the next setValue call overwrites it. Do not add any localStorage.removeItem() here.
      console.error(`useLocalStorage: failed to parse key "${key}" — returning default`)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) {
      console.error(`useLocalStorage set error [${key}]:`, err)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      localStorage.removeItem(key)
    } catch (err) {
      console.error(`useLocalStorage remove error [${key}]:`, err)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

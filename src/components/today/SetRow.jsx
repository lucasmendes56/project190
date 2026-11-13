import { useEffect, useRef, useState } from 'react'

function parsed(weightStr, repsStr, completed) {
  const weight = parseFloat(weightStr)
  const reps = parseInt(repsStr, 10)
  return {
    weight: Number.isNaN(weight) ? 0 : weight,
    reps: Number.isNaN(reps) ? 0 : reps,
    completed,
  }
}

export default function SetRow({ setNum, set, onChange }) {
  const [localWeight, setLocalWeight] = useState(String(set.weight ?? ''))
  const [localReps, setLocalReps] = useState(String(set.reps ?? ''))
  const weightRef = useRef(null)
  const repsRef = useRef(null)
  const completedRef = useRef(Boolean(set.completed))
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    completedRef.current = Boolean(set.completed)
    onChangeRef.current = onChange
  }, [set.completed, onChange])

  function emit(weightStr, repsStr, completed) {
    completedRef.current = completed
    onChangeRef.current(parsed(weightStr, repsStr, completed))
  }

  function flush() {
    const weight = weightRef.current?.value ?? localWeight
    const reps = repsRef.current?.value ?? localReps
    onChangeRef.current(parsed(weight, reps, completedRef.current))
  }

  useEffect(() => {
    function onPageHide() {
      const weight = weightRef.current?.value ?? ''
      const reps = repsRef.current?.value ?? ''
      onChangeRef.current(parsed(weight, reps, completedRef.current))
    }
    function onHide() {
      if (document.visibilityState === 'hidden') onPageHide()
    }
    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 transition-colors"
      style={{ background: set.completed ? '#0a0000' : '#111' }}
    >
      <span className="w-5 text-center text-xs font-mono font-bold text-muted">{setNum}</span>

      <div className="flex-1">
        <div className="relative">
          <input
            ref={weightRef}
            type="number"
            inputMode="decimal"
            autoComplete="off"
            value={localWeight}
            onChange={e => {
              setLocalWeight(e.target.value)
              emit(e.target.value, localReps, set.completed)
            }}
            onBlur={flush}
            placeholder="0"
            aria-label={`Set ${setNum} weight`}
            className="w-full border px-2 py-1.5 text-sm font-mono text-white text-center focus:outline-none pr-10"
            style={{ background: '#000', borderColor: '#222', caretColor: '#DC2626' }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: '#333' }}>LBS</span>
        </div>
      </div>

      <span className="font-mono text-muted text-sm">×</span>

      <div className="flex-1">
        <input
          ref={repsRef}
          type="number"
          inputMode="numeric"
          autoComplete="off"
          value={localReps}
          onChange={e => {
            setLocalReps(e.target.value)
            emit(localWeight, e.target.value, set.completed)
          }}
          onBlur={flush}
          placeholder="0"
          aria-label={`Set ${setNum} reps`}
          className="w-full border px-2 py-1.5 text-sm font-mono text-white text-center focus:outline-none"
          style={{ background: '#000', borderColor: '#222', caretColor: '#DC2626' }}
        />
      </div>

      <button
        type="button"
        onClick={() => emit(weightRef.current?.value ?? localWeight, repsRef.current?.value ?? localReps, !set.completed)}
        className="w-8 h-8 flex items-center justify-center transition-all flex-shrink-0 border"
        aria-label={set.completed ? `Mark set ${setNum} not done` : `Mark set ${setNum} done`}
        style={{
          borderColor: set.completed ? '#DC2626' : '#333',
          background: set.completed ? '#DC2626' : 'transparent',
        }}
      >
        {set.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  )
}

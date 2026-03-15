import { useState } from 'react'

export default function SetRow({ setNum, set, onChange }) {
  const [localWeight, setLocalWeight] = useState(String(set.weight ?? ''))
  const [localReps, setLocalReps] = useState(String(set.reps ?? ''))

  function commit() {
    const w = parseFloat(localWeight)
    const r = parseInt(localReps)
    onChange({
      weight: isNaN(w) ? 0 : w,
      reps: isNaN(r) ? 0 : r,
      completed: set.completed,
    })
  }

  function toggle() {
    const w = parseFloat(localWeight)
    const r = parseInt(localReps)
    onChange({
      weight: isNaN(w) ? 0 : w,
      reps: isNaN(r) ? 0 : r,
      completed: !set.completed,
    })
  }

  return (
    <div
      className="flex items-center gap-3 py-2 px-3 transition-colors"
      style={{ background: set.completed ? '#0a0000' : '#111' }}
    >
      <span className="w-5 text-center text-xs font-mono font-bold text-muted">{setNum}</span>

      <div className="flex-1">
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={localWeight}
            onChange={e => setLocalWeight(e.target.value)}
            onBlur={commit}
            placeholder="0"
            className="w-full border px-2 py-1.5 text-sm font-mono text-white text-center focus:outline-none pr-10"
            style={{ background: '#000', borderColor: '#222', caretColor: '#DC2626' }}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: '#333' }}>LBS</span>
        </div>
      </div>

      <span className="font-mono text-muted text-sm">×</span>

      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={localReps}
          onChange={e => setLocalReps(e.target.value)}
          onBlur={commit}
          placeholder="0"
          className="w-full border px-2 py-1.5 text-sm font-mono text-white text-center focus:outline-none"
          style={{ background: '#000', borderColor: '#222', caretColor: '#DC2626' }}
        />
      </div>

      <button
        onClick={toggle}
        className="w-8 h-8 flex items-center justify-center transition-all flex-shrink-0 border"
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

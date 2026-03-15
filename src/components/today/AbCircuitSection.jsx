import { useState } from 'react'

export default function AbCircuitSection({ circuit, completed, onToggle }) {
  const [expanded, setExpanded] = useState(false)

  if (!circuit) return null

  const allDone = circuit.exercises.every(ex => completed.includes(ex.id))

  return (
    <div
      className="border transition-colors"
      style={{
        borderColor: allDone ? '#DC2626' : '#1a1a1a',
        background: allDone ? '#0a0000' : '#0d0d0d',
      }}
    >
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border flex items-center justify-center text-xs font-mono font-black text-primary" style={{ borderColor: '#DC2626', background: '#0a0000' }}>
            {circuit.id}
          </div>
          <div className="text-left">
            <p className="font-mono font-bold text-white text-sm uppercase tracking-wide">Ab Circuit {circuit.id}</p>
            <p className="text-xs font-mono text-muted">{circuit.focus} · 5 min</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-muted">{completed.length}/{circuit.exercises.length}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`w-4 h-4 text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-1.5" style={{ borderTop: '1px solid #1a1a1a' }}>
          <div className="pt-3 pb-1">
            {circuit.exercises.map(ex => {
              const done = completed.includes(ex.id)
              return (
                <button
                  key={ex.id}
                  onClick={() => onToggle(ex.id)}
                  className="w-full flex items-center gap-3 py-2.5 text-left transition-opacity active:opacity-60"
                  style={{ borderBottom: '1px solid #111' }}
                >
                  <div
                    className="w-5 h-5 flex-shrink-0 flex items-center justify-center border"
                    style={{
                      borderColor: done ? '#DC2626' : '#333',
                      background: done ? '#DC2626' : 'transparent',
                    }}
                  >
                    {done && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-mono font-bold uppercase tracking-wide ${done ? 'text-primary' : 'text-white'}`}>{ex.name}</p>
                    <p className="text-[10px] font-mono text-muted">{ex.reps} · {ex.notes}</p>
                  </div>
                </button>
              )
            })}
          </div>
          <p className="text-[9px] font-mono text-muted pt-1">30–45 sec rest. One continuous round.</p>
        </div>
      )}
    </div>
  )
}

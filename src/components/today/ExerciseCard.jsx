import SetRow from './SetRow'

export default function ExerciseCard({ exercise, sets, onSetsChange, lastWeight }) {
  const completedCount = sets.filter(s => s.completed).length
  const allDone = completedCount === sets.length && sets.length > 0

  function updateSet(idx, updated) {
    const next = sets.map((s, i) => i === idx ? { ...s, ...updated } : s)
    onSetsChange(next)
  }

  return (
    <div
      className="border transition-colors"
      style={{
        borderColor: allDone ? '#DC2626' : '#1a1a1a',
        background: allDone ? '#0a0000' : '#0d0d0d',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-mono font-bold text-white text-sm uppercase tracking-wide">{exercise.name}</p>
            {exercise.superset && (
              <span className="text-[9px] font-mono tracking-widest border px-1.5 py-0.5" style={{ color: '#555', borderColor: '#1a1a1a' }}>SUPERSET</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs font-mono text-muted">{exercise.muscle}</p>
            <span className="text-muted/30">·</span>
            <p className="text-xs font-mono text-primary font-bold">{exercise.sets} × {exercise.reps}</p>
          </div>
        </div>
        <span className={`text-xs font-mono font-bold ml-2 flex-shrink-0 ${allDone ? 'text-primary' : 'text-muted'}`}>
          {completedCount}/{sets.length}
        </span>
      </div>

      {/* Sets */}
      <div className="px-4 pb-4 space-y-2">
        {lastWeight != null && (
          <p className="text-xs font-mono text-muted mb-1">
            LAST: <span className="text-primary font-bold">{lastWeight === 0 ? 'BW' : `${lastWeight}LBS`}</span>
          </p>
        )}
        {sets.map((set, idx) => (
          <SetRow
            key={idx}
            setNum={idx + 1}
            set={set}
            onChange={(updated) => updateSet(idx, updated)}
          />
        ))}
        {exercise.notes && (
          <p className="text-xs font-mono text-muted/50 mt-1">{exercise.notes}</p>
        )}
      </div>
    </div>
  )
}

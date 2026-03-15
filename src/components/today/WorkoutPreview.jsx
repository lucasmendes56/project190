// Read-only workout view — used when browsing days other than today

export default function WorkoutPreview({ workout, completed, onDoToday }) {
  if (!workout) {
    return (
      <div className="text-center py-12">
        <p className="text-2xl font-mono text-muted mb-2">—</p>
        <p className="text-xs font-mono tracking-widest text-muted">REST DAY</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Workout header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-lg font-mono font-black text-white uppercase tracking-wide">{workout.name}</h2>
          {workout.optional && (
            <span className="text-[9px] font-mono tracking-widest border px-2 py-0.5 text-muted" style={{ borderColor: '#1a1a1a' }}>
              OPTIONAL
            </span>
          )}
        </div>
        {completed && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-primary">
            <span className="w-1.5 h-1.5 inline-block" style={{ background: '#DC2626' }} /> COMPLETED
          </span>
        )}
      </div>

      {/* Sections */}
      {workout.sections.map(section => (
        <div key={section.id} className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: section.optional ? '#1a1a1a' : '#DC2626', opacity: 0.4 }} />
            <span className={`text-[10px] font-mono font-black tracking-[0.4em] uppercase ${section.optional ? 'text-muted' : 'text-primary'}`}>
              {section.label}
            </span>
            <div className="h-px flex-1" style={{ background: section.optional ? '#1a1a1a' : '#DC2626', opacity: 0.4 }} />
          </div>
          {section.sublabel && (
            <p className="text-xs font-mono text-muted text-center mb-3">{section.sublabel}</p>
          )}

          <div className="space-y-1.5">
            {section.exercises.map((ex) => (
              <div
                key={ex.id}
                className="border px-4 py-3 flex items-start justify-between gap-3"
                style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono font-bold text-white uppercase tracking-wide leading-tight">{ex.name}</p>
                    {ex.superset && (
                      <span className="text-[9px] font-mono border px-1 py-0.5 flex-shrink-0" style={{ color: '#555', borderColor: '#1a1a1a' }}>SS</span>
                    )}
                  </div>
                  <p className="text-xs font-mono mt-0.5" style={{ color: '#444' }}>{ex.muscle}</p>
                  {ex.notes && (
                    <p className="text-xs font-mono mt-1" style={{ color: '#333' }}>{ex.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-mono font-bold text-primary">{ex.sets} × {ex.reps}</p>
                  <p className="text-[9px] font-mono" style={{ color: '#333' }}>SETS × REPS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Ab Circuit */}
      {workout.abCircuit && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: '#1a1a1a' }} />
            <span className="text-[10px] font-mono font-black tracking-[0.4em] uppercase text-muted">
              AB CIRCUIT {workout.abCircuit.id}
            </span>
            <div className="h-px flex-1" style={{ background: '#1a1a1a' }} />
          </div>
          <div className="border px-4 py-3" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
            <p className="text-xs font-mono font-bold text-white uppercase tracking-wide mb-2">{workout.abCircuit.focus}</p>
            <div className="space-y-1.5">
              {workout.abCircuit.exercises.map(ex => (
                <div key={ex.id} className="flex items-start justify-between gap-3">
                  <p className="text-xs font-mono text-muted flex-1">{ex.name}</p>
                  <p className="text-xs font-mono text-primary font-bold flex-shrink-0">{ex.reps}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!completed && onDoToday && (
        <button
          onClick={() => onDoToday(workout)}
          className="w-full mt-2 mb-6 border border-primary text-primary font-mono font-bold text-sm py-4 tracking-widest uppercase active:opacity-70 transition-opacity"
        >
          DO THIS WORKOUT TODAY
        </button>
      )}
    </div>
  )
}

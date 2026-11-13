import { friendlyDate } from '../../utils/dateUtils'

function formatLoad(weight) {
  return weight === 0 ? 'BW' : `${weight} LBS`
}

export default function LoggedWorkoutReview({ entries, onUpdate }) {
  if (!entries?.length) return null

  return (
    <div className="animate-fade-in">
      <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-primary mb-2">SAVED WORKOUT</p>
      <p className="text-xs font-mono text-muted mb-4">
        This day already has a saved workout. Look it over, or update it.
      </p>
      <div className="space-y-4">
        {entries.map(entry => {
          const totalSets = entry.exercises?.reduce((sum, exercise) => sum + (exercise.sets?.length || 0), 0) ?? 0
          return (
            <div key={entry.id} className="border p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
              <p className="text-sm font-mono font-bold text-white uppercase tracking-wide">{entry.workoutName}</p>
              <p className="text-[10px] font-mono text-muted mt-1 mb-3">
                {friendlyDate(entry.date)} · {totalSets} SETS
              </p>
              <div className="space-y-3 mb-4">
                {(entry.exercises || []).filter(exercise => exercise.sets?.length > 0).map((exercise, index) => (
                  <div key={exercise.programId || `${exercise.id}-${index}`}>
                    <p className="text-xs font-mono font-bold text-white uppercase tracking-wide">{exercise.name}</p>
                    <div className="mt-1 space-y-0.5">
                      {exercise.sets.map((set, setIndex) => (
                        <p key={setIndex} className="text-xs font-mono text-muted">
                          Set {setIndex + 1}: {formatLoad(set.weight)} × {set.reps}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                {entry.abCompleted?.length > 0 && (
                  <p className="text-xs font-mono text-muted">Ab circuit: {entry.abCompleted.length} done</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onUpdate(entry)}
                className="w-full border border-primary text-primary font-mono font-bold text-sm py-3 tracking-[0.25em] uppercase active:opacity-70"
              >
                UPDATE THIS WORKOUT
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

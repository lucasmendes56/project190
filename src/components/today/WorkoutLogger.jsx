import { useMemo } from 'react'
import ExerciseCard from './ExerciseCard'
import AbCircuitSection from './AbCircuitSection'

export default function WorkoutLogger({
  template,
  session,
  dateLabel,
  resumed,
  updating,
  saveFlash,
  warning,
  onSave,
  onFinish,
  onBack,
  onCancelUpdate,
  onChangeWorkout,
  onSetsChange,
  onToggleAb,
  onSwapLift,
  onSwapAb,
  lastWeightFor,
  lastWeekWeightFor,
}) {
  const completedSetCount = session.sections
    .flatMap(section => section.exercises.flatMap(exercise => exercise.sets))
    .filter(set => set.completed).length
  const totalSetCount = session.sections
    .flatMap(section => section.exercises.flatMap(exercise => exercise.sets)).length

  const finishLabel = updating ? 'SAVE CHANGES' : (dateLabel ? 'FINISH THIS DAY' : 'FINISH SESSION')
  const abCircuit = useMemo(() => {
    const circuit = template.abCircuit
    if (!circuit) return null
    const overrides = session.abSwaps || {}
    return {
      ...circuit,
      exercises: circuit.exercises.map(ex => {
        const programId = ex.programId || ex.id
        const override = overrides[programId]
        if (!override) return { ...ex, programId }
        return {
          ...ex,
          programId,
          id: override.id,
          name: override.name,
          muscle: override.muscle || ex.muscle,
          notes: override.id === programId ? ex.notes : undefined,
          swapped: override.id !== programId,
        }
      }),
    }
  }, [template, session])

  return (
    <div>
      {dateLabel && (
        <div className="border px-4 py-3 mb-4" style={{ borderColor: '#3a0000', background: '#0a0000' }}>
          <p className="text-[10px] font-mono font-bold tracking-[0.35em] uppercase text-primary">
            {updating ? 'UPDATING' : 'LOGGING'} {dateLabel.toUpperCase()}
          </p>
          <p className="text-xs font-mono text-muted mt-1">
            {updating
              ? 'This replaces the saved workout only when you tap Save Changes.'
              : 'This is saved on this day, not today.'}
          </p>
        </div>
      )}

      {resumed && (
        <p className="text-xs font-mono text-primary mb-4">Picked up where you left off.</p>
      )}

      {warning && (
        <p className="text-xs font-mono mb-4" style={{ color: '#DC2626' }}>{warning}</p>
      )}

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-mono font-black text-white uppercase tracking-wide">{template.name}</h1>
          {template.phase?.tip && (
            <p className="text-[10px] font-mono text-muted mt-0.5 tracking-widest">{template.phase.tip}</p>
          )}
        </div>
        {onChangeWorkout && (
          <button
            type="button"
            onClick={onChangeWorkout}
            className="flex-shrink-0 text-[9px] font-mono font-bold tracking-widest uppercase border px-2.5 py-1.5 active:opacity-60"
            style={{ borderColor: '#1a1a1a', color: '#444' }}
          >
            CHANGE
          </button>
        )}
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-[10px] font-mono text-muted mb-1.5">
          <span>{completedSetCount} / {totalSetCount} SETS</span>
          <span>{totalSetCount > 0 ? Math.round((completedSetCount / totalSetCount) * 100) : 0}%</span>
        </div>
        <div className="h-px overflow-hidden" style={{ background: '#1a1a1a' }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: totalSetCount > 0 ? `${(completedSetCount / totalSetCount) * 100}%` : '0%',
              background: '#DC2626',
            }}
          />
        </div>
      </div>

      {template.sections.map(sectionTemplate => {
        const sessionSection = session.sections.find(section => section.sectionId === sectionTemplate.id)
        if (!sessionSection) return null
        return (
          <div key={sectionTemplate.id} className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: sectionTemplate.optional ? '#1a1a1a' : '#DC2626', opacity: 0.4 }} />
              <span className={`text-[10px] font-mono font-black tracking-[0.4em] uppercase ${sectionTemplate.optional ? 'text-muted' : 'text-primary'}`}>
                {sectionTemplate.label}
              </span>
              <div className="h-px flex-1" style={{ background: sectionTemplate.optional ? '#1a1a1a' : '#DC2626', opacity: 0.4 }} />
            </div>
            {sectionTemplate.sublabel && (
              <p className="text-xs font-mono text-muted text-center mb-3">{sectionTemplate.sublabel}</p>
            )}
            <div className="space-y-3">
              {sectionTemplate.exercises.map(exTemplate => {
                const slotId = exTemplate.programId || exTemplate.id
                const sessionEx = sessionSection.exercises.find(exercise => (exercise.programId || exercise.id) === slotId)
                if (!sessionEx) return null
                const exercise = {
                  ...exTemplate,
                  id: sessionEx.id,
                  name: sessionEx.name,
                  muscle: sessionEx.muscle || exTemplate.muscle,
                  defaultWeight: sessionEx.defaultWeight ?? exTemplate.defaultWeight,
                  programId: slotId,
                  swapped: sessionEx.id !== slotId,
                  notes: sessionEx.id === slotId ? exTemplate.notes : null,
                }
                return (
                  <ExerciseCard
                    key={slotId}
                    exercise={exercise}
                    sets={sessionEx.sets}
                    onSetsChange={(sets) => onSetsChange(sectionTemplate.id, slotId, sets)}
                    lastWeight={lastWeightFor(exercise.id)}
                    lastWeekWeight={lastWeekWeightFor(exercise.id)}
                    onSwap={onSwapLift ? () => onSwapLift(sectionTemplate.id, exercise) : null}
                  />
                )
              })}
            </div>
          </div>
        )
      })}

      {abCircuit && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1" style={{ background: '#1a1a1a' }} />
            <span className="text-[10px] font-mono font-black tracking-[0.4em] uppercase text-muted">
              AB CIRCUIT {abCircuit.id}
            </span>
            <div className="h-px flex-1" style={{ background: '#1a1a1a' }} />
          </div>
          <p className="text-xs font-mono text-muted text-center mb-3">5 MIN — ALWAYS DO THIS</p>
          <div className="mb-6">
            <AbCircuitSection
              circuit={abCircuit}
              completed={session.abCompleted || []}
              onToggle={onToggleAb}
              onSwap={onSwapAb}
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={onFinish}
        className="w-full border border-primary text-primary font-mono font-black text-sm py-4 tracking-[0.3em] uppercase active:opacity-70 transition-opacity"
      >
        {finishLabel}
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-[10px] font-mono font-bold tracking-widest uppercase py-3 active:opacity-60"
          style={{ color: '#333' }}
        >
          BACK
        </button>
      )}

      {onCancelUpdate && (
        <button
          type="button"
          onClick={onCancelUpdate}
          className="w-full text-[10px] font-mono font-bold tracking-widest uppercase py-3 active:opacity-60"
          style={{ color: '#333' }}
        >
          CANCEL CHANGES
        </button>
      )}

      {/* Room so the last button can scroll clear of the Save bar and the tab bar. */}
      <div className="h-24" />

      <div
        className="fixed left-0 right-0 z-40 px-4 pt-3 pb-2"
        style={{ bottom: '53px', background: 'linear-gradient(to top, #000 75%, rgba(0,0,0,0))' }}
      >
        <div className="max-w-lg mx-auto">
          <button
            type="button"
            onClick={onSave}
            className="w-full min-h-12 font-mono font-black text-sm py-3 tracking-[0.35em] uppercase active:opacity-70"
            style={{ background: '#DC2626', color: '#fff' }}
          >
            {saveFlash ? 'SAVED' : 'SAVE'}
          </button>
        </div>
      </div>
    </div>
  )
}

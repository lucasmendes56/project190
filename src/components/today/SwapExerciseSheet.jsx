import { useState } from 'react'
import { customExerciseFromName } from '../../data/exerciseSwaps'

export default function SwapExerciseSheet({
  group,
  groupLabel,
  planned,
  currentId,
  choices,
  onConfirm,
  onClose,
}) {
  const [pending, setPending] = useState(null)
  const [typing, setTyping] = useState(false)
  const [customName, setCustomName] = useState('')
  const [error, setError] = useState(null)

  function choose(target) {
    setError(null)
    setPending(target)
  }

  function submitCustom(event) {
    event.preventDefault()
    const typed = event.currentTarget.querySelector('input')?.value
    const exercise = customExerciseFromName(typed || customName, group)
    if (!exercise) {
      setError('Type the exercise name.')
      return
    }
    choose(exercise)
  }

  const showPlanned = planned && planned.id !== currentId

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-h-[85vh] overflow-y-auto p-5 pb-8"
        style={{ background: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase" style={{ color: '#DC2626' }}>
            Swap exercise
          </p>
          <button type="button" onClick={onClose} className="text-muted text-xs font-mono">✕</button>
        </div>
        <p className="text-xs font-mono text-muted mb-4">{groupLabel}</p>

        {pending ? (
          <div>
            <p className="text-sm font-mono font-bold text-white uppercase tracking-wide mb-2">{pending.name}</p>
            <p className="text-xs font-mono text-muted mb-4">
              Use this just today, or every time this exercise comes up? Weights for it are remembered on their own.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onConfirm(pending, false)}
                className="flex-1 border text-xs font-mono font-bold py-3 tracking-widest uppercase"
                style={{ borderColor: '#1a1a1a', color: '#d0d0d0' }}
              >
                Just today
              </button>
              <button
                type="button"
                onClick={() => onConfirm(pending, true)}
                className="flex-1 border text-xs font-mono font-bold py-3 tracking-widest uppercase"
                style={{ borderColor: '#DC2626', color: '#DC2626' }}
              >
                Every time
              </button>
            </div>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="w-full text-muted text-[10px] font-mono py-3 mt-2 tracking-widest uppercase"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {showPlanned && (
              <button
                type="button"
                onClick={() => choose({ ...planned, restore: true, name: planned.name })}
                className="w-full border px-4 py-3 text-left active:opacity-60"
                style={{ borderColor: '#1a1a1a', background: '#000' }}
              >
                <p className="text-sm font-mono font-bold text-white uppercase tracking-wide">{planned.name}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#555' }}>The planned exercise</p>
              </button>
            )}
            {choices.builtIn.map(exercise => (
              <ChoiceButton key={exercise.id} exercise={exercise} onChoose={choose} />
            ))}
            {choices.custom.length > 0 && (
              <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted pt-2">Yours</p>
            )}
            {choices.custom.map(exercise => (
              <ChoiceButton key={exercise.id} exercise={exercise} onChoose={choose} />
            ))}

            {typing ? (
              <form onSubmit={submitCustom} className="pt-2 space-y-2">
                <label className="block text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted">Other / type my own</label>
                <input
                  type="text"
                  value={customName}
                  onChange={event => { setCustomName(event.target.value); setError(null) }}
                  placeholder="Exercise name"
                  autoFocus
                  maxLength={60}
                  className="w-full border px-4 py-3 text-white text-base font-mono focus:outline-none"
                  style={{ background: '#000', borderColor: '#1a1a1a', caretColor: '#DC2626' }}
                />
                {error && <p className="text-xs font-mono" style={{ color: '#DC2626' }}>{error}</p>}
                <button
                  type="submit"
                  className="w-full border border-primary text-primary font-mono font-bold text-xs py-3 tracking-widest uppercase"
                >
                  Use this name
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setTyping(true)}
                className="w-full border px-4 py-3 text-left active:opacity-60"
                style={{ borderColor: '#1a1a1a', color: '#d0d0d0' }}
              >
                <p className="text-sm font-mono font-bold uppercase tracking-wide">Other / type my own</p>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ChoiceButton({ exercise, onChoose }) {
  return (
    <button
      type="button"
      onClick={() => onChoose(exercise)}
      className="w-full border px-4 py-3 text-left active:opacity-60"
      style={{ borderColor: '#1a1a1a', background: '#000' }}
    >
      <p className="text-sm font-mono font-bold text-white uppercase tracking-wide">{exercise.name}</p>
      {exercise.lastWeight != null && (
        <p className="text-[10px] font-mono mt-0.5" style={{ color: '#555' }}>
          Last: {exercise.lastWeight === 0 ? 'BW' : `${exercise.lastWeight} lbs`}
        </p>
      )}
    </button>
  )
}

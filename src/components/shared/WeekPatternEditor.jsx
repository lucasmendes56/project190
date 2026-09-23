import { getWorkoutSlots } from '../../utils/programUtils'

// Editable 7-day weekly pattern.
// pattern: array of 7 values — 0|1|2|3 (mandatory workout index), 'optional', or null (rest)
// phaseId: which phase to show workout names for (default: 'foundation' = Phase 1)
export default function WeekPatternEditor({ pattern, onChange, phaseId = 'foundation' }) {
  const { mandatory, optional } = getWorkoutSlots(phaseId)

  const options = [
    { value: 'rest', label: 'REST' },
    ...mandatory.map((w, i) => ({ value: String(i), label: w.name.toUpperCase() })),
    ...(optional ? [{ value: 'optional', label: `${optional.name.toUpperCase()} (OPT)` }] : []),
  ]

  function handleChange(dayIndex, value) {
    const next = [...pattern]
    next[dayIndex] = value === 'rest' ? null : value === 'optional' ? 'optional' : Number(value)
    onChange(next)
  }

  return (
    <div className="space-y-1.5">
      {pattern.map((slot, i) => {
        const selectVal = slot === null ? 'rest' : String(slot)
        const isWorkout = slot !== null
        return (
          <div key={i} className="flex items-center gap-3">
            <span
              className="text-[9px] font-mono font-bold tracking-widest w-10 flex-shrink-0 text-right"
              style={{ color: isWorkout ? '#DC2626' : '#2a2a2a' }}
            >
              D{i + 1}
            </span>
            <select
              value={selectVal}
              onChange={e => handleChange(i, e.target.value)}
              className="flex-1 text-xs font-mono py-2.5 px-3 focus:outline-none border"
              style={{
                background: '#000',
                color: isWorkout ? '#fff' : '#3a3a3a',
                borderColor: isWorkout ? '#1a1a1a' : '#0f0f0f',
                colorScheme: 'dark',
              }}
            >
              {options.map(o => (
                <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}

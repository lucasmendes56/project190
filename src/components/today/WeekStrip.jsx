import { addDays, isToday, isPast } from '../../utils/dateUtils'
import { getMandatoryWorkouts, getEffectiveWorkoutId } from '../../utils/programUtils'
import { shortWorkoutNavLabel } from '../../utils/workoutLabels'

// Four mandatory slots for the current week (completion / missed UI).
// Text under each cell: logged workout name only when done — never from schedule.
export default function WeekStrip({ programStartDate, currentWeek, currentPhase, isCompletedDate, scheduleOverrides, getEntryForDate }) {
  if (!programStartDate || !currentWeek || !currentPhase) return null

  const weekStartDate = addDays(programStartDate, (currentWeek - 1) * 7)
  const mandatory = getMandatoryWorkouts(currentPhase.id)

  const cells = mandatory.map(w => {
    let assignedDate = null
    for (let i = 0; i < 7; i++) {
      const d = addDays(weekStartDate, i)
      if (getEffectiveWorkoutId(d, programStartDate, scheduleOverrides) === w.id) {
        assignedDate = d
        break
      }
    }
    const done = assignedDate ? isCompletedDate(assignedDate) : false
    const todayCell = assignedDate ? isToday(assignedDate) : false
    const past = assignedDate ? (isPast(assignedDate) && !todayCell) : false
    const missed = past && !done
    const entry = assignedDate && getEntryForDate ? getEntryForDate(assignedDate) : null
    const label = done && entry?.workoutName ? shortWorkoutNavLabel(entry.workoutName) : ''
    return {
      key: w.id,
      label,
      done,
      todayCell,
      missed,
      unassigned: !assignedDate,
    }
  })

  const doneCount = cells.filter(c => c.done).length

  return (
    <div className="border mb-4 p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted">THIS WEEK</span>
        <span className="text-[10px] font-mono text-muted">{doneCount}/4</span>
      </div>
      <div className="flex justify-between">
        {cells.map(({ key, label, done, todayCell, missed, unassigned }) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <div
              className="w-10 h-10 flex items-center justify-center border transition-all"
              style={{
                borderColor: done ? '#DC2626' : todayCell ? '#DC2626' : missed ? '#3a0000' : '#1a1a1a',
                background: done ? '#1a0000' : todayCell ? '#0d0000' : 'transparent',
              }}
            >
              {done ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2.5} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : missed ? (
                <span className="text-xs font-mono font-bold" style={{ color: '#3a0000' }}>X</span>
              ) : unassigned ? (
                <span className="text-xs font-mono" style={{ color: '#333' }}>?</span>
              ) : todayCell ? (
                <span className="text-xs font-mono text-primary">●</span>
              ) : (
                <span className="text-xs font-mono" style={{ color: '#222' }}>●</span>
              )}
            </div>
            <span
              className={`text-[9px] font-mono font-bold tracking-widest min-h-[11px] ${
                label
                  ? todayCell ? 'text-primary' : done ? 'text-primary/60' : 'text-muted/50'
                  : 'text-transparent'
              }`}
            >
              {label || '\u00a0'}
            </span>
          </div>
        ))}
      </div>
      {doneCount === 4 && (
        <p className="text-[10px] font-mono text-primary text-center mt-3 tracking-widest">PERFECT WEEK</p>
      )}
    </div>
  )
}

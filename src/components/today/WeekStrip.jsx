import { addDays, isToday, isPast } from '../../utils/dateUtils'
import { isWorkoutDay } from '../../utils/programUtils'

export default function WeekStrip({ programStartDate, currentWeek, isCompletedDate }) {
  if (!programStartDate || !currentWeek) return null

  const weekStartDate = addDays(programStartDate, (currentWeek - 1) * 7)
  const workoutOffsets = [0, 1, 3, 4]
  const workoutDayLabels = ['MON', 'TUE', 'THU', 'FRI']

  const days = workoutOffsets.map((offset, i) => {
    const dateStr = addDays(weekStartDate, offset)
    const done = isCompletedDate(dateStr)
    const todayCell = isToday(dateStr)
    const past = isPast(dateStr) && !todayCell
    const missed = past && !done && isWorkoutDay(dateStr)
    return { dateStr, done, todayCell, missed, label: workoutDayLabels[i] }
  })

  const doneCount = days.filter(d => d.done).length

  return (
    <div className="border mb-4 p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted">THIS WEEK</span>
        <span className="text-[10px] font-mono text-muted">{doneCount}/4</span>
      </div>
      <div className="flex justify-between">
        {days.map(({ dateStr, done, todayCell, missed, label }) => (
          <div key={dateStr} className="flex flex-col items-center gap-1.5">
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
              ) : todayCell ? (
                <span className="text-xs font-mono text-primary">●</span>
              ) : (
                <span className="text-xs font-mono" style={{ color: '#222' }}>●</span>
              )}
            </div>
            <span className={`text-[9px] font-mono font-bold tracking-widest ${
              todayCell ? 'text-primary' : done ? 'text-primary/60' : missed ? 'text-muted/40' : 'text-muted/30'
            }`}>
              {label}
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

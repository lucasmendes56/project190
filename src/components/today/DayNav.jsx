import { useRef } from 'react'
import { addDays, isToday, dayOfWeek } from '../../utils/dateUtils'
import { shortWorkoutNavLabel } from '../../utils/workoutLabels'

const DOW_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const SWIPE_THRESHOLD_PX = 50

// Shows 7 days centered on `centerDate`. Swipe right → previous week, swipe left → toward current (via onWeekShift).
// `completedWorkoutLabels`: dateStr → workoutName from log only (never from program schedule).
export default function DayNav({
  centerDate,
  selectedDate,
  onSelect,
  isCompletedDate,
  completedWorkoutLabels,
  onWeekShift,
  weekOffsetFromToday,
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(centerDate, i - 3))
  const touchStartX = useRef(null)

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null || !onWeekShift) return
    const endX = e.changedTouches[0].clientX
    const dx = endX - touchStartX.current
    touchStartX.current = null
    if (dx > SWIPE_THRESHOLD_PX) onWeekShift(-1)
    else if (dx < -SWIPE_THRESHOLD_PX) onWeekShift(1)
  }

  return (
    <div className="mb-4 -mx-4 px-4">
      <p className="text-[9px] font-mono text-muted text-center mb-2 tracking-widest">
        {weekOffsetFromToday < 0 ? 'Past week — swipe left to return' : 'Swipe right for previous weeks'}
      </p>
      <div
        className="flex gap-1 overflow-x-auto no-scrollbar touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
      {days.map(dateStr => {
        const isSelected = selectedDate === dateStr
        const todayCell = isToday(dateStr)
        const completed = isCompletedDate(dateStr)
        const dow = dayOfWeek(dateStr)
        const dayNum = parseInt(dateStr.split('-')[2])
        const loggedName = completedWorkoutLabels?.[dateStr]
        const shortName = loggedName ? shortWorkoutNavLabel(loggedName) : ''

        return (
          <button
            key={dateStr}
            onClick={() => onSelect(dateStr)}
            className="flex-shrink-0 flex flex-col items-center px-2.5 py-2 min-w-[46px] transition-all border"
            style={{
              borderColor: isSelected ? '#DC2626' : todayCell ? '#3a0000' : '#1a1a1a',
              background: isSelected ? '#1a0000' : 'transparent',
            }}
          >
            <span
              className="text-[9px] font-mono font-bold tracking-wider"
              style={{ color: isSelected ? '#DC2626' : todayCell ? '#DC2626' : '#444' }}
            >
              {todayCell ? 'NOW' : DOW_SHORT[dow]}
            </span>
            <span
              className="text-sm font-mono font-bold mt-0.5"
              style={{ color: isSelected ? '#fff' : todayCell ? '#fff' : '#555' }}
            >
              {dayNum}
            </span>
            <span
              className="text-[8px] font-mono mt-0.5 min-h-[10px]"
              style={{ color: isSelected ? '#DC2626' : shortName ? '#555' : 'transparent' }}
            >
              {shortName || '\u00a0'}
            </span>
            {completed && (
              <span className="w-1 h-1 mt-0.5" style={{ background: '#DC2626' }} />
            )}
          </button>
        )
      })}
      </div>
    </div>
  )
}

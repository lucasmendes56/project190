import { isToday, isPast, isFuture } from '../../utils/dateUtils'
import { isWorkoutDay } from '../../utils/programUtils'

export default function DayCell({ dateStr, completed, programStartDate }) {
  const isScheduled = isWorkoutDay(dateStr)
  const past = isPast(dateStr)
  const todayCell = isToday(dateStr)
  const future = isFuture(dateStr)
  const beforeStart = programStartDate && dateStr < programStartDate

  const dayNum = parseInt(dateStr.split('-')[2])

  let style = { borderColor: 'transparent', background: 'transparent', color: '#222' }
  let fontClass = 'font-mono text-xs'

  if (beforeStart || (!isScheduled && !todayCell)) {
    style.color = '#1a1a1a'
  } else if (completed) {
    style.borderColor = '#DC2626'
    style.background = '#1a0000'
    style.color = '#DC2626'
    fontClass += ' font-bold'
  } else if (isScheduled && past && !todayCell) {
    style.borderColor = '#2a0000'
    style.color = '#3a0000'
  } else if (todayCell) {
    style.borderColor = '#DC2626'
    style.color = '#DC2626'
    fontClass += ' font-bold'
  } else if (isScheduled && future) {
    style.borderColor = '#1a1a1a'
    style.color = '#444'
  }

  return (
    <div
      className={`relative flex items-center justify-center w-8 h-8 border transition-colors ${fontClass}`}
      style={style}
    >
      {dayNum}
    </div>
  )
}

import { addDays, isToday, dayOfWeek } from '../../utils/dateUtils'

const DOW_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Shows 7 days: 3 before today → today → 3 ahead. Any day is selectable.
export default function DayNav({ centerDate, selectedDate, onSelect, isCompletedDate, workouts }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(centerDate, i - 3))

  return (
    <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar -mx-4 px-4">
      {days.map(dateStr => {
        const isSelected = selectedDate === dateStr
        const todayCell = isToday(dateStr)
        const completed = isCompletedDate(dateStr)
        const dow = dayOfWeek(dateStr)
        const dayNum = parseInt(dateStr.split('-')[2])
        const workout = workouts?.[dateStr]
        const shortName = workout
          ? workout.name.split(' + ')[0].split(' ')[0].toUpperCase().slice(0, 4)
          : '—'

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
              className="text-[8px] font-mono mt-0.5"
              style={{ color: isSelected ? '#DC2626' : '#333' }}
            >
              {shortName}
            </span>
            {completed && (
              <span className="w-1 h-1 mt-0.5" style={{ background: '#DC2626' }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import DayCell from '../components/calendar/DayCell'
import { PHASES } from '../data/program'
import { programDates } from '../utils/dateUtils'
import { getPhase } from '../utils/programUtils'

const DOW_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function CalendarPage() {
  const { settings, isCompletedDate, currentWeek } = useApp()
  const startDate = settings.programStartDate

  const weeks = useMemo(() => {
    if (!startDate) return []
    const dates = programDates(startDate)
    const result = []
    for (let i = 0; i < 12; i++) {
      const week = dates.slice(i * 7, i * 7 + 7)
      result.push({ weekNum: i + 1, dates: week, phase: getPhase(i + 1) })
    }
    return result
  }, [startDate])

  if (!startDate) {
    return (
      <PageWrapper>
        <h1 className="text-lg font-mono font-black text-white uppercase tracking-widest mb-2">Calendar</h1>
        <div className="h-px mb-6" style={{ background: '#DC2626', opacity: 0.3 }} />
        <div className="text-center py-16">
          <p className="text-xs font-mono tracking-widest text-muted">Set a start date in Settings.</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <h1 className="text-lg font-mono font-black text-white uppercase tracking-widest mb-2">12-Week Plan</h1>
      <div className="h-px mb-4" style={{ background: '#DC2626', opacity: 0.3 }} />

      {/* Phase legend */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {PHASES.map(p => (
          <span key={p.id} className="text-[9px] font-mono font-bold tracking-widest uppercase border px-2 py-0.5" style={{ borderColor: '#1a1a1a', color: '#555' }}>
            {p.name}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[9px] font-mono tracking-widest text-muted mb-4">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 inline-block" style={{ background: '#DC2626', opacity: 0.7 }} /> DONE</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 inline-block border" style={{ borderColor: '#3a0000' }} /> MISSED</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 inline-block border border-primary" /> TODAY</span>
      </div>

      {/* DOW headers */}
      <div className="grid grid-cols-8 gap-1 mb-1 px-1">
        <div className="text-[9px] font-mono text-muted text-center">WK</div>
        {DOW_LABELS.map((d, i) => (
          <div key={i} className="text-[9px] font-mono text-muted text-center">{d}</div>
        ))}
      </div>

      {/* Weeks */}
      <div className="space-y-0.5">
        {weeks.map(({ weekNum, dates, phase }) => {
          const isCurrentWeek = weekNum === currentWeek
          return (
            <div
              key={weekNum}
              className="grid grid-cols-8 gap-1 items-center px-1 py-0.5"
              style={{ background: isCurrentWeek ? '#0a0000' : 'transparent' }}
            >
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-mono font-bold" style={{ color: isCurrentWeek ? '#DC2626' : '#333' }}>{weekNum}</span>
              </div>
              {dates.map(dateStr => (
                <div key={dateStr} className="flex justify-center">
                  <DayCell dateStr={dateStr} completed={isCompletedDate(dateStr)} programStartDate={startDate} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}

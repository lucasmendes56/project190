import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import WeightChart from '../components/dashboard/WeightChart'
import StatsGrid from '../components/dashboard/StatsGrid'
import WeightEntryForm from '../components/dashboard/WeightEntryForm'
import PhaseTag from '../components/shared/PhaseTag'
import ProgressRing from '../components/shared/ProgressRing'
import { formatDate, today, programDates, isPast, isToday } from '../utils/dateUtils'
import { isScheduledWorkoutDay } from '../utils/programUtils'

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-3">{children}</p>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`border p-4 mb-4 ${className}`} style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const {
    settings,
    log,
    entries: weightEntries,
    logWeight,
    latestWeight,
    streak,
    longestStreak,
    currentWeek,
    currentPhase,
    scheduleOverrides,
  } = useApp()

  const totalWorkouts = log.length

  const consistencyRate = (() => {
    if (!settings.programStartDate) return null
    const completedDates = new Set(log.map(e => e.date))
    const allDates = programDates(settings.programStartDate)
    const scheduledPast = allDates.filter(d => (isPast(d) || isToday(d)) && isScheduledWorkoutDay(d, settings.programStartDate, scheduleOverrides))
    if (scheduledPast.length === 0) return null
    const hit = scheduledPast.filter(d => completedDates.has(d)).length
    return Math.round((hit / scheduledPast.length) * 100)
  })()

  const startWeight = settings.startWeight ?? 175
  const targetWeight = settings.targetWeight ?? 190
  const currentWeight = latestWeight ?? startWeight
  const gained = currentWeight - startWeight
  const toGo = targetWeight - currentWeight

  const stats = [
    { label: 'Workouts', value: totalWorkouts },
    { label: 'Streak', value: streak },
    { label: 'Consistency', value: consistencyRate != null ? `${consistencyRate}%` : '—', sub: 'of scheduled days' },
    { label: 'Best Streak', value: longestStreak },
  ]

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-mono font-black text-white uppercase tracking-widest">Progress</h1>
        {currentPhase && <PhaseTag phase={currentPhase} />}
      </div>
      <div className="h-px mb-6" style={{ background: '#DC2626', opacity: 0.3 }} />

      {/* Weight goal */}
      <SectionLabel>Body Weight</SectionLabel>
      <Card>
        <div className="flex items-center gap-4">
          <ProgressRing value={gained} max={targetWeight - startWeight} size={64} stroke={4} />
          <div className="flex-1">
            <p className="text-2xl font-mono font-black text-white">
              {currentWeight}<span className="text-muted text-sm font-normal"> lbs</span>
            </p>
            <p className="text-xs font-mono text-muted mt-0.5">
              {gained > 0 ? `+${gained.toFixed(1)}` : gained.toFixed(1)} gained
              {toGo > 0 ? ` · ${toGo.toFixed(1)} to go` : ' · GOAL REACHED'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono tracking-widest text-muted">TARGET</p>
            <p className="text-lg font-mono font-black text-primary">{targetWeight}</p>
          </div>
        </div>
      </Card>

      {/* Log weight */}
      <SectionLabel>Log Weight</SectionLabel>
      <div className="mb-4">
        <WeightEntryForm onSubmit={logWeight} latestWeight={latestWeight} />
      </div>

      {/* Chart */}
      {weightEntries.length > 0 && (
        <>
          <SectionLabel>Weight History</SectionLabel>
          <Card>
            <WeightChart entries={weightEntries} startWeight={startWeight} targetWeight={targetWeight} />
          </Card>
        </>
      )}

      {/* Stats */}
      <SectionLabel>Stats</SectionLabel>
      <div className="mb-4">
        <StatsGrid stats={stats} />
      </div>

      {/* Recent */}
      {log.length > 0 && (
        <>
          <SectionLabel>Recent Sessions</SectionLabel>
          <div className="space-y-1.5">
            {[...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(entry => (
              <div
                key={entry.id}
                className="border p-3 flex items-center justify-between"
                style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}
              >
                <div>
                  <p className="text-sm font-mono font-bold text-white uppercase">{entry.workoutName}</p>
                  <p className="text-xs font-mono text-muted">{formatDate(entry.date)}{entry.weekNum && ` · WK ${entry.weekNum}`}</p>
                </div>
                <p className="text-xs font-mono font-bold text-primary">
                  {entry.exercises?.reduce((sum, e) => sum + e.sets.length, 0) ?? 0} SETS
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  )
}

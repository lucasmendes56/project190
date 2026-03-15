import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import EmptyState from '../components/shared/EmptyState'
import { formatDate, formatDayName } from '../utils/dateUtils'

export default function LogPage() {
  const { log } = useApp()
  const sorted = [...log].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <PageWrapper>
      <h1 className="text-lg font-mono font-black text-white uppercase tracking-widest mb-2">Session Log</h1>
      <div className="h-px mb-6" style={{ background: '#DC2626', opacity: 0.3 }} />

      {sorted.length === 0 ? (
        <EmptyState title="No sessions yet" subtitle="Complete your first workout to see it here." />
      ) : (
        <div className="space-y-1.5">
          {sorted.map(entry => <LogEntry key={entry.id} entry={entry} />)}
        </div>
      )}
    </PageWrapper>
  )
}

function LogEntry({ entry }) {
  const totalSets = entry.exercises?.reduce((sum, e) => sum + e.sets.length, 0) ?? 0
  const totalVolume = entry.exercises?.reduce((vol, e) =>
    vol + e.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0) ?? 0

  return (
    <details className="group" style={{ borderBottom: '1px solid #1a1a1a' }}>
      <summary className="flex items-center justify-between px-0 py-4 cursor-pointer list-none">
        <div>
          <p className="text-sm font-mono font-bold text-white uppercase tracking-wide">{entry.workoutName}</p>
          <p className="text-xs font-mono text-muted mt-0.5">
            {formatDayName(entry.date).toUpperCase()}, {formatDate(entry.date)}
            {entry.weekNum && ` · WK ${entry.weekNum}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-primary">{totalSets} SETS</p>
            {totalVolume > 0 && (
              <p className="text-[10px] font-mono text-muted">{(totalVolume / 1000).toFixed(1)}K VOL</p>
            )}
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 text-muted transition-transform group-open:rotate-180"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>

      <div className="pb-4 space-y-3" style={{ borderTop: '1px solid #1a1a1a', paddingTop: '12px' }}>
        {entry.exercises?.map(ex => (
          <div key={ex.id}>
            <p className="text-xs font-mono font-bold text-white uppercase tracking-wide mb-1">{ex.name}</p>
            <div className="space-y-0.5">
              {ex.sets.map((set, i) => (
                <div key={i} className="flex gap-4 text-xs font-mono text-muted">
                  <span style={{ color: '#333' }}>S{i + 1}</span>
                  <span>{set.weight === 0 ? 'BW' : `${set.weight}LBS`} × {set.reps}</span>
                  <span style={{ color: '#333' }}>{set.weight * set.reps} vol</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {entry.abCompleted?.length > 0 && (
          <p className="text-xs font-mono text-muted">AB CIRCUIT: {entry.abCompleted.length}/4</p>
        )}
      </div>
    </details>
  )
}

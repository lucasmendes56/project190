import { useState, useEffect } from 'react'

export default function StreakBadge({ streak }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (streak > 0) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }
  }, [streak])

  if (streak === 0) {
    return (
      <div className="border px-3 py-1" style={{ borderColor: '#1a1a1a' }}>
        <span className="text-xs font-mono text-muted tracking-widest">NO STREAK</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 border border-primary/40 px-3 py-1 ${pulse ? 'animate-streak-pulse' : ''}`}>
      <span className="text-sm font-mono font-bold text-primary">{streak}</span>
      <span className="text-xs font-mono text-primary/60 tracking-widest">STREAK</span>
    </div>
  )
}

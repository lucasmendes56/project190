import { useNavigate } from 'react-router-dom'

const MENU_ITEMS = [
  {
    to: '/today',
    index: '01',
    label: "TODAY'S WORKOUT",
    desc: 'Start or continue your session',
  },
  {
    to: '/dashboard',
    index: '02',
    label: 'PROGRESS',
    desc: 'Weight, streaks, and stats',
  },
  {
    to: '/calendar',
    index: '03',
    label: 'CALENDAR',
    desc: 'Full 12-week schedule',
  },
  {
    to: '/log',
    index: '04',
    label: 'LOG',
    desc: 'Review past workouts',
  },
  {
    to: '/settings',
    index: '05',
    label: 'SETTINGS',
    desc: 'Program dates and preferences',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#000', color: '#d0d0d0' }}>
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <p
          className="text-[10px] font-mono tracking-[0.5em] uppercase mb-4"
          style={{ color: '#DC2626' }}
        >
          PROJECT 190
        </p>
        <h1 className="text-2xl font-black tracking-tight text-white font-mono">
          SELECT PROTOCOL
        </h1>
        <div className="mt-4 h-px" style={{ background: '#DC2626', opacity: 0.4 }} />
      </div>

      {/* Menu */}
      <div className="flex-1 px-6 pb-12 flex flex-col">
        {MENU_ITEMS.map(({ to, index, label, desc }, i) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group w-full text-left py-5 flex items-center gap-5 active:opacity-60 transition-opacity"
            style={{ borderBottom: '1px solid #1a1a1a' }}
          >
            <span
              className="font-mono text-sm tabular-nums flex-shrink-0 w-6"
              style={{ color: '#DC2626' }}
            >
              {index}
            </span>

            <div className="flex-1 min-w-0">
              <p className="font-mono font-bold text-sm tracking-widest text-white">
                {label}
              </p>
              <p className="font-mono text-xs mt-0.5" style={{ color: '#555' }}>
                {desc}
              </p>
            </div>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 flex-shrink-0"
              style={{ color: '#DC2626', opacity: 0.6 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

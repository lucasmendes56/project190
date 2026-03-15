import { useMemo } from 'react'
import { formatDate } from '../../utils/dateUtils'

export default function WeightChart({ entries, startWeight = 175, targetWeight = 190 }) {
  const data = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    return sorted
  }, [entries])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted text-sm">
        No weight entries yet
      </div>
    )
  }

  const W = 320
  const H = 160
  const PAD = { top: 10, right: 16, bottom: 30, left: 40 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const weights = data.map(e => e.weight)
  const allWeights = [startWeight, targetWeight, ...weights]
  const minW = Math.min(...allWeights) - 2
  const maxW = Math.max(...allWeights) + 2

  function xPos(idx) {
    return PAD.left + (idx / Math.max(data.length - 1, 1)) * chartW
  }
  function yPos(w) {
    return PAD.top + chartH - ((w - minW) / (maxW - minW)) * chartH
  }

  const linePath = data.map((e, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(e.weight)}`).join(' ')

  // Target line y
  const targetY = yPos(targetWeight)

  return (
    <div className="w-full overflow-x-auto no-scrollbar">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-full" style={{ minWidth: '280px' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const w = minW + t * (maxW - minW)
          const y = yPos(w)
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#1a1a1a" strokeWidth={1} />
              <text x={PAD.left - 4} y={y + 4} fontSize={9} fill="#444" textAnchor="end" fontFamily="monospace">
                {Math.round(w)}
              </text>
            </g>
          )
        })}

        {/* Target line */}
        <line
          x1={PAD.left}
          y1={targetY}
          x2={W - PAD.right}
          y2={targetY}
          stroke="#DC2626"
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.3}
        />
        <text x={W - PAD.right + 2} y={targetY + 4} fontSize={8} fill="#DC2626" opacity={0.5} fontFamily="monospace">GOAL</text>

        {/* Area fill */}
        {data.length > 1 && (
          <path
            d={`${linePath} L ${xPos(data.length - 1)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`}
            fill="#DC2626"
            opacity={0.08}
          />
        )}

        {/* Line */}
        {data.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke="#DC2626"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {data.map((e, i) => (
          <circle
            key={e.date}
            cx={xPos(i)}
            cy={yPos(e.weight)}
            r={3}
            fill="#DC2626"
          />
        ))}

        {/* X axis labels — show first, last, and every ~4th */}
        {data.map((e, i) => {
          const show = i === 0 || i === data.length - 1 || (data.length > 4 && i % Math.ceil(data.length / 4) === 0)
          if (!show) return null
          return (
            <text
              key={e.date}
              x={xPos(i)}
              y={H - 4}
              fontSize={8}
              fill="#333"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {formatDate(e.date)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

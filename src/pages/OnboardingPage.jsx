import { useState } from 'react'
import { useApp } from '../context/AppContext'

const inputClass = 'w-full border px-4 py-3 text-white text-sm font-mono focus:outline-none'
const inputStyle = { background: '#000', borderColor: '#1a1a1a', caretColor: '#DC2626' }
const labelClass = 'block text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-2'

export default function OnboardingPage() {
  const { updateSettings } = useApp()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    startWeight: '175',
    programStartDate: (() => {
      const d = new Date()
      const day = d.getDay()
      const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day
      d.setDate(d.getDate() + daysUntilMonday)
      return d.toISOString().split('T')[0]
    })(),
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleStart() {
    updateSettings({
      name: form.name,
      startWeight: parseFloat(form.startWeight) || 175,
      targetWeight: 190,
      programStartDate: form.programStartDate,
    })
  }

  const steps = [
    {
      index: '01',
      title: 'MASS BUILDING PROTOCOL',
      sub: '12-week hypertrophy program. Target: 175 → 190 lbs.',
      content: (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Name (optional)</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. ALEX"
              autoFocus
              className={inputClass}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass}>Current Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={form.startWeight}
              onChange={e => update('startWeight', e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>
      ),
    },
    {
      index: '02',
      title: 'SET START DATE',
      sub: 'Program runs Monday to Sunday. Pick a Monday to begin.',
      content: (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Program Start Date</label>
            <input
              type="date"
              value={form.programStartDate}
              onChange={e => update('programStartDate', e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, colorScheme: 'dark' }}
            />
          </div>
          <div className="border p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
            <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-3">Weekly Split</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div
                  key={i}
                  className="py-2 text-xs font-mono font-bold border"
                  style={{
                    borderColor: [0,1,3,4].includes(i) ? '#DC2626' : '#1a1a1a',
                    color: [0,1,3,4].includes(i) ? '#DC2626' : '#333',
                    background: [0,1,3,4].includes(i) ? '#0a0000' : 'transparent',
                  }}
                >
                  {d}
                </div>
              ))}
              {['PUSH', 'PULL', 'REST', 'LEGS', 'ARMS', 'REST', 'REST'].map((d, i) => (
                <div key={i} className="text-[8px] font-mono mt-1 leading-tight" style={{ color: [0,1,3,4].includes(i) ? '#555' : '#222' }}>{d}</div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      index: '03',
      title: 'RULES OF ENGAGEMENT',
      sub: 'Four days per week. No guesswork. Just results.',
      content: (
        <div className="space-y-2">
          {[
            'Streak system — rest days never break it',
            'Exact workout shown every session',
            '3 phases: Foundation → Build → Intensify',
            'Arms + abs built into every training day',
            'Core section = 35 min minimum viable session',
          ].map(text => (
            <div
              key={text}
              className="flex items-start gap-3 p-3 border"
              style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}
            >
              <span className="text-primary font-mono text-xs mt-0.5 flex-shrink-0">—</span>
              <p className="text-xs font-mono text-white">{text}</p>
            </div>
          ))}
        </div>
      ),
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#000' }}>
      <div className="w-full max-w-sm">
        {/* Progress */}
        <div className="flex gap-1.5 mb-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-px flex-1 transition-all"
              style={{ background: i <= step ? '#DC2626' : '#1a1a1a' }}
            />
          ))}
        </div>

        <p className="text-[10px] font-mono font-bold tracking-[0.5em] uppercase mb-1" style={{ color: '#DC2626' }}>
          {current.index} / 03
        </p>
        <h1 className="text-xl font-mono font-black text-white mb-2 tracking-wide">{current.title}</h1>
        <p className="text-xs font-mono text-muted mb-8">{current.sub}</p>

        {current.content}

        <button
          onClick={() => isLast ? handleStart() : setStep(s => s + 1)}
          className="w-full border border-primary text-primary font-mono font-black text-sm py-4 tracking-[0.4em] uppercase mt-8 active:opacity-70 transition-opacity"
        >
          {isLast ? 'INITIALIZE' : 'NEXT'}
        </button>

        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="w-full text-muted text-xs font-mono py-3 mt-2 tracking-widest"
          >
            BACK
          </button>
        )}
      </div>
    </div>
  )
}

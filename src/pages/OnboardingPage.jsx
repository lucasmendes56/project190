import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { DEFAULT_WEEK_PATTERN } from '../utils/programUtils'
import { today } from '../utils/dateUtils'
import WeekPatternEditor from '../components/shared/WeekPatternEditor'

const inputClass = 'w-full border px-4 py-3 text-white text-sm font-mono focus:outline-none'
const inputStyle = { background: '#000', borderColor: '#1a1a1a', caretColor: '#DC2626' }
const labelClass = 'block text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-2'

export default function OnboardingPage() {
  const { updateSettings, initializeSchedule } = useApp()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    startWeight: '175',
    programStartDate: today(),
    weekPattern: DEFAULT_WEEK_PATTERN,
  })

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleStart() {
    initializeSchedule(form.programStartDate, form.weekPattern)
    updateSettings({
      name: form.name,
      startWeight: parseFloat(form.startWeight) || 175,
      targetWeight: 190,
      programStartDate: form.programStartDate,
      weekPattern: form.weekPattern,
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
      sub: 'Start on any day. Week 1 begins from this date.',
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
        </div>
      ),
    },
    {
      index: '03',
      title: 'WEEKLY SPLIT',
      sub: 'Assign workouts to each day. Day 1 = your start date.',
      content: (
        <WeekPatternEditor
          pattern={form.weekPattern}
          onChange={p => update('weekPattern', p)}
          phaseId="foundation"
        />
      ),
    },
    {
      index: '04',
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
            'Change any day\'s workout anytime from Today',
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
  const totalSteps = steps.length
  const totalLabel = String(totalSteps).padStart(2, '0')

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
          {current.index} / {totalLabel}
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

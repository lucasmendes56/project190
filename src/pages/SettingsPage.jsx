import { useState } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import { today } from '../utils/dateUtils'

const inputClass = 'w-full border px-4 py-3 text-white text-sm font-mono focus:outline-none'
const inputStyle = { background: '#000', borderColor: '#1a1a1a', caretColor: '#DC2626' }
const labelClass = 'block text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-2'

export default function SettingsPage() {
  const { settings, updateSettings, resetAllData } = useApp()
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    name: settings.name ?? '',
    programStartDate: settings.programStartDate ?? today(),
    startWeight: settings.startWeight ?? 175,
    targetWeight: settings.targetWeight ?? 190,
  })

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSave(e) {
    e.preventDefault()
    updateSettings({
      ...form,
      startWeight: parseFloat(form.startWeight),
      targetWeight: parseFloat(form.targetWeight),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    resetAllData()
    setShowConfirm(false)
  }

  return (
    <PageWrapper>
      <h1 className="text-lg font-mono font-black text-white uppercase tracking-widest mb-2">System</h1>
      <div className="h-px mb-6" style={{ background: '#DC2626', opacity: 0.3 }} />

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className={labelClass}>Name (optional)</label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="e.g. Alex"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass}>Program Start Date</label>
          <input
            type="date"
            value={form.programStartDate}
            onChange={e => handleChange('programStartDate', e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
          <p className="text-xs font-mono text-muted mt-1.5">Must be a Monday</p>
        </div>

        <div>
          <label className={labelClass}>Starting Weight (lbs)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={form.startWeight}
            onChange={e => handleChange('startWeight', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass}>Target Weight (lbs)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={form.targetWeight}
            onChange={e => handleChange('targetWeight', e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          className="w-full border border-primary text-primary font-mono font-black text-sm py-4 tracking-[0.4em] uppercase active:opacity-70 transition-opacity"
        >
          {saved ? 'SAVED' : 'SAVE'}
        </button>
      </form>

      {/* Program info */}
      <div className="mt-8 border p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
        <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-3">Program Info</p>
        <div className="space-y-1.5">
          {[
            '4 days/week · Mass gain focus',
            'Mon / Tue / Thu / Fri — Core days (Sat optional)',
            'Ab circuit at end of every session (A, B, or C)',
            'Phase 1 (Weeks 1–4): Build the Habit · 45–55 min',
            'Phase 2 (Weeks 5–8): Build the Strength · 50–60 min',
            'Phase 3 (Weeks 9–12): Build the Mass · 55–65 min',
          ].map(line => (
            <p key={line} className="text-xs font-mono text-muted">{line}</p>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="mt-4 border p-4" style={{ borderColor: '#3a0000', background: '#0d0d0d' }}>
        <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase mb-3" style={{ color: '#DC2626' }}>Danger Zone</p>
        <p className="text-xs font-mono text-muted mb-4">Deletes all workout history, weight logs, and resets streak.</p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full border text-sm font-mono font-bold py-3 tracking-widest uppercase active:opacity-70"
            style={{ borderColor: '#3a0000', color: '#DC2626' }}
          >
            Reset All Data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-mono text-white text-center tracking-widest mb-3">CANNOT BE UNDONE</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border text-muted text-xs font-mono font-bold py-3 tracking-widest"
                style={{ borderColor: '#1a1a1a' }}
              >
                CANCEL
              </button>
              <button
                onClick={handleReset}
                className="flex-1 border text-xs font-mono font-bold py-3 tracking-widest"
                style={{ borderColor: '#DC2626', color: '#DC2626', background: '#1a0000' }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

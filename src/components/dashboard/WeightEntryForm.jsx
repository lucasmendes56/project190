import { useState } from 'react'

export default function WeightEntryForm({ onSubmit, latestWeight }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const w = parseFloat(value)
    if (isNaN(w) || w < 50 || w > 400) return
    onSubmit(w)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={latestWeight ? `LAST: ${latestWeight}` : 'ENTER WEIGHT'}
          className="w-full border px-4 py-3 text-white text-sm font-mono focus:outline-none pr-14"
          style={{ background: '#000', borderColor: '#1a1a1a', caretColor: '#DC2626' }}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono pointer-events-none" style={{ color: '#333' }}>LBS</span>
      </div>
      <button
        type="submit"
        disabled={!value}
        className="border border-primary text-primary font-mono font-bold text-sm px-5 py-3 tracking-widest disabled:opacity-30 active:opacity-70 transition-opacity"
        style={{ background: 'transparent' }}
      >
        LOG
      </button>
    </form>
  )
}

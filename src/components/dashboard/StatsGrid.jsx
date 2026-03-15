export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {stats.map(({ label, value, sub }) => (
        <div key={label} className="border p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
          <p className="text-2xl font-mono font-black text-primary mb-0.5">{value}</p>
          <p className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{label}</p>
          {sub && <p className="text-[9px] font-mono text-muted mt-0.5">{sub}</p>}
        </div>
      ))}
    </div>
  )
}

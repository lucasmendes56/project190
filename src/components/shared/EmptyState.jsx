export default function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-primary font-mono text-2xl mb-4">—</div>
      <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest mb-2">{title}</h3>
      {subtitle && <p className="text-xs font-mono text-muted max-w-xs">{subtitle}</p>}
    </div>
  )
}

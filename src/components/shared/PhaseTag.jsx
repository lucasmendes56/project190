export default function PhaseTag({ phase }) {
  if (!phase) return null

  return (
    <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase border border-primary/40 px-2 py-0.5 text-primary">
      {phase.name}
    </span>
  )
}

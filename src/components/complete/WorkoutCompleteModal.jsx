export default function WorkoutCompleteModal({ streak, workoutName, onClose }) {
  const message = streak >= 10
    ? 'CONSISTENCY IS YOUR SUPERPOWER.'
    : streak >= 5
    ? 'BUILDING SERIOUS MOMENTUM.'
    : streak >= 2
    ? 'BACK-TO-BACK. THAT\'S HOW GAINS ARE MADE.'
    : 'EVERY REP COUNTS. EAT PROTEIN. RECOVER.'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg border-t border-l border-r animate-slide-up p-8 pb-12"
        style={{ background: '#000', borderColor: '#DC2626' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="text-[10px] font-mono tracking-[0.5em] text-primary text-center mb-6">SESSION COMPLETE</p>

        <h2 className="text-2xl font-mono font-black text-white text-center uppercase tracking-wide mb-1">
          {workoutName}
        </h2>
        <p className="text-xs font-mono text-muted text-center mb-8 tracking-widest">CRUSHED</p>

        {streak > 0 && (
          <div className="border border-primary/30 p-4 mb-6 text-center">
            <p className="text-4xl font-mono font-black text-primary">{streak}</p>
            <p className="text-[10px] font-mono tracking-[0.4em] text-primary/60 mt-1">WORKOUT STREAK</p>
          </div>
        )}

        <p className="text-center text-xs font-mono tracking-widest mb-8" style={{ color: '#444' }}>
          {message}
        </p>

        <button
          onClick={onClose}
          className="w-full border border-primary text-primary font-mono font-black text-sm py-4 tracking-[0.4em] uppercase active:opacity-70 transition-opacity"
        >
          DONE
        </button>
      </div>
    </div>
  )
}

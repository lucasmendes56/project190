// Three rotating ab circuits — done at the end of every training session (5 min, 1 round)
// Each workout day specifies which circuit to use (A, B, or C)

export const AB_CIRCUITS = {
  A: {
    id: 'A',
    name: 'Circuit A',
    focus: 'Upper Abs + Isometric Core',
    exercises: [
      { id: 'crunches',      name: 'Crunches (slow)',         reps: '3 × 20',      notes: '2 sec up, 2 sec down — no momentum' },
      { id: 'cable_crunch',  name: 'Cable Crunch (kneeling)', reps: '3 × 15–20',   notes: 'Pull with abs, not arms or neck' },
      { id: 'plank',         name: 'Plank',                   reps: '3 × 45 sec',  notes: 'Neutral spine, brace everything' },
      { id: 'heel_tap',      name: 'Heel Tap (side-to-side)', reps: '3 × 20 each', notes: 'Oblique reach — controlled touch' },
      { id: 'dead_bug',      name: 'Dead Bug',                reps: '3 × 10 each', notes: 'Lower back flat — do NOT arch' },
    ],
  },
  B: {
    id: 'B',
    name: 'Circuit B',
    focus: 'Lower Abs + Anti-Rotation',
    exercises: [
      { id: 'hanging_knee',  name: 'Hanging Knee Raise',      reps: '3 × 15–20',   notes: 'Tuck pelvis up — not just swinging legs' },
      { id: 'reverse_crunch',name: 'Reverse Crunch',          reps: '3 × 15–20',   notes: 'Roll pelvis, not just legs' },
      { id: 'ab_wheel',      name: 'Ab Wheel Rollout',        reps: '3 × 10–12',   notes: 'Brace hard — slow on the return' },
      { id: 'pallof_press',  name: 'Pallof Press (cable)',    reps: '3 × 12 each', notes: 'Anti-rotation — resist the cable pull' },
      { id: 'leg_raises',    name: 'Leg Raises (lying flat)', reps: '3 × 15',      notes: 'Keep lower back pressed down' },
    ],
  },
  C: {
    id: 'C',
    name: 'Circuit C',
    focus: 'Obliques + Full Core',
    exercises: [
      { id: 'russian_twist', name: 'Russian Twist',           reps: '3 × 20 each', notes: 'Feet off floor for more challenge' },
      { id: 'woodchop',      name: 'Cable Woodchop (high→low)',reps: '3 × 12 each', notes: 'Rotate from the core, not arms' },
      { id: 'side_plank',    name: 'Side Plank',              reps: '3 × 35 sec',  notes: 'Stack feet or stagger for balance' },
      { id: 'bicycle_crunch',name: 'Bicycle Crunch',          reps: '3 × 20 each', notes: 'Slow and deliberate — not a race' },
      { id: 'mtn_climbers',  name: 'Mountain Climbers',       reps: '3 × 30 sec',  notes: 'Hips level, steady pace throughout' },
    ],
  },
}

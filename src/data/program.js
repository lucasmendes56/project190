// 12-week mass building program
//
// Workout templates are keyed by DOW (0–6) solely for migration / default-plan generation.
// The runtime schedule (wt_schedule v2) stores fully explicit date→workoutId assignments;
// no DOW lookup ever happens at runtime. Users can assign any workout to any day.
//
// Default split per phase (used only when generating a new week's initial plan):
//   Phase 1: Mon=Chest+Tris  Tue=Back+Bis  Thu=Shoulders+Arms  Fri=Legs+Bis   Sat=Optional Arms
//   Phase 2: Mon=Chest+Tris  Tue=Back+Bis  Thu=Legs+Tris       Fri=Shoulders+Arms  Sat=Optional
//   Phase 3: Mon=Chest+Tris  Tue=Legs+Bis  Thu=Shoulders+Arms  Fri=Back+Deadlift   Sat=Optional Arms

// Helper shorthand — each exercise entry in a section:
// { id, sets, reps (display string), notes, superset? }

// 12-week mass gain: 4 core days/week, ab circuit at end of every session
export const PHASES = [
  {
    id: 'foundation',
    name: 'Phase 1',
    label: 'Build the Habit',
    weeks: [1, 2, 3, 4],
    color: '#9e9e9e',
    sessionMin: '45–55 min',
    goal: 'Just show up, every single week',
    description: 'The goal is not to maximize growth — it\'s to build the habit of showing up 4 times a week. Weights are lighter, sessions manageable. Complete 4 sessions every week for 4 weeks — that\'s winning Phase 1.',
    tip: 'Resist the urge to add extra sets or go heavier. Leave the gym feeling good, not wrecked.',
  },
  {
    id: 'build',
    name: 'Phase 2',
    label: 'Build the Strength',
    weeks: [5, 6, 7, 8],
    color: '#DC2626',
    sessionMin: '50–60 min',
    goal: 'Add weight to every lift vs Phase 1',
    description: 'Your body is in a training rhythm. This phase increases load on all compound movements and adds volume on arms. Stop thinking "good workout" — think "did I beat last week\'s numbers?"',
    tip: 'Every time you do bench, squat, deadlift, or OHP — attempt to add 5 lbs or 1 rep vs last time.',
  },
  {
    id: 'mass',
    name: 'Phase 3',
    label: 'Build the Mass',
    weeks: [9, 10, 11, 12],
    color: '#B91C1C',
    sessionMin: '55–65 min',
    goal: 'Peak loads, maximum arm volume',
    description: 'Cash in on 8 weeks of consistency. Loads hit near-personal-record territory. Arm volume is highest — biceps and triceps 4–5 times per week. The habit is ingrained; just execute and eat.',
    tip: 'Weeks 10–11 will feel tired. That\'s accumulated fatigue — it means the training is working. Keep calories up, sleep 8+ hours.',
  },
]

// ─────────────────────────────────────────────────────────────────
// PHASE 1 — Weeks 1–4
// ─────────────────────────────────────────────────────────────────
const PHASE1_SCHEDULE = {
  // Monday — Chest + Triceps
  1: {
    id: 'chest_tris',
    name: 'Chest + Triceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~35 min — non-negotiable', optional: false,
        exercises: [
          { id: 'bench_press',      sets: 3, reps: '8–10',  notes: '2 sec down, controlled' },
          { id: 'incline_db_press', sets: 3, reps: '10–12', notes: 'Full stretch at bottom' },
          { id: 'cable_fly',        sets: 3, reps: '12–15', notes: 'Squeeze at peak contraction' },
          { id: 'close_grip_bench', sets: 3, reps: '10–12', notes: 'Elbows tight — tricep focus' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'tricep_rope_pushdown', sets: 3, reps: '12–15', notes: 'Full extension at bottom' },
        ],
      },
    ],
    abCircuit: 'A',
  },

  // Tuesday — Back + Biceps
  2: {
    id: 'back_bis',
    name: 'Back + Biceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~35 min — non-negotiable', optional: false,
        exercises: [
          { id: 'deadlift',         sets: 3, reps: '6–8',  notes: 'Priority lift — add 5 lbs weekly' },
          { id: 'bent_over_row',    sets: 3, reps: '8–10', notes: 'Pull to lower chest' },
          { id: 'lat_pulldown',     sets: 3, reps: '10–12',notes: 'Full stretch at top' },
          { id: 'seated_cable_row', sets: 3, reps: '12',   notes: 'Pause & squeeze at contraction' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'barbell_curl', sets: 3, reps: '10–12', notes: 'No swinging — strict form' },
          { id: 'hammer_curl',  sets: 2, reps: '12',    notes: 'Superset with curl' },
        ],
      },
    ],
    abCircuit: 'B',
  },

  // Thursday — Shoulders + Arms (arms are MANDATORY this day)
  4: {
    id: 'shoulders_arms',
    name: 'Shoulders + Arms',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~35 min — non-negotiable', optional: false,
        exercises: [
          { id: 'barbell_ohp_seated', sets: 3, reps: '8–10',  notes: 'Core braced, full range' },
          { id: 'lateral_raise',      sets: 3, reps: '12–15', notes: 'Slow & controlled' },
          { id: 'face_pulls',         sets: 3, reps: '15',    notes: 'Mandatory — shoulder health' },
        ],
      },
      {
        id: 'arms', label: 'ARMS', sublabel: '~15 min — always do this', optional: false,
        exercises: [
          { id: 'ez_bar_curl',    sets: 3, reps: '10–12', notes: 'Full ROM, no partial reps' },
          { id: 'skull_crushers', sets: 3, reps: '10–12', notes: 'Lower bar to forehead' },
          { id: 'cable_curl',     sets: 2, reps: '15',    notes: 'Superset with pushdown' },
          { id: 'cable_pushdown', sets: 2, reps: '15',    notes: 'Superset with curl', superset: true },
        ],
      },
    ],
    abCircuit: 'C',
  },

  // Friday — Legs + Bicep Finisher
  5: {
    id: 'legs_bis',
    name: 'Legs + Biceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~40 min — non-negotiable', optional: false,
        exercises: [
          { id: 'squat',             sets: 3, reps: '8–10',  notes: 'Priority lift — add 5 lbs weekly' },
          { id: 'romanian_deadlift', sets: 3, reps: '10–12', notes: 'Hamstring stretch — feel it' },
          { id: 'leg_press',         sets: 3, reps: '12–15', notes: 'High foot placement' },
          { id: 'leg_curl',          sets: 3, reps: '12',    notes: 'Slow eccentric' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'incline_db_curl', sets: 3, reps: '12', notes: 'Arms behind body — full bicep stretch' },
        ],
      },
    ],
    abCircuit: 'A',
  },

  // Saturday — OPTIONAL Full Arms
  6: {
    id: 'optional_arms_p1',
    name: 'Full Arms Day',
    optional: true,
    sections: [
      {
        id: 'arms', label: 'FULL ARMS', sublabel: 'Only if consistently hitting 4 days', optional: false,
        exercises: [
          { id: 'ez_bar_curl',     sets: 4, reps: '10–12', notes: 'Heaviest curl of the week' },
          { id: 'incline_db_curl', sets: 3, reps: '12',    notes: 'Full stretch' },
          { id: 'skull_crushers',  sets: 4, reps: '10–12', notes: 'Load it up' },
          { id: 'overhead_db_ext', sets: 3, reps: '12',    notes: 'Full stretch overhead' },
          { id: 'cable_curl',      sets: 3, reps: '15',    notes: 'Superset with pushdown' },
          { id: 'cable_pushdown',  sets: 3, reps: '15',    notes: 'Superset with curl', superset: true },
        ],
      },
    ],
    abCircuit: 'B',
  },
}

// ─────────────────────────────────────────────────────────────────
// PHASE 2 — Weeks 5–8
// ─────────────────────────────────────────────────────────────────
const PHASE2_SCHEDULE = {
  // Monday — Chest + Triceps
  1: {
    id: 'chest_tris',
    name: 'Chest + Triceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~35 min — non-negotiable', optional: false,
        exercises: [
          { id: 'bench_press',          sets: 4, reps: '6–8',  notes: 'Heavier than Phase 1 — add weight' },
          { id: 'incline_barbell_press', sets: 3, reps: '8–10', notes: 'Upper chest priority' },
          { id: 'db_fly',               sets: 3, reps: '12',   notes: 'Full stretch, slow' },
          { id: 'close_grip_bench',     sets: 3, reps: '10',   notes: 'Elbows in — tricep mass' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'overhead_db_ext',      sets: 3, reps: '12', notes: 'Long head stretch' },
          { id: 'tricep_rope_pushdown', sets: 3, reps: '15', notes: 'Superset with extension', superset: true },
        ],
      },
    ],
    abCircuit: 'B',
  },

  // Tuesday — Back + Biceps
  2: {
    id: 'back_bis',
    name: 'Back + Biceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~35 min — non-negotiable', optional: false,
        exercises: [
          { id: 'weighted_pullup',      sets: 4, reps: '6–8',  notes: 'Add 10–25 lb belt if easy' },
          { id: 'bent_over_row',        sets: 4, reps: '6–8',  notes: 'Heavier than Phase 1' },
          { id: 'single_arm_db_row',    sets: 3, reps: '10',   notes: 'Big range of motion each side' },
          { id: 'straight_arm_pulldown',sets: 3, reps: '12',   notes: 'Great lat isolator' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'ez_bar_curl',  sets: 3, reps: '10–12', notes: 'Heavier than Phase 1' },
          { id: 'hammer_curl',  sets: 3, reps: '12',    notes: 'Superset with EZ curl', superset: true },
        ],
      },
    ],
    abCircuit: 'C',
  },

  // Thursday — Legs + Tricep Finisher (split swap from Phase 1)
  4: {
    id: 'legs_tris',
    name: 'Legs + Triceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~40 min — non-negotiable', optional: false,
        exercises: [
          { id: 'squat',             sets: 4, reps: '6–8', notes: 'Heaviest squat yet — brace hard' },
          { id: 'romanian_deadlift', sets: 4, reps: '10',  notes: 'Heavier than Phase 1' },
          { id: 'walking_lunges',    sets: 3, reps: '12',  notes: 'Each side — glutes, quads, coordination' },
          { id: 'leg_curl',          sets: 3, reps: '12',  notes: 'Pause at peak contraction' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'tricep_dips', sets: 3, reps: '10–12', notes: 'Add belt weight if easy' },
        ],
      },
    ],
    abCircuit: 'A',
  },

  // Friday — Shoulders + Full Arms (arms MANDATORY)
  5: {
    id: 'shoulders_arms',
    name: 'Shoulders + Arms',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~30 min — non-negotiable', optional: false,
        exercises: [
          { id: 'seated_db_press', sets: 4, reps: '10',   notes: 'Full range, no partial reps' },
          { id: 'lateral_raise',   sets: 4, reps: '12–15',notes: 'Add weight vs Phase 1' },
          { id: 'face_pulls',      sets: 3, reps: '15',   notes: 'Mandatory' },
        ],
      },
      {
        id: 'arms', label: 'ARMS', sublabel: '~20 min — always do this', optional: false,
        exercises: [
          { id: 'barbell_curl',  sets: 3, reps: '10', notes: 'Heavy — load progressively' },
          { id: 'skull_crushers',sets: 3, reps: '10', notes: 'Superset with curl', superset: true },
          { id: 'hammer_curl',   sets: 3, reps: '12', notes: 'Brachialis + brachioradialis' },
          { id: 'tricep_dips',   sets: 3, reps: '12', notes: 'Superset with hammer curl', superset: true },
        ],
      },
    ],
    abCircuit: 'B',
  },

  // Saturday — OPTIONAL Weak Points + Arms
  6: {
    id: 'optional_weak_p2',
    name: 'Weak Points + Arms',
    optional: true,
    sections: [
      {
        id: 'arms', label: 'ARMS + WEAK POINTS', sublabel: 'Only add if 4-day streak is solid', optional: false,
        exercises: [
          { id: 'cable_curl',      sets: 4, reps: '15', notes: 'Superset with pushdown' },
          { id: 'cable_pushdown',  sets: 4, reps: '15', notes: 'Superset with curl', superset: true },
          { id: 'incline_db_curl', sets: 3, reps: '12', notes: 'Full bicep stretch' },
          { id: 'overhead_db_ext', sets: 3, reps: '12', notes: 'Long head focus' },
        ],
      },
    ],
    abCircuit: 'C',
  },
}

// ─────────────────────────────────────────────────────────────────
// PHASE 3 — Weeks 9–12
// ─────────────────────────────────────────────────────────────────
const PHASE3_SCHEDULE = {
  // Monday — Chest + Triceps
  1: {
    id: 'chest_tris',
    name: 'Chest + Triceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~40 min — non-negotiable', optional: false,
        exercises: [
          { id: 'bench_press',      sets: 4, reps: '6',   notes: 'Near max — spotter recommended' },
          { id: 'incline_db_press', sets: 3, reps: '10',  notes: 'Add weight vs Phase 2' },
          { id: 'cable_fly',        sets: 3, reps: '15',  notes: 'Pump finisher' },
          { id: 'close_grip_bench', sets: 4, reps: '8',   notes: 'Heaviest tricep movement' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'skull_crushers',  sets: 3, reps: '10', notes: 'Heavier than Phase 2' },
          { id: 'overhead_db_ext', sets: 3, reps: '12', notes: 'Long head — fills upper arm' },
        ],
      },
    ],
    abCircuit: 'C',
  },

  // Tuesday — Legs + Bicep Pump (split swap: legs move to Tue in Phase 3)
  2: {
    id: 'legs_bis',
    name: 'Legs + Biceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~40 min — non-negotiable', optional: false,
        exercises: [
          { id: 'squat',                sets: 5, reps: '5',    notes: 'Max weight of the program' },
          { id: 'bulgarian_split_squat',sets: 4, reps: '8',    notes: 'Each side — hardest move, biggest gains' },
          { id: 'leg_press',            sets: 3, reps: '12–15',notes: 'Deep range — quad pump' },
          { id: 'leg_curl',             sets: 3, reps: '12',   notes: 'Slow eccentric' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'cable_curl', sets: 3, reps: '15', notes: 'Easy on the joints post-legs' },
        ],
      },
    ],
    abCircuit: 'A',
  },

  // Thursday — Shoulders + Full Arms (arms MANDATORY)
  4: {
    id: 'shoulders_arms',
    name: 'Shoulders + Arms',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~30 min — non-negotiable', optional: false,
        exercises: [
          { id: 'barbell_ohp_standing', sets: 4, reps: '6',  notes: 'Heaviest OHP of the program' },
          { id: 'arnold_press',         sets: 3, reps: '10', notes: 'Great for shoulder fullness' },
          { id: 'cable_lateral_raise',  sets: 4, reps: '15', notes: 'Side delts = width' },
        ],
      },
      {
        id: 'arms', label: 'FULL ARMS', sublabel: '~20 min — always do this', optional: false,
        exercises: [
          { id: 'ez_bar_curl',       sets: 4, reps: '8–10',       notes: 'Heaviest curl of entire program' },
          { id: 'hammer_curl',       sets: 3, reps: '12',         notes: 'Superset with EZ curl', superset: true },
          { id: 'skull_crushers',    sets: 4, reps: '8–10',       notes: 'Heaviest tri movement' },
          { id: 'rope_pushdown_drop',sets: 3, reps: '10+10+10',   notes: '3 drops, no rest on last set', superset: true },
        ],
      },
    ],
    abCircuit: 'B',
  },

  // Friday — Back + Deadlift + Biceps
  5: {
    id: 'back_deadlift_bis',
    name: 'Back + Deadlift + Biceps',
    optional: false,
    sections: [
      {
        id: 'core', label: 'CORE', sublabel: '~40 min — non-negotiable', optional: false,
        exercises: [
          { id: 'deadlift',            sets: 3, reps: '3',    notes: 'Peak strength — go heavy' },
          { id: 'tbar_row',            sets: 4, reps: '8–10', notes: 'Best mid-back builder' },
          { id: 'chest_supported_row', sets: 3, reps: '12',   notes: 'Removes lower back fatigue' },
        ],
      },
      {
        id: 'arms', label: 'ARMS FINISHER', sublabel: '~10 min — if you have time', optional: true,
        exercises: [
          { id: 'incline_db_curl',   sets: 3, reps: '12', notes: 'Best bicep stretch — do not skip' },
          { id: 'concentration_curl',sets: 3, reps: '12', notes: 'Peak contraction focus, each side' },
        ],
      },
    ],
    abCircuit: 'C',
  },

  // Saturday — OPTIONAL Full Arms Day
  6: {
    id: 'optional_full_arms_p3',
    name: 'Full Arms Day',
    optional: true,
    sections: [
      {
        id: 'arms', label: 'FULL ARMS', sublabel: 'Reward for staying consistent all week', optional: false,
        exercises: [
          { id: 'barbell_curl',      sets: 4, reps: '8',        notes: 'Heavy — peak of program' },
          { id: 'incline_db_curl',   sets: 3, reps: '12',       notes: 'Full bicep stretch' },
          { id: 'close_grip_bench',  sets: 4, reps: '8',        notes: 'Best mass builder for tris' },
          { id: 'overhead_db_ext',   sets: 3, reps: '12',       notes: 'Long head — fills upper arm' },
          { id: 'rope_pushdown_drop',sets: 3, reps: '10+10+10', notes: '3 drops, no rest' },
        ],
      },
    ],
    abCircuit: 'A',
  },
}

// ─────────────────────────────────────────────────────────────────
// Phase schedule lookup
// ─────────────────────────────────────────────────────────────────
export const PHASE_SCHEDULES = {
  foundation: PHASE1_SCHEDULE,
  build:      PHASE2_SCHEDULE,
  mass:       PHASE3_SCHEDULE,
}

export const REST_DAY_MESSAGES = [
  'Recovery is where growth happens.',
  'Stretch, foam roll if sore. Light walk is fine.',
  '8–9 hours sleep tonight — this is when you grow.',
  'Active recovery: walk, stretch, eat protein.',
  'Elite athletes take rest seriously. So should you.',
]

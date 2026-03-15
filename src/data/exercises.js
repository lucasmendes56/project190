// Master exercise list — id, name, muscle group, default starting weight (lbs)
export const EXERCISES = {
  // ── Chest ──────────────────────────────────────────────────────
  bench_press:          { id: 'bench_press',          name: 'Barbell Bench Press',       muscle: 'Chest',            defaultWeight: 135 },
  incline_db_press:     { id: 'incline_db_press',     name: 'Incline DB Press',          muscle: 'Upper Chest',      defaultWeight: 45  },
  incline_barbell_press:{ id: 'incline_barbell_press',name: 'Incline Barbell Press',     muscle: 'Upper Chest',      defaultWeight: 95  },
  cable_fly:            { id: 'cable_fly',            name: 'Cable Chest Fly',           muscle: 'Chest',            defaultWeight: 25  },
  db_fly:               { id: 'db_fly',               name: 'DB Chest Fly',              muscle: 'Chest',            defaultWeight: 30  },
  close_grip_bench:     { id: 'close_grip_bench',     name: 'Close-Grip Bench Press',    muscle: 'Triceps',          defaultWeight: 95  },

  // ── Back ───────────────────────────────────────────────────────
  deadlift:             { id: 'deadlift',             name: 'Barbell Deadlift',          muscle: 'Back / Hamstrings',defaultWeight: 185 },
  bent_over_row:        { id: 'bent_over_row',        name: 'Barbell Bent-Over Row',     muscle: 'Mid Back',         defaultWeight: 115 },
  lat_pulldown:         { id: 'lat_pulldown',         name: 'Lat Pulldown',              muscle: 'Lats',             defaultWeight: 100 },
  seated_cable_row:     { id: 'seated_cable_row',     name: 'Seated Cable Row',          muscle: 'Mid Back',         defaultWeight: 80  },
  weighted_pullup:      { id: 'weighted_pullup',      name: 'Weighted Pull-Up',          muscle: 'Lats',             defaultWeight: 0   },
  single_arm_db_row:    { id: 'single_arm_db_row',    name: 'Single-Arm DB Row',         muscle: 'Back',             defaultWeight: 55  },
  straight_arm_pulldown:{ id: 'straight_arm_pulldown',name: 'Straight-Arm Pulldown',     muscle: 'Lats',             defaultWeight: 40  },
  tbar_row:             { id: 'tbar_row',             name: 'T-Bar Row',                 muscle: 'Mid Back',         defaultWeight: 90  },
  chest_supported_row:  { id: 'chest_supported_row',  name: 'Chest-Supported Row',       muscle: 'Back',             defaultWeight: 45  },

  // ── Shoulders ──────────────────────────────────────────────────
  barbell_ohp_seated:   { id: 'barbell_ohp_seated',   name: 'Seated Barbell OHP',        muscle: 'Shoulders',        defaultWeight: 95  },
  barbell_ohp_standing: { id: 'barbell_ohp_standing', name: 'Barbell OHP (Standing)',    muscle: 'Shoulders',        defaultWeight: 95  },
  seated_db_press:      { id: 'seated_db_press',      name: 'Seated DB Shoulder Press',  muscle: 'Shoulders',        defaultWeight: 40  },
  arnold_press:         { id: 'arnold_press',         name: 'Arnold Press',              muscle: 'Shoulders',        defaultWeight: 30  },
  lateral_raise:        { id: 'lateral_raise',        name: 'DB Lateral Raise',          muscle: 'Side Delts',       defaultWeight: 15  },
  cable_lateral_raise:  { id: 'cable_lateral_raise',  name: 'Cable Lateral Raise',       muscle: 'Side Delts',       defaultWeight: 12  },
  face_pulls:           { id: 'face_pulls',           name: 'Face Pulls (cable)',        muscle: 'Rear Delts',       defaultWeight: 30  },

  // ── Biceps ─────────────────────────────────────────────────────
  barbell_curl:         { id: 'barbell_curl',         name: 'Barbell Curl',              muscle: 'Biceps',           defaultWeight: 65  },
  ez_bar_curl:          { id: 'ez_bar_curl',          name: 'EZ-Bar Curl',               muscle: 'Biceps',           defaultWeight: 55  },
  hammer_curl:          { id: 'hammer_curl',          name: 'Hammer Curl',               muscle: 'Brachialis',       defaultWeight: 30  },
  incline_db_curl:      { id: 'incline_db_curl',      name: 'Incline DB Curl',           muscle: 'Biceps',           defaultWeight: 25  },
  cable_curl:           { id: 'cable_curl',           name: 'Cable Curl',                muscle: 'Biceps',           defaultWeight: 30  },
  concentration_curl:   { id: 'concentration_curl',   name: 'Concentration Curl',        muscle: 'Biceps',           defaultWeight: 20  },

  // ── Triceps ────────────────────────────────────────────────────
  tricep_rope_pushdown: { id: 'tricep_rope_pushdown', name: 'Tricep Rope Pushdown',      muscle: 'Triceps',          defaultWeight: 45  },
  overhead_db_ext:      { id: 'overhead_db_ext',      name: 'Overhead DB Extension',     muscle: 'Triceps (long)',   defaultWeight: 35  },
  skull_crushers:       { id: 'skull_crushers',       name: 'Skull Crushers',            muscle: 'Triceps',          defaultWeight: 65  },
  cable_pushdown:       { id: 'cable_pushdown',       name: 'Cable Pushdown',            muscle: 'Triceps',          defaultWeight: 40  },
  tricep_dips:          { id: 'tricep_dips',          name: 'Tricep Dips (weighted)',    muscle: 'Triceps',          defaultWeight: 0   },
  rope_pushdown_drop:   { id: 'rope_pushdown_drop',   name: 'Rope Pushdown Drop Set',    muscle: 'Triceps',          defaultWeight: 35  },

  // ── Legs ───────────────────────────────────────────────────────
  squat:                { id: 'squat',                name: 'Barbell Back Squat',        muscle: 'Quads',            defaultWeight: 155 },
  romanian_deadlift:    { id: 'romanian_deadlift',    name: 'Romanian Deadlift',         muscle: 'Hamstrings',       defaultWeight: 135 },
  leg_press:            { id: 'leg_press',            name: 'Leg Press',                 muscle: 'Quads',            defaultWeight: 225 },
  leg_curl:             { id: 'leg_curl',             name: 'Leg Curl (machine)',        muscle: 'Hamstrings',       defaultWeight: 70  },
  walking_lunges:       { id: 'walking_lunges',       name: 'Walking Lunges (DB)',       muscle: 'Quads / Glutes',   defaultWeight: 30  },
  bulgarian_split_squat:{ id: 'bulgarian_split_squat',name: 'Bulgarian Split Squat (DB)',muscle: 'Quads / Glutes',   defaultWeight: 25  },
}

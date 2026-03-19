export const phases = [
    {
      id: 1,
      name: "Phase 1 — Build the Habit",
      weeks: "Weeks 1–4",
      goal: "Just show up, every single week",
      sessionLength: "45–55 min",
      days: [
        {
          day: 1,
          name: "Chest + Triceps",
          exercises: [
            { name: "Barbell Bench Press",     sets: 3, reps: "8–10",  notes: "2 sec down, controlled" },
            { name: "Incline DB Press",         sets: 3, reps: "10–12", notes: "Full stretch at bottom" },
            { name: "Cable Chest Fly",          sets: 3, reps: "12–15", notes: "Squeeze at peak" },
            { name: "Close-Grip Bench Press",   sets: 3, reps: "10–12", notes: "Elbows tight — tricep focus" },
            { name: "Tricep Rope Pushdown",     sets: 3, reps: "12–15", notes: "Arms finisher — if time allows" },
          ],
          abs: "Circuit A",
        },
        {
          day: 2,
          name: "Back + Biceps",
          exercises: [
            { name: "Barbell Deadlift",         sets: 3, reps: "6–8",   notes: "Priority lift — add 5 lbs weekly" },
            { name: "Barbell Bent-Over Row",    sets: 3, reps: "8–10",  notes: "Pull to lower chest" },
            { name: "Lat Pulldown",             sets: 3, reps: "10–12", notes: "Full stretch at top" },
            { name: "Seated Cable Row",         sets: 3, reps: "12",    notes: "Pause & squeeze" },
            { name: "Barbell Curl",             sets: 3, reps: "10–12", notes: "Arms finisher — no swinging" },
            { name: "Hammer Curl",              sets: 2, reps: "12",    notes: "Arms finisher — superset w/ curl" },
          ],
          abs: "Circuit B",
        },
        { day: 3, name: "REST", exercises: [], abs: null },
        {
          day: 4,
          name: "Shoulders + Arms",
          exercises: [
            { name: "Seated Barbell OHP",       sets: 3, reps: "8–10",  notes: "Core braced, full range" },
            { name: "DB Lateral Raise",         sets: 3, reps: "12–15", notes: "Slow & controlled" },
            { name: "Face Pulls",               sets: 3, reps: "15",    notes: "Mandatory — shoulder health" },
            { name: "EZ-Bar Curl",             sets: 3, reps: "10–12", notes: "Full ROM" },
            { name: "Skull Crushers",           sets: 3, reps: "10–12", notes: "Lower bar to forehead" },
            { name: "Cable Curl",               sets: 2, reps: "15",    notes: "Superset w/ pushdown" },
            { name: "Tricep Pushdown",          sets: 2, reps: "15",    notes: "Superset w/ cable curl" },
          ],
          abs: "Circuit C",
        },
        {
          day: 5,
          name: "Legs + Bicep Finisher",
          exercises: [
            { name: "Barbell Back Squat",       sets: 3, reps: "8–10",  notes: "Priority lift — add 5 lbs weekly" },
            { name: "Romanian Deadlift",        sets: 3, reps: "10–12", notes: "Hamstring stretch — feel it" },
            { name: "Leg Press",                sets: 3, reps: "12–15", notes: "High foot placement" },
            { name: "Leg Curl",                 sets: 3, reps: "12",    notes: "Slow eccentric" },
            { name: "Incline DB Curl",          sets: 3, reps: "12",    notes: "Arms finisher — full bicep stretch" },
          ],
          abs: "Circuit A",
        },
        {
          day: 6,
          name: "Full Arms (optional)",
          optional: true,
          exercises: [
            { name: "EZ-Bar Curl",             sets: 4, reps: "10–12", notes: "Heaviest curl of the week" },
            { name: "Incline DB Curl",          sets: 3, reps: "12",    notes: "Full stretch" },
            { name: "Skull Crushers",           sets: 4, reps: "10–12", notes: "Load it up" },
            { name: "Overhead DB Extension",    sets: 3, reps: "12",    notes: "Full stretch overhead" },
            { name: "Cable Curl",               sets: 3, reps: "15",    notes: "Superset finisher" },
            { name: "Tricep Pushdown",          sets: 3, reps: "15",    notes: "Superset finisher" },
          ],
          abs: "Circuit B",
        },
        { day: 7, name: "REST", exercises: [], abs: null },
      ],
    },
    {
      id: 2,
      name: "Phase 2 — Build the Strength",
      weeks: "Weeks 5–8",
      goal: "Add weight to every lift vs. Phase 1",
      sessionLength: "50–60 min",
      days: [
        {
          day: 1,
          name: "Chest + Triceps",
          exercises: [
            { name: "Barbell Bench Press",      sets: 4, reps: "6–8",   notes: "Heavier than Phase 1" },
            { name: "Incline Barbell Press",    sets: 3, reps: "8–10",  notes: "Upper chest priority" },
            { name: "DB Chest Fly",             sets: 3, reps: "12",    notes: "Full stretch, slow" },
            { name: "Close-Grip Bench Press",   sets: 3, reps: "10",    notes: "Elbows in — tricep mass" },
            { name: "Overhead Tricep Extension",sets: 3, reps: "12",    notes: "Arms finisher — long head stretch" },
            { name: "Tricep Pushdown",          sets: 3, reps: "15",    notes: "Arms finisher — superset w/ extension" },
          ],
          abs: "Circuit B",
        },
        {
          day: 2,
          name: "Back + Biceps",
          exercises: [
            { name: "Weighted Pull-Ups",        sets: 4, reps: "6–8",   notes: "Add 10–25 lb belt if easy" },
            { name: "Barbell Row",              sets: 4, reps: "6–8",   notes: "Heavier than Phase 1" },
            { name: "Single-Arm DB Row",        sets: 3, reps: "10",    notes: "Big range of motion" },
            { name: "Straight-Arm Pulldown",    sets: 3, reps: "12",    notes: "Great lat isolator" },
            { name: "EZ-Bar Curl",             sets: 3, reps: "10–12", notes: "Arms finisher — heavier than Phase 1" },
            { name: "Hammer Curl",              sets: 3, reps: "12",    notes: "Arms finisher — superset w/ EZ curl" },
          ],
          abs: "Circuit C",
        },
        { day: 3, name: "REST", exercises: [], abs: null },
        {
          day: 4,
          name: "Legs + Tricep Finisher",
          exercises: [
            { name: "Barbell Back Squat",       sets: 4, reps: "6–8",   notes: "Heaviest squat yet" },
            { name: "Romanian Deadlift",        sets: 4, reps: "10",    notes: "Heavier than Phase 1" },
            { name: "Walking Lunges",           sets: 3, reps: "12",    notes: "Glutes, quads, coordination" },
            { name: "Leg Curl",                 sets: 3, reps: "12",    notes: "Pause at peak contraction" },
            { name: "Tricep Dips (weighted)",   sets: 3, reps: "10–12", notes: "Arms finisher — add belt weight if easy" },
          ],
          abs: "Circuit A",
        },
        {
          day: 5,
          name: "Shoulders + Full Arms",
          exercises: [
            { name: "Seated DB Shoulder Press", sets: 4, reps: "10",    notes: "Full range, no partial reps" },
            { name: "DB Lateral Raise",         sets: 4, reps: "12–15", notes: "Add weight vs. Phase 1" },
            { name: "Face Pulls",               sets: 3, reps: "15",    notes: "Mandatory" },
            { name: "Barbell Curl",             sets: 3, reps: "10",    notes: "Heavy — load progressively" },
            { name: "Skull Crushers",           sets: 3, reps: "10",    notes: "Superset w/ curl" },
            { name: "Hammer Curl",              sets: 3, reps: "12",    notes: "Brachialis + brachioradialis" },
            { name: "Tricep Dips",              sets: 3, reps: "12",    notes: "Superset w/ hammer curl" },
          ],
          abs: "Circuit B",
        },
        {
          day: 6,
          name: "Weak Points + Arms (optional)",
          optional: true,
          exercises: [
            { name: "Cable Curl",               sets: 4, reps: "15",    notes: "Superset — constant tension" },
            { name: "Tricep Pushdown",          sets: 4, reps: "15",    notes: "Superset w/ cable curl" },
            { name: "Incline DB Curl",          sets: 3, reps: "12",    notes: "Full bicep stretch" },
            { name: "Overhead Tricep Extension",sets: 3, reps: "12",    notes: "Long head focus" },
          ],
          abs: "Circuit C",
        },
        { day: 7, name: "REST", exercises: [], abs: null },
      ],
    },
    {
      id: 3,
      name: "Phase 3 — Build the Mass",
      weeks: "Weeks 9–12",
      goal: "Peak loads, maximum arm volume",
      sessionLength: "55–65 min",
      days: [
        {
          day: 1,
          name: "Chest + Triceps",
          exercises: [
            { name: "Barbell Bench Press",      sets: 4, reps: "6",     notes: "Near max — spotter recommended" },
            { name: "Incline DB Press",         sets: 3, reps: "10",    notes: "Add weight vs. Phase 2" },
            { name: "Cable Fly",                sets: 3, reps: "15",    notes: "Pump finisher" },
            { name: "Close-Grip Bench Press",   sets: 4, reps: "8",     notes: "Heaviest tricep movement" },
            { name: "Skull Crushers",           sets: 3, reps: "10",    notes: "Arms finisher — heavier than Phase 2" },
            { name: "Overhead DB Extension",    sets: 3, reps: "12",    notes: "Arms finisher — long head" },
          ],
          abs: "Circuit C",
        },
        {
          day: 2,
          name: "Legs + Bicep Pump",
          exercises: [
            { name: "Barbell Back Squat",       sets: 5, reps: "5",     notes: "Max weight of the program" },
            { name: "Bulgarian Split Squat",    sets: 4, reps: "8",     notes: "Hardest move, biggest gains" },
            { name: "Leg Press",                sets: 3, reps: "12–15", notes: "Deep range — quad pump" },
            { name: "Leg Curl",                 sets: 3, reps: "12",    notes: "Slow eccentric" },
            { name: "Cable Curl",               sets: 3, reps: "15",    notes: "Arms finisher — easy on joints post-legs" },
          ],
          abs: "Circuit A",
        },
        { day: 3, name: "REST", exercises: [], abs: null },
        {
          day: 4,
          name: "Shoulders + Full Arms",
          exercises: [
            { name: "Barbell OHP (standing)",   sets: 4, reps: "6",     notes: "Heaviest OHP of the program" },
            { name: "Arnold Press",             sets: 3, reps: "10",    notes: "Great for shoulder fullness" },
            { name: "Cable Lateral Raise",      sets: 4, reps: "15",    notes: "Side delts = width" },
            { name: "EZ-Bar Curl",             sets: 4, reps: "8–10",  notes: "Heaviest curl of entire program" },
            { name: "Hammer Curl",              sets: 3, reps: "12",    notes: "Superset w/ EZ curl" },
            { name: "Skull Crushers",           sets: 4, reps: "8–10",  notes: "Heaviest tri movement" },
            { name: "Tricep Pushdown",          sets: 3, reps: "10",    notes: "Drop set on last set" },
          ],
          abs: "Circuit B",
        },
        {
          day: 5,
          name: "Back + Deadlift + Biceps",
          exercises: [
            { name: "Deadlift",                 sets: 3, reps: "3",     notes: "Peak strength — go heavy" },
            { name: "T-Bar Row",                sets: 4, reps: "8–10",  notes: "Best mid-back builder" },
            { name: "Chest-Supported Row",      sets: 3, reps: "12",    notes: "Removes lower back fatigue" },
            { name: "Incline DB Curl",          sets: 3, reps: "12",    notes: "Arms finisher — best bicep stretch" },
            { name: "Concentration Curl",       sets: 3, reps: "12",    notes: "Arms finisher — peak contraction" },
          ],
          abs: "Circuit C",
        },
        {
          day: 6,
          name: "Full Arms Day (optional)",
          optional: true,
          exercises: [
            { name: "Barbell Curl",             sets: 4, reps: "8",     notes: "Heavy — peak of program" },
            { name: "Incline DB Curl",          sets: 3, reps: "12",    notes: "Full bicep stretch" },
            { name: "Close-Grip Bench Press",   sets: 4, reps: "8",     notes: "Best mass builder for tris" },
            { name: "Overhead Tricep Extension",sets: 3, reps: "12",    notes: "Long head — fills upper arm" },
            { name: "Tricep Pushdown",          sets: 3, reps: "10",    notes: "Drop set — 3 drops no rest" },
          ],
          abs: "Circuit A",
        },
        { day: 7, name: "REST", exercises: [], abs: null },
      ],
    },
  ];
  
  export const abCircuits = {
    "Circuit A": {
      name: "Circuit A — Upper Abs + Isometric Core",
      exercises: [
        { name: "Crunches",           sets: 3, reps: "20",    notes: "2 sec up, 2 sec down" },
        { name: "Cable Crunch",       sets: 3, reps: "15–20", notes: "Pull with abs, not arms" },
        { name: "Plank",              sets: 3, reps: "45 sec",notes: "Neutral spine, brace everything" },
        { name: "Heel Tap",           sets: 3, reps: "20",    notes: "Side to side — oblique reach" },
        { name: "Dead Bug",           sets: 3, reps: "10",    notes: "Lower back flat — do not arch" },
      ],
    },
    "Circuit B": {
      name: "Circuit B — Lower Abs + Anti-Rotation",
      exercises: [
        { name: "Hanging Knee Raise", sets: 3, reps: "15–20", notes: "Tuck pelvis up — not just swinging" },
        { name: "Reverse Crunch",     sets: 3, reps: "15–20", notes: "Roll pelvis, not just legs" },
        { name: "Ab Wheel Rollout",   sets: 3, reps: "10–12", notes: "Brace hard — slow on return" },
        { name: "Pallof Press",       sets: 3, reps: "12",    notes: "Anti-rotation — resist the pull" },
        { name: "Leg Raises",         sets: 3, reps: "15",    notes: "Keep lower back pressed down" },
      ],
    },
    "Circuit C": {
      name: "Circuit C — Obliques + Full Core",
      exercises: [
        { name: "Russian Twist",      sets: 3, reps: "20",    notes: "Feet off floor for more challenge" },
        { name: "Cable Woodchop",     sets: 3, reps: "12",    notes: "Rotate from core, not arms" },
        { name: "Side Plank",         sets: 3, reps: "35 sec",notes: "Each side" },
        { name: "Bicycle Crunch",     sets: 3, reps: "20",    notes: "Slow and deliberate" },
        { name: "Mountain Climbers",  sets: 3, reps: "30 sec",notes: "Hips level, steady pace" },
      ],
    },
  };
  
  export const allExercises = [
    ...new Map(
      phases.flatMap(p => p.days.flatMap(d => d.exercises.map(e => e.name)))
        .concat(Object.values(abCircuits).flatMap(c => c.exercises.map(e => e.name)))
        .map(name => [name, { id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), name }])
    ).values()
  ];
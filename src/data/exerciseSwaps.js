import { EXERCISES } from './exercises.js'
import { AB_CIRCUITS } from './abCircuit.js'

// Muscle groups for Swap exercise. Program templates stay as they are;
// a saved swap only changes which movement is shown for that slot.

export const MUSCLE_GROUPS = {
  chest: {
    label: 'Chest',
    alternatives: ['db_bench_press', 'incline_db_press', 'machine_chest_press', 'push_ups', 'cable_fly'],
  },
  back: {
    label: 'Back',
    alternatives: ['lat_pulldown', 'seated_cable_row', 'single_arm_db_row', 'chest_supported_row', 'assisted_pullup'],
  },
  shoulders: {
    label: 'Shoulders',
    alternatives: ['seated_db_press', 'machine_shoulder_press', 'arnold_press', 'lateral_raise', 'face_pulls'],
  },
  biceps: {
    label: 'Biceps',
    alternatives: ['db_curl', 'hammer_curl', 'cable_curl', 'ez_bar_curl', 'preacher_curl_machine'],
  },
  triceps: {
    label: 'Triceps',
    alternatives: ['cable_pushdown', 'overhead_db_ext', 'skull_crushers', 'dips', 'close_grip_bench'],
  },
  quads: {
    label: 'Quads',
    alternatives: ['leg_press', 'goblet_squat', 'hack_squat', 'bulgarian_split_squat', 'leg_extension'],
  },
  hamstrings_glutes: {
    label: 'Hamstrings / Glutes',
    alternatives: ['db_rdl', 'leg_curl', 'hip_thrust', 'cable_pull_through', 'back_extension'],
  },
  calves: {
    label: 'Calves',
    alternatives: ['seated_calf_raise', 'leg_press_calf_raise', 'single_leg_calf_raise'],
  },
  abs: {
    label: 'Abs',
    alternatives: ['cable_crunch', 'hanging_knee', 'dead_bug', 'plank', 'ab_wheel'],
  },
}

// Every movement that already appears in a workout or ab circuit.
// Deadlift stays with Back: it is the back-day priority lift. Romanian deadlifts are the hamstring slot.
export const EXERCISE_GROUP = {
  bench_press: 'chest',
  incline_db_press: 'chest',
  incline_barbell_press: 'chest',
  cable_fly: 'chest',
  db_fly: 'chest',

  deadlift: 'back',
  bent_over_row: 'back',
  lat_pulldown: 'back',
  seated_cable_row: 'back',
  weighted_pullup: 'back',
  single_arm_db_row: 'back',
  straight_arm_pulldown: 'back',
  tbar_row: 'back',
  chest_supported_row: 'back',

  barbell_ohp_seated: 'shoulders',
  barbell_ohp_standing: 'shoulders',
  seated_db_press: 'shoulders',
  arnold_press: 'shoulders',
  lateral_raise: 'shoulders',
  cable_lateral_raise: 'shoulders',
  face_pulls: 'shoulders',

  barbell_curl: 'biceps',
  ez_bar_curl: 'biceps',
  hammer_curl: 'biceps',
  incline_db_curl: 'biceps',
  cable_curl: 'biceps',
  concentration_curl: 'biceps',

  close_grip_bench: 'triceps',
  tricep_rope_pushdown: 'triceps',
  overhead_db_ext: 'triceps',
  skull_crushers: 'triceps',
  cable_pushdown: 'triceps',
  tricep_dips: 'triceps',
  rope_pushdown_drop: 'triceps',

  squat: 'quads',
  leg_press: 'quads',
  walking_lunges: 'quads',
  bulgarian_split_squat: 'quads',

  romanian_deadlift: 'hamstrings_glutes',
  leg_curl: 'hamstrings_glutes',

  crunches: 'abs',
  cable_crunch: 'abs',
  plank: 'abs',
  heel_tap: 'abs',
  dead_bug: 'abs',
  hanging_knee: 'abs',
  reverse_crunch: 'abs',
  ab_wheel: 'abs',
  pallof_press: 'abs',
  leg_raises: 'abs',
  russian_twist: 'abs',
  woodchop: 'abs',
  side_plank: 'abs',
  bicycle_crunch: 'abs',
  mtn_climbers: 'abs',
}

const AB_BY_ID = Object.fromEntries(
  Object.values(AB_CIRCUITS).flatMap(circuit =>
    circuit.exercises.map(ex => [ex.id, { id: ex.id, name: ex.name, muscle: 'Abs', defaultWeight: 0 }])
  )
)

export function getCatalogExercise(id) {
  if (!id) return null
  return EXERCISES[id] || AB_BY_ID[id] || null
}

export function groupForExercise(id) {
  return EXERCISE_GROUP[id] || null
}

export function groupLabel(groupId) {
  return MUSCLE_GROUPS[groupId]?.label || null
}

export function alternativesFor(groupId) {
  const ids = MUSCLE_GROUPS[groupId]?.alternatives || []
  return ids.map(id => getCatalogExercise(id)).filter(Boolean)
}

export function customExerciseId(name) {
  const slug = String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  if (!slug) return null
  return `custom_${slug}`
}

export function customExerciseFromName(name, group) {
  const trimmed = String(name || '').trim().replace(/\s+/g, ' ')
  if (!trimmed || trimmed.length > 60) return null
  const id = customExerciseId(trimmed)
  if (!id || !group) return null
  return {
    id,
    name: trimmed,
    group,
    custom: true,
    muscle: groupLabel(group) || 'Custom',
    defaultWeight: 0,
  }
}

export function resolveSwapTarget(swap) {
  if (!swap || typeof swap !== 'object' || typeof swap.id !== 'string') return null
  if (swap.custom) {
    if (typeof swap.name !== 'string' || !swap.name.trim()) return null
    return {
      id: swap.id,
      name: swap.name.trim(),
      muscle: groupLabel(swap.group) || 'Custom',
      defaultWeight: 0,
      custom: true,
      group: swap.group,
    }
  }
  const catalog = getCatalogExercise(swap.id)
  if (!catalog) return null
  return catalog
}

export function swapExercise(ex, swaps) {
  const programId = ex.programId || ex.id
  const planned = getCatalogExercise(programId)
  const base = {
    ...ex,
    programId,
    name: ex.name || planned?.name,
  }
  const target = resolveSwapTarget(swaps?.[programId])
  if (!target || target.id === programId) {
    return {
      ...base,
      id: programId,
      name: planned?.name || base.name,
      swapped: false,
    }
  }
  return {
    ...base,
    id: target.id,
    name: target.name,
    muscle: target.muscle || base.muscle,
    defaultWeight: target.defaultWeight ?? base.defaultWeight ?? 0,
    notes: undefined,
    swapped: true,
  }
}

export function applyExerciseSwaps(workout, swaps) {
  if (!workout) return workout
  if (!swaps || typeof swaps !== 'object' || Array.isArray(swaps)) return workout
  return {
    ...workout,
    sections: (workout.sections || []).map(section => ({
      ...section,
      exercises: (section.exercises || []).map(ex => swapExercise(ex, swaps)),
    })),
    abCircuit: workout.abCircuit
      ? {
          ...workout.abCircuit,
          exercises: (workout.abCircuit.exercises || []).map(ex => swapExercise(ex, swaps)),
        }
      : workout.abCircuit,
  }
}

export function swapRecord(target) {
  if (!target || target.restore) return null
  if (target.custom) {
    return { id: target.id, name: target.name, custom: true, group: target.group }
  }
  return { id: target.id }
}

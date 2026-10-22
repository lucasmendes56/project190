import test from 'node:test'
import assert from 'node:assert/strict'
import { PHASE_SCHEDULES } from './program.js'
import { AB_CIRCUITS } from './abCircuit.js'
import {
  MUSCLE_GROUPS,
  alternativesFor,
  applyExerciseSwaps,
  customExerciseFromName,
  customExerciseId,
  getCatalogExercise,
  groupForExercise,
} from './exerciseSwaps.js'

function workoutWith(exercises, abs = []) {
  return {
    sections: [{ id: 'core', exercises }],
    abCircuit: { id: 'A', exercises: abs },
  }
}

function programExerciseIds() {
  const ids = new Set()
  for (const schedule of Object.values(PHASE_SCHEDULES)) {
    for (const day of Object.values(schedule)) {
      if (!day?.sections) continue
      for (const section of day.sections) {
        for (const exercise of section.exercises) ids.add(exercise.id)
      }
    }
  }
  for (const circuit of Object.values(AB_CIRCUITS)) {
    for (const exercise of circuit.exercises) ids.add(exercise.id)
  }
  return [...ids]
}

test('every programmed exercise maps to a muscle group', () => {
  const missing = programExerciseIds().filter(id => !groupForExercise(id))
  assert.deepEqual(missing, [])
})

test('built-in alternatives match the swap list and exist in the catalog', () => {
  const expected = {
    chest: ['Dumbbell Bench Press', 'Incline DB Press', 'Machine Chest Press', 'Push-Ups', 'Cable Chest Fly'],
    back: ['Lat Pulldown', 'Seated Cable Row', 'Single-Arm DB Row', 'Chest-Supported Row', 'Assisted Pull-Ups'],
    shoulders: ['Seated DB Shoulder Press', 'Machine Shoulder Press', 'Arnold Press', 'DB Lateral Raise', 'Face Pulls (cable)'],
    biceps: ['Dumbbell Curl', 'Hammer Curl', 'Cable Curl', 'EZ-Bar Curl', 'Preacher Curl Machine'],
    triceps: ['Cable Pushdown', 'Overhead DB Extension', 'Skull Crushers', 'Dips', 'Close-Grip Bench Press'],
    quads: ['Leg Press', 'Goblet Squat', 'Hack Squat', 'Bulgarian Split Squat (DB)', 'Leg Extension'],
    hamstrings_glutes: ['Dumbbell Romanian Deadlift', 'Leg Curl (machine)', 'Hip Thrust', 'Cable Pull-Through', 'Back Extension'],
    calves: ['Seated Calf Raise', 'Leg-Press Calf Raise', 'Single-Leg Calf Raise'],
    abs: ['Cable Crunch (kneeling)', 'Hanging Knee Raise', 'Dead Bug', 'Plank', 'Ab Wheel Rollout'],
  }
  for (const [group, names] of Object.entries(expected)) {
    const alternatives = alternativesFor(group)
    assert.equal(alternatives.length, MUSCLE_GROUPS[group].alternatives.length)
    assert.deepEqual(alternatives.map(exercise => exercise.name), names)
    for (const exercise of alternatives) {
      assert.ok(getCatalogExercise(exercise.id), exercise.id)
    }
  }
})

test('a saved swap replaces that movement and leaves the prescription', () => {
  const original = workoutWith([
    { id: 'bench_press', programId: 'bench_press', name: 'Barbell Bench Press', sets: 3, reps: '8–10', notes: 'controlled' },
    { id: 'incline_db_press', programId: 'incline_db_press', name: 'Incline DB Press', sets: 3, reps: '10–12' },
  ])
  const swapped = applyExerciseSwaps(original, { bench_press: { id: 'db_bench_press' } })
  const next = swapped.sections[0].exercises[0]
  assert.equal(next.programId, 'bench_press')
  assert.equal(next.id, 'db_bench_press')
  assert.equal(next.name, 'Dumbbell Bench Press')
  assert.equal(next.sets, 3)
  assert.equal(next.reps, '8–10')
  assert.equal(next.swapped, true)
  assert.equal(next.notes, undefined)
  assert.equal(swapped.sections[0].exercises[1].id, 'incline_db_press')
  assert.equal(original.sections[0].exercises[0].id, 'bench_press')
})

test('an unknown swap leaves the planned exercise in place', () => {
  const workout = applyExerciseSwaps(workoutWith([
    { id: 'bench_press', programId: 'bench_press', name: 'Barbell Bench Press', sets: 3, reps: '8–10' },
  ]), {
    bench_press: { id: 'not_a_real_exercise' },
  })
  assert.equal(workout.sections[0].exercises[0].id, 'bench_press')
  assert.equal(workout.sections[0].exercises[0].name, 'Barbell Bench Press')
})

test('custom swaps keep the typed name and a stable id', () => {
  const first = customExerciseFromName('Landmine press', 'chest')
  const again = customExerciseFromName('  landmine   press ', 'chest')
  assert.equal(first.id, 'custom_landmine_press')
  assert.equal(again.id, first.id)
  assert.equal(customExerciseId('Landmine press'), first.id)
  assert.equal(customExerciseFromName('   ', 'chest'), null)
  assert.equal(customExerciseFromName('!!!', 'chest'), null)

  const workout = {
    sections: [{ id: 'core', exercises: [{ id: 'bench_press', programId: 'bench_press', name: 'Barbell Bench Press', sets: 3, reps: '8–10', notes: 'controlled' }] }],
    abCircuit: null,
  }
  const swapped = applyExerciseSwaps(workout, {
    bench_press: { id: first.id, name: first.name, custom: true, group: 'chest' },
  })
  assert.equal(swapped.sections[0].exercises[0].id, 'custom_landmine_press')
  assert.equal(swapped.sections[0].exercises[0].name, 'Landmine press')
  assert.equal(swapped.sections[0].exercises[0].sets, 3)
  assert.equal(swapped.sections[0].exercises[0].notes, undefined)
})

test('ab circuit swaps do not change the other movements', () => {
  const workout = applyExerciseSwaps(workoutWith([], [
    { id: 'plank', programId: 'plank', name: 'Plank', reps: '3 × 45 sec', notes: 'Brace' },
    { id: 'crunches', programId: 'crunches', name: 'Crunches (slow)', reps: '3 × 20' },
  ]), {
    plank: { id: 'ab_wheel' },
  })
  const names = workout.abCircuit.exercises.map(exercise => exercise.name)
  assert.deepEqual(names, ['Ab Wheel Rollout', 'Crunches (slow)'])
  const swapped = workout.abCircuit.exercises[0]
  assert.equal(swapped.programId, 'plank')
  assert.equal(swapped.id, 'ab_wheel')
  assert.equal(swapped.reps, '3 × 45 sec')
  assert.equal(swapped.notes, undefined)
})

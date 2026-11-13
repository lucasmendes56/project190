import test from 'node:test'
import assert from 'node:assert/strict'
import { daysBetween, weekOffsetContaining } from './dateUtils.js'
import {
  applySetUpdate,
  buildSession,
  confirmDraft,
  draftForEditing,
  entryFromSession,
  finishPlan,
  normalizeDrafts,
  parkedPastDraft,
  removeDraft,
  replaceLogEntry,
  sessionFromEntry,
  upsertDraft,
} from './workoutSession.js'

const workout = {
  id: 'chest_tris',
  name: 'Chest + Tris',
  sections: [
    {
      id: 'core',
      exercises: [
        { id: 'bench_press', programId: 'bench_press', name: 'Bench Press', sets: 3, reps: '8–10', defaultWeight: 95 },
        { id: 'cable_fly', programId: 'cable_fly', name: 'Cable Fly', sets: 2, reps: '12', defaultWeight: 20 },
      ],
    },
  ],
}

test('buildSession fills last weight and does not mark the day dirty', () => {
  const session = buildSession(workout, '2026-11-12', id => (id === 'bench_press' ? 135 : null))
  assert.equal(session.date, '2026-11-12')
  assert.equal(session.dirty, false)
  assert.equal(session.sections[0].exercises[0].sets[0].weight, 135)
  assert.equal(session.sections[0].exercises[0].sets[0].reps, 8)
  assert.equal(session.sections[0].exercises[0].sets[0].completed, false)
  assert.equal(session.sections[0].exercises[1].sets[0].weight, 20)
  assert.equal(session.sections[0].exercises[0].sets.length, 3)
})

test('applySetUpdate keeps typed sets and ignores a repeat of the same numbers', () => {
  const session = buildSession(workout, '2026-11-12')
  const nextSets = [
    { weight: 145, reps: 8, completed: true },
    { weight: 145, reps: 8, completed: false },
    { weight: 145, reps: 6, completed: false },
  ]
  const updated = applySetUpdate(session, 'core', 'bench_press', nextSets)
  assert.equal(updated.dirty, true)
  assert.equal(updated.sections[0].exercises[0].sets[0].weight, 145)
  assert.equal(updated.sections[0].exercises[1].sets[0].weight, 20)
  assert.equal(applySetUpdate(updated, 'core', 'bench_press', nextSets), updated)
})

test('entryFromSession keeps checked sets only', () => {
  const session = applySetUpdate(buildSession(workout, '2026-11-11'), 'core', 'bench_press', [
    { weight: 155, reps: 8, completed: true },
    { weight: 155, reps: 5, completed: false },
    { weight: 135, reps: 8, completed: true },
  ])
  const entry = entryFromSession(session, { weekNum: 4, phaseId: 'foundation' })
  assert.equal(entry.date, '2026-11-11')
  assert.equal(entry.weekNum, 4)
  assert.equal(entry.phase, 'foundation')
  assert.deepEqual(
    entry.exercises[0].sets.map(set => set.weight),
    [155, 135],
  )
  assert.equal(entry.exercises[1].sets.length, 0)
})

test('sessionFromEntry restores saved numbers and leaves room to finish the rest', () => {
  const entry = {
    id: '2026-11-11_chest_tris_1',
    date: '2026-11-11',
    workoutId: 'chest_tris',
    workoutName: 'Chest + Tris',
    exercises: [
      {
        programId: 'bench_press',
        id: 'bench_press',
        name: 'Bench Press',
        section: 'core',
        sets: [{ weight: 155, reps: 8, completed: true }],
      },
    ],
    abCompleted: ['plank'],
  }
  const session = sessionFromEntry(workout, entry)
  assert.equal(session.updatingEntryId, entry.id)
  assert.equal(session.dirty, false)
  assert.equal(session.sections[0].exercises[0].sets.length, 3)
  assert.equal(session.sections[0].exercises[0].sets[0].weight, 155)
  assert.equal(session.sections[0].exercises[0].sets[0].completed, true)
  assert.equal(session.sections[0].exercises[0].sets[1].completed, false)
  assert.equal(session.sections[0].exercises[1].sets.length, 2)
  assert.deepEqual(session.abCompleted, ['plank'])
})

test('finishPlan adds, replaces, or refuses a silent overwrite', () => {
  const fresh = buildSession(workout, '2026-11-11')
  const saved = [{ id: 'entry-1', date: '2026-11-11' }]
  assert.equal(finishPlan(fresh, [], '2026-11-12').action, 'add')
  assert.equal(finishPlan(fresh, saved, '2026-11-12').action, 'blocked')
  assert.equal(finishPlan(buildSession(workout, '2026-11-12'), saved, '2026-11-12').action, 'add')

  const update = { ...fresh, updatingEntryId: 'entry-1' }
  assert.deepEqual(finishPlan(update, saved, '2026-11-12'), { action: 'replace', entryId: 'entry-1' })
  assert.equal(finishPlan({ ...fresh, updatingEntryId: 'missing' }, saved, '2026-11-12').action, 'blocked')
})

test('draftForEditing hides a past draft when that day is already saved', () => {
  const draft = buildSession(workout, '2026-11-11')
  const saved = [{ id: 'entry-1', date: '2026-11-11' }]
  assert.equal(draftForEditing(draft, saved, '2026-11-12'), null)
  assert.equal(draftForEditing(draft, [], '2026-11-12'), draft)
  const todayDraft = buildSession(workout, '2026-11-12')
  const todaySaved = [{ id: 'entry-2', date: '2026-11-12' }]
  assert.equal(draftForEditing(todayDraft, todaySaved, '2026-11-12'), todayDraft)

  const update = { ...draft, updatingEntryId: 'entry-1' }
  assert.equal(draftForEditing(update, saved, '2026-11-12'), update)
  assert.equal(draftForEditing(update, [], '2026-11-12'), null)
})

test('replaceLogEntry updates one workout and does not add or remove others', () => {
  const log = [
    { id: 'a', date: '2026-11-10', workoutName: 'Legs', completedAt: 't0', exercises: [] },
    { id: 'b', date: '2026-11-11', workoutName: 'Push', completedAt: 't1', exercises: [{ id: 'bench_press', sets: [] }] },
    { id: 'c', date: '2026-11-11', workoutName: 'Extra', completedAt: 't2', exercises: [] },
  ]
  const missing = replaceLogEntry(log, 'nope', { workoutName: 'Nope' })
  assert.equal(missing.updated, null)
  assert.equal(missing.log, log)

  const { log: next, updated } = replaceLogEntry(log, 'b', {
    id: 'changed',
    date: '2026-11-01',
    workoutName: 'Push updated',
    exercises: [{ id: 'bench_press', sets: [{ weight: 160, reps: 5, completed: true }] }],
  }, 't3')
  assert.equal(updated.id, 'b')
  assert.equal(updated.date, '2026-11-11')
  assert.equal(updated.completedAt, 't1')
  assert.equal(updated.updatedAt, 't3')
  assert.equal(updated.workoutName, 'Push updated')
  assert.equal(next.length, 3)
  assert.equal(next[0].id, 'a')
  assert.equal(next[2].id, 'c')
  assert.equal(next[1].exercises[0].sets[0].weight, 160)
})

test('drafts round-trip per day and ignore junk', () => {
  const session = confirmDraft(applySetUpdate(buildSession(workout, '2026-11-11'), 'core', 'bench_press', [
    { weight: 100, reps: 8, completed: false },
  ]))
  const stored = upsertDraft({ bad: { nope: true }, '2026-11-10': { sections: 'no' } }, session)
  assert.deepEqual(Object.keys(stored), ['2026-11-11'])
  assert.equal(stored['2026-11-11'].confirmedAt != null, true)
  assert.equal(normalizeDrafts(stored)['2026-11-11'].sections[0].exercises[0].sets[0].weight, 100)
  assert.deepEqual(removeDraft(stored, '2026-11-11'), {})
})

test('parkedPastDraft reminds only for a past day that was actually started', () => {
  const todayDraft = buildSession(workout, '2026-11-12')
  const untouched = buildSession(workout, '2026-11-10')
  const started = applySetUpdate(buildSession(workout, '2026-11-11'), 'core', 'bench_press', [
    { weight: 115, reps: 8, completed: false },
    { weight: 95, reps: 8, completed: false },
    { weight: 95, reps: 8, completed: false },
  ])
  const drafts = upsertDraft(upsertDraft(upsertDraft({}, todayDraft), untouched), started)
  assert.equal(parkedPastDraft(drafts, '2026-11-12').date, '2026-11-11')
})

test('weekOffsetContaining lands the tapped day inside the 7-day strip', () => {
  const todayStr = '2026-11-12'
  for (const dateStr of ['2026-11-12', '2026-11-09', '2026-11-08', '2026-11-01', '2026-10-15']) {
    const offset = weekOffsetContaining(dateStr, todayStr)
    assert.ok(offset <= 0)
    const center = offset * 7
    const diff = daysBetween(todayStr, dateStr)
    assert.ok(diff >= center - 3 && diff <= center + 3, `${dateStr} offset ${offset}`)
  }
})

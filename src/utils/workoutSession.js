import { parseMinReps } from './reps.js'

export const DRAFTS_STORAGE_KEY = 'wt_drafts'

function isDateKey(date) {
  return typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
}

function isDraft(draft) {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return false
  if (!Array.isArray(draft.sections)) return false
  return draft.sections.every(section => (
    section
    && typeof section.sectionId === 'string'
    && Array.isArray(section.exercises)
  ))
}

export function normalizeDrafts(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out = {}
  for (const [date, draft] of Object.entries(value)) {
    if (!isDateKey(date) || !isDraft(draft)) continue
    out[date] = {
      ...draft,
      date,
      sections: draft.sections,
      abCompleted: Array.isArray(draft.abCompleted) ? draft.abCompleted : [],
      abSwaps: draft.abSwaps && typeof draft.abSwaps === 'object' && !Array.isArray(draft.abSwaps) ? draft.abSwaps : {},
      dirty: Boolean(draft.dirty),
      updatingEntryId: draft.updatingEntryId || null,
      confirmedAt: draft.confirmedAt || null,
      savedAt: draft.savedAt || null,
      workoutId: draft.workoutId || null,
      workoutName: draft.workoutName || '',
    }
  }
  return out
}

export function upsertDraft(drafts, session) {
  const safe = normalizeDrafts(drafts)
  if (!session?.date || !isDraft(session)) return safe
  const date = session.date
  if (!isDateKey(date)) return safe
  return {
    ...safe,
    [date]: normalizeDrafts({ [date]: { ...session, date } })[date],
  }
}

export function removeDraft(drafts, date) {
  const safe = normalizeDrafts(drafts)
  if (!safe[date]) return safe
  const next = { ...safe }
  delete next[date]
  return next
}

// A past day the user started and has not finished. Clean, untouched drafts stay quiet.
export function parkedPastDraft(drafts, todayStr) {
  return Object.values(normalizeDrafts(drafts))
    .filter(draft => draft.date < todayStr && (draft.dirty || draft.confirmedAt || draft.updatingEntryId))
    .sort((a, b) => b.date.localeCompare(a.date))[0] || null
}

export function buildInitialSets(exercise, lastWeight) {
  const count = Number(exercise?.sets) || 0
  return Array.from({ length: count }, () => ({
    weight: lastWeight ?? exercise?.defaultWeight ?? 0,
    reps: parseMinReps(exercise?.reps),
    completed: false,
  }))
}

export function sessionExercise(ex, lastWeight, sets) {
  return {
    programId: ex.programId || ex.id,
    id: ex.id,
    name: ex.name,
    muscle: ex.muscle,
    defaultWeight: ex.defaultWeight,
    sets: sets || buildInitialSets(ex, lastWeight),
  }
}

export function buildSession(workout, date, lastWeightFor) {
  const getWeight = typeof lastWeightFor === 'function' ? lastWeightFor : () => null
  return {
    date,
    workoutId: workout.id,
    workoutName: workout.name,
    sections: (workout.sections || []).map(section => ({
      sectionId: section.id,
      exercises: (section.exercises || []).map(ex => sessionExercise(ex, getWeight(ex.id))),
    })),
    abCompleted: [],
    abSwaps: {},
    dirty: false,
    updatingEntryId: null,
    savedAt: null,
    confirmedAt: null,
  }
}

export function markDirty(session, now = new Date().toISOString()) {
  if (!session) return session
  return { ...session, dirty: true, savedAt: now }
}

export function confirmDraft(session, now = new Date().toISOString()) {
  if (!session) return session
  return { ...session, savedAt: now, confirmedAt: now }
}

function sameSet(a, b) {
  return Number(a?.weight) === Number(b?.weight)
    && Number(a?.reps) === Number(b?.reps)
    && Boolean(a?.completed) === Boolean(b?.completed)
}

function sameSets(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
  return a.every((set, index) => sameSet(set, b[index]))
}

export function applySetUpdate(session, sectionId, slotId, sets) {
  if (!session) return session
  let changed = false
  const sections = session.sections.map(section => {
    if (section.sectionId !== sectionId) return section
    return {
      ...section,
      exercises: section.exercises.map(exercise => {
        if ((exercise.programId || exercise.id) !== slotId) return exercise
        if (sameSets(exercise.sets, sets)) return exercise
        changed = true
        return { ...exercise, sets }
      }),
    }
  })
  if (!changed) return session
  return markDirty({ ...session, sections })
}

function normalizeSavedSet(set, fallback) {
  return {
    weight: set?.weight ?? fallback?.weight ?? 0,
    reps: set?.reps ?? fallback?.reps ?? 0,
    completed: set?.completed !== false,
  }
}

function setsFromSaved(savedSets, templateEx) {
  const sets = (savedSets || []).map(set => normalizeSavedSet(set))
  const target = Number(templateEx?.sets) || sets.length
  while (sets.length < target) {
    sets.push({
      weight: templateEx?.defaultWeight ?? 0,
      reps: parseMinReps(templateEx?.reps),
      completed: false,
    })
  }
  return sets
}

// Rebuild an editable workout from a saved log entry. Extra template sets stay empty
// so a half-finished day can be completed. The saved entry id is kept so a later
// save replaces that entry instead of adding another one.
export function sessionFromEntry(workout, entry) {
  const savedExercises = entry?.exercises || []
  const used = new Set()

  let sections
  if (workout?.sections?.length) {
    sections = workout.sections.map(section => ({
      sectionId: section.id,
      exercises: (section.exercises || []).map(ex => {
        const programId = ex.programId || ex.id
        const savedIndex = savedExercises.findIndex((saved, index) => {
          if (used.has(index)) return false
          if (saved?.section && saved.section !== section.id) return false
          const savedSlot = saved?.programId || saved?.id
          return savedSlot === programId || saved?.id === ex.id
        })
        if (savedIndex === -1) return sessionExercise(ex, null)
        used.add(savedIndex)
        const saved = savedExercises[savedIndex]
        return {
          programId,
          id: saved.id || ex.id,
          name: saved.name || ex.name,
          muscle: saved.muscle || ex.muscle,
          defaultWeight: ex.defaultWeight,
          sets: setsFromSaved(saved.sets, ex),
        }
      }),
    }))
  } else {
    const grouped = new Map()
    savedExercises.forEach((saved, index) => {
      const key = saved?.section || 'workout'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key).push({ saved, index })
    })
    sections = [...grouped.entries()].map(([sectionId, items]) => ({
      sectionId,
      exercises: items.map(({ saved, index }) => {
        used.add(index)
        const programId = saved.programId || saved.id
        return {
          programId,
          id: saved.id,
          name: saved.name,
          muscle: saved.muscle,
          defaultWeight: saved.defaultWeight,
          sets: setsFromSaved(saved.sets, { sets: saved.sets?.length || 0, reps: String(saved.sets?.[0]?.reps ?? '') }),
        }
      }),
    }))
  }

  return {
    date: entry.date,
    workoutId: entry.workoutId || workout?.id || null,
    workoutName: entry.workoutName || workout?.name || '',
    sections,
    abCompleted: Array.isArray(entry.abCompleted) ? [...entry.abCompleted] : [],
    abSwaps: {},
    dirty: false,
    updatingEntryId: entry.id || null,
    savedAt: null,
    confirmedAt: null,
  }
}

export function templateFromSession(session) {
  if (!session) return null
  return {
    id: session.workoutId,
    name: session.workoutName || 'Workout',
    sections: (session.sections || []).map(section => ({
      id: section.sectionId,
      label: section.sectionId,
      exercises: (section.exercises || []).map(exercise => ({
        ...exercise,
        sets: exercise.sets?.length || 0,
        reps: '',
      })),
    })),
    abCircuit: null,
    phase: null,
    weekNum: null,
  }
}

// History keeps checked sets, matching the original finish behavior.
// The in-progress draft keeps every number, checked or not.
export function entryFromSession(session, { weekNum = null, phaseId = null } = {}) {
  const exercises = (session.sections || []).flatMap(section => (
    section.exercises.map(exercise => ({
      ...exercise,
      section: section.sectionId,
      sets: (exercise.sets || []).filter(set => set.completed),
    }))
  ))
  return {
    date: session.date,
    workoutId: session.workoutId,
    workoutName: session.workoutName,
    exercises,
    abCompleted: session.abCompleted || [],
    weekNum,
    phase: phaseId,
  }
}

// add: write a new history entry.
// replace: user is explicitly updating one saved workout.
// blocked: a past day already has a saved workout and this draft is not that update.
export function finishPlan(session, entriesForDate, todayStr) {
  if (!session?.date) return { action: 'blocked' }
  const entries = Array.isArray(entriesForDate) ? entriesForDate : []
  if (session.updatingEntryId) {
    const target = entries.find(entry => entry.id === session.updatingEntryId)
    return target ? { action: 'replace', entryId: target.id } : { action: 'blocked' }
  }
  if (session.date < todayStr && entries.length > 0) return { action: 'blocked' }
  return { action: 'add' }
}

// Show the editor for an in-progress day. A past day that already has a saved
// workout stays on the review screen unless this draft is an edit of that workout.
export function draftForEditing(draft, entriesForDate, todayStr) {
  if (!isDraft(draft) || !isDateKey(draft.date)) return null
  const entries = Array.isArray(entriesForDate) ? entriesForDate : []
  if (draft.updatingEntryId) {
    return entries.some(entry => entry.id === draft.updatingEntryId) ? draft : null
  }
  if (draft.date < todayStr && entries.length > 0) return null
  return draft
}

export function replaceLogEntry(log, entryId, updates, now = new Date().toISOString()) {
  if (!Array.isArray(log)) return { log: [], updated: null }
  const index = log.findIndex(entry => entry && entry.id === entryId)
  if (index === -1) return { log, updated: null }
  const existing = log[index]
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    date: existing.date,
    completedAt: existing.completedAt,
    updatedAt: now,
  }
  const next = log.slice()
  next[index] = updated
  return { log: next, updated }
}

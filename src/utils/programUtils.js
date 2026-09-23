import { PHASES, PHASE_SCHEDULES } from '../data/program'
import { EXERCISES } from '../data/exercises'
import { AB_CIRCUITS } from '../data/abCircuit'
import { dayOfWeek, programWeek, addDays } from './dateUtils'

// Returns the phase object for a given week number
export function getPhase(weekNum) {
  if (!weekNum || weekNum < 1) return PHASES[0]
  if (weekNum > 12) return null // program complete
  return PHASES.find(p => p.weeks.includes(weekNum)) || PHASES[0]
}

// Returns the 4 mandatory workout templates for a phase (ordered as defined)
export function getMandatoryWorkouts(phaseId) {
  const schedule = PHASE_SCHEDULES[phaseId]
  if (!schedule) return []
  return Object.values(schedule).filter(w => w && !w.optional)
}

// Returns the optional workout template for a phase (or null)
export function getOptionalWorkout(phaseId) {
  const schedule = PHASE_SCHEDULES[phaseId]
  if (!schedule) return null
  return Object.values(schedule).find(w => w?.optional) ?? null
}

// ─────────────────────────────────────────────────────────────────
// Schedule v2 — forward-only migration
// ─────────────────────────────────────────────────────────────────
//
// v1 format (old): { 'YYYY-MM-DD': workoutId | 'rest' } — sparse overrides on top of DOW defaults
// v2 format (new): { _v: 2, 'YYYY-MM-DD': workoutId }  — fully explicit, absence = rest, no DOW fallback
//
// The migration generates explicit assignments for all 12 program weeks by combining
// the old DOW defaults with any v1 overrides. It never touches wt_log or wt_bodyweight.

export function migrateScheduleToV2(oldSchedule, programStartDate) {
  if (!programStartDate) return { _v: 2 }
  if (oldSchedule?._v === 2) return oldSchedule // already migrated

  const result = { _v: 2 }

  for (let week = 1; week <= 12; week++) {
    const weekStartDate = addDays(programStartDate, (week - 1) * 7)
    const phase = getPhase(week)
    if (!phase) continue
    const phaseSchedule = PHASE_SCHEDULES[phase.id]

    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(weekStartDate, i)
      const dow = dayOfWeek(dateStr)
      const oldOverride = oldSchedule?.[dateStr]

      if (oldOverride === 'rest') {
        // explicit rest in v1 → omit (absence = rest in v2)
      } else if (oldOverride) {
        result[dateStr] = oldOverride
      } else if (phaseSchedule?.[dow]) {
        result[dateStr] = phaseSchedule[dow].id
      }
    }
  }

  return result
}

// ─────────────────────────────────────────────────────────────────
// Schedule resolution
// ─────────────────────────────────────────────────────────────────

// Returns the effective workoutId for a date.
// v2 (preferred): pure flat lookup — dateStr present = workout, absent = rest.
// v1 legacy path: override → DOW default (kept until migration completes on first load).
export function getEffectiveWorkoutId(dateStr, startDateStr, schedule = {}) {
  if (schedule._v === 2) {
    return schedule[dateStr] ?? null
  }
  // v1 legacy: override → DOW fallback
  const ov = schedule[dateStr]
  if (ov === 'rest') return null
  if (ov) return ov
  const weekNum = programWeek(startDateStr, dateStr)
  const phase = getPhase(weekNum)
  if (!phase) return null
  const dow = dayOfWeek(dateStr)
  return PHASE_SCHEDULES[phase.id]?.[dow]?.id ?? null
}

// Core resolver: date + start date + schedule → full hydrated workout template, or null for rest day
export function resolveWorkout(dateStr, startDateStr, schedule = {}) {
  const weekNum = programWeek(startDateStr, dateStr)
  const phase = getPhase(weekNum)
  if (!phase) return null

  const workoutId = getEffectiveWorkoutId(dateStr, startDateStr, schedule)
  if (!workoutId) return null

  // Find the template by workoutId within this phase's schedule
  const phaseSchedule = PHASE_SCHEDULES[phase.id]
  const dayTemplate = Object.values(phaseSchedule).find(t => t?.id === workoutId)
  if (!dayTemplate) return null

  const sections = dayTemplate.sections.map(section => ({
    ...section,
    exercises: section.exercises.map(ex => ({
      ...EXERCISES[ex.id],
      ...ex,
    })),
  }))

  return {
    ...dayTemplate,
    sections,
    abCircuit: AB_CIRCUITS[dayTemplate.abCircuit],
    phase,
    weekNum,
  }
}

// Is this date a scheduled workout day?
export function isScheduledWorkoutDay(dateStr, startDateStr, schedule = {}) {
  return getEffectiveWorkoutId(dateStr, startDateStr, schedule) !== null
}

// Returns all { dateStr → workoutId } assignments for a specific program week number
export function getWeekAssignments(weekNum, programStartDate, schedule = {}) {
  const weekStartDate = addDays(programStartDate, (weekNum - 1) * 7)
  const assignments = {}
  for (let i = 0; i < 7; i++) {
    const dateStr = addDays(weekStartDate, i)
    const id = getEffectiveWorkoutId(dateStr, programStartDate, schedule)
    if (id) assignments[dateStr] = id
  }
  return assignments
}

// Returns next workout date from a given date (up to 14 days ahead), requires programStartDate
export function nextWorkoutDate(fromDateStr, startDateStr = null, schedule = {}) {
  if (!startDateStr) return null
  let check = fromDateStr
  for (let i = 1; i <= 14; i++) {
    const d = new Date(check)
    d.setDate(d.getDate() + 1)
    check = d.toISOString().split('T')[0]
    if (isScheduledWorkoutDay(check, startDateStr, schedule)) return check
  }
  return null
}

// Parse the minimum reps from a display string like '8–10' or '12' or '10+10+10'
export function parseMinReps(repsStr) {
  if (!repsStr) return 10
  const str = String(repsStr)
  const match = str.match(/\d+/)
  return match ? parseInt(match[0]) : 10
}

// ─────────────────────────────────────────────────────────────────
// Flexible week pattern — any-day-start & custom workout ordering
// ─────────────────────────────────────────────────────────────────
//
// A week pattern is a 7-element array for day offsets 0–6 within each program week.
// Values:
//   0,1,2,3    = index into the mandatory workout list for the current phase
//   'optional' = the phase's optional workout
//   null       = rest day
//
// Default mirrors the original Mon/Tue/Rest/Thu/Fri/Sat/Sun split.
export const DEFAULT_WEEK_PATTERN = [0, 1, null, 2, 3, 'optional', null]

// Returns { mandatory, optional } workout templates for a given phase
export function getWorkoutSlots(phaseId) {
  const schedule = PHASE_SCHEDULES[phaseId]
  if (!schedule) return { mandatory: [], optional: null }
  const mandatory = Object.values(schedule).filter(w => w && !w.optional)
  const optional = Object.values(schedule).find(w => w?.optional) ?? null
  return { mandatory, optional }
}

// Generate a complete 12-week v2 schedule from a week pattern
export function generateScheduleFromPattern(programStartDate, weekPattern = DEFAULT_WEEK_PATTERN) {
  if (!programStartDate) return { _v: 2 }
  const result = { _v: 2 }
  for (let week = 1; week <= 12; week++) {
    const weekStartDate = addDays(programStartDate, (week - 1) * 7)
    const phase = getPhase(week)
    if (!phase) continue
    const phaseSchedule = PHASE_SCHEDULES[phase.id]
    const mandatory = Object.values(phaseSchedule).filter(w => w && !w.optional)
    const optional = Object.values(phaseSchedule).find(w => w?.optional) ?? null
    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(weekStartDate, i)
      const slot = weekPattern[i]
      if (slot === null || slot === undefined) continue
      if (slot === 'optional') {
        if (optional) result[dateStr] = optional.id
      } else {
        const workout = mandatory[slot]
        if (workout) result[dateStr] = workout.id
      }
    }
  }
  return result
}

// Regenerate schedule from a given week number onward, leaving earlier weeks untouched
export function regenerateFutureSchedule(programStartDate, weekPattern, currentSchedule, fromWeekNum) {
  const result = { ...currentSchedule }
  for (let week = fromWeekNum; week <= 12; week++) {
    const weekStartDate = addDays(programStartDate, (week - 1) * 7)
    // Clear existing assignments for this week
    for (let i = 0; i < 7; i++) delete result[addDays(weekStartDate, i)]
    const phase = getPhase(week)
    if (!phase) continue
    const phaseSchedule = PHASE_SCHEDULES[phase.id]
    const mandatory = Object.values(phaseSchedule).filter(w => w && !w.optional)
    const optional = Object.values(phaseSchedule).find(w => w?.optional) ?? null
    for (let i = 0; i < 7; i++) {
      const dateStr = addDays(weekStartDate, i)
      const slot = weekPattern[i]
      if (slot === null || slot === undefined) continue
      if (slot === 'optional') {
        if (optional) result[dateStr] = optional.id
      } else {
        const workout = mandatory[slot]
        if (workout) result[dateStr] = workout.id
      }
    }
  }
  return result
}

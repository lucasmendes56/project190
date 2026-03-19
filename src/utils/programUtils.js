import { PHASES, PHASE_SCHEDULES } from '../data/program'
import { EXERCISES } from '../data/exercises'
import { AB_CIRCUITS } from '../data/abCircuit'
import { dayOfWeek, programWeek } from './dateUtils'

// Returns the phase object for a given week number
export function getPhase(weekNum) {
  if (!weekNum || weekNum < 1) return PHASES[0]
  if (weekNum > 12) return null // program complete
  return PHASES.find(p => p.weeks.includes(weekNum)) || PHASES[0]
}

// Returns the effective workoutId for a date (override → DOW default → null)
export function getEffectiveWorkoutId(dateStr, startDateStr, overrides = {}) {
  const ov = overrides[dateStr]
  if (ov === 'rest') return null
  if (ov) return ov
  const weekNum = programWeek(startDateStr, dateStr)
  const phase = getPhase(weekNum)
  if (!phase) return null
  const dow = dayOfWeek(dateStr)
  return PHASE_SCHEDULES[phase.id]?.[dow]?.id ?? null
}

// Core resolver: date + start date → full workout template (with sections), or null for rest day
export function resolveWorkout(dateStr, startDateStr, overrides = {}) {
  const weekNum = programWeek(startDateStr, dateStr)
  const phase = getPhase(weekNum)
  if (!phase) return null

  const ov = overrides[dateStr]
  let dayTemplate

  if (ov === 'rest') {
    return null
  } else if (ov) {
    // Find the template by workout id in this phase's schedule
    const schedule = PHASE_SCHEDULES[phase.id]
    dayTemplate = Object.values(schedule).find(t => t.id === ov)
  } else {
    const dow = dayOfWeek(dateStr)
    dayTemplate = PHASE_SCHEDULES[phase.id]?.[dow]
  }

  if (!dayTemplate) return null // rest day

  // Hydrate exercise IDs with master exercise data
  const sections = dayTemplate.sections.map(section => ({
    ...section,
    exercises: section.exercises.map(ex => ({
      ...EXERCISES[ex.id],
      ...ex, // override with workout-specific sets/reps/notes
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

// Is this date a scheduled workout day? (checks overrides first, then DOW default)
export function isScheduledWorkoutDay(dateStr, startDateStr, overrides = {}) {
  return getEffectiveWorkoutId(dateStr, startDateStr, overrides) !== null
}

// Deprecated shim — DOW-only check, no override support
export function isWorkoutDay(dateStr) {
  const dow = dayOfWeek(dateStr)
  return [1, 2, 4, 5].includes(dow)
}

// Is this date any scheduled day including optional Sat?
export function isAnyWorkoutDay(dateStr) {
  const dow = dayOfWeek(dateStr)
  return [1, 2, 4, 5, 6].includes(dow)
}

// Returns next workout date from a given date, respecting overrides when startDateStr is provided
export function nextWorkoutDate(fromDateStr, startDateStr = null, overrides = {}) {
  let check = fromDateStr
  for (let i = 1; i <= 7; i++) {
    const d = new Date(check)
    d.setDate(d.getDate() + 1)
    check = d.toISOString().split('T')[0]
    if (startDateStr) {
      if (isScheduledWorkoutDay(check, startDateStr, overrides)) return check
    } else {
      if (isWorkoutDay(check)) return check
    }
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

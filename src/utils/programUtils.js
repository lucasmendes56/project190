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

// Core resolver: date + start date → full workout template (with sections), or null for rest day
export function resolveWorkout(dateStr, startDateStr) {
  const dow = dayOfWeek(dateStr)
  const weekNum = programWeek(startDateStr, dateStr)
  const phase = getPhase(weekNum)

  if (!phase) return null

  const schedule = PHASE_SCHEDULES[phase.id]
  const dayTemplate = schedule?.[dow]

  if (!dayTemplate) return null // rest day (Wed=3, Sun=0 not in any schedule)

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

// Is this date a mandatory workout day? (Mon/Tue/Thu/Fri — not Sat optional, not Wed/Sun rest)
export function isWorkoutDay(dateStr) {
  const dow = dayOfWeek(dateStr)
  return [1, 2, 4, 5].includes(dow)
}

// Is this date any scheduled day including optional Sat?
export function isAnyWorkoutDay(dateStr) {
  const dow = dayOfWeek(dateStr)
  return [1, 2, 4, 5, 6].includes(dow)
}

// Returns next MANDATORY workout date from a given date
export function nextWorkoutDate(fromDateStr) {
  let check = fromDateStr
  for (let i = 1; i <= 7; i++) {
    const d = new Date(check)
    d.setDate(d.getDate() + 1)
    check = d.toISOString().split('T')[0]
    if (isWorkoutDay(check)) return check
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

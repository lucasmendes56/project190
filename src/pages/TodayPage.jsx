import { useState, useEffect, useMemo, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import StreakBadge from '../components/streak/StreakBadge'
import PhaseTag from '../components/shared/PhaseTag'
import ExerciseCard from '../components/today/ExerciseCard'
import AbCircuitSection from '../components/today/AbCircuitSection'
import WeekStrip from '../components/today/WeekStrip'
import DayNav from '../components/today/DayNav'
import WorkoutPreview from '../components/today/WorkoutPreview'
import WorkoutCompleteModal from '../components/complete/WorkoutCompleteModal'
import { formatDate, formatDayName, today, addDays } from '../utils/dateUtils'
import { parseMinReps, resolveWorkout } from '../utils/programUtils'
import { REST_DAY_MESSAGES } from '../data/program'

function buildInitialSets(exercise, lastWeight) {
  return Array.from({ length: exercise.sets }, () => ({
    weight: lastWeight ?? exercise.defaultWeight ?? 0,
    reps: parseMinReps(exercise.reps),
    completed: false,
  }))
}

export default function TodayPage() {
  const {
    todayWorkout,
    isTodayWorkoutDay,
    streak,
    currentWeek,
    currentPhase,
    addEntry,
    isCompletedDate,
    getLastWeightForExercise,
    getWeightForExerciseInWeek,
    getTodayEntry,
    getEntryForDate,
    log,
    isProgramComplete,
    activeSession,
    setActiveSession,
    settings,
    scheduleOverrides,
    swapWorkouts,
    assignWorkout,
  } = useApp()

  const todayStr = today()
  const [selectedDate, setSelectedDate] = useState(todayStr)
  /** 0 = DayNav centered on today; -1 = one week earlier, etc. */
  const [dayNavWeekOffset, setDayNavWeekOffset] = useState(0)
  const dayNavCenterDate = useMemo(() => addDays(todayStr, dayNavWeekOffset * 7), [todayStr, dayNavWeekOffset])

  const handleDayNavWeekShift = useCallback((delta) => {
    setDayNavWeekOffset(prev => Math.min(0, prev + delta))
  }, [])

  // Keep selected day on-screen when changing week strip
  useEffect(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(dayNavCenterDate, i - 3))
    setSelectedDate(sel => (days.includes(sel) ? sel : dayNavCenterDate))
  }, [dayNavCenterDate])
  const [showComplete, setShowComplete] = useState(false)
  const [completedWorkoutName, setCompletedWorkoutName] = useState(null)
  const [activeWorkoutTemplate, setActiveWorkoutTemplate] = useState(null)

  const alreadyDone = isCompletedDate(todayStr)
  const todayEntry = getTodayEntry()
  const isViewingToday = selectedDate === todayStr

  // Resolve workout for the selected date (for preview)
  const previewWorkout = useMemo(() => {
    if (!settings.programStartDate) return null
    return resolveWorkout(selectedDate, settings.programStartDate, scheduleOverrides)
  }, [selectedDate, settings.programStartDate, scheduleOverrides])

  // Scheduled workouts for WorkoutPicker (same 7-day window as DayNav)
  const dayNavWorkouts = useMemo(() => {
    if (!settings.programStartDate) return {}
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(dayNavCenterDate, i - 3)
        return [d, resolveWorkout(d, settings.programStartDate, scheduleOverrides)]
      })
    )
  }, [settings.programStartDate, dayNavCenterDate, scheduleOverrides])

  // DayNav labels: logged workout names for the visible 7 days
  const completedWorkoutLabels = useMemo(() => {
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(dayNavCenterDate, i - 3)
        const entry = getEntryForDate(d)
        return [d, entry?.workoutName ?? null]
      })
    )
  }, [dayNavCenterDate, log, getEntryForDate])

  const previewCompleted = isCompletedDate(selectedDate)

  // Build session from today's workout sections
  useEffect(() => {
    if (!todayWorkout || alreadyDone || activeSession?.date === todayStr) return

    const sections = todayWorkout.sections.map(section => ({
      sectionId: section.id,
      exercises: section.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: buildInitialSets(ex, getLastWeightForExercise(ex.id)),
      })),
    }))

    setActiveSession({ date: todayStr, workoutId: todayWorkout.id, sections, abCompleted: [] })
    setActiveWorkoutTemplate(todayWorkout)
  }, [todayWorkout?.id, alreadyDone])

  // Restore activeWorkoutTemplate from todayWorkout on page reload if session matches
  useEffect(() => {
    if (!activeWorkoutTemplate && activeSession?.date === todayStr && todayWorkout && activeSession.workoutId === todayWorkout.id) {
      setActiveWorkoutTemplate(todayWorkout)
    }
  }, [activeSession, todayWorkout])

  function updateExerciseSets(sectionId, exId, sets) {
    setActiveSession(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.sectionId === sectionId
          ? { ...s, exercises: s.exercises.map(e => e.id === exId ? { ...e, sets } : e) }
          : s
      ),
    }))
  }

  function toggleAb(id) {
    setActiveSession(prev => {
      const has = prev.abCompleted.includes(id)
      return { ...prev, abCompleted: has ? prev.abCompleted.filter(x => x !== id) : [...prev.abCompleted, id] }
    })
  }

  function handleDoToday(borrowedWorkout, fromDate) {
    if (fromDate && fromDate !== todayStr) {
      swapWorkouts(todayStr, fromDate)
    } else if (!fromDate) {
      // Unscheduled workout selected directly — assign it to today
      assignWorkout(todayStr, borrowedWorkout.id)
    }
    const sections = borrowedWorkout.sections.map(section => ({
      sectionId: section.id,
      exercises: section.exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: buildInitialSets(ex, getLastWeightForExercise(ex.id)),
      })),
    }))
    setActiveSession({
      date: todayStr,
      workoutId: borrowedWorkout.id,
      workoutName: borrowedWorkout.name,
      sections,
      abCompleted: [],
    })
    setActiveWorkoutTemplate(borrowedWorkout)
    setSelectedDate(todayStr)
  }

  function finishWorkout() {
    if (!activeSession) return
    const allExercises = activeSession.sections.flatMap(s =>
      s.exercises.map(e => ({ ...e, section: s.sectionId, sets: e.sets.filter(set => set.completed) }))
    )
    addEntry({
      date: todayStr,
      workoutId: activeSession.workoutId,
      workoutName: activeSession.workoutName ?? todayWorkout?.name,
      exercises: allExercises,
      abCompleted: activeSession.abCompleted,
      weekNum: currentWeek,
      phase: currentPhase?.id,
    })
    setCompletedWorkoutName(activeSession.workoutName ?? todayWorkout?.name ?? 'Workout')
    setActiveSession(null)
    setShowComplete(true)
  }

  const completedSetCount = activeSession
    ? activeSession.sections.flatMap(s => s.exercises.flatMap(e => e.sets)).filter(s => s.completed).length : 0
  const totalSetCount = activeSession
    ? activeSession.sections.flatMap(s => s.exercises.flatMap(e => e.sets)).length : 0

  if (isProgramComplete) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-primary mb-4">PROTOCOL COMPLETE</p>
          <h1 className="text-2xl font-mono font-black text-white uppercase tracking-wide mb-2">12 Weeks Done.</h1>
          <p className="text-xs font-mono text-muted">Go to System settings to restart.</p>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted">
            {formatDayName(todayStr).toUpperCase()}, {formatDate(todayStr)}
          </p>
          {currentWeek && <p className="text-[9px] font-mono tracking-widest" style={{ color: '#333' }}>WEEK {currentWeek} OF 12</p>}
        </div>
        <div className="flex items-center gap-2">
          {currentPhase && <PhaseTag phase={currentPhase} />}
          <StreakBadge streak={streak} />
        </div>
      </div>

      <WeekStrip
        programStartDate={settings.programStartDate}
        currentWeek={currentWeek}
        currentPhase={currentPhase}
        isCompletedDate={isCompletedDate}
        scheduleOverrides={scheduleOverrides}
        getEntryForDate={getEntryForDate}
      />

      {/* Day navigator */}
      <DayNav
        centerDate={dayNavCenterDate}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        isCompletedDate={isCompletedDate}
        completedWorkoutLabels={completedWorkoutLabels}
        onWeekShift={handleDayNavWeekShift}
        weekOffsetFromToday={dayNavWeekOffset}
      />

      {/* ── PREVIEW MODE: viewing another day ── */}
      {!isViewingToday && (
        previewWorkout ? (
          <WorkoutPreview
            workout={previewWorkout}
            completed={previewCompleted}
            onDoToday={(workout) => handleDoToday(workout, selectedDate)}
          />
        ) : (
          <div>
            <div className="text-center py-8">
              <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-primary mb-2">REST DAY</p>
              <p className="text-xs font-mono text-muted max-w-xs mx-auto">
                {REST_DAY_MESSAGES[new Date().getDay() % REST_DAY_MESSAGES.length]}
              </p>
            </div>
            <WorkoutPicker workouts={dayNavWorkouts} onSelect={handleDoToday} />
          </div>
        )
      )}

      {/* ── TODAY MODE ── */}
      {isViewingToday && (
        <>
          {/* Rest day — no scheduled workout and no active session */}
          {!isTodayWorkoutDay && !activeSession && (
            <div>
              <div className="text-center py-8">
                <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-primary mb-2">REST DAY</p>
                <p className="text-xs font-mono text-muted max-w-xs mx-auto">
                  {REST_DAY_MESSAGES[new Date().getDay() % REST_DAY_MESSAGES.length]}
                </p>
              </div>
              <WorkoutPicker workouts={dayNavWorkouts} onSelect={handleDoToday} />
            </div>
          )}

          {/* Already done */}
          {isTodayWorkoutDay && alreadyDone && (
            <div>
              <div className="text-center py-8">
                <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-primary mb-2">COMPLETE</p>
                <p className="text-xs font-mono text-muted mb-0.5">
                  {todayEntry?.exercises?.reduce((sum, e) => sum + e.sets.length, 0) ?? 0} SETS LOGGED
                </p>
                <p className="text-xs font-mono" style={{ color: '#333' }}>EAT. SLEEP. RECOVER.</p>
              </div>
              <WorkoutPicker workouts={dayNavWorkouts} onSelect={handleDoToday} label="DO ANOTHER WORKOUT" />
            </div>
          )}

          {/* Active workout */}
          {activeWorkoutTemplate && activeSession && (
            <>
              <div className="mb-5">
                <h1 className="text-lg font-mono font-black text-white uppercase tracking-wide">{activeWorkoutTemplate.name}</h1>
                {currentPhase && <p className="text-[10px] font-mono text-muted mt-0.5 tracking-widest">{currentPhase.tip}</p>}
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-[10px] font-mono text-muted mb-1.5">
                  <span>{completedSetCount} / {totalSetCount} SETS</span>
                  <span>{totalSetCount > 0 ? Math.round((completedSetCount / totalSetCount) * 100) : 0}%</span>
                </div>
                <div className="h-px overflow-hidden" style={{ background: '#1a1a1a' }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: totalSetCount > 0 ? `${(completedSetCount / totalSetCount) * 100}%` : '0%',
                      background: '#DC2626',
                    }}
                  />
                </div>
              </div>

              {/* Sections with exercise cards */}
              {activeWorkoutTemplate.sections.map(sectionTemplate => {
                const sessionSection = activeSession.sections.find(s => s.sectionId === sectionTemplate.id)
                if (!sessionSection) return null
                return (
                  <div key={sectionTemplate.id} className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-px flex-1" style={{ background: sectionTemplate.optional ? '#1a1a1a' : '#DC2626', opacity: 0.4 }} />
                      <span className={`text-[10px] font-mono font-black tracking-[0.4em] uppercase ${sectionTemplate.optional ? 'text-muted' : 'text-primary'}`}>
                        {sectionTemplate.label}
                      </span>
                      <div className="h-px flex-1" style={{ background: sectionTemplate.optional ? '#1a1a1a' : '#DC2626', opacity: 0.4 }} />
                    </div>
                    {sectionTemplate.sublabel && (
                      <p className="text-xs font-mono text-muted text-center mb-3">{sectionTemplate.sublabel}</p>
                    )}
                    <div className="space-y-3">
                      {sectionTemplate.exercises.map(exTemplate => {
                        const sessionEx = sessionSection.exercises.find(e => e.id === exTemplate.id)
                        if (!sessionEx) return null
                        return (
                          <ExerciseCard
                            key={exTemplate.id}
                            exercise={exTemplate}
                            sets={sessionEx.sets}
                            onSetsChange={(sets) => updateExerciseSets(sectionTemplate.id, exTemplate.id, sets)}
                            lastWeight={getLastWeightForExercise(exTemplate.id)}
                            lastWeekWeight={currentWeek > 1 ? getWeightForExerciseInWeek(exTemplate.id, currentWeek - 1) : null}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Ab Circuit */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1" style={{ background: '#1a1a1a' }} />
                <span className="text-[10px] font-mono font-black tracking-[0.4em] uppercase text-muted">
                  AB CIRCUIT {activeWorkoutTemplate.abCircuit?.id}
                </span>
                <div className="h-px flex-1" style={{ background: '#1a1a1a' }} />
              </div>
              <p className="text-xs font-mono text-muted text-center mb-3">5 MIN — ALWAYS DO THIS</p>
              <div className="mb-6">
                <AbCircuitSection
                  circuit={activeWorkoutTemplate.abCircuit}
                  completed={activeSession.abCompleted}
                  onToggle={toggleAb}
                />
              </div>

              <button
                onClick={finishWorkout}
                className="w-full border border-primary text-primary font-mono font-black text-sm py-4 tracking-[0.4em] uppercase active:opacity-70 transition-opacity"
              >
                FINISH SESSION
              </button>
            </>
          )}
        </>
      )}

      {showComplete && (
        <WorkoutCompleteModal
          streak={streak}
          workoutName={completedWorkoutName ?? 'Workout'}
          onClose={() => setShowComplete(false)}
        />
      )}
    </PageWrapper>
  )
}

function WorkoutPicker({ workouts, onSelect, label = 'START A WORKOUT' }) {
  const items = Object.entries(workouts).filter(([, w]) => Boolean(w))
  if (items.length === 0) return null

  return (
    <div className="mt-2">
      <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-3">{label}</p>
      <div className="space-y-1.5">
        {items.map(([dateStr, workout]) => (
          <button
            key={dateStr}
            onClick={() => onSelect(workout, dateStr)}
            className="w-full flex items-center justify-between border px-4 py-4 text-left active:opacity-60 transition-opacity"
            style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}
          >
            <div>
              <p className="text-sm font-mono font-bold text-white uppercase tracking-wide">{workout.name}</p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: '#444' }}>
                {workout.sections?.flatMap(s => s.exercises).length ?? 0} EXERCISES
              </p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" style={{ color: '#DC2626' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}

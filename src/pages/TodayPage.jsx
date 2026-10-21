import { useState, useEffect, useMemo, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import StreakBadge from '../components/streak/StreakBadge'
import PhaseTag from '../components/shared/PhaseTag'
import ExerciseCard from '../components/today/ExerciseCard'
import AbCircuitSection from '../components/today/AbCircuitSection'
import SwapExerciseSheet from '../components/today/SwapExerciseSheet'
import WeekStrip from '../components/today/WeekStrip'
import DayNav from '../components/today/DayNav'
import WorkoutPreview from '../components/today/WorkoutPreview'
import WorkoutCompleteModal from '../components/complete/WorkoutCompleteModal'
import { formatDate, formatDayName, today, addDays } from '../utils/dateUtils'
import { parseMinReps, resolveWorkout, getWorkoutSlots } from '../utils/programUtils'
import { REST_DAY_MESSAGES } from '../data/program'
import {
  alternativesFor,
  getCatalogExercise,
  groupForExercise,
  groupLabel,
  swapRecord,
} from '../data/exerciseSwaps'

function buildInitialSets(exercise, lastWeight) {
  return Array.from({ length: exercise.sets }, () => ({
    weight: lastWeight ?? exercise.defaultWeight ?? 0,
    reps: parseMinReps(exercise.reps),
    completed: false,
  }))
}

function sessionExercise(ex, lastWeight) {
  return {
    programId: ex.programId || ex.id,
    id: ex.id,
    name: ex.name,
    muscle: ex.muscle,
    defaultWeight: ex.defaultWeight,
    sets: buildInitialSets(ex, lastWeight),
  }
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
    exerciseSwaps,
    customExercises,
    saveExerciseSwap,
    clearExerciseSwap,
    rememberCustomExercise,
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
  const [showChangePicker, setShowChangePicker] = useState(false)
  const [changePickerDate, setChangePickerDate] = useState(null)
  const [swapRequest, setSwapRequest] = useState(null)

  const alreadyDone = isCompletedDate(todayStr)
  const todayEntry = getTodayEntry()
  const isViewingToday = selectedDate === todayStr

  // Resolve workout for the selected date (for preview)
  const previewWorkout = useMemo(() => {
    if (!settings.programStartDate) return null
    return resolveWorkout(selectedDate, settings.programStartDate, scheduleOverrides, exerciseSwaps)
  }, [selectedDate, settings.programStartDate, scheduleOverrides, exerciseSwaps])

  // Scheduled workouts for WorkoutPicker (same 7-day window as DayNav)
  const dayNavWorkouts = useMemo(() => {
    if (!settings.programStartDate) return {}
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(dayNavCenterDate, i - 3)
        return [d, resolveWorkout(d, settings.programStartDate, scheduleOverrides, exerciseSwaps)]
      })
    )
  }, [settings.programStartDate, dayNavCenterDate, scheduleOverrides, exerciseSwaps])

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
      exercises: section.exercises.map(ex => sessionExercise(ex, getLastWeightForExercise(ex.id))),
    }))

    setActiveSession({ date: todayStr, workoutId: todayWorkout.id, sections, abCompleted: [], abSwaps: {} })
    setActiveWorkoutTemplate(todayWorkout)
  }, [todayWorkout?.id, alreadyDone])

  // Restore activeWorkoutTemplate from todayWorkout on page reload if session matches
  useEffect(() => {
    if (!activeWorkoutTemplate && activeSession?.date === todayStr && todayWorkout && activeSession.workoutId === todayWorkout.id) {
      setActiveWorkoutTemplate(todayWorkout)
    }
  }, [activeSession, todayWorkout])

  function updateExerciseSets(sectionId, slotId, sets) {
    setActiveSession(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.sectionId === sectionId
          ? { ...s, exercises: s.exercises.map(e => (e.programId || e.id) === slotId ? { ...e, sets } : e) }
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
      exercises: section.exercises.map(ex => sessionExercise(ex, getLastWeightForExercise(ex.id))),
    }))
    setActiveSession({
      date: todayStr,
      workoutId: borrowedWorkout.id,
      workoutName: borrowedWorkout.name,
      sections,
      abCompleted: [],
      abSwaps: {},
    })
    setActiveWorkoutTemplate(borrowedWorkout)
    setSelectedDate(todayStr)
  }

  function openChangePicker(dateStr) {
    setChangePickerDate(dateStr)
    setShowChangePicker(true)
  }

  function handleChangeWorkout(newWorkoutId) {
    const dateStr = changePickerDate
    assignWorkout(dateStr, newWorkoutId)
    // If changing today's active workout, rebuild the session
    if (dateStr === todayStr) {
      const newWorkout = resolveWorkout(dateStr, settings.programStartDate, { _v: 2, [dateStr]: newWorkoutId }, exerciseSwaps)
      if (newWorkout) {
        const sections = newWorkout.sections.map(section => ({
          sectionId: section.id,
          exercises: section.exercises.map(ex => sessionExercise(ex, getLastWeightForExercise(ex.id))),
        }))
        setActiveSession({ date: todayStr, workoutId: newWorkoutId, workoutName: newWorkout.name, sections, abCompleted: [], abSwaps: {} })
        setActiveWorkoutTemplate(newWorkout)
      }
    }
    setShowChangePicker(false)
    setChangePickerDate(null)
  }

  function slotTemplate(programId) {
    for (const section of activeWorkoutTemplate?.sections || []) {
      const exercise = section.exercises.find(ex => (ex.programId || ex.id) === programId)
      if (exercise) return exercise
    }
    return null
  }

  function openLiftSwap(sectionId, exercise) {
    const programId = exercise.programId || exercise.id
    const group = groupForExercise(programId)
    if (!group) return
    setSwapRequest({
      kind: 'lift',
      sectionId,
      programId,
      group,
      currentId: exercise.id,
      planned: getCatalogExercise(programId),
    })
  }

  function openAbSwap(exercise) {
    const programId = exercise.programId || exercise.id
    const group = groupForExercise(programId) || 'abs'
    setSwapRequest({
      kind: 'ab',
      programId,
      group,
      currentId: exercise.id,
      planned: getCatalogExercise(programId),
    })
  }

  function applyLiftToSession(programId, sectionId, exercise) {
    const template = slotTemplate(programId)
    const prescription = template || { sets: exercise.sets, reps: exercise.reps }
    setActiveSession(prev => {
      if (!prev) return prev
      return {
        ...prev,
        sections: prev.sections.map(section => {
          if (section.sectionId !== sectionId) return section
          return {
            ...section,
            exercises: section.exercises.map(slot => {
              if ((slot.programId || slot.id) !== programId) return slot
              return sessionExercise(
                {
                  ...prescription,
                  programId,
                  id: exercise.id,
                  name: exercise.name,
                  muscle: exercise.muscle,
                  defaultWeight: exercise.defaultWeight,
                },
                getLastWeightForExercise(exercise.id)
              )
            }),
          }
        }),
      }
    })
  }

  function applyAbToSession(programId, exercise) {
    setActiveSession(prev => {
      if (!prev) return prev
      const previous = prev.abSwaps?.[programId]
      const templateId = activeWorkoutTemplate?.abCircuit?.exercises?.find(ex => (ex.programId || ex.id) === programId)?.id
      const drop = new Set([programId, previous?.id, templateId].filter(Boolean))
      return {
        ...prev,
        abCompleted: (prev.abCompleted || []).filter(id => !drop.has(id)),
        abSwaps: {
          ...(prev.abSwaps || {}),
          [programId]: { id: exercise.id, name: exercise.name, muscle: exercise.muscle },
        },
      }
    })
  }

  function handleSwapConfirm(target, makeDefault) {
    if (!swapRequest) return
    const { programId, kind, sectionId } = swapRequest
    const planned = getCatalogExercise(programId)
    const next = target.restore
      ? { ...planned, id: programId, name: planned?.name, muscle: planned?.muscle, defaultWeight: planned?.defaultWeight, restore: true }
      : target

    if (next.custom) rememberCustomExercise(next)
    if (target.restore) {
      if (makeDefault) clearExerciseSwap(programId)
    } else if (makeDefault) {
      const record = swapRecord(next)
      if (record) saveExerciseSwap(programId, record)
    }

    if (kind === 'ab') applyAbToSession(programId, next)
    else applyLiftToSession(programId, sectionId, next)
    setSwapRequest(null)
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

  const displayAbCircuit = useMemo(() => {
    const circuit = activeWorkoutTemplate?.abCircuit
    if (!circuit) return null
    const overrides = activeSession?.abSwaps || {}
    return {
      ...circuit,
      exercises: circuit.exercises.map(ex => {
        const programId = ex.programId || ex.id
        const override = overrides[programId]
        if (!override) return { ...ex, programId }
        return {
          ...ex,
          programId,
          id: override.id,
          name: override.name,
          muscle: override.muscle || ex.muscle,
          notes: override.id === programId ? ex.notes : undefined,
          swapped: override.id !== programId,
        }
      }),
    }
  }, [activeWorkoutTemplate, activeSession])

  const swapChoices = useMemo(() => {
    if (!swapRequest) return { builtIn: [], custom: [] }
    const saved = customExercises && typeof customExercises === 'object' && !Array.isArray(customExercises)
      ? Object.values(customExercises)
      : []
    const builtIn = alternativesFor(swapRequest.group)
      .filter(exercise => exercise.id !== swapRequest.currentId)
      .map(exercise => ({ ...exercise, lastWeight: getLastWeightForExercise(exercise.id) }))
    const custom = saved
      .filter(exercise => exercise?.group === swapRequest.group && exercise.id !== swapRequest.currentId)
      .filter(exercise => !builtIn.some(item => item.id === exercise.id))
      .map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        group: exercise.group,
        custom: true,
        muscle: groupLabel(exercise.group) || 'Custom',
        defaultWeight: 0,
        lastWeight: getLastWeightForExercise(exercise.id),
      }))
    return { builtIn, custom }
  }, [swapRequest, customExercises, getLastWeightForExercise])

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
          <>
            <WorkoutPreview
              workout={previewWorkout}
              completed={previewCompleted}
              onDoToday={(workout) => handleDoToday(workout, selectedDate)}
            />
            {!previewCompleted && (
              <button
                onClick={() => openChangePicker(selectedDate)}
                className="w-full text-[10px] font-mono font-bold tracking-widest uppercase py-3 active:opacity-60"
                style={{ color: '#333' }}
              >
                CHANGE THIS DAY'S WORKOUT
              </button>
            )}
          </>
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
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-mono font-black text-white uppercase tracking-wide">{activeWorkoutTemplate.name}</h1>
                  {currentPhase && <p className="text-[10px] font-mono text-muted mt-0.5 tracking-widest">{currentPhase.tip}</p>}
                </div>
                {!alreadyDone && (
                  <button
                    onClick={() => openChangePicker(todayStr)}
                    className="flex-shrink-0 text-[9px] font-mono font-bold tracking-widest uppercase border px-2.5 py-1.5 active:opacity-60"
                    style={{ borderColor: '#1a1a1a', color: '#444' }}
                  >
                    CHANGE
                  </button>
                )}
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
                        const slotId = exTemplate.programId || exTemplate.id
                        const sessionEx = sessionSection.exercises.find(e => (e.programId || e.id) === slotId)
                        if (!sessionEx) return null
                        const exercise = {
                          ...exTemplate,
                          id: sessionEx.id,
                          name: sessionEx.name,
                          muscle: sessionEx.muscle || exTemplate.muscle,
                          defaultWeight: sessionEx.defaultWeight ?? exTemplate.defaultWeight,
                          programId: slotId,
                          swapped: sessionEx.id !== slotId,
                          notes: sessionEx.id === slotId ? exTemplate.notes : null,
                        }
                        return (
                          <ExerciseCard
                            key={slotId}
                            exercise={exercise}
                            sets={sessionEx.sets}
                            onSetsChange={(sets) => updateExerciseSets(sectionTemplate.id, slotId, sets)}
                            lastWeight={getLastWeightForExercise(exercise.id)}
                            lastWeekWeight={currentWeek > 1 ? getWeightForExerciseInWeek(exercise.id, currentWeek - 1) : null}
                            onSwap={() => openLiftSwap(sectionTemplate.id, exercise)}
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
                  circuit={displayAbCircuit}
                  completed={activeSession.abCompleted}
                  onToggle={toggleAb}
                  onSwap={openAbSwap}
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

      {showChangePicker && currentPhase && (
        <WorkoutChangePicker
          phaseId={currentPhase.id}
          phaseName={currentPhase.name}
          currentWorkoutId={changePickerDate === todayStr ? activeWorkoutTemplate?.id : previewWorkout?.id}
          programStartDate={settings.programStartDate}
          dateStr={changePickerDate}
          scheduleOverrides={scheduleOverrides}
          onSelect={handleChangeWorkout}
          onClose={() => { setShowChangePicker(false); setChangePickerDate(null) }}
        />
      )}

      {swapRequest && (
        <SwapExerciseSheet
          group={swapRequest.group}
          groupLabel={groupLabel(swapRequest.group) || 'Exercise'}
          planned={swapRequest.planned}
          currentId={swapRequest.currentId}
          choices={swapChoices}
          onConfirm={handleSwapConfirm}
          onClose={() => setSwapRequest(null)}
        />
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

function WorkoutChangePicker({ phaseId, phaseName, currentWorkoutId, onSelect, onClose }) {
  const { mandatory, optional } = getWorkoutSlots(phaseId)
  const all = [...mandatory, ...(optional ? [optional] : [])]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full p-5 pb-8"
        style={{ background: '#0d0d0d', borderTop: '1px solid #1a1a1a' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase" style={{ color: '#DC2626' }}>
            CHANGE WORKOUT — {phaseName}
          </p>
          <button onClick={onClose} className="text-muted text-xs font-mono">✕</button>
        </div>
        <div className="space-y-2">
          {all.map(w => (
            <button
              key={w.id}
              onClick={() => onSelect(w.id)}
              className="w-full flex items-center justify-between border px-4 py-3 text-left active:opacity-60"
              style={{
                borderColor: w.id === currentWorkoutId ? '#DC2626' : '#1a1a1a',
                background: w.id === currentWorkoutId ? '#0a0000' : '#000',
              }}
            >
              <div>
                <p className="text-sm font-mono font-bold uppercase tracking-wide"
                  style={{ color: w.id === currentWorkoutId ? '#DC2626' : '#fff' }}>
                  {w.name}
                  {w.optional && <span className="ml-2 text-[9px] text-muted normal-case">(optional)</span>}
                </p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: '#333' }}>
                  {w.sections?.flatMap(s => s.exercises).length ?? 0} EXERCISES
                </p>
              </div>
              {w.id === currentWorkoutId && (
                <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: '#DC2626' }}>NOW</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
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

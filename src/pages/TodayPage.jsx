import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useApp } from '../context/AppContext'
import PageWrapper from '../components/layout/PageWrapper'
import StreakBadge from '../components/streak/StreakBadge'
import PhaseTag from '../components/shared/PhaseTag'
import SwapExerciseSheet from '../components/today/SwapExerciseSheet'
import WeekStrip from '../components/today/WeekStrip'
import DayNav from '../components/today/DayNav'
import WorkoutPreview from '../components/today/WorkoutPreview'
import WorkoutLogger from '../components/today/WorkoutLogger'
import LoggedWorkoutReview from '../components/today/LoggedWorkoutReview'
import WorkoutCompleteModal from '../components/complete/WorkoutCompleteModal'
import { friendlyDate, formatDate, formatDayName, today, addDays, weekOffsetContaining, programWeek } from '../utils/dateUtils'
import { resolveWorkout, getWorkoutSlots, getPhase } from '../utils/programUtils'
import { REST_DAY_MESSAGES } from '../data/program'
import {
  alternativesFor,
  getCatalogExercise,
  groupForExercise,
  groupLabel,
  swapRecord,
} from '../data/exerciseSwaps'
import {
  applySetUpdate,
  buildSession,
  confirmDraft,
  draftForEditing,
  entryFromSession,
  finishPlan,
  markDirty,
  normalizeDrafts,
  parkedPastDraft,
  sessionExercise,
  sessionFromEntry,
  templateFromSession,
} from '../utils/workoutSession'

export default function TodayPage() {
  const {
    todayWorkout,
    isTodayWorkoutDay,
    streak,
    currentWeek,
    currentPhase,
    addEntry,
    replaceEntryForDate,
    isCompletedDate,
    getLastWeightForExercise,
    getWeightForExerciseInWeek,
    getEntriesForDate,
    getEntryForDate,
    isProgramComplete,
    drafts,
    getDrafts,
    putDraft,
    mutateDraft,
    clearDraft,
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
  const [pickedDate, setPickedDate] = useState(todayStr)
  /** 0 = DayNav centered on today; -1 = one week earlier, etc. */
  const [dayNavWeekOffset, setDayNavWeekOffset] = useState(0)
  const dayNavCenterDate = useMemo(() => addDays(todayStr, dayNavWeekOffset * 7), [todayStr, dayNavWeekOffset])
  const visibleDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(dayNavCenterDate, i - 3)),
    [dayNavCenterDate],
  )
  const selectedDate = visibleDays.includes(pickedDate) ? pickedDate : dayNavCenterDate

  const handleDayNavWeekShift = useCallback((delta) => {
    setDayNavWeekOffset(prev => Math.min(0, prev + delta))
  }, [])

  const [showComplete, setShowComplete] = useState(false)
  const [completedWorkoutName, setCompletedWorkoutName] = useState(null)
  const [completedDateLabel, setCompletedDateLabel] = useState('')
  const [completedAsUpdate, setCompletedAsUpdate] = useState(false)
  const [showChangePicker, setShowChangePicker] = useState(false)
  const [changePickerDate, setChangePickerDate] = useState(null)
  const [swapRequest, setSwapRequest] = useState(null)
  const [flashDate, setFlashDate] = useState(null)
  const [warning, setWarning] = useState(null)
  const flashTimer = useRef(null)

  const [resumedOnOpen] = useState(() => new Set(
    Object.values(normalizeDrafts(drafts))
      .filter(draft => draft.dirty || draft.confirmedAt || draft.updatingEntryId)
      .map(draft => draft.date)
  ))

  const alreadyDone = isCompletedDate(todayStr)
  const isViewingToday = selectedDate === todayStr
  const selectedEntries = getEntriesForDate(selectedDate)
  const todayEntries = getEntriesForDate(todayStr)

  const previewWorkout = useMemo(() => {
    if (!settings.programStartDate) return null
    return resolveWorkout(selectedDate, settings.programStartDate, scheduleOverrides, exerciseSwaps)
  }, [selectedDate, settings.programStartDate, scheduleOverrides, exerciseSwaps])

  const dayNavWorkouts = useMemo(() => {
    if (!settings.programStartDate) return {}
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(dayNavCenterDate, i - 3)
        return [d, resolveWorkout(d, settings.programStartDate, scheduleOverrides, exerciseSwaps)]
      })
    )
  }, [settings.programStartDate, dayNavCenterDate, scheduleOverrides, exerciseSwaps])

  const completedWorkoutLabels = useMemo(() => {
    return Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => {
        const d = addDays(dayNavCenterDate, i - 3)
        const entry = getEntryForDate(d)
        return [d, entry?.workoutName ?? null]
      })
    )
  }, [dayNavCenterDate, getEntryForDate])

  const previewCompleted = selectedEntries.length > 0

  const editorSession = draftForEditing(
    normalizeDrafts(drafts)[selectedDate],
    selectedEntries,
    todayStr,
  )

  const activeTemplate = useMemo(() => {
    if (!editorSession) return null
    if (!settings.programStartDate) return templateFromSession(editorSession)
    const schedule = editorSession.workoutId
      ? { ...scheduleOverrides, [editorSession.date]: editorSession.workoutId }
      : scheduleOverrides
    const resolved = resolveWorkout(editorSession.date, settings.programStartDate, schedule, exerciseSwaps)
    if (resolved && templateMatchesSession(resolved, editorSession)) return resolved
    return templateFromSession(editorSession)
  }, [editorSession, settings.programStartDate, scheduleOverrides, exerciseSwaps])

  // Open today's workout automatically. A day the user already started is left alone.
  useEffect(() => {
    if (!todayWorkout || isCompletedDate(todayStr)) return
    const existing = normalizeDrafts(getDrafts())[todayStr]
    if (existing && (existing.dirty || existing.confirmedAt || existing.updatingEntryId)) return
    if (existing && existing.workoutId === todayWorkout.id) return
    putDraft(buildSession(todayWorkout, todayStr, getLastWeightForExercise))
  }, [todayWorkout, todayStr, isCompletedDate, getDrafts, putDraft, getLastWeightForExercise])

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
  }, [])

  function focusDate(dateStr) {
    setDayNavWeekOffset(weekOffsetContaining(dateStr, todayStr))
    setPickedDate(dateStr)
  }

  function resolveFor(dateStr, workoutId) {
    if (!settings.programStartDate) return null
    const schedule = workoutId
      ? { ...scheduleOverrides, [dateStr]: workoutId }
      : scheduleOverrides
    return resolveWorkout(dateStr, settings.programStartDate, schedule, exerciseSwaps)
  }

  function updateExerciseSets(sectionId, slotId, sets) {
    if (!editorSession) return
    mutateDraft(editorSession.date, current => applySetUpdate(current, sectionId, slotId, sets))
  }

  function toggleAb(id) {
    if (!editorSession) return
    mutateDraft(editorSession.date, current => {
      if (!current) return current
      const has = (current.abCompleted || []).includes(id)
      return markDirty({
        ...current,
        abCompleted: has
          ? current.abCompleted.filter(item => item !== id)
          : [...(current.abCompleted || []), id],
      })
    })
  }

  function handleDoToday(borrowedWorkout, fromDate) {
    if (fromDate && fromDate !== todayStr) {
      swapWorkouts(todayStr, fromDate)
    } else if (!fromDate) {
      assignWorkout(todayStr, borrowedWorkout.id)
    }
    putDraft(buildSession(borrowedWorkout, todayStr, getLastWeightForExercise))
    setPickedDate(todayStr)
    setDayNavWeekOffset(0)
  }

  function startLog(dateStr, workout) {
    if (!workout || dateStr > todayStr) return
    if (getEntriesForDate(dateStr).length > 0) return
    putDraft(buildSession(workout, dateStr, getLastWeightForExercise))
  }

  function startUpdate(entry) {
    const workout = resolveFor(entry.date, entry.workoutId)
    putDraft(sessionFromEntry(workout, entry))
    focusDate(entry.date)
  }

  function openChangePicker(dateStr) {
    setChangePickerDate(dateStr)
    setShowChangePicker(true)
  }

  function handleChangeWorkout(newWorkoutId) {
    const dateStr = changePickerDate
    assignWorkout(dateStr, newWorkoutId)
    const newWorkout = resolveFor(dateStr, newWorkoutId)
    const current = normalizeDrafts(getDrafts())[dateStr]
    const editingThisDate = current
      ? draftForEditing(current, getEntriesForDate(dateStr), todayStr)
      : null
    if (newWorkout && (dateStr === todayStr || editingThisDate)) {
      const next = buildSession(newWorkout, dateStr, getLastWeightForExercise)
      if (editingThisDate?.updatingEntryId) next.updatingEntryId = editingThisDate.updatingEntryId
      putDraft(next)
    }
    setShowChangePicker(false)
    setChangePickerDate(null)
  }

  function slotTemplate(programId) {
    for (const section of activeTemplate?.sections || []) {
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
    if (!editorSession) return
    const template = slotTemplate(programId)
    const prescription = template || { sets: exercise.sets, reps: exercise.reps }
    mutateDraft(editorSession.date, prev => {
      if (!prev) return prev
      return markDirty({
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
                getLastWeightForExercise(exercise.id),
              )
            }),
          }
        }),
      })
    })
  }

  function applyAbToSession(programId, exercise) {
    if (!editorSession) return
    mutateDraft(editorSession.date, prev => {
      if (!prev) return prev
      const previous = prev.abSwaps?.[programId]
      const templateId = activeTemplate?.abCircuit?.exercises?.find(ex => (ex.programId || ex.id) === programId)?.id
      const drop = new Set([programId, previous?.id, templateId].filter(Boolean))
      return markDirty({
        ...prev,
        abCompleted: (prev.abCompleted || []).filter(id => !drop.has(id)),
        abSwaps: {
          ...(prev.abSwaps || {}),
          [programId]: { id: exercise.id, name: exercise.name, muscle: exercise.muscle },
        },
      })
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

  function handleSave() {
    if (!editorSession) return
    const date = editorSession.date
    const active = document.activeElement
    if (active && typeof active.blur === 'function') active.blur()
    mutateDraft(date, current => (current ? confirmDraft(current) : current))
    setFlashDate(date)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlashDate(current => (current === date ? null : current)), 2000)
  }

  function finishWorkout() {
    if (!editorSession) return
    const active = document.activeElement
    if (active && typeof active.blur === 'function') active.blur()
    const session = normalizeDrafts(getDrafts())[editorSession.date]
    if (!session) return
    const entries = getEntriesForDate(session.date)
    const plan = finishPlan(session, entries, todayStr)
    if (plan.action === 'blocked') {
      setWarning('This day already has a saved workout. Review it before changing it.')
      return
    }
    const workout = resolveFor(session.date, session.workoutId) || activeTemplate
    const weekNum = workout?.weekNum ?? programWeek(settings.programStartDate, session.date)
    const phaseId = workout?.phase?.id ?? (weekNum ? getPhase(weekNum)?.id ?? null : null)
    const payload = entryFromSession(session, { weekNum, phaseId })
    if (plan.action === 'replace') {
      const updated = replaceEntryForDate(plan.entryId, payload)
      if (!updated) {
        setWarning('This day already has a saved workout. Review it before changing it.')
        return
      }
    } else {
      addEntry(payload)
    }
    clearDraft(session.date)
    setCompletedWorkoutName(payload.workoutName || 'Workout')
    setCompletedDateLabel(session.date === todayStr ? '' : friendlyDate(session.date))
    setCompletedAsUpdate(plan.action === 'replace')
    setWarning(null)
    setShowComplete(true)
  }

  function lastWeekWeightFor(exerciseId) {
    const weekNum = activeTemplate?.weekNum || currentWeek
    if (!weekNum || weekNum <= 1) return null
    return getWeightForExerciseInWeek(exerciseId, weekNum - 1)
  }

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

  const parked = parkedPastDraft(drafts, todayStr)
  const pickerWeek = changePickerDate ? programWeek(settings.programStartDate, changePickerDate) : null
  const pickerPhase = pickerWeek ? getPhase(pickerWeek) : currentPhase
  const pastDay = selectedDate < todayStr
  const editingUpdate = Boolean(editorSession?.updatingEntryId)
  const canGoBack = Boolean(
    editorSession
    && pastDay
    && !editingUpdate
    && !editorSession.dirty
    && !editorSession.confirmedAt
  )

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

      <DayNav
        centerDate={dayNavCenterDate}
        selectedDate={selectedDate}
        onSelect={setPickedDate}
        isCompletedDate={isCompletedDate}
        completedWorkoutLabels={completedWorkoutLabels}
        onWeekShift={handleDayNavWeekShift}
        weekOffsetFromToday={dayNavWeekOffset}
      />

      {isViewingToday && parked && (
        <button
          type="button"
          onClick={() => focusDate(parked.date)}
          className="w-full text-left border px-4 py-3 mb-4 active:opacity-70"
          style={{ borderColor: '#3a0000', background: '#0a0000' }}
        >
          <p className="text-xs font-mono text-white">{friendlyDate(parked.date)} is still open.</p>
          <p className="text-[10px] font-mono text-primary mt-1 tracking-widest uppercase">Tap to finish it</p>
        </button>
      )}

      {editorSession && activeTemplate && (
        <WorkoutLogger
          key={editorSession.date + (editorSession.updatingEntryId || '')}
          template={activeTemplate}
          session={editorSession}
          dateLabel={pastDay ? friendlyDate(selectedDate) : null}
          resumed={resumedOnOpen.has(editorSession.date)}
          updating={editingUpdate}
          saveFlash={flashDate === editorSession.date}
          warning={warning}
          onSave={handleSave}
          onFinish={finishWorkout}
          onBack={canGoBack ? () => clearDraft(editorSession.date) : null}
          onCancelUpdate={editingUpdate ? () => clearDraft(editorSession.date) : null}
          onChangeWorkout={editingUpdate ? null : () => openChangePicker(editorSession.date)}
          onSetsChange={updateExerciseSets}
          onToggleAb={toggleAb}
          onSwapLift={openLiftSwap}
          onSwapAb={openAbSwap}
          lastWeightFor={getLastWeightForExercise}
          lastWeekWeightFor={lastWeekWeightFor}
        />
      )}

      {!isViewingToday && !editorSession && selectedEntries.length > 0 && (
        <LoggedWorkoutReview entries={selectedEntries} onUpdate={startUpdate} />
      )}

      {!isViewingToday && !editorSession && selectedEntries.length === 0 && (
        previewWorkout ? (
          <>
            <WorkoutPreview
              workout={previewWorkout}
              completed={previewCompleted}
              onDoToday={handleDoToday}
              onLogDay={pastDay ? (workout) => startLog(selectedDate, workout) : null}
            />
            {!previewCompleted && (
              <button
                type="button"
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
            <WorkoutPicker
              workouts={dayNavWorkouts}
              onSelect={pastDay ? (workout) => startLog(selectedDate, workout) : handleDoToday}
              label={pastDay ? 'LOG A WORKOUT FOR THIS DAY' : 'START A WORKOUT'}
            />
          </div>
        )
      )}

      {isViewingToday && !editorSession && !isTodayWorkoutDay && (
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

      {isViewingToday && !editorSession && isTodayWorkoutDay && alreadyDone && (
        <div>
          <div className="text-center py-8">
            <p className="text-[10px] font-mono font-bold tracking-[0.5em] text-primary mb-2">COMPLETE</p>
            <p className="text-xs font-mono text-muted mb-0.5">
              {todayEntries.reduce((sum, entry) => sum + (entry.exercises?.reduce((sets, exercise) => sets + exercise.sets.length, 0) ?? 0), 0)} SETS LOGGED
            </p>
            <p className="text-xs font-mono" style={{ color: '#333' }}>EAT. SLEEP. RECOVER.</p>
          </div>
          <div className="mb-6">
            <LoggedWorkoutReview entries={todayEntries} onUpdate={startUpdate} />
          </div>
          <WorkoutPicker workouts={dayNavWorkouts} onSelect={handleDoToday} label="DO ANOTHER WORKOUT" />
        </div>
      )}

      {showChangePicker && pickerPhase && (
        <WorkoutChangePicker
          phaseId={pickerPhase.id}
          phaseName={pickerPhase.name}
          currentWorkoutId={(changePickerDate && normalizeDrafts(drafts)[changePickerDate]?.workoutId) || previewWorkout?.id}
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
          updated={completedAsUpdate}
          dateLabel={completedDateLabel}
          onClose={() => setShowComplete(false)}
        />
      )}
    </PageWrapper>
  )
}

function templateMatchesSession(template, session) {
  const templateSlots = (template.sections || []).flatMap(section => (
    (section.exercises || []).map(exercise => `${section.id}:${exercise.programId || exercise.id}`)
  ))
  const sessionSlots = (session.sections || []).flatMap(section => (
    (section.exercises || []).map(exercise => `${section.sectionId}:${exercise.programId || exercise.id}`)
  ))
  return templateSlots.join('|') === sessionSlots.join('|')
}

function WorkoutChangePicker({ phaseId, phaseName, currentWorkoutId, onSelect, onClose }) {
  const { mandatory, optional } = getWorkoutSlots(phaseId)
  const all = [...mandatory, ...(optional ? [optional] : [])]

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col justify-end"
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
          <button type="button" onClick={onClose} className="text-muted text-xs font-mono">✕</button>
        </div>
        <div className="space-y-2">
          {all.map(w => (
            <button
              key={w.id}
              type="button"
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
            type="button"
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

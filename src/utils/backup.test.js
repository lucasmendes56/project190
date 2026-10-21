import test from 'node:test'
import assert from 'node:assert/strict'
import {
  EMPTY_BACKUP_MESSAGE,
  LAST_BACKUP_STORAGE_KEY,
  NOT_A_BACKUP_MESSAGE,
  REMINDER_NEVER,
  REMINDER_STALE,
  RESTORE_FAILED_MESSAGE,
  UNREADABLE_MESSAGE,
  applyBackup,
  backupFilename,
  backupReminder,
  chooseShareFile,
  createBackupPayload,
  formatBackupDate,
  serializeBackup,
  validateBackup,
} from './backup.js'

class MemoryStorage {
  constructor(initial = {}) {
    this.map = new Map(Object.entries(initial))
  }

  get length() {
    return this.map.size
  }

  key(index) {
    return [...this.map.keys()][index] ?? null
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null
  }

  setItem(key, value) {
    this.map.set(String(key), String(value))
  }

  removeItem(key) {
    this.map.delete(key)
  }
}

function sampleData() {
  const settings = {
    programStartDate: '2026-01-05',
    startWeight: 175,
    targetWeight: 190,
    name: 'Alex "O\'Brien" 🏋️',
    weekPattern: ['A', 'B', 'rest', 'A', 'B', 'rest', 'rest'],
  }
  const log = [
    {
      id: '2026-01-05_A_1736078400000',
      completedAt: '2026-01-05T15:04:00.000Z',
      date: '2026-01-05',
      workoutId: 'A',
      workoutName: 'Upper A',
      exercises: [
        {
          id: 'squat',
          sets: [
            { weight: 135.5, reps: 8, completed: true },
            { weight: 0, reps: 12, completed: false, note: 'line\n"quote"\\slash' },
          ],
        },
      ],
      abCompleted: false,
      weekNum: 1,
      phase: 'foundation',
    },
  ]
  const bodyweight = [
    { date: '2026-01-05', weight: 176.5 },
    { date: '2026-01-12', weight: 177 },
  ]
  const schedule = {
    _v: 2,
    '2026-01-05': 'A',
    '2026-01-06': 'B',
    '2026-01-07': null,
  }
  return { settings, log, bodyweight, schedule }
}

function storageFromSample(extra = {}) {
  const { settings, log, bodyweight, schedule } = sampleData()
  return new MemoryStorage({
    wt_settings: JSON.stringify(settings),
    wt_log: JSON.stringify(log),
    wt_bodyweight: JSON.stringify(bodyweight),
    wt_schedule: JSON.stringify(schedule),
    ...extra,
  })
}

test('backup filename uses the local calendar date', () => {
  assert.equal(backupFilename(new Date(2026, 9, 21, 23, 30)), 'project190-backup-2026-10-21.json')
  assert.equal(backupFilename(new Date(2026, 0, 5)), 'project190-backup-2026-01-05.json')
})

test('backup then restore round-trips stored data exactly', () => {
  const exportedAt = '2026-10-21T18:30:00.000Z'
  const storage = storageFromSample({
    [LAST_BACKUP_STORAGE_KEY]: JSON.stringify('2020-01-01T00:00:00.000Z'),
    unrelated: 'leave-me',
    wt_custom: JSON.stringify({ kept: true, n: 1 }),
  })
  const original = {
    wt_settings: storage.getItem('wt_settings'),
    wt_log: storage.getItem('wt_log'),
    wt_bodyweight: storage.getItem('wt_bodyweight'),
    wt_schedule: storage.getItem('wt_schedule'),
    wt_custom: storage.getItem('wt_custom'),
  }

  const payload = createBackupPayload(storage, exportedAt)
  assert.equal(payload.app, 'project190')
  assert.equal(payload.version, 1)
  assert.equal(payload.exportedAt, exportedAt)
  assert.equal(Object.hasOwn(payload.data, LAST_BACKUP_STORAGE_KEY), false)
  assert.equal(Object.hasOwn(payload.data, 'unrelated'), false)
  assert.deepEqual(payload.data.wt_custom, { kept: true, n: 1 })

  const fileText = serializeBackup(payload)
  const parsed = JSON.parse(fileText)
  const result = validateBackup(parsed)
  assert.equal(result.ok, true)

  storage.setItem('wt_log', JSON.stringify([]))
  storage.setItem('wt_settings', JSON.stringify({ name: 'changed' }))
  storage.setItem('wt_extra', JSON.stringify({ nope: true }))
  storage.removeItem('wt_bodyweight')
  storage.setItem('unrelated', 'still-here')

  applyBackup(storage, result.data, result.exportedAt)

  assert.equal(storage.getItem('wt_settings'), original.wt_settings)
  assert.equal(storage.getItem('wt_log'), original.wt_log)
  assert.equal(storage.getItem('wt_bodyweight'), original.wt_bodyweight)
  assert.equal(storage.getItem('wt_schedule'), original.wt_schedule)
  assert.equal(storage.getItem('wt_custom'), original.wt_custom)
  assert.equal(storage.getItem('wt_extra'), null)
  assert.equal(storage.getItem('unrelated'), 'still-here')
  assert.equal(storage.getItem(LAST_BACKUP_STORAGE_KEY), JSON.stringify(exportedAt))

  const again = createBackupPayload(storage, exportedAt)
  assert.deepEqual(again.data, payload.data)
  assert.equal(JSON.stringify(again.data), JSON.stringify(payload.data))
})

test('restore removes app keys that were not in the backup', () => {
  const storage = storageFromSample()
  const payload = createBackupPayload(storage, '2026-10-21T00:00:00.000Z')
  storage.removeItem('wt_log')
  const file = JSON.parse(serializeBackup(payload))
  delete file.data.wt_log
  storage.setItem('wt_log', JSON.stringify([{ id: 'newer' }]))

  const result = validateBackup(file)
  assert.equal(result.ok, true)
  applyBackup(storage, result.data, result.exportedAt)
  assert.equal(storage.getItem('wt_log'), null)
  assert.equal(storage.getItem('wt_settings'), JSON.stringify(sampleData().settings))
})

test('refuses to export when saved data cannot be read', () => {
  const storage = new MemoryStorage({
    wt_settings: JSON.stringify({ programStartDate: '2026-01-05' }),
    wt_log: '{not json',
  })
  assert.throws(() => createBackupPayload(storage, '2026-10-21T00:00:00.000Z'), { message: UNREADABLE_MESSAGE })
})

test('refuses to export when there is no app data', () => {
  const storage = new MemoryStorage({
    [LAST_BACKUP_STORAGE_KEY]: JSON.stringify('2026-10-21T00:00:00.000Z'),
    other: 'nope',
  })
  assert.throws(() => createBackupPayload(storage, '2026-10-21T00:00:00.000Z'), { message: EMPTY_BACKUP_MESSAGE })
})

test('rejects files that are not backups and does not require storage', () => {
  assert.equal(validateBackup(null).message, NOT_A_BACKUP_MESSAGE)
  assert.equal(validateBackup([]).message, NOT_A_BACKUP_MESSAGE)
  assert.equal(validateBackup({ app: 'other', version: 1, data: {} }).message, NOT_A_BACKUP_MESSAGE)
  assert.equal(validateBackup({ hello: 'world' }).ok, false)

  const damaged = validateBackup({
    app: 'project190',
    version: 1,
    exportedAt: '2026-10-21T00:00:00.000Z',
    data: { wt_log: { not: 'an array' }, wt_settings: { programStartDate: '2026-01-05' } },
  })
  assert.equal(damaged.ok, false)

  const storage = new MemoryStorage({ wt_log: JSON.stringify([{ id: 'keep' }]) })
  assert.throws(() => applyBackup(storage, damaged.data ?? { wt_log: { not: 'an array' } }, '2026-10-21T00:00:00.000Z'))
  assert.equal(storage.getItem('wt_log'), JSON.stringify([{ id: 'keep' }]))
})

test('failed restore rolls current data back', () => {
  const storage = storageFromSample()
  const originalSettings = storage.getItem('wt_settings')
  const originalLog = storage.getItem('wt_log')
  const payload = createBackupPayload(storage, '2026-10-01T00:00:00.000Z')
  payload.data.wt_bodyweight = [{ date: '2026-02-01', weight: 180 }]
  payload.data.wt_settings = { ...payload.data.wt_settings, name: 'Replaced' }

  const originalSetItem = storage.setItem.bind(storage)
  let refusedSchedule = false
  storage.setItem = (key, value) => {
    if (key === 'wt_schedule' && !refusedSchedule) {
      refusedSchedule = true
      throw new Error('quota')
    }
    originalSetItem(key, value)
  }

  assert.throws(() => applyBackup(storage, payload.data, payload.exportedAt), { message: RESTORE_FAILED_MESSAGE })
  assert.equal(storage.getItem('wt_settings'), originalSettings)
  assert.equal(storage.getItem('wt_log'), originalLog)
  assert.equal(storage.getItem('wt_bodyweight'), JSON.stringify(sampleData().bodyweight))
})

test('reminder appears only after more than 7 days, and when there is no backup', () => {
  const now = new Date('2026-10-21T12:00:00.000Z')
  const day = 24 * 60 * 60 * 1000
  assert.equal(backupReminder(null, now), REMINDER_NEVER)
  assert.equal(backupReminder(new Date(now.getTime() - 7 * day).toISOString(), now), null)
  assert.equal(backupReminder(new Date(now.getTime() - 7 * day + 1000).toISOString(), now), null)
  assert.equal(backupReminder(new Date(now.getTime() - 7 * day - 1).toISOString(), now), REMINDER_STALE)
  assert.equal(backupReminder('not-a-date', now), REMINDER_NEVER)
})

test('formats the backup date for display', () => {
  const local = new Date(2026, 9, 21, 15, 30, 0)
  assert.equal(
    formatBackupDate(local.toISOString()),
    local.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  )
  assert.equal(formatBackupDate('nope'), null)
})

test('share prefers a json file and falls back to plain text', () => {
  const json = { type: 'application/json' }
  const plain = { type: 'text/plain' }
  assert.equal(chooseShareFile([json, plain], ({ files }) => files[0].type === 'application/json'), json)
  assert.equal(chooseShareFile([json, plain], ({ files }) => files[0].type === 'text/plain'), plain)
  assert.equal(chooseShareFile([json], () => false), null)
  assert.equal(chooseShareFile([json], null), null)
  assert.equal(chooseShareFile([json, plain], () => { throw new Error('nope') }), null)
})

// Snapshot of this app's localStorage. Workout records are copied as-is and written
// back with JSON.stringify, the same format useLocalStorage already uses.
// Nothing here reshapes wt_log, wt_bodyweight, wt_schedule, or wt_settings.

export const BACKUP_APP_ID = 'project190'
export const BACKUP_VERSION = 1
export const LAST_BACKUP_STORAGE_KEY = 'wt_last_backup'
export const BACKUP_REMINDER_AFTER_MS = 7 * 24 * 60 * 60 * 1000

export const EMPTY_BACKUP_MESSAGE = 'There is nothing to back up yet.'
export const UNREADABLE_MESSAGE = "Couldn't read your saved data, so nothing was exported."
export const NOT_A_BACKUP_MESSAGE = "That file doesn't look like a Project 190 backup."
export const UNSUPPORTED_BACKUP_MESSAGE = "This backup can't be opened by this version of the app."
export const DAMAGED_MESSAGE = 'This backup file looks damaged. Nothing was changed.'
export const EMPTY_FILE_MESSAGE = "This backup doesn't contain any saved data."
export const RESTORE_FAILED_MESSAGE = "Couldn't restore that backup. Your current data was left as it is."
export const REMINDER_NEVER = "You haven't backed up yet. A saved file keeps your history safe if this phone is lost."
export const REMINDER_STALE = "It's been more than 7 days since your last backup."

const APP_DATA_KEY = /^wt_[A-Za-z0-9_]+$/

const KNOWN_SHAPES = {
  wt_settings: isPlainObject,
  wt_log: Array.isArray,
  wt_bodyweight: Array.isArray,
  wt_schedule: isPlainObject,
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function isAppDataKey(key) {
  return typeof key === 'string' && key !== LAST_BACKUP_STORAGE_KEY && APP_DATA_KEY.test(key)
}

function listAppDataKeys(storage) {
  const keys = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (isAppDataKey(key)) keys.push(key)
  }
  keys.sort()
  return keys
}

export function backupFilename(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `project190-backup-${y}-${m}-${d}.json`
}

export function formatBackupDate(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function backupReminder(iso, now = new Date()) {
  if (!iso) return REMINDER_NEVER
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return REMINDER_NEVER
  if (now.getTime() - then.getTime() > BACKUP_REMINDER_AFTER_MS) return REMINDER_STALE
  return null
}

export function readLastBackup(storage = localStorage) {
  const raw = storage.getItem(LAST_BACKUP_STORAGE_KEY)
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    if (typeof value !== 'string' || Number.isNaN(new Date(value).getTime())) return null
    return value
  } catch {
    return null
  }
}

export function writeLastBackup(storage, iso) {
  storage.setItem(LAST_BACKUP_STORAGE_KEY, JSON.stringify(iso))
}

export function createBackupPayload(storage = localStorage, exportedAt = new Date().toISOString()) {
  const keys = listAppDataKeys(storage)
  if (keys.length === 0) {
    throw new Error(EMPTY_BACKUP_MESSAGE)
  }

  const data = {}
  for (const key of keys) {
    const raw = storage.getItem(key)
    try {
      data[key] = JSON.parse(raw)
    } catch {
      throw new Error(UNREADABLE_MESSAGE)
    }
  }

  const payload = {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt,
    data,
  }
  const check = validateBackup(payload)
  if (!check.ok) throw new Error(UNREADABLE_MESSAGE)
  return payload
}

export function serializeBackup(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`
}

export function validateBackup(payload) {
  if (!isPlainObject(payload) || payload.app !== BACKUP_APP_ID || !isPlainObject(payload.data)) {
    return { ok: false, message: NOT_A_BACKUP_MESSAGE }
  }
  if (payload.version !== BACKUP_VERSION) {
    return { ok: false, message: UNSUPPORTED_BACKUP_MESSAGE }
  }
  if (typeof payload.exportedAt !== 'string' || Number.isNaN(new Date(payload.exportedAt).getTime())) {
    return { ok: false, message: DAMAGED_MESSAGE }
  }

  const keys = Object.keys(payload.data)
  if (keys.length === 0) {
    return { ok: false, message: EMPTY_FILE_MESSAGE }
  }

  let hasKnown = false
  for (const key of keys) {
    if (!isAppDataKey(key)) {
      return { ok: false, message: NOT_A_BACKUP_MESSAGE }
    }
    const value = payload.data[key]
    const shape = KNOWN_SHAPES[key]
    if (shape) {
      hasKnown = true
      if (!shape(value)) return { ok: false, message: DAMAGED_MESSAGE }
    }
  }

  if (!hasKnown) return { ok: false, message: EMPTY_FILE_MESSAGE }

  return { ok: true, data: payload.data, exportedAt: payload.exportedAt }
}

function snapshotWtKeys(storage) {
  const entries = new Map()
  const keys = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (typeof key === 'string' && key.startsWith('wt_')) keys.push(key)
  }
  for (const key of keys) entries.set(key, storage.getItem(key))
  return entries
}

function putBack(storage, key, value) {
  if (value == null) storage.removeItem(key)
  else storage.setItem(key, value)
}

export function applyBackup(storage, data, exportedAt) {
  const check = validateBackup({
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt,
    data,
  })
  if (!check.ok) throw new Error(check.message)

  const previous = snapshotWtKeys(storage)
  const written = []
  const removed = []
  try {
    const nextKeys = new Set(Object.keys(data))
    for (const [key, value] of Object.entries(data)) {
      storage.setItem(key, JSON.stringify(value))
      written.push(key)
    }
    for (const key of previous.keys()) {
      if (key !== LAST_BACKUP_STORAGE_KEY && !nextKeys.has(key)) {
        removed.push([key, previous.get(key)])
        storage.removeItem(key)
      }
    }
    storage.setItem(LAST_BACKUP_STORAGE_KEY, JSON.stringify(exportedAt))
  } catch {
    try {
      for (const key of written) putBack(storage, key, previous.get(key))
      for (const [key, value] of removed) putBack(storage, key, value)
    } catch {
      // The browser refused a write while rolling back. Surface the original failure.
    }
    throw new Error(RESTORE_FAILED_MESSAGE)
  }
}

// Prefer a real JSON file. iPhone Safari often refuses to share application/json
// but will share text/plain and still keep the .json file name in Save to Files.
export function chooseShareFile(candidates, canShare) {
  if (typeof canShare !== 'function') return null
  for (const file of candidates) {
    try {
      if (canShare({ files: [file] })) return file
    } catch {
      // This type isn't shareable here. Try the next one.
    }
  }
  return null
}

function downloadTextFile(body, filename) {
  if (typeof document === 'undefined') {
    throw new Error("Couldn't save the backup file.")
  }
  const blob = new Blob([body], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2500)
}

export async function saveBackupFile(payload, filename) {
  const body = serializeBackup(payload)
  let file = null
  try {
    const candidates = [
      new File([body], filename, { type: 'application/json' }),
      new File([body], filename, { type: 'text/plain' }),
    ]
    const canShare = typeof navigator !== 'undefined' && typeof navigator.canShare === 'function'
      ? data => navigator.canShare(data)
      : null
    file = chooseShareFile(candidates, canShare)
  } catch {
    file = null
  }

  if (file && typeof navigator.share === 'function') {
    try {
      await navigator.share({ files: [file], title: 'Project 190 backup' })
      return 'shared'
    } catch (err) {
      if (err && err.name === 'AbortError') throw err
    }
  }

  downloadTextFile(body, filename)
  return 'downloaded'
}

import { useRef, useState } from 'react'
import {
  applyBackup,
  backupFilename,
  backupReminder,
  createBackupPayload,
  formatBackupDate,
  readLastBackup,
  saveBackupFile,
  validateBackup,
  writeLastBackup,
} from '../../utils/backup'

function readFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('read'))
    reader.readAsText(file)
  })
}

export default function BackupSection() {
  const fileInputRef = useRef(null)
  const [lastBackup, setLastBackup] = useState(() => readLastBackup())
  const [pending, setPending] = useState(null)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const reminder = backupReminder(lastBackup)
  const lastBackupLabel = lastBackup ? formatBackupDate(lastBackup) : 'Never'

  async function handleBackup() {
    setError(null)
    setStatus(null)
    setPending(null)
    setBusy(true)

    let payload
    try {
      payload = createBackupPayload()
    } catch (err) {
      setError(err.message || "Couldn't make a backup.")
      setBusy(false)
      return
    }

    const filename = backupFilename()
    try {
      const method = await saveBackupFile(payload, filename)
      try {
        writeLastBackup(localStorage, payload.exportedAt)
        setLastBackup(payload.exportedAt)
      } catch {
        // The file was still handed off. Remembering the date is secondary.
      }
      setStatus(method === 'shared' ? `Saved ${filename}` : `Downloaded ${filename}`)
    } catch (err) {
      if (!err || err.name !== 'AbortError') {
        setError("Couldn't save the backup file. Nothing was changed.")
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleFileChosen(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setError(null)
    setStatus(null)
    setPending(null)

    let text
    try {
      text = await readFileText(file)
    } catch {
      setError("Couldn't read that file. Nothing was changed.")
      return
    }

    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      setError("That file doesn't look like a Project 190 backup.")
      return
    }

    const result = validateBackup(parsed)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setPending(result)
  }

  function handleConfirmRestore() {
    if (!pending) return
    try {
      applyBackup(localStorage, pending.data, pending.exportedAt)
    } catch (err) {
      setError(err.message || "Couldn't restore that backup. Your current data was left as it is.")
      setPending(null)
      return
    }
    window.location.reload()
  }

  return (
    <div className="mt-4 border p-4" style={{ borderColor: '#1a1a1a', background: '#0d0d0d' }}>
      <p className="text-[10px] font-mono font-bold tracking-[0.4em] uppercase text-muted mb-1">Backup</p>
      <p className="text-xs font-mono text-muted mb-4">
        Saves your workouts, body weight, and settings into one dated file. On iPhone, choose Save to Files so a copy stays in iCloud.
      </p>

      <p className="text-xs font-mono text-white">Last backup: {lastBackupLabel}</p>
      {reminder && (
        <p className="text-xs font-mono mt-2" style={{ color: '#9e9e9e' }}>{reminder}</p>
      )}

      {error && (
        <p className="text-xs font-mono mt-3" style={{ color: '#DC2626' }} role="alert">{error}</p>
      )}
      {status && (
        <p className="text-xs font-mono mt-3" style={{ color: '#9e9e9e' }} role="status">{status}</p>
      )}

      {pending ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-mono text-white text-center">This will replace your current data</p>
          <p className="text-[10px] font-mono text-muted text-center mb-3">
            Backup from {formatBackupDate(pending.exportedAt)}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="flex-1 border text-muted text-xs font-mono font-bold py-3 tracking-widest"
              style={{ borderColor: '#1a1a1a' }}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleConfirmRestore}
              className="flex-1 border text-xs font-mono font-bold py-3 tracking-widest"
              style={{ borderColor: '#DC2626', color: '#DC2626', background: '#1a0000' }}
            >
              RESTORE
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleBackup}
            disabled={busy}
            className="w-full border border-primary text-primary font-mono font-bold text-sm py-3 tracking-widest uppercase active:opacity-70 transition-opacity disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Back up my data'}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="w-full border text-xs font-mono font-bold py-3 tracking-widest uppercase active:opacity-70 disabled:opacity-50"
            style={{ borderColor: '#1a1a1a', color: '#d0d0d0' }}
          >
            Restore from backup
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json,text/plain,text/json"
        className="sr-only"
        tabIndex={-1}
        onChange={handleFileChosen}
      />
    </div>
  )
}

// Format: YYYY-MM-DD
export function toDateStr(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().split('T')[0]
}

export function fromDateStr(str) {
  // Parse YYYY-MM-DD without timezone shift
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today() {
  return toDateStr(new Date())
}

export function dayOfWeek(dateStr) {
  return fromDateStr(dateStr).getDay() // 0=Sun…6=Sat
}

// How many full days between two date strings (b - a)
export function daysBetween(aStr, bStr) {
  const a = fromDateStr(aStr)
  const b = fromDateStr(bStr)
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

// Week number in the 12-week program (1-indexed). Returns null if before start.
export function programWeek(startDateStr, checkDateStr) {
  const diff = daysBetween(startDateStr, checkDateStr)
  if (diff < 0) return null
  return Math.floor(diff / 7) + 1
}

export function addDays(dateStr, n) {
  const d = fromDateStr(dateStr)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export function subtractDays(dateStr, n) {
  return addDays(dateStr, -n)
}

export function formatDate(dateStr, opts = {}) {
  const d = fromDateStr(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...opts })
}

export function formatDayName(dateStr) {
  const d = fromDateStr(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

// Returns array of YYYY-MM-DD strings for a full 12-week program starting from startDate
export function programDates(startDateStr) {
  return Array.from({ length: 84 }, (_, i) => addDays(startDateStr, i))
}

// Get start of the week (Monday) containing dateStr
export function weekStart(dateStr) {
  const d = fromDateStr(dateStr)
  const day = d.getDay()
  // Convert Sunday(0) to 7 so Monday is first
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toDateStr(d)
}

export function isToday(dateStr) {
  return dateStr === today()
}

export function isPast(dateStr) {
  return dateStr < today()
}

export function isFuture(dateStr) {
  return dateStr > today()
}

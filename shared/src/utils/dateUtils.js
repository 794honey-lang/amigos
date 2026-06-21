/**
 * Shared Date Utility — converts UTC ISO 8601 strings to IST display strings.
 * Always use these helpers in UI. Never store formatted strings in DB.
 *
 * WHY UTC in DB?
 *  - Correct sorting across timezones
 *  - Easy time-math (e.g. "placed 23 mins ago")
 *  - Future-proof for multi-region expansion
 */

const IST_LOCALE = 'en-IN';
const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a UTC ISO string as IST time only.
 * e.g. "2026-06-21T20:04:56Z" → "1:34 AM"
 */
export function formatTimeIST(dateStr) {
  const d = new Date(dateStr);
  if (!dateStr || isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(IST_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  });
}

/**
 * Format a UTC ISO string as a full IST date + time.
 * e.g. "2026-06-21T20:04:56Z" → "22 Jun, 1:34 AM"
 * Shows "Today" if the IST date is today.
 */
export function formatDateTimeIST(dateStr) {
  const d = new Date(dateStr);
  if (!dateStr || isNaN(d.getTime())) return '—';

  const now = new Date();

  // Compare dates in IST
  const istDateStr = d.toLocaleDateString(IST_LOCALE, { timeZone: IST_TIMEZONE });
  const todayISTStr = now.toLocaleDateString(IST_LOCALE, { timeZone: IST_TIMEZONE });
  const isToday = istDateStr === todayISTStr;

  const timeStr = d.toLocaleTimeString(IST_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
  });

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const dateLabel = d.toLocaleDateString(IST_LOCALE, {
    day: 'numeric',
    month: 'short',
    timeZone: IST_TIMEZONE,
  });
  return `${dateLabel}, ${timeStr}`;
}

/**
 * Format as full verbose IST timestamp for order detail views.
 * e.g. "Sun, 22 Jun 2026 · 1:34 AM IST"
 */
export function formatFullIST(dateStr) {
  const d = new Date(dateStr);
  if (!dateStr || isNaN(d.getTime())) return '—';
  return d.toLocaleString(IST_LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: IST_TIMEZONE,
    timeZoneName: 'short',
  });
}

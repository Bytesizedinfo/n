// Local-date helpers. Dates are 'YYYY-MM-DD' strings in the device's time zone.

export function toStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayStr(now = new Date()) {
  return toStr(now);
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(str, n) {
  const d = parseDate(str);
  d.setDate(d.getDate() + n);
  return toStr(d);
}

export function daysBetween(a, b) {
  const ms = parseDate(b) - parseDate(a);
  return Math.round(ms / 86400000);
}

// 0 = Monday … 6 = Sunday
export function weekdayMon0(str) {
  return (parseDate(str).getDay() + 6) % 7;
}

export function formatDate(str, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return parseDate(str).toLocaleDateString('en-SG', opts);
}

export function isMorning(now = new Date()) {
  return now.getHours() < 15;
}

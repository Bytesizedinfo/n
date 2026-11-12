// Calendar reminders (.ics) for the routine. Times are "floating" local times, so they follow
// whatever time zone the phone's calendar is in.

import { DAY_NAMES } from './scheduler.js';

const BYDAY = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

function esc(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function fold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  out.push(rest);
  return out.join('\r\n');
}

function stamp(d = new Date()) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function local(dateStr, time) {
  return dateStr.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';
}

function uid(tag) {
  return `${tag}-${Math.random().toString(36).slice(2, 10)}@skin-ritual`;
}

function event({ summary, description, dateStr, time, rrule, minutes = 10 }) {
  return [
    'BEGIN:VEVENT',
    `UID:${uid(summary.replace(/\W+/g, '-').toLowerCase())}`,
    `DTSTAMP:${stamp()}`,
    `DTSTART:${local(dateStr, time)}`,
    `DURATION:PT${minutes}M`,
    `RRULE:${rrule}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(description)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(summary)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
  ];
}

function plusMinutes(dateStr, time, minutes) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const t = new Date(y, m - 1, d, hh, mm + minutes);
  const p = (n) => String(n).padStart(2, '0');
  return `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}T${p(t.getHours())}${p(t.getMinutes())}00`;
}

// "Add to Google Calendar" links: a repeating morning and night reminder, plus weekly extras.
export function googleCalendarLinks(routine, { amTime = '07:30', pmTime = '22:00', startDate, appUrl = '', timeZone } = {}) {
  const start = startDate || routine.startDate;
  let tz = timeZone;
  if (!tz) { try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { tz = 'Asia/Singapore'; } }
  const tail = appUrl ? `\n\nToday's exact steps: ${appUrl}` : '\n\nOpen Skin Ritual for today’s exact steps.';
  const list = (slot) => routine.steps.filter((s) => s.slot === slot).sort((a, b) => a.order - b.order).map((s, i) => `${i + 1}. ${s.title}`).join('\n');
  const link = (text, details, time, rrule, minutes) => 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text, details: details + tail, dates: `${plusMinutes(start, time, 0)}/${plusMinutes(start, time, minutes)}`, ctz: tz, recur: 'RRULE:' + rrule,
  }).toString();
  const out = [
    { label: 'Morning routine', when: `Every day at ${amTime}`, url: link('Skin Ritual: morning routine', list('am'), amTime, 'FREQ=DAILY', 10) },
    { label: 'Night routine', when: `Every day at ${pmTime}`, url: link('Skin Ritual: night routine', list('pm'), pmTime, 'FREQ=DAILY', 10) },
  ];
  for (const s of routine.steps.filter((x) => x.slot === 'weekly' && x.days && x.days.length)) {
    out.push({ label: s.title, when: s.days.map((d) => DAY_NAMES[d]).join(', '), url: link(`Skin Ritual: ${s.title}`, (s.why || []).join(' '), pmTime, `FREQ=WEEKLY;BYDAY=${s.days.map((d) => BYDAY[d]).join(',')}`, 15) });
  }
  return out;
}

export function buildIcs(routine, { amTime = '07:30', pmTime = '22:00', startDate, appUrl = '' } = {}) {
  const start = startDate || routine.startDate;
  const am = routine.steps.filter((s) => s.slot === 'am').sort((a, b) => a.order - b.order);
  const pm = routine.steps.filter((s) => s.slot === 'pm').sort((a, b) => a.order - b.order);
  const listSteps = (steps) => steps.map((s, i) => `${i + 1}. ${s.title}${s.base ? '' : ` (${s.days.length === 7 ? 'daily' : s.days.map((d) => DAY_NAMES[d]).join('/')})`}`).join('\n');
  const tail = `\n\nOpen Skin Ritual for today's exact steps${appUrl ? ': ' + appUrl : '.'}`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Skin Ritual//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Skin Ritual'];
  lines.push(...event({ summary: 'Skin Ritual: morning routine', description: listSteps(am) + tail, dateStr: start, time: amTime, rrule: 'FREQ=DAILY' }));
  lines.push(...event({ summary: 'Skin Ritual: night routine', description: listSteps(pm) + tail, dateStr: start, time: pmTime, rrule: 'FREQ=DAILY' }));
  for (const s of routine.steps.filter((x) => x.slot === 'weekly' && x.days && x.days.length)) {
    lines.push(...event({
      summary: `Skin Ritual: ${s.title}`,
      description: (s.why || []).join(' ') + tail,
      dateStr: start,
      time: pmTime,
      rrule: `FREQ=WEEKLY;BYDAY=${s.days.map((d) => BYDAY[d]).join(',')}`,
      minutes: 15,
    }));
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

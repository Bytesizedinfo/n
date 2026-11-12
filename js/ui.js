// Small UI toolkit: safe HTML templates, icons, sheets, toasts.

class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }

export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function out(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(out).join('');
  return esc(String(v));
}

// html`<p>${userText}</p>` escapes values; nest html`` results or raw() to insert markup.
export function html(strings, ...values) {
  let s = '';
  strings.forEach((str, i) => { s += str; if (i < values.length) s += out(values[i]); });
  return new Raw(s);
}
export const raw = (s) => new Raw(s);

const P = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9.5"/><path d="m8 12.5 2.7 2.7L16.5 9.5"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-6.6 0-3.1-2-5.4-3.6-7.2-.4 1.7-1.4 2.9-2.6 3.4.3-3.1-1-6-3.8-8.6.1 3.3-1.6 5.4-3.2 7.1C4.4 11.6 5 13.4 5 15.4 5 19.3 8 22 12 22z"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/>',
  shelf: '<path d="M12 2.5 2.5 7.2 12 12l9.5-4.8z"/><path d="m2.5 16.8 9.5 4.7 9.5-4.7"/><path d="m2.5 12 9.5 4.8 9.5-4.8"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2.5H20v19H6.5A2.5 2.5 0 0 1 4 19V5a2.5 2.5 0 0 1 2.5-2.5z"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1.5 14h5M9.5 8h5M17.5 16h5"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  camera: '<path d="M22 18.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3.5l2-3h5l2 3H20a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.5-4.5"/>',
  trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v6M9 11h6"/>',
  droplet: '<path d="M12 2.7 6.3 8.4a8 8 0 1 0 11.4 0z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6"/>',
  compare: '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 6.5V12l3.5 2"/>',
  bottle: '<path d="M9.5 2h5v3h-5z"/><path d="M8 5h8l1 4v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z"/><path d="M7 12h10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bed: '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M2 16h20M6 10V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3"/>',
  dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  heart: '<path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 0 1 12 6a5 5 0 0 1 7.5 6.6z"/>',
};

export function icon(name, cls = '') {
  return raw(`<svg class="${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`);
}

export const LOGO = raw(`<svg viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" rx="26" fill="var(--blush-soft)"/><path d="M48 18 30 38a24 24 0 1 0 36 0z" fill="var(--blush)"/><path d="M56 44c-9 1-15 8-15 16 0 3 1 5 2 7 2-6 6-10 13-12-6 4-9 8-10 13 7 1 14-4 15-13 1-5-1-9-5-11z" fill="var(--sage)"/></svg>`);

// ---------- toast ----------
let toastTimer = null;
export function toast(message) {
  const t = document.getElementById('toast');
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- sheet ----------
export function openSheet({ title, content = '', onClose } = {}) {
  const prevFocus = document.activeElement;
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  const sheet = document.createElement('div');
  sheet.className = 'sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', title || 'Details');
  sheet.innerHTML = String(html`<div class="grabber"></div><div class="sheet-head"><h2>${title}</h2><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div><div class="sheet-body"></div>`);
  const body = sheet.querySelector('.sheet-body');
  body.innerHTML = String(content);
  document.body.append(backdrop, sheet);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => { backdrop.classList.add('show'); sheet.classList.add('show'); });
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    backdrop.classList.remove('show');
    sheet.classList.remove('show');
    document.removeEventListener('keydown', onKey);
    setTimeout(() => { backdrop.remove(); sheet.remove(); }, 260);
    document.body.style.overflow = '';
    if (prevFocus && prevFocus.focus) prevFocus.focus();
    if (onClose) onClose();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', close);
  sheet.querySelector('[data-close]').addEventListener('click', close);
  setTimeout(() => sheet.querySelector('[data-close]').focus(), 50);
  return { body, close, sheet };
}

export function confirmDialog(message, { title = 'Are you sure?', ok = 'Yes', cancel = 'Cancel', danger = false } = {}) {
  return new Promise((resolve) => {
    let answered = false;
    const s = openSheet({
      title,
      content: html`<p>${message}</p><div class="row" style="margin-top:18px"><button class="btn grow" data-no>${cancel}</button><button class="btn grow ${danger ? 'danger' : 'primary'}" data-yes>${ok}</button></div>`,
      onClose: () => { if (!answered) resolve(false); },
    });
    s.body.querySelector('[data-yes]').addEventListener('click', () => { answered = true; resolve(true); s.close(); });
    s.body.querySelector('[data-no]').addEventListener('click', () => { answered = true; resolve(false); s.close(); });
  });
}

export function downloadFile(filename, data, type = 'text/plain') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function debounce(fn, ms = 400) {
  let t = null;
  const d = (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  d.flush = (...args) => { clearTimeout(t); fn(...args); };
  return d;
}

// ---------- products ----------
const TIER = { budget: 'Budget', mid: 'Mid-range', splurge: 'Splurge' };

export function productCard(p, { issues = [], owned = false, action = null } = {}) {
  const f = p.flags || {};
  const chips = [];
  if (f.ff === true) chips.push(html`<span class="chip sage">Fragrance-free</span>`);
  if (f.ff === false) chips.push(html`<span class="chip">Has fragrance</span>`);
  if (f.ff === null && !owned) chips.push(html`<span class="chip">Check label for fragrance</span>`);
  if (f.alcohol) chips.push(html`<span class="chip">Has alcohol</span>`);
  if (p.rx === 'pharmacist') chips.push(html`<span class="chip info">Pharmacy counter</span>`);
  if (f.vegan) chips.push(html`<span class="chip">Vegan</span>`);
  if (f.cf) chips.push(html`<span class="chip">Cruelty-free</span>`);
  const meta = owned ? '' : [p.size, (p.where || []).join(', ')].filter(Boolean).join(' · ');
  return html`<div class="prod">
    <div class="swatch">${icon('bottle')}</div>
    <div class="grow">
      ${p.brand ? html`<div class="brand">${p.brand}</div>` : ''}
      <div class="name">${p.name}</div>
      ${!owned && p.price ? html`<div class="meta"><span class="price">~S$${p.price}</span> · ${TIER[p.tier] || ''}${meta ? ' · ' + meta : ''}</div>` : ''}
      ${p.note ? html`<div class="meta">${p.note}</div>` : ''}
      ${chips.length ? html`<div class="chips" style="margin-top:6px">${chips}</div>` : ''}
      ${issues.map((i) => html`<div class="issue ${i.level}">${icon(i.level === 'info' ? 'info' : 'alert')}<span>${i.text}</span></div>`)}
    </div>
    ${action || ''}
  </div>`;
}

export function isTyping() {
  const a = document.activeElement;
  return a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && ['text', 'search', 'time'].includes(a.type)));
}

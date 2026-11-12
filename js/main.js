// Boot, routing and the tab bar.

import { initStore, subscribe } from './store/index.js';
import { app } from './app.js';
import { html, icon, isTyping } from './ui.js';
import * as welcome from './screens/welcome.js';
import * as quiz from './screens/quiz.js';
import * as today from './screens/today.js';
import * as routine from './screens/routine.js';
import * as shelf from './screens/shelf.js';
import * as journal from './screens/journal.js';
import * as more from './screens/more.js';
import * as compare from './screens/compare.js';

const ROUTES = { welcome, quiz, today, routine, shelf, journal, more, compare };
const NEEDS_ROUTINE = ['today', 'routine', 'journal', 'compare'];
const TABS = [
  ['today', 'Today', 'checkCircle'],
  ['routine', 'Routine', 'list'],
  ['shelf', 'Shelf', 'shelf'],
  ['journal', 'Journal', 'book'],
  ['more', 'More', 'sliders'],
];
const TITLES = { welcome: 'Skin Ritual', quiz: 'Quiz · Skin Ritual', today: 'Today · Skin Ritual', routine: 'Routine · Skin Ritual', shelf: 'My shelf · Skin Ritual', journal: 'Journal · Skin Ritual', more: 'More · Skin Ritual', compare: 'Compare · Skin Ritual' };

let current = null;
let lastRoute = null;

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  return { name: path || '', params: new URLSearchParams(qs || '') };
}

export function go(name, params) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const next = '#/' + name + qs;
  if (location.hash === next) render(); else location.hash = next;
}

export function applyTheme() {
  const t = app.settings().theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

function renderTabs(route) {
  const nav = document.getElementById('tabs');
  const show = !['welcome', 'quiz'].includes(route) && !!app.routine();
  nav.hidden = !show;
  document.getElementById('view').classList.toggle('no-tabs', !show);
  if (!show) return;
  const active = route === 'compare' ? 'more' : route;
  nav.innerHTML = String(html`<div class="tabs-inner">${TABS.map(([k, label, ic]) => html`<a class="tab" href="#/${k}" ${active === k ? html`aria-current="page"` : ''}>${icon(ic)}<span>${label}</span></a>`)}</div>`);
}

function render() {
  const { name, params } = parseHash();
  let route = ROUTES[name] ? name : null;
  const hasRoutine = !!app.routine();
  if (!route) route = hasRoutine ? 'today' : 'welcome';
  if (!hasRoutine && NEEDS_ROUTINE.includes(route)) route = 'welcome';
  if (current && typeof current.cleanup === 'function') current.cleanup();
  const view = document.getElementById('view');
  const keepScroll = route === lastRoute ? window.scrollY : 0;
  view.innerHTML = '';
  let cleanup;
  try {
    cleanup = ROUTES[route].render(view, { params, go, rerender: render });
  } catch (e) {
    console.error(e);
    view.innerHTML = String(html`<div class="card"><h2>Something went wrong</h2><p class="muted">${e.message}</p><button class="btn" onclick="location.hash='#/today';location.reload()">Reload</button></div>`);
  }
  current = { route, cleanup };
  renderTabs(route);
  document.title = TITLES[route] || 'Skin Ritual';
  window.scrollTo(0, keepScroll);
  if (route !== lastRoute) view.focus({ preventScroll: true });
  lastRoute = route;
}

window.addEventListener('hashchange', render);

subscribe((kind) => {
  if (kind === 'data') {
    applyTheme();
    if (!isTyping() && !document.querySelector('.sheet')) render();
  } else if ((kind === 'status' || kind === 'auth') && current && ['more', 'welcome'].includes(current.route)) {
    if (!isTyping()) render();
  }
});

applyTheme();
render();
initStore();

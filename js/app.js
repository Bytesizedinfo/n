// App state facade: everything screens need, on top of the store and the engine.

import * as store from './store/index.js';
import { buildRoutine, ROUTINE_VERSION } from './engine/routine.js';
import { buildFromShelf } from './engine/shelf.js';
import { buildProfile } from './engine/profile.js';
import { todayStr } from './engine/dates.js';

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const DEFAULT_SETTINGS = { theme: 'system', amTime: '07:30', pmTime: '22:00' };

export const app = {
  answers() { return store.getDoc('answers'); },
  draft() { return store.getDoc('draft'); },
  saveDraft(draft) { store.setDoc('draft', draft); },
  clearDraft() { store.setDoc('draft', null); },

  profile() { const a = this.answers(); return a ? buildProfile(a) : null; },

  routine() {
    const r = store.getDoc('routine');
    if (!r) return null;
    // Routines saved by an older version of the app are rebuilt, keeping the ramp-up start date.
    if (r.version !== ROUTINE_VERSION && this.answers()) {
      const fresh = r.source === 'shelf' ? buildFromShelf(this.shelf(), this.answers(), { startDate: r.startDate }) : buildRoutine(this.answers(), { startDate: r.startDate });
      store.setDoc('routine', fresh);
      return fresh;
    }
    return r;
  },

  settings() { return { ...DEFAULT_SETTINGS, ...(store.getDoc('settings') || {}) }; },
  saveSettings(patch) { store.setDoc('settings', { ...this.settings(), ...patch }); },

  finishQuiz(answers) {
    const routine = buildRoutine(answers, { startDate: todayStr() });
    store.setDoc('answers', answers);
    store.setDoc('routine', routine);
    store.addHistory({ id: uid(), date: new Date().toISOString(), source: 'quiz', answers, routine });
    this.clearDraft();
    return routine;
  },

  useShelfRoutine() {
    const answers = this.answers();
    const routine = buildFromShelf(this.shelf(), answers, { startDate: todayStr() });
    store.setDoc('routine', routine);
    store.addHistory({ id: uid(), date: new Date().toISOString(), source: 'shelf', answers, routine });
    return routine;
  },

  useQuizRoutine() {
    const answers = this.answers();
    const routine = buildRoutine(answers, { startDate: todayStr() });
    store.setDoc('routine', routine);
    store.addHistory({ id: uid(), date: new Date().toISOString(), source: 'quiz', answers, routine });
    return routine;
  },

  restoreRoutine(entry) {
    const routine = { ...entry.routine, startDate: todayStr() };
    store.setDoc('routine', routine);
    if (entry.answers) store.setDoc('answers', entry.answers);
  },

  // ----- shelf -----
  shelf() { return store.getDoc('shelf') || []; },
  addProduct(p) {
    const item = { ...p, id: p.id && !this.shelf().some((x) => x.id === p.id) ? p.id : uid(), addedAt: new Date().toISOString() };
    store.setDoc('shelf', this.shelf().concat(item));
    return item;
  },
  updateProduct(id, patch) { store.setDoc('shelf', this.shelf().map((p) => (p.id === id ? { ...p, ...patch } : p))); },
  removeProduct(id) { store.setDoc('shelf', this.shelf().filter((p) => p.id !== id)); },

  // ----- checklist & journal -----
  checklist(date) { return store.getDay('checklist', date) || { am: {}, pm: {} }; },
  allChecklist() { return store.days('checklist'); },
  toggleStep(date, slot, key) {
    const rec = this.checklist(date);
    const next = { am: { ...(rec.am || {}) }, pm: { ...(rec.pm || {}) } };
    if (next[slot][key]) delete next[slot][key]; else next[slot][key] = true;
    store.setDay('checklist', date, next);
    return next;
  },
  journal(date) { return store.getDay('journal', date); },
  allJournal() { return store.days('journal'); },
  saveJournal(date, entry) { store.setDay('journal', date, entry); },

  history() { return store.historyList(); },
  removeHistory(id) { store.removeHistory(id); },
};

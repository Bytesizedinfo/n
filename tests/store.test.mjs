import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSnapshots, emptySnapshot, stampAll } from '../js/store/merge.js';

const e = (value, updatedAt) => ({ value, updatedAt });

test('newer value wins per item; local wins are queued for upload', () => {
  const local = emptySnapshot();
  const cloud = emptySnapshot();
  local.docs.answers = e({ a: 1 }, '2026-11-10T10:00:00Z');
  cloud.docs.answers = e({ a: 2 }, '2026-11-11T10:00:00Z');
  local.docs.shelf = e(['x'], '2026-11-12T10:00:00Z');
  cloud.docs.routine = e({ id: 'r' }, '2026-11-01T00:00:00Z');
  local.days.checklist['2026-11-12'] = e({ am: { a: true } }, '2026-11-12T08:00:00Z');
  cloud.days.checklist['2026-11-12'] = e({ am: {} }, '2026-11-12T07:00:00Z');
  cloud.days.journal['2026-11-11'] = e({ ratings: {} }, '2026-11-11T22:00:00Z');
  local.history.h1 = e({ id: 'h1' }, '2026-11-09T00:00:00Z');

  const { merged, uploads } = mergeSnapshots(local, cloud);
  assert.deepEqual(merged.docs.answers.value, { a: 2 });
  assert.deepEqual(merged.docs.shelf.value, ['x']);
  assert.deepEqual(merged.docs.routine.value, { id: 'r' });
  assert.deepEqual(merged.days.checklist['2026-11-12'].value, { am: { a: true } });
  assert.ok(merged.days.journal['2026-11-11']);
  assert.ok(merged.history.h1);
  assert.deepEqual(uploads.docs.sort(), ['shelf']);
  assert.deepEqual(uploads.days, [['checklist', '2026-11-12']]);
  assert.deepEqual(uploads.history, ['h1']);
});

test('first sign-in on a new device with an empty cloud uploads everything', () => {
  const local = emptySnapshot();
  local.docs.answers = e({ a: 1 }, '2026-11-10T10:00:00Z');
  local.days.journal['2026-11-10'] = e({ note: 'hi' }, '2026-11-10T10:00:00Z');
  const { uploads } = mergeSnapshots(local, emptySnapshot());
  assert.deepEqual(uploads.docs, ['answers']);
  assert.deepEqual(uploads.days, [['journal', '2026-11-10']]);
});

test('imported backups are re-stamped so they win', () => {
  const backup = emptySnapshot();
  backup.docs.answers = e({ a: 'old backup' }, '2020-01-01T00:00:00Z');
  const current = emptySnapshot();
  current.docs.answers = e({ a: 'current' }, '2026-11-12T00:00:00Z');
  const { merged } = mergeSnapshots(stampAll(backup, '2026-11-13T00:00:00Z'), current);
  assert.equal(merged.docs.answers.value.a, 'old backup');
});

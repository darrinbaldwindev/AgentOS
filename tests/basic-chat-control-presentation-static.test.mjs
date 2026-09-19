import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const js = await readFile(new URL('../ui/basic-chat.js', import.meta.url), 'utf8');

test('Basic Chat derives control availability from canonical snapshot flags', () => {
  assert.match(js, /\[data-action="pause"\]/);
  assert.match(js, /\[data-action="resume"\]/);
  assert.match(js, /\[data-action="stop"\]/);
  assert.match(js, /controlsAvailable = Boolean\(state\.ready \|\| state\.paused \|\| state\.stopped \|\| sending\)/);
  assert.match(js, /pause\.disabled = !controlsAvailable \|\| Boolean\(state\.paused\) \|\| Boolean\(state\.stopped\)/);
  assert.match(js, /resume\.disabled = !controlsAvailable \|\| !Boolean\(state\.paused\) \|\| Boolean\(state\.stopped\)/);
  assert.match(js, /stop\.disabled = !controlsAvailable \|\| Boolean\(state\.stopped\)/);
});

test('Basic Chat does not restore a clicked control to enabled blindly after the request', () => {
  assert.doesNotMatch(js, /finally\s*\{\s*button\.disabled\s*=\s*false\s*;?\s*\}/s);
  assert.match(js, /finally\s*\{\s*render\(\);\s*\}/s);
});

test('control failures reconcile canonical state before controls are rendered again', () => {
  const marker = "for (const button of document.querySelectorAll('[data-action]')) button.addEventListener";
  const start = js.indexOf(marker);
  assert.notEqual(start, -1);
  const controlHandler = js.slice(start);
  assert.match(controlHandler, /catch \(error\) \{ showError\(error\); await reconcileAfterError\(\); \}/);
  assert.match(controlHandler, /finally \{ render\(\); \}/);
});

test('failed state reconciliation disables new work and controls instead of reusing stale availability', () => {
  assert.match(js, /function failClosedState\(\) \{ state = \{ \.\.\.state, ready: false, paused: false, stopped: false, status: 'UNKNOWN' \}; \}/);
  assert.match(js, /async function reconcileAfterError\(\) \{ try \{ await refresh\(\); \} catch \{ failClosedState\(\); \} \}/);
  assert.match(js, /if \(!res\.ok\) throw new Error\(`STATE_REFRESH_FAILED_\$\{res\.status\}`\)/);
  assert.match(js, /const blocked = sending \|\| state\.paused \|\| state\.stopped \|\| !state\.ready/);
  assert.match(js, /controlsAvailable = Boolean\(state\.ready \|\| state\.paused \|\| state\.stopped \|\| sending\)/);
});

test('Stop remains available during an active send because it is a request, not a termination claim', () => {
  assert.match(js, /state\.ready \|\| state\.paused \|\| state\.stopped \|\| sending/);
  assert.doesNotMatch(js, /stop\.disabled\s*=\s*sending/);
  assert.match(js, /Stop requested — no new actions will start; the current action may still finish/);
});

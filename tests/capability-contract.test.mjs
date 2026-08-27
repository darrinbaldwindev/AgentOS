import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCapabilities } from '../runtime/capability-contract.mjs';

test('normalizes adapter aliases to canonical capability names', () => {
  assert.deepEqual(normalizeCapabilities({ githubRead: true, continuityRead: true, handoff: true, workspaceRead: false }), {
    'github.read': true,
    'continuity.read': true,
    handoff: true,
    'workspace.read': false,
  });
});

test('unknown capability names remain explicit and falsey values are normalized', () => {
  assert.deepEqual(normalizeCapabilities({ 'github.write': false, experimental: 1 }), {
    'github.write': false,
    experimental: false,
  });
});

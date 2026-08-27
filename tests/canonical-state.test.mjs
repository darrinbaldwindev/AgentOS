import test from 'node:test';
import assert from 'node:assert/strict';
import { createCanonicalStateReader, validateCanonicalState } from '../runtime/canonical-state.mjs';

const state = { schemaVersion: 1, system: 'AgentOS', stateAuthority: '.agentos/state', status: 'active' };

test('canonical state validates required authority fields', () => {
  assert.equal(validateCanonicalState(state).stateAuthority, '.agentos/state');
  assert.throws(() => validateCanonicalState({ ...state, stateAuthority: 'wrong' }), /AUTHORITY_MISMATCH/);
});

test('canonical reader reads only canonical state paths', async () => {
  const paths = [];
  const reader = createCanonicalStateReader({ read: async (path) => { paths.push(path); return path.endsWith('current.json') ? state : {}; } });
  await reader.current();
  await reader.agents();
  await reader.missions();
  await reader.decisions();
  assert.deepEqual(paths, [
    '.agentos/state/current.json',
    '.agentos/state/agents.json',
    '.agentos/state/missions.json',
    '.agentos/state/decisions.json',
  ]);
});

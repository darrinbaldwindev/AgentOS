import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProjectOverseerResponse } from '../scripts/validate-project-overseer-response.mjs';

const valid = {
  mission_id: 'MISSION-LOCAL-001', status: 'COMPLETED',
  started_at: '2026-09-01T00:00:00Z', completed_at: '2026-09-01T00:01:00Z',
  repository_commit: 'abcdef1234567', inspection_summary: 'inspection',
  work_claimed: ['inspect'], work_implemented: ['validated'],
  verification: ['test passed'], evidence: ['commit:abcdef1234567'],
  blockers: [], escalations: [], next_action: 'reconcile'
};

test('validator accepts complete response', () => {
  assert.deepEqual(validateProjectOverseerResponse(valid), { valid: true, errors: [] });
});

test('validator rejects missing fields', () => {
  const result = validateProjectOverseerResponse({ mission_id: 'x' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('missing required field: repository_commit'));
});

test('validator rejects self-reported GREEN', () => {
  const result = validateProjectOverseerResponse({ ...valid, status: 'GREEN' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('invalid status')));
});

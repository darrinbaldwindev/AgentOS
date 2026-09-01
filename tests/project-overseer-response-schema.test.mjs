import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const schema = JSON.parse(fs.readFileSync(new URL('../schemas/project-overseer-response-v1.json', import.meta.url), 'utf8'));

function requiredFields(value) {
  return schema.required.every((key) => Object.prototype.hasOwnProperty.call(value, key));
}

test('accepts a complete Project Overseer response envelope', () => {
  const response = {
    mission_id: 'MISSION-TEST-001',
    status: 'COMPLETED',
    started_at: '2026-09-01T00:00:00Z',
    completed_at: '2026-09-01T00:01:00Z',
    repository_commit: 'abcdef1234567',
    inspection_summary: 'Inspected repository and reconciled current work.',
    work_claimed: ['inspect'],
    work_implemented: ['validated'],
    verification: ['deterministic test passed'],
    evidence: ['commit:abcdef1234567'],
    blockers: [],
    escalations: [],
    next_action: 'await upstream reconciliation'
  };
  assert.equal(requiredFields(response), true);
});

test('rejects an incomplete Project Overseer response envelope', () => {
  const response = { mission_id: 'MISSION-TEST-002', status: 'COMPLETED' };
  assert.equal(requiredFields(response), false);
});

test('does not allow GREEN as a Project Overseer self-reported status', () => {
  const response = { mission_id: 'MISSION-TEST-003', status: 'GREEN' };
  assert.equal(schema.properties.status.enum.includes(response.status), false);
});

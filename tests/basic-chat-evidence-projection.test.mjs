import assert from 'node:assert/strict';
import { test } from 'node:test';
import { projectBasicChatEvidence } from '../runtime/basic-chat-evidence-projection.mjs';

test('projects only bounded canonical evidence for one Basic Chat task', () => {
  const taskId = 'local-wake-123';
  const result = projectBasicChatEvidence({
    taskId,
    artifacts: [
      {
        id: `green-disposition:${taskId}`,
        artifactType: 'green.disposition',
        payload: { disposition: 'pass', task_status: 'complete', secret: 'must-not-leak' },
      },
      {
        id: `response:${taskId}`,
        artifactType: 'project-overseer.response',
        payload: {
          mission_id: `mission:${taskId}`,
          wake_trace_id: 'wake-123',
          status: 'COMPLETED',
          completed_at: '2026-09-14T09:00:00.000Z',
          blockers: [],
          evidence: ['raw-worker-output-do-not-expose'],
          work_claimed: ['private objective'],
        },
      },
    ],
    events: [
      { id: 'event-1', taskId, missionId: `mission:${taskId}`, wakeTraceId: 'wake-123', status: 'COMPLETED', greenDisposition: 'pass' },
    ],
  });

  assert.deepEqual(result, {
    schemaVersion: 1,
    taskId,
    evidenceAvailable: true,
    missionId: `mission:${taskId}`,
    wakeTraceId: 'wake-123',
    completionStatus: 'COMPLETED',
    greenDisposition: 'pass',
    completedAt: '2026-09-14T09:00:00.000Z',
    blockerCount: 0,
  });
  const encoded = JSON.stringify(result);
  assert.doesNotMatch(encoded, /secret|raw-worker-output|private objective/i);
});

test('ignores evidence from other tasks and fails closed when matching evidence is absent', () => {
  const result = projectBasicChatEvidence({
    taskId: 'local-wake-target',
    artifacts: [
      { id: 'response:local-wake-other', payload: { status: 'COMPLETED', mission_id: 'wrong' } },
      { id: 'green-disposition:local-wake-other', payload: { disposition: 'pass' } },
    ],
    events: [
      { taskId: 'local-wake-other', status: 'COMPLETED', greenDisposition: 'pass' },
    ],
  });

  assert.equal(result.evidenceAvailable, false);
  assert.equal(result.completionStatus, null);
  assert.equal(result.greenDisposition, null);
  assert.equal(result.missionId, null);
  assert.equal(result.wakeTraceId, null);
});

test('uses task-correlated event fallback without inventing Green or completion state', () => {
  const taskId = 'local-wake-event-only';
  const result = projectBasicChatEvidence({
    taskId,
    artifacts: [],
    events: [
      { id: 'event-older', taskId, status: 'GREEN_BLOCKED', missionId: 'mission:event', createdAt: '2026-09-14T08:00:00.000Z' },
      { id: 'event-newer', taskId, status: 'INCOMPLETE', missionId: 'mission:event', wakeTraceId: 'wake:event', createdAt: '2026-09-14T08:01:00.000Z' },
    ],
  });

  assert.equal(result.evidenceAvailable, true);
  assert.equal(result.completionStatus, 'INCOMPLETE');
  assert.equal(result.greenDisposition, null);
  assert.equal(result.missionId, 'mission:event');
  assert.equal(result.wakeTraceId, 'wake:event');
});

test('requires arrays and returns null when there is no task identity', () => {
  assert.equal(projectBasicChatEvidence({}), null);
  assert.throws(() => projectBasicChatEvidence({ taskId: 'x', artifacts: null, events: [] }), /must be arrays/);
});

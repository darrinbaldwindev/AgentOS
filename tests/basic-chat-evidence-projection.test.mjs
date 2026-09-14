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
        payload: { disposition: 'pass', task_id: taskId, task_status: 'complete', secret: 'must-not-leak' },
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
      { id: 'event-1', eventType: 'agentos.manual-wake.completed', taskId, missionId: `mission:${taskId}`, wakeTraceId: 'wake-123', status: 'COMPLETED', greenDisposition: 'pass' },
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
      { id: 'response:local-wake-other', artifactType: 'project-overseer.response', payload: { status: 'COMPLETED', mission_id: 'wrong' } },
      { id: 'green-disposition:local-wake-other', artifactType: 'green.disposition', payload: { disposition: 'pass', task_id: 'local-wake-other' } },
    ],
    events: [
      { eventType: 'agentos.manual-wake.completed', taskId: 'local-wake-other', status: 'COMPLETED', greenDisposition: 'pass' },
    ],
  });

  assert.equal(result.evidenceAvailable, false);
  assert.equal(result.completionStatus, null);
  assert.equal(result.greenDisposition, null);
  assert.equal(result.missionId, null);
  assert.equal(result.wakeTraceId, null);
});

test('uses task-correlated canonical event fallback without inventing Green or completion state', () => {
  const taskId = 'local-wake-event-only';
  const result = projectBasicChatEvidence({
    taskId,
    artifacts: [],
    events: [
      { id: 'event-older', eventType: 'agentos.manual-wake.green-blocked', taskId, status: 'GREEN_BLOCKED', missionId: 'mission:event', createdAt: '2026-09-14T08:00:00.000Z' },
      { id: 'event-newer', eventType: 'agentos.manual-wake.green-failed', taskId, status: 'INCOMPLETE', missionId: 'mission:event', wakeTraceId: 'wake:event', createdAt: '2026-09-14T08:01:00.000Z' },
    ],
  });

  assert.equal(result.evidenceAvailable, true);
  assert.equal(result.completionStatus, 'INCOMPLETE');
  assert.equal(result.greenDisposition, null);
  assert.equal(result.missionId, 'mission:event');
  assert.equal(result.wakeTraceId, 'wake:event');
});

test('rejects same-task artifacts and events that do not have canonical record types', () => {
  const taskId = 'local-wake-forged';
  const result = projectBasicChatEvidence({
    taskId,
    artifacts: [
      { id: `response:${taskId}`, artifactType: 'dispatch.task', payload: { status: 'COMPLETED', mission_id: 'mission:forged', wake_trace_id: 'wake:forged' } },
      { id: `green-disposition:${taskId}`, artifactType: 'worker.result', payload: { disposition: 'pass', task_id: taskId } },
    ],
    events: [
      { eventType: 'worker.self-reported-complete', taskId, status: 'COMPLETED', missionId: 'mission:forged', wakeTraceId: 'wake:forged', greenDisposition: 'pass' },
    ],
  });

  assert.deepEqual(result, {
    schemaVersion: 1,
    taskId,
    evidenceAvailable: false,
    missionId: null,
    wakeTraceId: null,
    completionStatus: null,
    greenDisposition: null,
    completedAt: null,
    blockerCount: 0,
  });
});

test('fails closed when same-task response and canonical event disagree on mission or wake identity', () => {
  const taskId = 'local-wake-conflict';
  const base = {
    taskId,
    artifacts: [{
      id: `response:${taskId}`,
      artifactType: 'project-overseer.response',
      payload: { mission_id: 'mission:one', wake_trace_id: 'wake:one', status: 'COMPLETED' },
    }],
  };

  for (const event of [
    { eventType: 'agentos.manual-wake.completed', taskId, missionId: 'mission:two', wakeTraceId: 'wake:one', status: 'COMPLETED', greenDisposition: 'pass' },
    { eventType: 'agentos.manual-wake.completed', taskId, missionId: 'mission:one', wakeTraceId: 'wake:two', status: 'COMPLETED', greenDisposition: 'pass' },
  ]) {
    const result = projectBasicChatEvidence({ ...base, events: [event] });
    assert.equal(result.evidenceAvailable, false);
    assert.equal(result.completionStatus, null);
    assert.equal(result.greenDisposition, null);
    assert.equal(result.missionId, null);
    assert.equal(result.wakeTraceId, null);
  }
});

test('fails closed when a canonical Green artifact is missing or conflicts with task identity', () => {
  const taskId = 'local-wake-green-binding';
  for (const payload of [
    { disposition: 'pass' },
    { disposition: 'pass', task_id: 'local-wake-other' },
  ]) {
    const result = projectBasicChatEvidence({
      taskId,
      artifacts: [
        { id: `green-disposition:${taskId}`, artifactType: 'green.disposition', payload },
        { id: `response:${taskId}`, artifactType: 'project-overseer.response', payload: { status: 'COMPLETED', mission_id: `mission:${taskId}`, wake_trace_id: 'wake:bound' } },
      ],
      events: [],
    });
    assert.deepEqual(result, {
      schemaVersion: 1,
      taskId,
      evidenceAvailable: false,
      missionId: null,
      wakeTraceId: null,
      completionStatus: null,
      greenDisposition: null,
      completedAt: null,
      blockerCount: 0,
    });
  }
});

test('requires arrays and returns null when there is no task identity', () => {
  assert.equal(projectBasicChatEvidence({}), null);
  assert.throws(() => projectBasicChatEvidence({ taskId: 'x', artifacts: null, events: [] }), /must be arrays/);
});

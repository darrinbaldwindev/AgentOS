import test from 'node:test';
import assert from 'node:assert/strict';
import { projectBasicChatJobs } from '../runtime/basic-chat-jobs-projection.mjs';

function task(id, status, createdAt) {
  return {
    id,
    artifactType: 'dispatch.task',
    createdAt,
    updatedAt: createdAt,
    payload: {
      task_id: id,
      mission_id: `mission:${id}`,
      wake_trace_id: `wake:${id}`,
      status,
      priority: 'high',
      created_at: createdAt,
      objective: 'private objective must not be projected',
      authority: { token: 'secret-authority' },
      credential: 'secret-credential',
      worker_output: 'private-worker-output',
      prs: { disposition: 'pass' },
      recovery: { status: 'complete' },
    },
  };
}

test('projects bounded recent jobs from canonical dispatch tasks only', () => {
  const jobs = projectBasicChatJobs({
    artifacts: [
      task('task-old', 'complete', '2026-09-15T01:00:00.000Z'),
      task('task-new', 'working', '2026-09-15T02:00:00.000Z'),
      { id: 'not-task', artifactType: 'chat.message', payload: { task_id: 'not-task', status: 'complete' } },
    ],
  });
  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].taskId, 'task-new');
  assert.equal(jobs[0].status, 'working');
  assert.equal(jobs[1].taskId, 'task-old');
  assert.equal(jobs[1].status, 'complete');
});

test('does not project objective authority credentials worker output PRS or recovery', () => {
  const jobs = projectBasicChatJobs({ artifacts: [task('task-sensitive', 'complete', '2026-09-15T03:00:00.000Z')] });
  const encoded = JSON.stringify(jobs);
  assert.doesNotMatch(encoded, /private objective|secret-authority|secret-credential|private-worker-output|prs|recovery/i);
  assert.deepEqual(Object.keys(jobs[0]).sort(), ['createdAt', 'missionId', 'priority', 'schemaVersion', 'status', 'taskId', 'updatedAt'].sort());
});

test('fails closed on forged identity or incomplete canonical correlation', () => {
  const valid = task('task-valid', 'complete', '2026-09-15T03:00:00.000Z');
  const forged = { ...task('task-payload', 'complete', '2026-09-15T04:00:00.000Z'), id: 'different-id' };
  const noMission = task('task-no-mission', 'complete', '2026-09-15T05:00:00.000Z');
  delete noMission.payload.mission_id;
  const noWake = task('task-no-wake', 'complete', '2026-09-15T06:00:00.000Z');
  delete noWake.payload.wake_trace_id;
  assert.deepEqual(projectBasicChatJobs({ artifacts: [forged, noMission, noWake, valid] }).map((job) => job.taskId), ['task-valid']);
});

test('unknown status stays unknown rather than being promoted', () => {
  const jobs = projectBasicChatJobs({ artifacts: [task('task-unknown', 'MAGIC_SUCCESS', '2026-09-15T03:00:00.000Z')] });
  assert.equal(jobs[0].status, 'unknown');
});

test('enforces bounded list limits and input types', () => {
  const artifacts = Array.from({ length: 8 }, (_, index) => task(`task-${index}`, 'queued', `2026-09-15T0${index}:00:00.000Z`));
  assert.equal(projectBasicChatJobs({ artifacts, limit: 3 }).length, 3);
  assert.throws(() => projectBasicChatJobs({ artifacts: null }), /artifacts must be an array/);
  assert.throws(() => projectBasicChatJobs({ artifacts: [], limit: 0 }), /limit must be an integer/);
});

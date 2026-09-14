import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal } from '../scripts/install-local.mjs';
import { createLocalChat } from '../runtime/local-chat.mjs';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';

async function makeRoot() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-chat-evidence-'));
  await installLocal({ root });
  return root;
}

async function persistenceFor(root) {
  const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
  return createLocalPersistence({ filePath: join(root, config.stateFile) });
}

async function seedControl(persistence, patch) {
  const current = await persistence.get('artifact', 'basic-chat:control');
  if (current) {
    await persistence.update('artifact', 'basic-chat:control', { ...current, ...patch });
  } else {
    await persistence.create('artifact', {
      id: 'basic-chat:control',
      artifactType: 'chat.control',
      status: 'ready',
      paused: false,
      stopped: false,
      ...patch,
    });
  }
}

describe('Basic Chat canonical evidence integration', () => {
  it('projects the current wake task evidence into the live snapshot', async () => {
    const root = await makeRoot();
    const chat = await createLocalChat({ root });
    try {
      const snapshot = await chat.send('show bounded evidence');
      assert.ok(snapshot.lastTaskId);
      assert.equal(snapshot.evidence?.taskId, snapshot.lastTaskId);
      assert.equal(snapshot.evidence?.evidenceAvailable, true);
      assert.ok(['COMPLETED', 'INCOMPLETE', 'GREEN_BLOCKED', 'AWAITING_GREEN'].includes(snapshot.evidence?.completionStatus));
      assert.equal(Object.hasOwn(snapshot.evidence ?? {}, 'prs'), false);
      assert.equal(Object.hasOwn(snapshot.evidence ?? {}, 'recovery'), false);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('fails closed when only non-current task evidence exists', async () => {
    const root = await makeRoot();
    const persistence = await persistenceFor(root);
    const taskId = 'local-wake-target';
    await seedControl(persistence, { lastTaskId: taskId, lastUserStatus: 'COMPLETE' });
    await persistence.create('artifact', {
      id: 'response:local-wake-other',
      artifactType: 'project-overseer.response',
      payload: { status: 'COMPLETED', mission_id: 'mission:other', wake_trace_id: 'wake:other' },
    });
    await persistence.create('event', {
      id: 'event:local-wake-other',
      taskId: 'local-wake-other',
      status: 'COMPLETED',
      greenDisposition: 'pass',
    });

    const chat = await createLocalChat({ root });
    try {
      const snapshot = await chat.snapshot();
      assert.equal(snapshot.lastTaskId, taskId);
      assert.deepEqual(snapshot.evidence, {
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
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not leak private/raw/secret or fabricated PRS/recovery fields through snapshot evidence', async () => {
    const root = await makeRoot();
    const persistence = await persistenceFor(root);
    const taskId = 'local-wake-sensitive';
    await seedControl(persistence, { lastTaskId: taskId, lastUserStatus: 'COMPLETE' });
    await persistence.create('artifact', {
      id: `response:${taskId}`,
      artifactType: 'project-overseer.response',
      payload: {
        status: 'COMPLETED',
        mission_id: 'mission:sensitive',
        wake_trace_id: 'wake:sensitive',
        completed_at: '2026-09-14T11:00:00.000Z',
        blockers: [],
        secret: 'never-return-this',
        rawWorkerOutput: 'private-worker-output',
        credential: 'opaque-but-still-private',
        prs: { disposition: 'pass' },
        recovery: { status: 'complete' },
      },
    });
    await persistence.create('artifact', {
      id: `green-disposition:${taskId}`,
      artifactType: 'green.disposition',
      payload: {
        disposition: 'pass',
        credential: 'do-not-project',
        prsDisposition: 'pass',
      },
    });

    const chat = await createLocalChat({ root });
    try {
      const evidence = (await chat.snapshot()).evidence;
      assert.deepEqual(evidence, {
        schemaVersion: 1,
        taskId,
        evidenceAvailable: true,
        missionId: 'mission:sensitive',
        wakeTraceId: 'wake:sensitive',
        completionStatus: 'COMPLETED',
        greenDisposition: 'pass',
        completedAt: '2026-09-14T11:00:00.000Z',
        blockerCount: 0,
      });
      const encoded = JSON.stringify(evidence);
      assert.doesNotMatch(encoded, /never-return-this|private-worker-output|credential|prs|recovery/i);
    } finally {
      await chat.close();
      await rm(root, { recursive: true, force: true });
    }
  });
});

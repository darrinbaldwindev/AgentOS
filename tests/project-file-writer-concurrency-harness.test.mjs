import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProjectFileWriter } from '../runtime/project-file-writer.mjs';

const task = Object.freeze({
  project_id: 'agentos',
  mission_id: 'mission-level2-concurrency-harness',
  task_id: 'task-project-file-write-concurrency-harness',
  worker_id: 'windows-worker-fixture',
});

function persistenceHarness() {
  const artifacts = new Map();
  return {
    artifacts,
    api: {
      get: async (type, id) => type === 'artifact' ? artifacts.get(id) ?? null : null,
      create: async (type, input) => {
        if (type !== 'artifact') throw new Error('unexpected type');
        if (artifacts.has(input.id)) throw new Error('duplicate');
        artifacts.set(input.id, structuredClone(input));
        return structuredClone(input);
      },
    },
  };
}

function orderedTwoCallBarrier() {
  let arrivals = 0;
  let signalFirstArrival;
  let releaseFirst;
  let releaseSecond;
  const firstArrived = new Promise((resolve) => { signalFirstArrival = resolve; });
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });
  const secondGate = new Promise((resolve) => { releaseSecond = resolve; });
  return {
    firstArrived,
    releaseSecond: () => releaseSecond(),
    hook: async () => {
      arrivals += 1;
      if (arrivals === 1) {
        signalFirstArrival();
        await firstGate;
        return;
      }
      if (arrivals === 2) {
        releaseFirst();
        await secondGate;
        return;
      }
      throw new Error('unexpected barrier arrival');
    },
  };
}

async function runSameKeyRace(iteration) {
  const root = await mkdtemp(path.join(tmpdir(), 'agentos-level2-writer-order-'));
  try {
    const persistence = persistenceHarness();
    const barrier = orderedTwoCallBarrier();
    const writer = await createProjectFileWriter({
      approvedRoots: [root],
      persistence: persistence.api,
      hooks: { beforeLock: barrier.hook },
    });
    const target = path.join(root, 'fixture.txt');
    const args = {
      task,
      targetPath: target,
      content: `same-${iteration}\n`,
      idempotencyKey: `idem-ordered-${iteration}`,
    };

    const firstPromise = writer.execute(args).then((result) => {
      barrier.releaseSecond();
      return result;
    });
    await barrier.firstArrived;
    const secondPromise = writer.execute(args);
    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    assert.equal(first.replayed, false);
    assert.equal(second.replayed, true);
    assert.equal(second.receipt_id, first.receipt_id);
    assert.equal(await readFile(target, 'utf8'), `same-${iteration}\n`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('same-key concurrency harness pins the designated first writer before starting its duplicate', async () => {
  for (let iteration = 0; iteration < 25; iteration += 1) {
    await runSameKeyRace(iteration);
  }
});

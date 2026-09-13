import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRemoteDeliveryClaimStore } from '../runtime/remote-delivery-claim-store.mjs';
import { createGovernedExecutionClaimGuard } from '../runtime/governed-execution-claim-guard.mjs';

const actorContext = Object.freeze({ actor_id: 'agentos:overseer' });
const task = Object.freeze({
  delivery_id: 'delivery:ps:guard',
  request_id: 'request:ps:guard',
  mission_id: 'mission:ps:guard',
  task_id: 'task:ps:guard',
  wake_trace_id: 'wake:ps:guard',
});

async function withGuard(fn, { now = () => new Date('2026-09-13T02:30:00.000Z'), boundary } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'agentos-governed-claim-guard-'));
  try {
    const claims = await createRemoteDeliveryClaimStore({ root, now });
    const guarded = createGovernedExecutionClaimGuard({
      boundary: boundary ?? { async execute({ invoke }) { return invoke(); } },
      claims,
      hostId: 'host:win:1',
      recoveryOptions: { now },
    });
    await fn({ guarded, claims, root });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('first delivery claims before invoking and replay never invokes twice', async () => {
  await withGuard(async ({ guarded, claims }) => {
    let invokeCalls = 0;
    const first = await guarded.execute({
      actorContext,
      task,
      async invoke() { invokeCalls += 1; return { ok: true }; },
    });
    assert.deepEqual(first, { ok: true });
    assert.equal(invokeCalls, 1);
    const retained = await claims.get(task.delivery_id);
    assert.equal(retained.mission_id, task.mission_id);
    assert.equal(retained.task_id, task.task_id);
    assert.equal(retained.wake_trace_id, task.wake_trace_id);

    await assert.rejects(
      guarded.execute({ actorContext, task, async invoke() { invokeCalls += 1; return { ok: true }; } }),
      (error) => error?.code === 'GOVERNED_EXECUTION_DUPLICATE_DELIVERY' && error?.details?.reclaim_allowed === false,
    );
    assert.equal(invokeCalls, 1);
  });
});

test('concurrent delivery attempts allow exactly one boundary invocation', async () => {
  let boundaryCalls = 0;
  let release;
  const blocker = new Promise((resolve) => { release = resolve; });
  const boundary = {
    async execute({ invoke }) {
      boundaryCalls += 1;
      await blocker;
      return invoke();
    },
  };

  await withGuard(async ({ guarded }) => {
    let invokeCalls = 0;
    const attempts = Array.from({ length: 10 }, () => guarded.execute({
      actorContext,
      task,
      async invoke() { invokeCalls += 1; return { ok: true }; },
    }).then((value) => ({ ok: true, value }), (error) => ({ ok: false, error })));

    await new Promise((resolve) => setTimeout(resolve, 25));
    release();
    const results = await Promise.all(attempts);
    assert.equal(results.filter((item) => item.ok).length, 1);
    assert.equal(results.filter((item) => item.error?.code === 'GOVERNED_EXECUTION_DUPLICATE_DELIVERY').length, 9);
    assert.equal(boundaryCalls, 1);
    assert.equal(invokeCalls, 1);
  }, { boundary });
});

test('claim correlation mismatch blocks without boundary invocation', async () => {
  await withGuard(async ({ guarded, claims }) => {
    await claims.claim({ deliveryId: task.delivery_id, requestId: 'request:other', hostId: 'host:win:1' });
    let invokeCalls = 0;
    await assert.rejects(
      guarded.execute({ actorContext, task, async invoke() { invokeCalls += 1; return {}; } }),
      (error) => error?.code === 'GOVERNED_EXECUTION_CLAIM_CORRELATION_MISMATCH',
    );
    assert.equal(invokeCalls, 0);
  });
});

test('retained exact identity cannot be borrowed by another mission task or wake', async () => {
  await withGuard(async ({ guarded, claims }) => {
    await claims.claim({
      deliveryId: task.delivery_id,
      requestId: task.request_id,
      hostId: 'host:win:1',
      missionId: task.mission_id,
      taskId: task.task_id,
      wakeTraceId: task.wake_trace_id,
    });
    let invokeCalls = 0;
    await assert.rejects(
      guarded.execute({
        actorContext,
        task: { ...task, mission_id: 'mission:borrowed', task_id: 'task:borrowed', wake_trace_id: 'wake:borrowed' },
        async invoke() { invokeCalls += 1; return {}; },
      }),
      (error) => error?.code === 'GOVERNED_EXECUTION_CLAIM_CORRELATION_MISMATCH' &&
        error?.details?.actual_task_id === task.task_id &&
        error?.details?.expected_task_id === 'task:borrowed',
    );
    assert.equal(invokeCalls, 0);
  });
});

test('stale claim requires recovery and never auto-reclaims or invokes', async () => {
  const claimTime = () => new Date('2026-09-13T02:00:00.000Z');
  const recoveryTime = () => new Date('2026-09-13T02:30:01.000Z');
  const root = await mkdtemp(join(tmpdir(), 'agentos-governed-claim-stale-'));
  try {
    const writer = await createRemoteDeliveryClaimStore({ root, now: claimTime });
    await writer.claim({
      deliveryId: task.delivery_id,
      requestId: task.request_id,
      hostId: 'host:win:1',
      missionId: task.mission_id,
      taskId: task.task_id,
      wakeTraceId: task.wake_trace_id,
    });
    const reader = await createRemoteDeliveryClaimStore({ root, now: recoveryTime });
    const guarded = createGovernedExecutionClaimGuard({
      boundary: { async execute() { throw new Error('boundary must not run'); } },
      claims: reader,
      hostId: 'host:win:1',
      recoveryOptions: { now: recoveryTime, staleAfterMs: 15 * 60 * 1000 },
    });
    let invokeCalls = 0;
    await assert.rejects(
      guarded.execute({ actorContext, task, async invoke() { invokeCalls += 1; return {}; } }),
      (error) => error?.code === 'GOVERNED_EXECUTION_RECOVERY_REQUIRED' && error?.details?.reclaim_allowed === false,
    );
    assert.equal(invokeCalls, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('post-claim boundary failure retains claim and marks replay unsafe', async () => {
  const boundary = {
    async execute({ invoke }) {
      await invoke();
      const error = new Error('SIMULATED_CRASH_AFTER_SIDE_EFFECT');
      error.code = 'SIMULATED_CRASH_AFTER_SIDE_EFFECT';
      throw error;
    },
  };

  await withGuard(async ({ guarded, claims }) => {
    let invokeCalls = 0;
    await assert.rejects(
      guarded.execute({ actorContext, task, async invoke() { invokeCalls += 1; return { side_effect: true }; } }),
      (error) => error?.code === 'SIMULATED_CRASH_AFTER_SIDE_EFFECT' && error?.claim_retained === true && error?.replay_safe_to_invoke === false,
    );
    assert.equal(invokeCalls, 1);
    const retained = await claims.get(task.delivery_id);
    assert.equal(retained?.state, 'CLAIMED');
    assert.equal(retained?.task_id, task.task_id);

    await assert.rejects(
      guarded.execute({ actorContext, task, async invoke() { invokeCalls += 1; return {}; } }),
      (error) => error?.code === 'GOVERNED_EXECUTION_DUPLICATE_DELIVERY',
    );
    assert.equal(invokeCalls, 1);
  }, { boundary });
});

test('pre-side-effect boundary failure also retains claim rather than guessing replay safety', async () => {
  const boundary = {
    async execute() {
      const error = new Error('POLICY_DENIED');
      error.code = 'POLICY_DENIED';
      throw error;
    },
  };
  await withGuard(async ({ guarded, claims }) => {
    await assert.rejects(
      guarded.execute({ actorContext, task, async invoke() { throw new Error('must not invoke'); } }),
      (error) => error?.code === 'POLICY_DENIED' && error?.claim_retained === true && error?.replay_safe_to_invoke === false,
    );
    assert.equal((await claims.get(task.delivery_id))?.state, 'CLAIMED');
  }, { boundary });
});
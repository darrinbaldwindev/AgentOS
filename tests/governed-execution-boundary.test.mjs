import test from 'node:test';
import assert from 'node:assert/strict';
import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';

function fixture(overrides = {}) {
  const calls = [];
  const gate = (name, value = true) => ({
    async assertValid() { calls.push(name); if (value instanceof Error) throw value; return value; },
    async assertAllowed() { calls.push(name); if (value instanceof Error) throw value; return value; },
    async assertExecutionEligible() { calls.push(name); if (value instanceof Error) throw value; return value; },
    async evaluate() { calls.push(name); if (value instanceof Error) throw value; return value; },
    async assertApproved() { calls.push(name); if (value instanceof Error) throw value; return value; },
    async record() { calls.push(name); if (value instanceof Error) throw value; return value; },
    async verify() { calls.push(name); if (value instanceof Error) throw value; return value; },
  });
  const budget = {
    async reserve(input) { calls.push('budget.reserve'); return { reservation_id: 'budget-1', ...input }; },
    async reconcile(input) { calls.push(`budget.reconcile:${input.actual_units}`); return { status: 'RECONCILED', ...input }; },
  };
  const components = {
    context: gate('context'),
    authority: gate('authority'),
    consent: gate('consent'),
    capability: gate('capability', { eligible: true }),
    policy: gate('policy'),
    risk: gate('risk', { approvalRequired: false, level: 'low' }),
    budget,
    approval: gate('approval'),
    receipts: gate('receipt', { receipt_id: 'receipt-1' }),
    verification: gate('verification', { passed: true }),
    ...overrides,
  };
  return { boundary: createGovernedExecutionBoundary(components), calls, components };
}

const actorContext = Object.freeze({ actor_id: 'agentos:overseer' });
const task = Object.freeze({ project_id: 'agentos-local', mission_id: 'mission:test', task_id: 'task:test' });

for (const [name, override] of [
  ['context', { context: { async assertValid() { throw new Error('CONTEXT_DENIED'); } } }],
  ['authority', { authority: { async assertAllowed() { throw new Error('AUTHORITY_DENIED'); } } }],
  ['consent', { consent: { async assertAllowed() { throw new Error('CONSENT_DENIED'); } } }],
  ['capability', { capability: { async assertExecutionEligible() { throw new Error('AGENT_NOT_ELIGIBLE'); } } }],
  ['policy', { policy: { async assertAllowed() { throw new Error('POLICY_DENIED'); } } }],
  ['risk', { risk: { async evaluate() { throw new Error('RISK_BLOCKED'); } } }],
]) {
  test(`${name} failure prevents execution`, async () => {
    let invoked = 0;
    const { boundary } = fixture(override);
    await assert.rejects(
      boundary.execute({ actorContext, task, invoke: async () => { invoked += 1; } }),
    );
    assert.equal(invoked, 0);
  });
}

test('approval is required only after risk and budget reservation and before execution', async () => {
  let invoked = 0;
  const calls = [];
  const { boundary } = fixture({
    risk: { async evaluate() { calls.push('risk'); return { approvalRequired: true, level: 'high' }; } },
    budget: {
      async reserve() { calls.push('budget.reserve'); return { reservation_id: 'budget-approval' }; },
      async reconcile({ actual_units }) { calls.push(`budget.reconcile:${actual_units}`); return { status: 'RECONCILED' }; },
    },
    approval: { async assertApproved() { calls.push('approval'); throw new Error('APPROVAL_REQUIRED'); } },
  });
  await assert.rejects(
    boundary.execute({ actorContext, task, invoke: async () => { invoked += 1; } }),
    /APPROVAL_REQUIRED/,
  );
  assert.equal(invoked, 0);
  assert.deepEqual(calls, ['risk', 'budget.reserve', 'approval', 'budget.reconcile:0']);
});

test('invalid risk decision fails before budget reservation and execution', async () => {
  let invoked = 0;
  let reserved = 0;
  const { boundary } = fixture({
    risk: { async evaluate() { return { level: 'unknown' }; } },
    budget: {
      async reserve() { reserved += 1; return { reservation_id: 'never' }; },
      async reconcile() {},
    },
  });
  await assert.rejects(
    boundary.execute({ actorContext, task, invoke: async () => { invoked += 1; } }),
    /RISK_DECISION_INVALID/,
  );
  assert.equal(reserved, 0);
  assert.equal(invoked, 0);
});

test('successful execution requires receipt, verification and budget reconciliation', async () => {
  let invoked = 0;
  const { boundary, calls } = fixture();
  const outcome = await boundary.execute({
    actorContext,
    task,
    actualUnits: 1,
    invoke: async () => { invoked += 1; calls.push('invoke'); return { ok: true }; },
  });
  assert.equal(invoked, 1);
  assert.equal(outcome.status, 'VERIFIED');
  assert.equal(outcome.verification.passed, true);
  assert.deepEqual(calls, [
    'context', 'authority', 'consent', 'capability', 'policy', 'risk',
    'budget.reserve', 'invoke', 'receipt', 'verification', 'budget.reconcile:1',
  ]);
});

test('missing receipt cannot report verified completion and charges attempted work', async () => {
  let reconciled = null;
  const { boundary } = fixture({
    receipts: { async record() { return null; } },
    budget: {
      async reserve() { return { reservation_id: 'budget-receipt' }; },
      async reconcile(input) { reconciled = input.actual_units; return { status: 'RECONCILED' }; },
    },
  });
  await assert.rejects(
    boundary.execute({ actorContext, task, actualUnits: 1, invoke: async () => ({ ok: true }) }),
    /EXECUTION_RECEIPT_REQUIRED/,
  );
  assert.equal(reconciled, 1);
});

test('failed verification cannot report verified completion and preserves receipt evidence', async () => {
  let reconciled = null;
  const { boundary } = fixture({
    verification: { async verify() { return { passed: false, reason: 'evidence mismatch' }; } },
    budget: {
      async reserve() { return { reservation_id: 'budget-verify' }; },
      async reconcile(input) { reconciled = input.actual_units; return { status: 'RECONCILED' }; },
    },
  });
  await assert.rejects(
    boundary.execute({ actorContext, task, actualUnits: 1, invoke: async () => ({ ok: true }) }),
    (error) => error.code === 'EXECUTION_VERIFICATION_FAILED' && error.receipt?.receipt_id === 'receipt-1',
  );
  assert.equal(reconciled, 1);
});

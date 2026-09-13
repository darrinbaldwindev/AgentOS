import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createToolPolicy } from '../runtime/tool-policy.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';
import {
  createCanonicalContextGate,
  createCanonicalAuthorityGate,
  createCanonicalToolPolicyGate,
  createCanonicalHumanApprovalGate,
  createCanonicalVerificationGate,
} from '../runtime/governed-execution-canonical-adapters.mjs';

const actorContext = Object.freeze({ actor_id: 'agentos:overseer' });

function task(overrides = {}) {
  return {
    project_id: 'agentos-local',
    mission_id: 'mission:powershell',
    task_id: 'task:powershell',
    issuer: 'agentos:overseer',
    authority: { granted_capabilities: ['shell.powershell.dev.execute'] },
    execution: { operation: 'test.run' },
    ...overrides,
  };
}

test('context adapter delegates to canonical mission/decision validation', async () => {
  const gate = createCanonicalContextGate({
    canonicalContext: {
      missions: [{ id: 'mission:powershell' }],
      decisions: [{ id: 'decision:1', status: 'accepted' }],
    },
  });
  const result = await gate.assertValid({ actorContext, task: task({ decision_id: 'decision:1' }) });
  assert.deepEqual(result, { mission_id: 'mission:powershell', decision_id: 'decision:1' });
  await assert.rejects(
    gate.assertValid({ actorContext, task: task({ mission_id: 'mission:missing' }) }),
    /unknown mission/,
  );
});

test('authority adapter delegates to canonical issuer/capability policy and fails closed', async () => {
  const gate = createCanonicalAuthorityGate({
    authorityPolicy: createAuthorityPolicy({
      issuers: ['agentos:overseer'],
      capabilities: ['shell.powershell.dev.execute'],
    }),
  });
  const allowed = await gate.assertAllowed({ actorContext, task: task() });
  assert.equal(allowed.issuer, 'agentos:overseer');
  await assert.rejects(
    gate.assertAllowed({ actorContext, task: task({ issuer: 'unknown:issuer' }) }),
    /untrusted issuer/,
  );
});

test('tool policy adapter derives fixed operation identity and denies missing/disallowed operations', async () => {
  const gate = createCanonicalToolPolicyGate({ toolPolicy: createToolPolicy({ allow: ['test.run'] }) });
  assert.equal((await gate.assertAllowed({ actorContext, task: task() })).mode, 'allow');
  await assert.rejects(
    gate.assertAllowed({ actorContext, task: task({ execution: { operation: 'service.list' } }) }),
    (error) => error?.code === 'TOOL_POLICY_DENIED',
  );
  await assert.rejects(
    gate.assertAllowed({ actorContext, task: task({ execution: {} }) }),
    (error) => error?.code === 'EXECUTION_TOOL_IDENTITY_REQUIRED',
  );
});

test('human approval adapter consumes canonical human-gate state without creating approval', async () => {
  const humanGate = createHumanGate();
  const gate = createCanonicalHumanApprovalGate({ humanGate });
  await assert.rejects(
    gate.assertApproved({ actorContext, task: task(), riskDecision: { approvalRequired: true }, reservation: {} }),
    (error) => error?.code === 'HUMAN_APPROVAL_RECORD_REQUIRED',
  );
  humanGate.request({ missionId: 'mission:powershell', reason: 'high-risk test' });
  await assert.rejects(
    gate.assertApproved({ actorContext, task: task(), riskDecision: { approvalRequired: true }, reservation: {} }),
    (error) => error?.code === 'HUMAN_APPROVAL_PENDING',
  );
  humanGate.resolve({ missionId: 'mission:powershell', decision: 'denied' });
  await assert.rejects(
    gate.assertApproved({ actorContext, task: task(), riskDecision: { approvalRequired: true }, reservation: {} }),
    (error) => error?.code === 'HUMAN_APPROVAL_DENIED',
  );

  const approvedGateState = createHumanGate();
  approvedGateState.request({ missionId: 'mission:powershell', reason: 'high-risk test' });
  approvedGateState.resolve({ missionId: 'mission:powershell', decision: 'approved' });
  const approvedGate = createCanonicalHumanApprovalGate({ humanGate: approvedGateState });
  const approved = await approvedGate.assertApproved({ actorContext, task: task(), riskDecision: { approvalRequired: true }, reservation: {} });
  assert.equal(approved.decision, 'approved');
});

test('verification adapter requires canonical router selection and typed verifier result', async () => {
  const calls = [];
  const gate = createCanonicalVerificationGate({
    verificationRouter: {
      async selectVerifier({ task: selectedTask, result }) {
        calls.push(['select', selectedTask.task_id, result.workerId]);
        return { id: 'verifier:independent' };
      },
    },
    async runVerifier({ verifier, task: selectedTask, receipt }) {
      calls.push(['run', verifier.id, selectedTask.task_id, receipt.receipt_id]);
      return { passed: true, evidence: ['independent-check'] };
    },
  });
  const verification = await gate.verify({
    actorContext,
    task: task(),
    result: { workerId: 'worker:powershell' },
    receipt: { receipt_id: 'receipt:1' },
  });
  assert.equal(verification.passed, true);
  assert.equal(verification.verifier_id, 'verifier:independent');
  assert.deepEqual(calls, [
    ['select', 'task:powershell', 'worker:powershell'],
    ['run', 'verifier:independent', 'task:powershell', 'receipt:1'],
  ]);
});

test('verification adapter fails closed when no verifier or malformed result is returned', async () => {
  const noVerifier = createCanonicalVerificationGate({
    verificationRouter: { async selectVerifier() { return null; } },
    async runVerifier() { return { passed: true }; },
  });
  await assert.rejects(
    noVerifier.verify({ actorContext, task: task(), result: {}, receipt: {} }),
    (error) => error?.code === 'EXECUTION_VERIFIER_REQUIRED',
  );

  const malformed = createCanonicalVerificationGate({
    verificationRouter: { async selectVerifier() { return { id: 'verifier:1' }; } },
    async runVerifier() { return { status: 'ok' }; },
  });
  await assert.rejects(
    malformed.verify({ actorContext, task: task(), result: {}, receipt: {} }),
    (error) => error?.code === 'EXECUTION_VERIFICATION_RESULT_INVALID',
  );
});

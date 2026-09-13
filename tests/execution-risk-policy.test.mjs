import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyWindowsPowerShellOperationRisk,
  createExecutionRiskPolicy,
  EXECUTION_RISK_LEVELS,
  WINDOWS_POWERSHELL_OPERATION_RISK,
} from '../runtime/execution-risk-policy.mjs';

const actorContext = Object.freeze({ actor_id: 'agentos:overseer' });
const task = Object.freeze({ project_id: 'agentos-local', mission_id: 'mission:1', task_id: 'task:1' });
const capabilityEvaluation = Object.freeze({ pickup_eligible: true, execution_authorized: true });

test('risk levels are fixed provider-neutral A0 through A4', () => {
  assert.deepEqual(EXECUTION_RISK_LEVELS, ['A0', 'A1', 'A2', 'A3', 'A4']);
});

test('risk policy delegates classification and returns normalized decision', async () => {
  const calls = [];
  const policy = createExecutionRiskPolicy({
    async classify(input) {
      calls.push(input);
      return { level: 'A2', approvalRequired: false, reason: 'bounded reversible operator action', evidence: ['policy:test'] };
    },
  });
  const decision = await policy.evaluate({ actorContext, task, capabilityEvaluation });
  assert.equal(calls.length, 1);
  assert.deepEqual(decision, {
    level: 'A2',
    approvalRequired: false,
    reason: 'bounded reversible operator action',
    evidence: ['policy:test'],
  });
});

test('PowerShell operation risk mapping covers the complete bounded catalogue', () => {
  assert.deepEqual(Object.keys(WINDOWS_POWERSHELL_OPERATION_RISK).sort(), [
    'audit.run',
    'process.list',
    'repo.diff',
    'repo.status',
    'service.list',
    'test.run',
  ]);

  for (const operation of ['repo.status', 'repo.diff', 'process.list', 'service.list']) {
    assert.deepEqual(classifyWindowsPowerShellOperationRisk({
      task: { execution: { adapter: 'windows-powershell', operation } },
    }), {
      level: 'A0',
      approvalRequired: false,
      reason: WINDOWS_POWERSHELL_OPERATION_RISK[operation].reason,
      evidence: [
        'policy:agentos-security-control-plane',
        'adapter:windows-powershell',
        `operation:${operation}`,
      ],
    });
  }

  for (const operation of ['test.run', 'audit.run']) {
    const decision = classifyWindowsPowerShellOperationRisk({
      task: { execution: { adapter: 'windows-powershell', operation } },
    });
    assert.equal(decision.level, 'A2');
    assert.equal(decision.approvalRequired, false);
  }
});

test('PowerShell operation risk mapping fails closed for wrong adapters and unknown operations', () => {
  assert.throws(
    () => classifyWindowsPowerShellOperationRisk({
      task: { execution: { adapter: 'other-shell', operation: 'repo.status' } },
    }),
    (error) => error?.code === 'EXECUTION_RISK_ADAPTER_MISMATCH',
  );

  assert.throws(
    () => classifyWindowsPowerShellOperationRisk({
      task: { execution: { adapter: 'windows-powershell', operation: 'shell.arbitrary' } },
    }),
    (error) => error?.code === 'EXECUTION_RISK_OPERATION_UNKNOWN',
  );
});

test('PowerShell mapping composes through the canonical risk contract', async () => {
  const policy = createExecutionRiskPolicy({ classify: classifyWindowsPowerShellOperationRisk });
  const decision = await policy.evaluate({
    actorContext,
    task: {
      ...task,
      execution: { adapter: 'windows-powershell', operation: 'test.run' },
    },
    capabilityEvaluation,
  });
  assert.equal(decision.level, 'A2');
  assert.equal(decision.approvalRequired, false);
  assert.deepEqual(decision.evidence, [
    'policy:agentos-security-control-plane',
    'adapter:windows-powershell',
    'operation:test.run',
  ]);
});

test('unknown or missing classification fails closed', async () => {
  const missing = createExecutionRiskPolicy({ async classify() { return null; } });
  await assert.rejects(
    missing.evaluate({ actorContext, task, capabilityEvaluation }),
    (error) => error?.code === 'EXECUTION_RISK_DECISION_REQUIRED',
  );

  const unknown = createExecutionRiskPolicy({ async classify() { return { level: 'A9', approvalRequired: true, reason: 'unknown' }; } });
  await assert.rejects(
    unknown.evaluate({ actorContext, task, capabilityEvaluation }),
    (error) => error?.code === 'EXECUTION_RISK_LEVEL_UNKNOWN',
  );
});

test('malformed approvalRequired fails closed', async () => {
  const policy = createExecutionRiskPolicy({ async classify() { return { level: 'A3', approvalRequired: 'yes', reason: 'privileged' }; } });
  await assert.rejects(
    policy.evaluate({ actorContext, task, capabilityEvaluation }),
    (error) => error?.code === 'EXECUTION_RISK_APPROVAL_REQUIRED_INVALID',
  );
});

test('A4 critical/high-impact classification can never suppress approval', async () => {
  const unsafe = createExecutionRiskPolicy({ async classify() { return { level: 'A4', approvalRequired: false, reason: 'critical' }; } });
  await assert.rejects(
    unsafe.evaluate({ actorContext, task, capabilityEvaluation }),
    (error) => error?.code === 'EXECUTION_RISK_A4_APPROVAL_REQUIRED',
  );

  const safe = createExecutionRiskPolicy({ async classify() { return { level: 'A4', approvalRequired: true, reason: 'critical requires owner approval' }; } });
  const decision = await safe.evaluate({ actorContext, task, capabilityEvaluation });
  assert.equal(decision.level, 'A4');
  assert.equal(decision.approvalRequired, true);
});

test('risk policy requires actor, task and capability evidence', async () => {
  const policy = createExecutionRiskPolicy({ async classify() { throw new Error('must not classify invalid input'); } });
  await assert.rejects(policy.evaluate({ task, capabilityEvaluation }), /actorContext is required/);
  await assert.rejects(policy.evaluate({ actorContext, capabilityEvaluation }), /task is required/);
  await assert.rejects(policy.evaluate({ actorContext, task }), /capabilityEvaluation is required/);
});

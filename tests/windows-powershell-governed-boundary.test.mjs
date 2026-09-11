import test from 'node:test';
import assert from 'node:assert/strict';
import { createGovernedExecutionBoundary } from '../runtime/governed-execution-boundary.mjs';
import { createWindowsPowerShellAdapter } from '../runtime/windows-powershell-adapter.mjs';

function harness({ authorityAllowed = true, approvalRequired = false, approved = true } = {}) {
  const events = [];
  let invoked = 0;
  const powershell = createWindowsPowerShellAdapter({
    allowedRoots: ['C:/agentos'],
    pathResolver: (input) => input,
    executor: async (request) => {
      invoked += 1;
      events.push('powershell');
      return { stdout: 'tests passed', stderr: '', exitCode: 0, request };
    },
  });
  const gate = (name, fn = async () => undefined) => ({ [name]: async (input) => { events.push(name); return fn(input); } });
  const boundary = createGovernedExecutionBoundary({
    context: gate('assertValid'),
    authority: gate('assertAllowed', async () => { if (!authorityAllowed) throw new Error('AUTHORITY_DENIED'); }),
    consent: gate('assertAllowed'),
    capability: gate('assertExecutionEligible', async () => powershell.describe('test.run')),
    policy: gate('assertAllowed'),
    risk: gate('evaluate', async () => ({ approvalRequired })),
    budget: {
      reserve: async () => { events.push('reserve'); return { reservation_id: 'budget-1' }; },
      reconcile: async ({ actual_units }) => { events.push(`reconcile:${actual_units}`); return { status: 'reconciled', actual_units }; },
    },
    approval: gate('assertApproved', async () => { if (!approved) throw new Error('APPROVAL_DENIED'); }),
    receipts: { record: async ({ result }) => { events.push('receipt'); return { receipt_id: 'receipt-1', execution: result }; } },
    verification: { verify: async ({ result, receipt }) => { events.push('verify'); return { passed: result.success === true && receipt.execution === result }; } },
  });
  const task = { project_id: 'agentos-local', mission_id: 'mission:windows-worker-test', task_id: 'windows-worker-test' };
  const actorContext = { actor_id: 'agentos:overseer' };
  return { boundary, powershell, task, actorContext, events, invoked: () => invoked };
}

test('authority denial prevents PowerShell invocation', async () => {
  const h = harness({ authorityAllowed: false });
  await assert.rejects(h.boundary.execute({ actorContext: h.actorContext, task: h.task, invoke: () => h.powershell.execute({ operation: 'test.run', cwd: 'C:/agentos/AgentOS' }) }), /AUTHORITY_DENIED/);
  assert.equal(h.invoked(), 0);
  assert.deepEqual(h.events, ['assertValid', 'assertAllowed']);
});

test('required approval denial prevents PowerShell invocation and reconciles zero', async () => {
  const h = harness({ approvalRequired: true, approved: false });
  await assert.rejects(h.boundary.execute({ actorContext: h.actorContext, task: h.task, invoke: () => h.powershell.execute({ operation: 'test.run', cwd: 'C:/agentos/AgentOS' }) }), /APPROVAL_DENIED/);
  assert.equal(h.invoked(), 0);
  assert.equal(h.events.includes('reconcile:0'), true);
});

test('admitted PowerShell execution produces receipted verified evidence', async () => {
  const h = harness();
  const result = await h.boundary.execute({ actorContext: h.actorContext, task: h.task, actualUnits: 1, invoke: () => h.powershell.execute({ operation: 'test.run', cwd: 'C:/agentos/AgentOS' }) });
  assert.equal(h.invoked(), 1);
  assert.equal(result.status, 'VERIFIED');
  assert.equal(result.result.operation, 'test.run');
  assert.equal(result.result.capability, 'shell.powershell.dev.execute');
  assert.equal(result.result.success, true);
  assert.equal(result.receipt.execution, result.result);
  assert.equal(result.verification.passed, true);
  assert.deepEqual(h.events, ['assertValid','assertAllowed','assertAllowed','assertExecutionEligible','assertAllowed','evaluate','reserve','powershell','receipt','verify','reconcile:1']);
});

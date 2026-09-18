import test from 'node:test';
import assert from 'node:assert/strict';
import { createExecutionPreflight } from '../runtime/execution-preflight.mjs';
import { createRuntimeShell } from '../runtime/runtime-shell.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createHumanGate } from '../runtime/overseer-human-gate.mjs';
import { createToolPolicy } from '../runtime/tool-policy.mjs';

const ISSUER = 'agentos:overseer';
const TARGET = 'agentos:project-overseer';
const CAPABILITY = 'repository:read';

function task(overrides = {}) {
  return {
    task_id: 'task-1',
    mission_id: 'mission-1',
    project_id: 'agentos-local',
    issuer: ISSUER,
    target: TARGET,
    objective: 'bounded test',
    scope: ['local-runtime'],
    constraints: ['DRY_RUN only'],
    consent_mode: 'PRE_AUTHORIZED',
    required_capabilities: [CAPABILITY],
    authority: { granted_capabilities: [CAPABILITY] },
    ...overrides,
  };
}

function eligibleShell(overrides = {}) {
  return createRuntimeShell({
    probes: {
      githubRead: async () => overrides.githubRead ?? true,
      continuityRead: async () => overrides.continuityRead ?? true,
      handoff: async () => overrides.handoff ?? true,
    },
  });
}

function authorityPolicy(capabilities = [CAPABILITY]) {
  return createAuthorityPolicy({ issuers: [ISSUER], capabilities });
}

function fakeBudget() {
  const events = [];
  return {
    events,
    reserve(input) {
      events.push({ type: 'reserve', ...input });
      return { reservation_id: 'reservation-1', ...input, status: 'RESERVED' };
    },
    reconcile(input) {
      events.push({ type: 'reconcile', ...input });
      return { ...input, status: 'RECONCILED' };
    },
  };
}

test('ineligible runtime cannot reach execution', async () => {
  let called = false;
  const gate = createExecutionPreflight({ runtimeShell: eligibleShell({ githubRead: false }), authorityPolicy: authorityPolicy() });
  await assert.rejects(
    () => gate.execute({ task: task(), execute: async () => { called = true; } }),
    (error) => error.code === 'AGENT_NOT_ELIGIBLE',
  );
  assert.equal(called, false);
});

test('required capability must be explicitly granted before execution', async () => {
  let called = false;
  const gate = createExecutionPreflight({ runtimeShell: eligibleShell(), authorityPolicy: authorityPolicy() });
  await assert.rejects(
    () => gate.execute({ task: task({ authority: { granted_capabilities: [] } }), execute: async () => { called = true; } }),
    (error) => error.code === 'CAPABILITY_GRANT_MISSING',
  );
  assert.equal(called, false);
});

test('explicit approval must be resolved before execution', async () => {
  const approvalGate = createHumanGate();
  let called = 0;
  const gate = createExecutionPreflight({ runtimeShell: eligibleShell(), authorityPolicy: authorityPolicy(), approvalGate });
  const approvedTask = task({ consent_mode: 'EXPLICIT_APPROVAL' });

  await assert.rejects(() => gate.execute({ task: approvedTask, execute: async () => { called += 1; } }), /APPROVAL_REQUIRED/);
  assert.equal(called, 0);

  approvalGate.request({ missionId: approvedTask.mission_id, reason: 'owner approval required' });
  approvalGate.resolve({ missionId: approvedTask.mission_id, decision: 'approve' });
  const outcome = await gate.execute({ task: approvedTask, execute: async () => { called += 1; return 'ok'; } });
  assert.equal(outcome.result, 'ok');
  assert.equal(called, 1);
});

test('tool policy denial blocks execution', async () => {
  let called = false;
  const gate = createExecutionPreflight({
    runtimeShell: eligibleShell(),
    authorityPolicy: authorityPolicy(),
    toolPolicy: createToolPolicy({ allow: [] }),
  });
  await assert.rejects(
    () => gate.execute({ task: task(), toolName: 'shell.exec', execute: async () => { called = true; } }),
    (error) => error.code === 'TOOL_POLICY_DENIED',
  );
  assert.equal(called, false);
});

test('production scope is blocked before budget reservation or execution', async () => {
  const budget = fakeBudget();
  let called = false;
  const gate = createExecutionPreflight({ runtimeShell: eligibleShell(), authorityPolicy: authorityPolicy(), budget });
  await assert.rejects(
    () => gate.execute({ task: task({ scope: ['production'] }), execute: async () => { called = true; } }),
    (error) => error.code === 'PRODUCTION_SCOPE_PROHIBITED',
  );
  assert.equal(called, false);
  assert.deepEqual(budget.events, []);
});

test('budget is reserved only after admission and reconciled on success', async () => {
  const budget = fakeBudget();
  const gate = createExecutionPreflight({ runtimeShell: eligibleShell(), authorityPolicy: authorityPolicy(), budget });
  const outcome = await gate.execute({ task: task(), execute: async () => ({ status: 'done' }) });
  assert.deepEqual(outcome.result, { status: 'done' });
  assert.deepEqual(budget.events, [
    { type: 'reserve', project_id: 'agentos-local', mission_id: 'mission-1', limit_units: 1 },
    { type: 'reconcile', reservation_id: 'reservation-1', actual_units: 1 },
  ]);
});

test('an attempted execution failure still reconciles consumed budget', async () => {
  const budget = fakeBudget();
  const gate = createExecutionPreflight({ runtimeShell: eligibleShell(), authorityPolicy: authorityPolicy(), budget });
  await assert.rejects(
    () => gate.execute({ task: task(), execute: async () => { throw new Error('worker failed'); } }),
    (error) => error.message === 'worker failed' && error.budget?.status === 'RECONCILED',
  );
  assert.equal(budget.events.at(-1).actual_units, 1);
});

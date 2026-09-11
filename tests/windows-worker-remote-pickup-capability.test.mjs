import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsWorkerHostProbe } from '../runtime/windows-worker-host-probe.mjs';
import { evaluateRemotePickupEligibility } from '../runtime/remote-pickup-eligibility.mjs';

function admittedTask(requiredCapabilities) {
  return {
    task_id: 'task-windows-1',
    mission_id: 'mission-windows-1',
    delivery_id: 'delivery-windows-1',
    request_id: 'request-windows-1',
    project_id: 'agentos-local',
    target_host_id: 'host-1',
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    created_at: '2026-09-11T00:00:00.000Z',
    required_capabilities: requiredCapabilities,
    scope: ['local-runtime'],
    constraints: ['DRY_RUN only', 'no production writes'],
  };
}

function hostIdentity() {
  return { host_id: 'host-1' };
}

function now() {
  return new Date('2026-09-11T00:05:00.000Z');
}

async function probeWith({ platform = 'win32', tools = {}, workspace = { readable: true, writable: true } } = {}) {
  const probe = createWindowsWorkerHostProbe({
    platform,
    commandProbe: async (tool) => tools[tool] ?? true,
    workspaceProbe: async () => workspace,
  });
  return probe.probe('agentos:windows-worker');
}

test('fully evidenced Windows host advertises bounded PowerShell capabilities', async () => {
  const result = await probeWith();
  assert.deepEqual(result.capabilities, [
    'shell.powershell.system.read',
    'shell.powershell.repo.read',
    'shell.powershell.dev.execute',
  ]);
});

test('remote PowerShell development task is eligible only with matching evidenced host capability', async () => {
  const result = await probeWith();
  const gate = evaluateRemotePickupEligibility({
    admittedTask: admittedTask(['shell.powershell.dev.execute']),
    hostIdentity: hostIdentity(),
    hostCapabilities: result.capabilities,
    now,
  });
  assert.equal(gate.eligible, true);
  assert.equal(gate.disposition, 'ELIGIBLE_FOR_PICKUP');
});

test('missing npm blocks development task before pickup claim', async () => {
  const result = await probeWith({ tools: { 'npm.cmd': false } });
  assert.equal(result.capabilities.includes('shell.powershell.dev.execute'), false);
  const gate = evaluateRemotePickupEligibility({
    admittedTask: admittedTask(['shell.powershell.dev.execute']),
    hostIdentity: hostIdentity(),
    hostCapabilities: result.capabilities,
    now,
  });
  assert.equal(gate.eligible, false);
  assert.equal(gate.disposition, 'HOST_CAPABILITY_MISMATCH');
});

test('read-only system capability can remain available when git/npm are absent', async () => {
  const result = await probeWith({ tools: { 'git.exe': false, 'npm.cmd': false }, workspace: { readable: false, writable: false } });
  assert.deepEqual(result.capabilities, ['shell.powershell.system.read']);
  const gate = evaluateRemotePickupEligibility({
    admittedTask: admittedTask(['shell.powershell.system.read']),
    hostIdentity: hostIdentity(),
    hostCapabilities: result.capabilities,
    now,
  });
  assert.equal(gate.eligible, true);
});

test('non-Windows host advertises no PowerShell capabilities and is blocked', async () => {
  const result = await probeWith({ platform: 'linux' });
  assert.deepEqual(result.capabilities, []);
  const gate = evaluateRemotePickupEligibility({
    admittedTask: admittedTask(['shell.powershell.repo.read']),
    hostIdentity: hostIdentity(),
    hostCapabilities: result.capabilities,
    now,
  });
  assert.equal(gate.eligible, false);
  assert.equal(gate.disposition, 'HOST_CAPABILITY_MISMATCH');
});

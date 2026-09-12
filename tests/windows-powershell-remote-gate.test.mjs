import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultWindowsWorkerHostProbe } from '../runtime/windows-worker-default-host-probe.mjs';
import { evaluateWindowsPowerShellRemotePickup } from '../runtime/windows-powershell-remote-gate.mjs';

function task(hostId, required = ['shell.powershell.dev.execute']) {
  return {
    task_id: 'task-pwsh-1',
    mission_id: 'mission-pwsh-1',
    delivery_id: 'delivery-pwsh-1',
    request_id: 'request-pwsh-1',
    project_id: 'agentos-local',
    target_host_id: hostId,
    admitted_by: 'agentos:overseer',
    authority_admitted: true,
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    required_capabilities: required,
    scope: ['local-runtime'],
    constraints: ['bounded-command-catalogue'],
    created_at: new Date().toISOString(),
  };
}

function evidencedProbe(capabilities) {
  return {
    async probe(agentId) {
      return {
        agent_id: agentId,
        mode: 'DRY_RUN',
        evaluation: { windows: true, eligible: true },
        capabilities,
      };
    },
  };
}

test('evidenced PowerShell host may pass canonical pickup gate but execution stays unwired', async () => {
  const hostIdentity = { host_id: 'host-win-1' };
  const result = await evaluateWindowsPowerShellRemotePickup({
    admittedTask: task(hostIdentity.host_id),
    hostIdentity,
    workspaceRoot: process.cwd(),
    hostProbe: evidencedProbe([
      'shell.powershell.system.read',
      'shell.powershell.repo.read',
      'shell.powershell.dev.execute',
    ]),
  });

  assert.equal(result.pickup_eligible, true);
  assert.equal(result.canonical_gate.disposition, 'ELIGIBLE_FOR_PICKUP');
  assert.equal(result.execution_authorized, false);
  assert.equal(result.disposition, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');
  assert.equal(result.host_capabilities.includes('repository:read'), true);
});

test('missing evidenced capability fails at existing canonical host-capability gate', async () => {
  const hostIdentity = { host_id: 'host-win-2' };
  const result = await evaluateWindowsPowerShellRemotePickup({
    admittedTask: task(hostIdentity.host_id),
    hostIdentity,
    workspaceRoot: process.cwd(),
    hostProbe: evidencedProbe(['shell.powershell.system.read', 'shell.powershell.repo.read']),
  });

  assert.equal(result.pickup_eligible, false);
  assert.equal(result.execution_authorized, false);
  assert.equal(result.disposition, 'HOST_CAPABILITY_MISMATCH');
});

test('authority denial remains ahead of PowerShell execution', async () => {
  const hostIdentity = { host_id: 'host-win-3' };
  const denied = { ...task(hostIdentity.host_id), authority_admitted: false };
  const result = await evaluateWindowsPowerShellRemotePickup({
    admittedTask: denied,
    hostIdentity,
    workspaceRoot: process.cwd(),
    hostProbe: evidencedProbe(['shell.powershell.dev.execute']),
  });

  assert.equal(result.pickup_eligible, false);
  assert.equal(result.execution_authorized, false);
  assert.equal(result.disposition, 'AUTHORITY_NOT_ADMITTED');
});

test('default Windows host probe uses only fixed discovery/version commands and bounded workspace access', async () => {
  const calls = [];
  const access = [];
  const realpaths = [];
  const paths = {
    'powershell.exe': 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
    'git.exe': 'C:\\Program Files\\Git\\cmd\\git.exe',
    'npm.cmd': 'C:\\Program Files\\nodejs\\npm.cmd',
  };
  const versions = {
    [paths['powershell.exe']]: '5.1.26100.33296\n',
    [paths['git.exe']]: 'git version 2.55.0.windows.5\n',
    [paths['npm.cmd']]: '10.9.8\n',
  };
  const probe = createDefaultWindowsWorkerHostProbe({
    workspaceRoot: 'C:\\AgentOS',
    platform: 'win32',
    execFileImpl(command, args, options, callback) {
      calls.push({ command, args: [...args], options: { ...options } });
      if (command === 'where.exe') {
        callback(null, `${paths[args[0]]}\n`, '');
        return;
      }
      callback(null, versions[command] ?? '', '');
    },
    async fsAccess(path, mode) {
      access.push({ path, mode });
    },
    async fsRealpath(path) {
      realpaths.push(path);
      return path;
    },
  });

  const result = await probe.probe('host-win-default');
  assert.equal(result.mode, 'DRY_RUN');
  assert.deepEqual(calls.slice(0, 6).map((call) => call.command), [
    'where.exe', paths['powershell.exe'],
    'where.exe', paths['git.exe'],
    'where.exe', paths['npm.cmd'],
  ]);
  assert.deepEqual(calls.filter((call) => call.command === 'where.exe').map((call) => call.args), [
    ['powershell.exe'], ['git.exe'], ['npm.cmd'],
  ]);
  assert.equal(calls.every((call) => call.options.windowsHide === true && call.options.timeout === 5000), true);
  assert.deepEqual(realpaths, [paths['powershell.exe'], paths['git.exe'], paths['npm.cmd']]);
  assert.equal(access.length, 2);
  assert.equal(result.capabilities.includes('shell.powershell.dev.execute'), true);
  assert.deepEqual(result.evaluation.tool_evidence['powershell.exe'], {
    available: true,
    path: paths['powershell.exe'],
    version: '5.1.26100.33296',
  });
  assert.deepEqual(result.evaluation.tool_evidence['git.exe'], {
    available: true,
    path: paths['git.exe'],
    version: 'git version 2.55.0.windows.5',
  });
  assert.deepEqual(result.evaluation.tool_evidence['npm.cmd'], {
    available: true,
    path: paths['npm.cmd'],
    version: '10.9.8',
  });
});

test('default probe never invokes Windows discovery on a non-Windows host', async () => {
  let invoked = 0;
  const probe = createDefaultWindowsWorkerHostProbe({
    workspaceRoot: process.cwd(),
    platform: 'linux',
    execFileImpl() { invoked += 1; },
    async fsAccess() {},
  });
  const result = await probe.probe('host-linux');
  assert.equal(invoked, 0);
  assert.deepEqual(result.capabilities, []);
  assert.equal(result.evaluation.windows, false);
});

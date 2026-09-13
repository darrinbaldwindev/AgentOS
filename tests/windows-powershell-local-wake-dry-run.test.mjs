import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { loadOrCreateRemoteHostIdentity } from '../runtime/remote-host-identity.mjs';
import { __testOnlyWakeLocal } from '../runtime/local-wake.mjs';

async function makeFixture(t) {
  const root = await fs.mkdtemp(join(tmpdir(), 'agentos-powershell-dry-wake-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  await installLocal({ root });

  const configPath = join(root, 'config.json');
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  await fs.writeFile(configPath, JSON.stringify({
    ...config,
    remoteBridge: {
      enabled: true,
      powerShell: { enabled: true },
    },
  }));

  const host = await loadOrCreateRemoteHostIdentity({ filePath: join(root, 'state', 'remote-host.json') });
  const store = await createLocalPersistence({ filePath: join(root, DEFAULT_CONFIG.stateFile) });
  const task = {
    task_id: 'task-powershell-dry-1',
    mission_id: 'mission-powershell-dry-1',
    delivery_id: 'delivery-powershell-dry-1',
    request_id: 'request-powershell-dry-1',
    wake_trace_id: 'wake-powershell-dry-1',
    project_id: 'agentos-local',
    target_host_id: host.host_id,
    actor_id: 'owner-fixture',
    issuer: 'agentos:overseer',
    admitted_by: 'agentos:overseer',
    target: 'agentos:project-overseer',
    authority_admitted: true,
    environment: 'DRY_RUN',
    pickup_state: 'QUEUED',
    status: 'queued',
    consent_mode: 'PRE_AUTHORIZED',
    authority: { action: 'execute', granted_capabilities: ['shell.powershell.repo.read'] },
    required_capabilities: ['shell.powershell.repo.read'],
    execution: { adapter: 'windows-powershell', operation: 'repo.status', cwd: root },
    scope: ['local-runtime'],
    constraints: ['DRY_RUN only', 'no external side effects', 'no credentials'],
    objective: 'inspect repository status without executing PowerShell',
    priority: 'high',
    acceptance_criteria: ['PowerShell pickup evaluated without process invocation'],
    created_at: new Date().toISOString(),
  };
  await store.create('artifact', { id: task.task_id, artifactType: 'dispatch.task', payload: task });
  return { root, store, task, host };
}

function evidencedWindowsProbe() {
  return {
    async probe(hostId) {
      return {
        host_id: hostId,
        platform: 'win32',
        capabilities: [
          'shell.powershell.system.read',
          'shell.powershell.repo.read',
          'shell.powershell.dev.execute',
        ],
        workspace: { readable: true, writable: true },
        tools: {
          powershell: { available: true },
          git: { available: true },
          npm: { available: true },
        },
      };
    },
  };
}

test('local wake recognizes an evidenced PowerShell delivery but remains fail-closed in DRY_RUN', async (t) => {
  const { root, store, task, host } = await makeFixture(t);
  const result = await __testOnlyWakeLocal({
    root,
    deliveryId: task.delivery_id,
    powerShellHostProbe: evidencedWindowsProbe(),
  });

  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');
  assert.equal(result.executed, false);
  assert.equal(result.task_id, task.task_id);
  assert.equal(result.host_id, host.host_id);
  assert.equal(result.response.mission_id, task.mission_id);
  assert.equal(result.response.wake_trace_id, task.wake_trace_id);
  assert.equal(result.powershell_pickup.pickup_eligible, true);
  assert.equal(result.powershell_pickup.execution_authorized, false);
  assert.equal(result.powershell_pickup.runtime_execution_enabled, false);
  assert.equal(result.powershell_pickup.disposition, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');
  assert.equal(result.powershell_pickup.canonical_gate.eligible, true);

  const artifacts = await store.list('artifact');
  assert.equal(artifacts.some((item) => item.artifactType === 'remote.execution.receipt'), false);
  assert.equal(artifacts.some((item) => item.payload?.status === 'COMPLETED'), false);
  const updatedTask = await store.get('artifact', task.task_id);
  assert.equal(updatedTask.payload.pickup_state, 'BLOCKED');
  assert.equal(updatedTask.payload.pickup_blocker, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');

  const events = await store.list('event');
  const disposition = events.find((event) => event.eventType === 'remote.pickup.disposition');
  assert.ok(disposition);
  assert.equal(disposition.delivery_id, task.delivery_id);
  assert.equal(disposition.executed, false);
  assert.equal(disposition.reason, 'POWERSHELL_RUNTIME_EXECUTION_NOT_WIRED');

  await assert.rejects(
    fs.access(join(root, 'state', 'remote-claims')),
    (error) => error?.code === 'ENOENT',
  );
  await assert.rejects(
    fs.access(join(root, 'state', 'mission-budget.sqlite')),
    (error) => error?.code === 'ENOENT',
  );
});

test('local wake keeps PowerShell disabled when the PowerShell bridge switch is off', async (t) => {
  const { root, store, task } = await makeFixture(t);
  const configPath = join(root, 'config.json');
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  await fs.writeFile(configPath, JSON.stringify({
    ...config,
    remoteBridge: { enabled: true, powerShell: { enabled: false } },
  }));

  const result = await __testOnlyWakeLocal({
    root,
    deliveryId: task.delivery_id,
    powerShellHostProbe: evidencedWindowsProbe(),
  });
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.reason, 'POWERSHELL_PICKUP_DISABLED');
  assert.equal(result.executed, false);
  assert.equal(result.powershell_pickup.pickup_eligible, false);
  assert.equal(result.powershell_pickup.execution_authorized, false);
  assert.equal((await store.list('artifact')).some((item) => item.artifactType === 'remote.execution.receipt'), false);
});

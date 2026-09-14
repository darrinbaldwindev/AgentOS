import test from 'node:test';
import assert from 'node:assert/strict';
import { projectBasicChatReadiness } from '../runtime/basic-chat-readiness-projection.mjs';

test('readiness projection fails closed when no canonical inputs exist', () => {
  const result = projectBasicChatReadiness();
  assert.equal(result.basicChat.state, 'unknown');
  assert.equal(result.localHostLifecycle.state, 'unknown');
  assert.equal(result.windowsHostCapability.state, 'unknown');
  assert.equal(result.physicalWindowsAcceptance.state, 'not_established');
  assert.equal(result.projectFileMutation.state, 'unknown');
  assert.equal(result.projectFileMutation.reason, 'NO_CANONICAL_MUTATION_READINESS_SOURCE');
});

test('Basic Chat availability comes only from the supplied canonical chat snapshot', () => {
  assert.equal(projectBasicChatReadiness({ chatSnapshot: { ready: true, paused: false, stopped: false } }).basicChat.state, 'available');
  assert.equal(projectBasicChatReadiness({ chatSnapshot: { ready: true, paused: true, stopped: false } }).basicChat.state, 'paused');
  assert.equal(projectBasicChatReadiness({ chatSnapshot: { ready: true, paused: false, stopped: true } }).basicChat.state, 'stopped');
});

test('local host lifecycle projects canonical status without becoming readiness', () => {
  const working = projectBasicChatReadiness({
    localHostStatus: {
      schema_version: 1,
      host_id: 'host-a',
      lifecycle_state: 'working',
      reason: 'CORRELATED_IN_FLIGHT_TASK',
      evidence_freshness: 'fresh',
    },
  });
  assert.equal(working.localHostLifecycle.state, 'working');
  assert.equal(working.localHostLifecycle.freshness, 'fresh');
  assert.equal(working.windowsHostCapability.state, 'unknown');
  assert.equal(working.projectFileMutation.state, 'unknown');

  const conflicting = projectBasicChatReadiness({
    localHostStatus: {
      schema_version: 1,
      host_id: 'host-a',
      lifecycle_state: 'idle',
      reason: 'HOST_IDENTITY_CONFLICT',
      evidence_freshness: 'conflicting',
    },
  });
  assert.equal(conflicting.localHostLifecycle.state, 'blocked');
  assert.equal(conflicting.localHostLifecycle.reason, 'HOST_IDENTITY_CONFLICT');

  const malformed = projectBasicChatReadiness({
    localHostStatus: { schema_version: 2, host_id: 'host-a', lifecycle_state: 'idle', evidence_freshness: 'fresh' },
  });
  assert.equal(malformed.localHostLifecycle.state, 'unknown');
  assert.equal(malformed.localHostLifecycle.reason, 'LOCAL_HOST_STATUS_SCHEMA_INVALID');
});

test('Windows host capability requires explicit canonical probe facts instead of asserted eligibility', () => {
  const asserted = projectBasicChatReadiness({
    windowsHostProbe: { evaluation: { windows: true, eligible: true, missingRequired: [] } },
  });
  assert.equal(asserted.windowsHostCapability.state, 'unknown');
  assert.equal(asserted.windowsHostCapability.reason, 'WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED');

  const capable = projectBasicChatReadiness({
    windowsHostProbe: {
      evaluation: {
        windows: true,
        eligible: true,
        tools: { 'powershell.exe': true, 'git.exe': true, 'npm.cmd': true },
        workspace: { readable: true, writable: true },
        missingRequired: [],
      },
    },
  });
  assert.equal(capable.windowsHostCapability.state, 'capable');
  assert.equal(capable.windowsHostCapability.reason, 'WINDOWS_HOST_CAPABILITY_FACTS_CONFIRMED');

  const contradictory = projectBasicChatReadiness({
    windowsHostProbe: {
      evaluation: {
        windows: true,
        eligible: true,
        tools: { 'powershell.exe': true, 'git.exe': false, 'npm.cmd': true },
        workspace: { readable: true, writable: true },
        missingRequired: [],
      },
    },
  });
  assert.equal(contradictory.windowsHostCapability.state, 'unknown');
  assert.equal(contradictory.windowsHostCapability.reason, 'WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED');

  const blocked = projectBasicChatReadiness({
    windowsHostProbe: { evaluation: { windows: true, eligible: false, missingRequired: ['tool.git.exe'] } },
  });
  assert.equal(blocked.windowsHostCapability.state, 'not_capable');
  assert.deepEqual(blocked.windowsHostCapability.missingRequired, ['tool.git.exe']);

  const notWindows = projectBasicChatReadiness({
    windowsHostProbe: { evaluation: { windows: false, eligible: true, missingRequired: [] } },
  });
  assert.equal(notWindows.windowsHostCapability.state, 'not_capable');
});

test('physical Windows acceptance requires canonical supervised PASS evidence bound to the expected exact head', () => {
  const head = 'a'.repeat(40);
  const acceptance = {
    schema: 'agentos.windows-powershell-physical-acceptance.v1',
    exact_head: head,
    platform: 'win32',
    pass: true,
    disposition: 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS',
    local_wake_execution_enabled: false,
    scheduler_execution_enabled: false,
    production_autonomy_enabled: false,
    owner_supervision_required: true,
  };

  const missingExpectedHead = projectBasicChatReadiness({ physicalAcceptance: acceptance });
  assert.equal(missingExpectedHead.physicalWindowsAcceptance.state, 'not_established');
  assert.equal(missingExpectedHead.physicalWindowsAcceptance.reason, 'PHYSICAL_ACCEPTANCE_EXPECTED_HEAD_REQUIRED');

  const stale = projectBasicChatReadiness({
    physicalAcceptance: acceptance,
    expectedExactHead: 'b'.repeat(40),
  });
  assert.equal(stale.physicalWindowsAcceptance.state, 'not_established');
  assert.equal(stale.physicalWindowsAcceptance.reason, 'PHYSICAL_ACCEPTANCE_HEAD_MISMATCH');
  assert.equal(stale.physicalWindowsAcceptance.exactHead, head);

  const pass = projectBasicChatReadiness({ physicalAcceptance: acceptance, expectedExactHead: head });
  assert.equal(pass.physicalWindowsAcceptance.state, 'passed_for_exact_head');
  assert.equal(pass.physicalWindowsAcceptance.exactHead, head);

  const unsafe = projectBasicChatReadiness({
    expectedExactHead: head,
    physicalAcceptance: { ...acceptance, local_wake_execution_enabled: true },
  });
  assert.equal(unsafe.physicalWindowsAcceptance.state, 'not_established');
});

test('lifecycle capability or physical acceptance never upgrades project-file mutation', () => {
  const head = 'b'.repeat(40);
  const result = projectBasicChatReadiness({
    expectedExactHead: head,
    chatSnapshot: { ready: true, paused: false, stopped: false },
    localHostStatus: {
      schema_version: 1,
      host_id: 'host-a',
      lifecycle_state: 'idle',
      reason: 'FRESH_HOST_EVIDENCE_WITH_NO_ACTIVE_TASK',
      evidence_freshness: 'fresh',
    },
    windowsHostProbe: {
      evaluation: {
        windows: true,
        eligible: true,
        tools: { 'powershell.exe': true, 'git.exe': true, 'npm.cmd': true },
        workspace: { readable: true, writable: true },
        missingRequired: [],
      },
    },
    physicalAcceptance: {
      schema: 'agentos.windows-powershell-physical-acceptance.v1',
      exact_head: head,
      platform: 'win32',
      pass: true,
      disposition: 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS',
      local_wake_execution_enabled: false,
      scheduler_execution_enabled: false,
      production_autonomy_enabled: false,
      owner_supervision_required: true,
    },
  });
  assert.equal(result.basicChat.state, 'available');
  assert.equal(result.localHostLifecycle.state, 'idle');
  assert.equal(result.windowsHostCapability.state, 'capable');
  assert.equal(result.physicalWindowsAcceptance.state, 'passed_for_exact_head');
  assert.equal(result.projectFileMutation.state, 'unknown');
  assert.equal(result.projectFileMutation.reason, 'NO_CANONICAL_MUTATION_READINESS_SOURCE');
});

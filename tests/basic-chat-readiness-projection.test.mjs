import test from 'node:test';
import assert from 'node:assert/strict';
import { projectBasicChatReadiness } from '../runtime/basic-chat-readiness-projection.mjs';

test('readiness projection fails closed when no canonical inputs exist', () => {
  const result = projectBasicChatReadiness();
  assert.equal(result.basicChat.state, 'unknown');
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

test('Windows host capability fails closed on asserted eligibility without canonical evidence', () => {
  const asserted = projectBasicChatReadiness({
    windowsHostProbe: { evaluation: { windows: true, eligible: true, missingRequired: [] } },
  });
  assert.equal(asserted.windowsHostCapability.state, 'unknown');
  assert.equal(asserted.windowsHostCapability.reason, 'WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED');

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

test('physical Windows acceptance requires canonical exact-head supervised PASS evidence', () => {
  const pass = projectBasicChatReadiness({
    physicalAcceptance: {
      schema: 'agentos.windows-powershell-physical-acceptance.v1',
      exact_head: 'a'.repeat(40),
      platform: 'win32',
      pass: true,
      disposition: 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS',
      local_wake_execution_enabled: false,
      scheduler_execution_enabled: false,
      production_autonomy_enabled: false,
      owner_supervision_required: true,
    },
  });
  assert.equal(pass.physicalWindowsAcceptance.state, 'passed_for_exact_head');
  assert.equal(pass.physicalWindowsAcceptance.exactHead, 'a'.repeat(40));

  const unsafe = projectBasicChatReadiness({
    physicalAcceptance: {
      schema: 'agentos.windows-powershell-physical-acceptance.v1',
      exact_head: 'a'.repeat(40),
      platform: 'win32',
      pass: true,
      disposition: 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS',
      local_wake_execution_enabled: true,
      scheduler_execution_enabled: false,
      production_autonomy_enabled: false,
      owner_supervision_required: true,
    },
  });
  assert.equal(unsafe.physicalWindowsAcceptance.state, 'not_established');
});

test('capability or physical acceptance never upgrades project-file mutation', () => {
  const result = projectBasicChatReadiness({
    chatSnapshot: { ready: true, paused: false, stopped: false },
    windowsHostProbe: { evaluation: { windows: true, eligible: true, missingRequired: [] } },
    physicalAcceptance: {
      schema: 'agentos.windows-powershell-physical-acceptance.v1',
      exact_head: 'b'.repeat(40),
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
  assert.equal(result.windowsHostCapability.state, 'unknown');
  assert.equal(result.windowsHostCapability.reason, 'WINDOWS_CAPABILITY_CANONICAL_EVIDENCE_REQUIRED');
  assert.equal(result.physicalWindowsAcceptance.state, 'passed_for_exact_head');
  assert.equal(result.projectFileMutation.state, 'unknown');
});

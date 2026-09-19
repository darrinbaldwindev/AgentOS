import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsFamilySafetyProbe } from '../runtime/windows-family-safety-probe.mjs';

const NOW = new Date('2026-09-19T08:00:00.000Z');
const COMPLETE_FIREWALL = Object.freeze([
  { Name: 'Domain', Enabled: true },
  { Name: 'Private', Enabled: true },
  { Name: 'Public', Enabled: true },
]);
const DEFENDER_OK = Object.freeze({ RealTimeProtectionEnabled: true, AntivirusEnabled: true });
const RDP_DENIED = Object.freeze({ DenyConnections: true, ServiceStatus: 'Stopped' });
const RDP_ENABLED = Object.freeze({ DenyConnections: false, ServiceStatus: 'Running' });

function executorFor(outputs) {
  const calls = [];
  return {
    calls,
    async run(request) {
      calls.push(request);
      const next = outputs.shift();
      if (next instanceof Error) throw next;
      return next;
    },
  };
}

test('uses only fixed read-only noninteractive PowerShell requests for all Windows checks', async () => {
  const executor = executorFor([
    { exitCode: 0, stdout: JSON.stringify(COMPLETE_FIREWALL) },
    { exitCode: 0, stdout: JSON.stringify(DEFENDER_OK) },
    { exitCode: 0, stdout: 'false' },
    { exitCode: 0, stdout: JSON.stringify(RDP_DENIED) },
  ]);
  const findings = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspect();
  assert.deepEqual(findings.map((f) => f.state), ['VERIFIED', 'VERIFIED', 'VERIFIED', 'VERIFIED']);
  assert.equal(executor.calls.length, 4);
  for (const call of executor.calls) {
    assert.equal(call.file, 'powershell.exe');
    assert.equal(call.readOnly, true);
    assert.deepEqual(call.args.slice(0, 3), ['-NoLogo', '-NoProfile', '-NonInteractive']);
    assert.equal(call.args[3], '-Command');
    assert.equal(typeof call.args[4], 'string');
    assert.ok(call.args[4].length > 0);
  }
});

test('complete firewall set with disabled profile needs attention', async () => {
  const executor = executorFor([{
    exitCode: 0,
    stdout: JSON.stringify([
      { Name: 'Domain', Enabled: true },
      { Name: 'Private', Enabled: true },
      { Name: 'Public', Enabled: false },
    ]),
  }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall();
  assert.equal(finding.state, 'NEEDS_ATTENTION');
  assert.match(finding.detail, /Public/);
});

test('omitted firewall profile is UNKNOWN rather than false VERIFIED', async () => {
  const executor = executorFor([{
    exitCode: 0,
    stdout: JSON.stringify([
      { Name: 'Domain', Enabled: true },
      { Name: 'Private', Enabled: true },
    ]),
  }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall()).state, 'UNKNOWN');
});

test('duplicate firewall profile is UNKNOWN', async () => {
  const executor = executorFor([{
    exitCode: 0,
    stdout: JSON.stringify([
      { Name: 'Domain', Enabled: true },
      { Name: 'Private', Enabled: true },
      { Name: 'Private', Enabled: true },
    ]),
  }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall()).state, 'UNKNOWN');
});

test('unexpected firewall profile is UNKNOWN', async () => {
  const executor = executorFor([{
    exitCode: 0,
    stdout: JSON.stringify([
      { Name: 'Domain', Enabled: true },
      { Name: 'Private', Enabled: true },
      { Name: 'Custom', Enabled: true },
    ]),
  }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall()).state, 'UNKNOWN');
});

test('malformed firewall profile fields are UNKNOWN', async () => {
  const executor = executorFor([{
    exitCode: 0,
    stdout: JSON.stringify([
      { Name: 'Domain', Enabled: true },
      { Name: 'Private', Enabled: true },
      { Name: '', Enabled: true },
    ]),
  }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall()).state, 'UNKNOWN');
});

test('Defender fully enabled is VERIFIED', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify(DEFENDER_OK) }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender()).state, 'VERIFIED');
});

test('Defender disabled or passive-like state is UNKNOWN until provider context exists', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: false, AntivirusEnabled: true }) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender();
  assert.equal(finding.state, 'UNKNOWN');
  assert.match(finding.detail, /provider and running-mode context required/i);
});

test('non-admin effective session token is VERIFIED for the narrow session proposition', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: 'false' }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectSessionAdminToken();
  assert.equal(finding.state, 'VERIFIED');
  assert.match(finding.detail, /does not present an effective administrator token/i);
});

test('effective administrator session token needs attention', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: 'true' }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectSessionAdminToken();
  assert.equal(finding.state, 'NEEDS_ATTENTION');
  assert.match(finding.detail, /effective administrator token/i);
});

test('malformed administrator-token output is UNKNOWN', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ IsAdministrator: false }) }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectSessionAdminToken()).state, 'UNKNOWN');
});

test('RDP denied with TermService stopped is VERIFIED for the narrow configuration proposition', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify(RDP_DENIED) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectRdpConfiguration();
  assert.equal(finding.state, 'VERIFIED');
  assert.match(finding.detail, /configured denied/i);
});

test('RDP enabled with TermService running needs attention', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify(RDP_ENABLED) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectRdpConfiguration();
  assert.equal(finding.state, 'NEEDS_ATTENTION');
  assert.match(finding.detail, /configured allowed/i);
});

test('contradictory RDP flag and service evidence is UNKNOWN', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ DenyConnections: true, ServiceStatus: 'Running' }) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectRdpConfiguration();
  assert.equal(finding.state, 'UNKNOWN');
  assert.match(finding.detail, /partial or contradictory/i);
});

test('malformed RDP output is UNKNOWN', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ DenyConnections: true }) }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectRdpConfiguration()).state, 'UNKNOWN');
});

test('command failure becomes UNKNOWN rather than pass', async () => {
  const executor = executorFor([{ exitCode: 1, stdout: '' }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall()).state, 'UNKNOWN');
});

test('malformed and incomplete output becomes UNKNOWN', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: '{bad' }, { exitCode: 0, stdout: '{}' }]);
  const probe = createWindowsFamilySafetyProbe({ executor, clock: () => NOW });
  assert.equal((await probe.inspectFirewall()).state, 'UNKNOWN');
  assert.equal((await probe.inspectDefender()).state, 'UNKNOWN');
});

test('summary uses the existing Family Safety evidence contract and never permits a global safe claim', async () => {
  const executor = executorFor([
    { exitCode: 0, stdout: JSON.stringify(COMPLETE_FIREWALL) },
    { exitCode: 0, stdout: JSON.stringify(DEFENDER_OK) },
    { exitCode: 0, stdout: 'false' },
    { exitCode: 0, stdout: JSON.stringify(RDP_DENIED) },
  ]);
  const summary = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectSummary();
  assert.equal(summary.overallStatus, 'CHECKS_PASSED');
  assert.deepEqual(summary.verifiedCheckIds, [
    'windows-firewall',
    'windows-defender',
    'windows-session-admin-token',
    'windows-rdp-configuration',
  ]);
  assert.equal(summary.safeClaimPermitted, false);
});

test('UNKNOWN child finding keeps composed summary UNKNOWN', async () => {
  const executor = executorFor([
    { exitCode: 0, stdout: JSON.stringify(COMPLETE_FIREWALL) },
    { exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: false, AntivirusEnabled: true }) },
    { exitCode: 0, stdout: 'false' },
    { exitCode: 0, stdout: JSON.stringify(RDP_DENIED) },
  ]);
  const summary = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectSummary();
  assert.equal(summary.overallStatus, 'UNKNOWN');
  assert.deepEqual(summary.unknownCheckIds, ['windows-defender']);
  assert.equal(summary.safeClaimPermitted, false);
});

test('NEEDS_ATTENTION child finding produces parent action required', async () => {
  const executor = executorFor([
    { exitCode: 0, stdout: JSON.stringify(COMPLETE_FIREWALL) },
    { exitCode: 0, stdout: JSON.stringify(DEFENDER_OK) },
    { exitCode: 0, stdout: 'true' },
    { exitCode: 0, stdout: JSON.stringify(RDP_DENIED) },
  ]);
  const summary = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectSummary();
  assert.equal(summary.overallStatus, 'PARENT_ACTION_REQUIRED');
  assert.deepEqual(summary.needsAttentionCheckIds, ['windows-session-admin-token']);
  assert.equal(summary.safeClaimPermitted, false);
});

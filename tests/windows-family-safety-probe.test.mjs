import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsFamilySafetyProbe } from '../runtime/windows-family-safety-probe.mjs';

const NOW = new Date('2026-09-19T08:00:00.000Z');
const COMPLETE_FIREWALL = Object.freeze([
  { Name: 'Domain', Enabled: true },
  { Name: 'Private', Enabled: true },
  { Name: 'Public', Enabled: true },
]);

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

test('uses only fixed read-only noninteractive PowerShell requests', async () => {
  const executor = executorFor([
    { exitCode: 0, stdout: JSON.stringify(COMPLETE_FIREWALL) },
    { exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: true, AntivirusEnabled: true }) },
  ]);
  const findings = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspect();
  assert.deepEqual(findings.map((f) => f.state), ['VERIFIED', 'VERIFIED']);
  for (const call of executor.calls) {
    assert.equal(call.file, 'powershell.exe');
    assert.equal(call.readOnly, true);
    assert.deepEqual(call.args.slice(0, 3), ['-NoLogo', '-NoProfile', '-NonInteractive']);
    assert.equal(call.args[3], '-Command');
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
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: true, AntivirusEnabled: true }) }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender()).state, 'VERIFIED');
});

test('Defender disabled or passive-like state is UNKNOWN until provider context exists', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: false, AntivirusEnabled: true }) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender();
  assert.equal(finding.state, 'UNKNOWN');
  assert.match(finding.detail, /provider and running-mode context required/i);
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

import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsFamilySafetyProbe } from '../runtime/windows-family-safety-probe.mjs';

const NOW = new Date('2026-09-19T08:00:00.000Z');
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
    { exitCode: 0, stdout: JSON.stringify([{ Name: 'Domain', Enabled: true }, { Name: 'Private', Enabled: true }, { Name: 'Public', Enabled: true }]) },
    { exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: true, AntivirusEnabled: true }) },
  ]);
  const probe = createWindowsFamilySafetyProbe({ executor, clock: () => NOW });
  const findings = await probe.inspect();
  assert.deepEqual(findings.map((f) => f.state), ['VERIFIED', 'VERIFIED']);
  assert.equal(executor.calls.length, 2);
  for (const call of executor.calls) {
    assert.equal(call.file, 'powershell.exe');
    assert.equal(call.readOnly, true);
    assert.deepEqual(call.args.slice(0, 3), ['-NoLogo', '-NoProfile', '-NonInteractive']);
    assert.equal(call.args[3], '-Command');
    assert.equal(call.timeoutMs, 8000);
  }
});

test('disabled firewall profile needs attention', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify([{ Name: 'Domain', Enabled: true }, { Name: 'Public', Enabled: false }]) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall();
  assert.equal(finding.state, 'NEEDS_ATTENTION');
  assert.match(finding.detail, /Public/);
});

test('disabled Defender protection needs attention', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: false, AntivirusEnabled: true }) }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender();
  assert.equal(finding.state, 'NEEDS_ATTENTION');
});

test('command failure becomes UNKNOWN rather than pass', async () => {
  const executor = executorFor([{ exitCode: 1, stdout: '' }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall();
  assert.equal(finding.state, 'UNKNOWN');
});

test('malformed output becomes UNKNOWN rather than pass', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: '{bad' }]);
  const finding = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender();
  assert.equal(finding.state, 'UNKNOWN');
});

test('empty or structurally incomplete output becomes UNKNOWN', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: '[]' }, { exitCode: 0, stdout: '{}' }]);
  const probe = createWindowsFamilySafetyProbe({ executor, clock: () => NOW });
  assert.equal((await probe.inspectFirewall()).state, 'UNKNOWN');
  assert.equal((await probe.inspectDefender()).state, 'UNKNOWN');
});

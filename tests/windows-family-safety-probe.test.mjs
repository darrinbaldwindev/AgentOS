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
  const findings = await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspect();
  assert.deepEqual(findings.map((f) => f.state), ['VERIFIED', 'VERIFIED']);
  for (const call of executor.calls) {
    assert.equal(call.file, 'powershell.exe');
    assert.equal(call.readOnly, true);
    assert.deepEqual(call.args.slice(0, 3), ['-NoLogo', '-NoProfile', '-NonInteractive']);
    assert.equal(call.args[3], '-Command');
  }
});

test('disabled firewall profile needs attention', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify([{ Name: 'Public', Enabled: false }]) }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectFirewall()).state, 'NEEDS_ATTENTION');
});

test('disabled Defender protection needs attention', async () => {
  const executor = executorFor([{ exitCode: 0, stdout: JSON.stringify({ RealTimeProtectionEnabled: false, AntivirusEnabled: true }) }]);
  assert.equal((await createWindowsFamilySafetyProbe({ executor, clock: () => NOW }).inspectDefender()).state, 'NEEDS_ATTENTION');
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

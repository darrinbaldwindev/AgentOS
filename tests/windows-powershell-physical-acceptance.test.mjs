import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PHYSICAL_ACCEPTANCE_READ_OPERATIONS,
  runWindowsPowerShellPhysicalAcceptance,
} from '../runtime/windows-powershell-physical-acceptance.mjs';

const HEAD = '0123456789abcdef0123456789abcdef01234567';

function adapterFactory({ calls, failOperation = null } = {}) {
  return () => ({
    describe(operation) {
      return {
        operation,
        capability: operation === 'test.run' ? 'shell.powershell.dev.execute' : 'shell.powershell.repo.read',
        elevated: false,
        interactive: false,
      };
    },
    async execute({ operation, cwd, expectedExecutables }) {
      calls?.push({ operation, cwd, expectedExecutables });
      const success = operation !== failOperation;
      return {
        operation,
        cwd,
        elevated: false,
        interactive: false,
        success,
        exit_code: success ? 0 : 1,
        timed_out: false,
        truncated: false,
        stdout: success ? 'ok' : '',
        stderr: success ? '' : 'failed',
        resolved_executables: {},
      };
    },
  });
}

async function expectCode(fn, code) {
  await assert.rejects(fn, (error) => error?.code === code);
}

test('physical acceptance refuses non-Windows hosts before adapter creation', async () => {
  let created = 0;
  await expectCode(() => runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, acknowledgePhysicalRun: true, platform: 'linux',
    adapterFactory() { created += 1; return {}; },
  }), 'PHYSICAL_ACCEPTANCE_WINDOWS_REQUIRED');
  assert.equal(created, 0);
});

test('physical acceptance requires explicit owner acknowledgement', async () => {
  await expectCode(() => runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, platform: 'win32',
  }), 'PHYSICAL_ACCEPTANCE_OWNER_ACK_REQUIRED');
});

test('physical acceptance requires exact immutable head and clean tracked tree', async () => {
  await expectCode(() => runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: 'not-a-sha', acknowledgePhysicalRun: true, platform: 'win32',
    headResolver: async () => HEAD,
  }), 'PHYSICAL_ACCEPTANCE_EXACT_HEAD_REQUIRED');

  await expectCode(() => runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, acknowledgePhysicalRun: true, platform: 'win32',
    headResolver: async () => 'fedcba9876543210fedcba9876543210fedcba98',
  }), 'PHYSICAL_ACCEPTANCE_HEAD_MISMATCH');

  await expectCode(() => runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, acknowledgePhysicalRun: true, platform: 'win32',
    headResolver: async () => HEAD,
    dirtyResolver: async () => true,
  }), 'PHYSICAL_ACCEPTANCE_TRACKED_TREE_DIRTY');
});

test('read-only supervised acceptance runs only the fixed initial acceptance catalogue', async () => {
  const calls = [];
  const evidence = await runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, acknowledgePhysicalRun: true, platform: 'win32',
    headResolver: async () => HEAD,
    dirtyResolver: async () => false,
    adapterFactory: adapterFactory({ calls }),
    now: (() => {
      const values = [new Date('2026-09-13T08:00:00.000Z'), new Date('2026-09-13T08:00:03.000Z')];
      return () => values.shift();
    })(),
  });

  assert.deepEqual(calls.map((entry) => entry.operation), [...PHYSICAL_ACCEPTANCE_READ_OPERATIONS]);
  assert.equal(evidence.pass, true);
  assert.equal(evidence.disposition, 'PHYSICAL_POWERSHELL_ACCEPTANCE_PASS');
  assert.equal(evidence.include_dev_execution, false);
  assert.equal(evidence.local_wake_execution_enabled, false);
  assert.equal(evidence.scheduler_execution_enabled, false);
  assert.equal(evidence.production_autonomy_enabled, false);
  assert.equal(evidence.owner_supervision_required, true);
});

test('development execution requires a second explicit acknowledgement', async () => {
  await expectCode(() => runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, acknowledgePhysicalRun: true, includeDevExecution: true, platform: 'win32',
    headResolver: async () => HEAD,
    dirtyResolver: async () => false,
  }), 'PHYSICAL_ACCEPTANCE_DEV_ACK_REQUIRED');
});

test('explicit dev acceptance adds only test.run and preserves failure evidence', async () => {
  const calls = [];
  const evidence = await runWindowsPowerShellPhysicalAcceptance({
    root: '.', expectedHead: HEAD, acknowledgePhysicalRun: true,
    includeDevExecution: true, acknowledgeDevExecution: true, platform: 'win32',
    headResolver: async () => HEAD,
    dirtyResolver: async () => false,
    adapterFactory: adapterFactory({ calls, failOperation: 'test.run' }),
    now: (() => {
      const values = [new Date('2026-09-13T08:00:00.000Z'), new Date('2026-09-13T08:00:05.000Z')];
      return () => values.shift();
    })(),
  });

  assert.deepEqual(calls.map((entry) => entry.operation), [...PHYSICAL_ACCEPTANCE_READ_OPERATIONS, 'test.run']);
  assert.equal(evidence.pass, false);
  assert.equal(evidence.disposition, 'PHYSICAL_POWERSHELL_ACCEPTANCE_FAIL');
  assert.equal(evidence.results.at(-1).operation, 'test.run');
  assert.equal(evidence.results.at(-1).result.success, false);
});

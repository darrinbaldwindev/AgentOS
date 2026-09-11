import test from 'node:test';
import assert from 'node:assert/strict';
import { createWindowsWorkerHostProbe } from '../runtime/windows-worker-host-probe.mjs';

function makeProbe({ platform = 'win32', tools = {}, workspace = { readable: true, writable: true } } = {}) {
  return createWindowsWorkerHostProbe({
    platform,
    commandProbe: async (tool) => tools[tool] ?? true,
    workspaceProbe: async () => workspace,
  });
}

test('eligible only when Windows, required tools, and workspace evidence all pass', async () => {
  const result = await makeProbe().probe('agentos:overseer');
  assert.equal(result.mode, 'DRY_RUN');
  assert.equal(result.evaluation.eligible, true);
  assert.deepEqual(result.evaluation.missingRequired, []);
  assert.equal(result.evaluation.tools['powershell.exe'], true);
});

test('non-Windows platform fails closed', async () => {
  const result = await makeProbe({ platform: 'linux' }).probe('agentos:overseer');
  assert.equal(result.evaluation.eligible, false);
  assert.equal(result.evaluation.missingRequired.includes('platform.win32'), true);
});

test('missing PowerShell fails closed', async () => {
  const result = await makeProbe({ tools: { 'powershell.exe': false } }).probe('agentos:overseer');
  assert.equal(result.evaluation.eligible, false);
  assert.equal(result.evaluation.missingRequired.includes('tool.powershell.exe'), true);
});

test('missing git or npm fails closed for development-worker eligibility', async () => {
  const gitMissing = await makeProbe({ tools: { 'git.exe': false } }).probe('agentos:overseer');
  const npmMissing = await makeProbe({ tools: { 'npm.cmd': false } }).probe('agentos:overseer');
  assert.equal(gitMissing.evaluation.eligible, false);
  assert.equal(npmMissing.evaluation.eligible, false);
});

test('workspace read/write evidence is mandatory', async () => {
  const readDenied = await makeProbe({ workspace: { readable: false, writable: true } }).probe('agentos:overseer');
  const writeDenied = await makeProbe({ workspace: { readable: true, writable: false } }).probe('agentos:overseer');
  assert.equal(readDenied.evaluation.missingRequired.includes('workspace.read'), true);
  assert.equal(writeDenied.evaluation.missingRequired.includes('workspace.write'), true);
});

test('probe exceptions become missing capability instead of optimistic eligibility', async () => {
  const probe = createWindowsWorkerHostProbe({
    platform: 'win32',
    commandProbe: async (tool) => {
      if (tool === 'git.exe') throw new Error('probe failed');
      return true;
    },
    workspaceProbe: async () => { throw new Error('workspace probe failed'); },
  });
  const result = await probe.probe('agentos:overseer');
  assert.equal(result.evaluation.eligible, false);
  assert.equal(result.evaluation.tools['git.exe'], false);
  assert.equal(result.evaluation.missingRequired.includes('workspace.read'), true);
  assert.equal(result.evaluation.missingRequired.includes('workspace.write'), true);
});

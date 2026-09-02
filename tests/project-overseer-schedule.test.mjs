import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.join(here, '..', '.github', 'workflows', 'project-overseer-wake.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');

function countExact(line) {
  return workflow.split('\n').filter((entry) => entry === line).length;
}

test('Project Overseer wake schedule is hourly but avoids the top-of-hour load peak', () => {
  assert.match(workflow, /schedule:\n    - cron: '17 \* \* \* \*'/);
  assert.doesNotMatch(workflow, /schedule:\n    - cron: '0 \* \* \* \*'/);
  assert.equal((workflow.match(/\n    - cron: '[^']+'\n/g) ?? []).length, 1);
  assert.equal(countExact('  workflow_dispatch:'), 1);
  assert.equal(countExact('  pull_request:'), 1);
  assert.equal(countExact('  push:'), 1);
  assert.equal(countExact('    branches: [main]'), 2);
});

test('Project Overseer wake remains serialized and fail-visible', () => {
  assert.equal(countExact('  group: project-overseer-wake'), 1);
  assert.equal(countExact('  cancel-in-progress: false'), 1);
  assert.equal(countExact('    timeout-minutes: 10'), 1);
  assert.equal(countExact('  contents: read'), 1);
});

test('Project Overseer wake verifies the complete deterministic gate', () => {
  const requiredTests = [
    'tests/project-overseer-schedule.test.mjs',
    'tests/local-cycle.test.mjs',
    'tests/github-wake.test.mjs',
    'tests/github-wake-lease.test.mjs',
    'tests/lease.test.mjs',
    'tests/project-overseer-response-validator.test.mjs',
    'tests/persistence.test.mjs',
    'tests/shared-reference-persistence.test.mjs',
  ];
  for (const testPath of requiredTests) assert.match(workflow, new RegExp(testPath.replaceAll('.', '\\.') + '\\b'));
});

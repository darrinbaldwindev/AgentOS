import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const validator = path.resolve('scripts/validate_tier2_3_status.mjs');
const fixture = path.resolve('schemas/tier2_3_examples/green-eligible.json');

const valid = execFileSync(process.execPath, [validator, fixture], { encoding: 'utf8' });
const parsed = JSON.parse(valid);
assert.equal(parsed.valid, true);
assert.equal(parsed.gates, 5);
assert.equal(parsed.evidence_suites, 7);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agentos-tier23-'));
const blocked = JSON.parse(fs.readFileSync(fixture, 'utf8'));
blocked.green_eligible = true;
blocked.gates.G2.status = 'BLOCKED';
blocked.gates.G2.blocking_reasons = ['TEST_NOT_EXECUTED'];
blocked.tests.T2.status = 'BLOCKED';
blocked.tests.T2.passed = false;
blocked.tests.T2.blocking_reasons = ['TEST_NOT_EXECUTED'];
const blockedFile = path.join(dir, 'blocked.json');
fs.writeFileSync(blockedFile, JSON.stringify(blocked));
assert.throws(() => execFileSync(process.execPath, [validator, blockedFile], { encoding: 'utf8', stdio: 'pipe' }));

const mismatch = JSON.parse(fs.readFileSync(fixture, 'utf8'));
mismatch.tests.T3.parent_gate = 'G2';
const mismatchFile = path.join(dir, 'mismatch.json');
fs.writeFileSync(mismatchFile, JSON.stringify(mismatch));
assert.throws(() => execFileSync(process.execPath, [validator, mismatchFile], { encoding: 'utf8', stdio: 'pipe' }));

console.log('Tier 2.3 status validator contract tests passed');

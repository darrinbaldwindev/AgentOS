#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/validate_tier2_3_status.mjs <status.json>');
  process.exit(2);
}

const value = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const statuses = new Set(['PENDING','RUNNING','PASS','FAIL','BLOCKED','SKIPPED','VERIFIED','REJECTED']);
const gates = {
  G1: ['T1'], G2: ['T2'], G3: ['T3'], G4: ['T4'], G5: ['T5','T6','T7']
};

function check(cond, msg) { if (!cond) errors.push(msg); }
function sha(v) { return v === null || (typeof v === 'string' && /^[0-9a-fA-F]{40}$/.test(v)); }

check(value?.schema === 'agentos.tier2_3.status', 'schema must be agentos.tier2_3.status');
check(value?.schema_version === '1.1', 'schema_version must be 1.1');
check(value?.tier === '2.3', 'tier must be 2.3');
check(statuses.has(value?.overall_status), 'invalid overall_status');
check(sha(value?.current_commit), 'current_commit must be a 40-character SHA or null');
check(sha(value?.last_verified_commit), 'last_verified_commit must be a 40-character SHA or null');

for (const [gateId, requiredTests] of Object.entries(gates)) {
  const g = value?.gates?.[gateId];
  check(!!g, `${gateId} is required`);
  if (!g) continue;
  check(g.gate_id === gateId, `${gateId}.gate_id mismatch`);
  check(Array.isArray(g.required_evidence) && JSON.stringify(g.required_evidence) === JSON.stringify(requiredTests), `${gateId}.required_evidence mismatch`);
  check(statuses.has(g.status), `${gateId}.status invalid`);
  if (g.status === 'BLOCKED') check(g.blocking_reasons?.length > 0, `${gateId}: BLOCKED requires blocking_reasons`);
  if (g.status === 'PASS') check((g.blocking_reasons?.length ?? 0) === 0, `${gateId}: PASS cannot have blocking_reasons`);
}

for (const [testId, gateId] of Object.entries({T1:'G1',T2:'G2',T3:'G3',T4:'G4',T5:'G5',T6:'G5',T7:'G5'})) {
  const t = value?.tests?.[testId];
  check(!!t, `${testId} is required`);
  if (!t) continue;
  check(t.test_id === testId, `${testId}.test_id mismatch`);
  check(t.parent_gate === gateId, `${testId}.parent_gate must be ${gateId}`);
  check(statuses.has(t.status), `${testId}.status invalid`);
  if (t.status === 'PASS') {
    check(t.executed === true, `${testId}: PASS requires executed=true`);
    check(t.passed === true, `${testId}: PASS requires passed=true`);
    check((t.failures?.length ?? 0) === 0, `${testId}: PASS cannot contain failures`);
    check((t.blocking_reasons?.length ?? 0) === 0, `${testId}: PASS cannot contain blocking_reasons`);
  }
  if (t.status === 'FAIL') check(t.executed === true && t.passed === false, `${testId}: FAIL requires executed=true and passed=false`);
  if (t.status === 'BLOCKED') check((t.blocking_reasons?.length ?? 0) > 0 && t.passed === false, `${testId}: BLOCKED requires reason and passed=false`);
  if (t.status === 'SKIPPED') check(t.passed === false, `${testId}: SKIPPED cannot be passed`);
}

const gateValues = Object.values(value.gates ?? {}).map(g => g?.status);
const testValues = Object.values(value.tests ?? {}).map(t => t?.status);
const allPassing = gateValues.length === 5 && testValues.length === 7 &&
  gateValues.every(s => s === 'PASS' || s === 'VERIFIED') &&
  testValues.every(s => s === 'PASS' || s === 'VERIFIED');
if (value.green_eligible === true) check(allPassing, 'green_eligible=true requires all five gates and seven tests to PASS/VERIFIED');
if (value.green_eligible === false) check(value.overall_status !== 'VERIFIED', 'green_eligible=false cannot have overall_status=VERIFIED');

if (errors.length) {
  console.error(JSON.stringify({ valid:false, errors }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ valid:true, green_eligible:value.green_eligible, gates:5, evidence_suites:7 }, null, 2));

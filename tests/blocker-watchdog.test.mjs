import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectControlLoopSchedules,
  planAuthorizedScheduleRepairs,
  applyAuthorizedScheduleRepairs,
} from '../runtime/blocker-watchdog.mjs';

function healthy() {
  return [
    { id: 'a1', stage: 'A', minute: 0, enabled: true },
    { id: 'b1', stage: 'B', minute: 20, enabled: true },
    { id: 'c1', stage: 'C', minute: 40, enabled: true },
  ];
}

test('healthy A/B/C registry is green', () => {
  const result = inspectControlLoopSchedules({ schedules: healthy() });
  assert.equal(result.disposition, 'green');
  assert.equal(result.healthy, true);
  assert.equal(result.findings.length, 0);
  assert.equal(result.read_only, true);
});

test('regression: A=true, B=false, C=true is detected as critical blocker', () => {
  const schedules = healthy();
  schedules[1] = { ...schedules[1], enabled: false };
  const result = inspectControlLoopSchedules({ schedules });
  assert.equal(result.disposition, 'red');
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].type, 'REQUIRED_SCHEDULE_DISABLED');
  assert.equal(result.findings[0].stage, 'B');
  assert.equal(result.findings[0].schedule_id, 'b1');
  assert.equal(result.findings[0].self_repairable, true);
});

test('missing required stage fails closed and is not auto-created', () => {
  const schedules = healthy().filter((item) => item.stage !== 'B');
  const result = inspectControlLoopSchedules({ schedules });
  assert.equal(result.disposition, 'red');
  assert.equal(result.findings[0].type, 'REQUIRED_SCHEDULE_MISSING');
  assert.equal(result.findings[0].self_repairable, false);
  assert.deepEqual(planAuthorizedScheduleRepairs({ inspection: result }), []);
});

test('duplicate active stage fails closed rather than choosing one', () => {
  const schedules = [...healthy(), { id: 'b2', stage: 'B', minute: 20, enabled: true }];
  const result = inspectControlLoopSchedules({ schedules });
  const finding = result.findings.find((item) => item.stage === 'B');
  assert.equal(finding.type, 'COMPETING_ACTIVE_SCHEDULES');
  assert.equal(finding.self_repairable, false);
});

test('wrong cadence is detected without autonomous cadence mutation', () => {
  const schedules = healthy();
  schedules[2] = { ...schedules[2], minute: 41 };
  const result = inspectControlLoopSchedules({ schedules });
  assert.equal(result.disposition, 'yellow');
  assert.equal(result.findings[0].type, 'WRONG_SCHEDULE_CADENCE');
  assert.equal(result.findings[0].self_repairable, false);
});

test('only a uniquely disabled required schedule produces an enable repair', () => {
  const schedules = healthy();
  schedules[1] = { ...schedules[1], enabled: false };
  const inspection = inspectControlLoopSchedules({ schedules });
  const actions = planAuthorizedScheduleRepairs({ inspection });
  assert.deepEqual(actions, [{ action: 'ENABLE_SCHEDULE', stage: 'B', schedule_id: 'b1', reason: 'required canonical control-loop schedule is disabled' }]);
});

test('authorized repair re-reads live state and requires independent recheck', async () => {
  const state = new Map([['b1', { id: 'b1', enabled: false }]]);
  const adapter = {
    async setEnabled(id, enabled) {
      state.set(id, { ...state.get(id), enabled });
    },
    async read(id) {
      return state.get(id);
    },
  };
  const results = await applyAuthorizedScheduleRepairs({
    actions: [{ action: 'ENABLE_SCHEDULE', stage: 'B', schedule_id: 'b1' }],
    adapter,
  });
  assert.equal(results[0].status, 'repaired_verified');
  assert.equal(results[0].requires_independent_recheck, true);
  assert.equal(state.get('b1').enabled, true);
});

test('failed repair is bounded and escalatable instead of looping forever', async () => {
  let calls = 0;
  const adapter = {
    async setEnabled() { calls += 1; throw new Error('transport unavailable'); },
    async read() { return { enabled: false }; },
  };
  const results = await applyAuthorizedScheduleRepairs({
    actions: [{ action: 'ENABLE_SCHEDULE', stage: 'B', schedule_id: 'b1' }],
    adapter,
    maxAttempts: 2,
  });
  assert.equal(calls, 2);
  assert.equal(results[0].status, 'repair_failed');
  assert.equal(results[0].attempts, 2);
  assert.match(results[0].error, /transport unavailable/);
  assert.equal(results[0].requires_independent_recheck, true);
});

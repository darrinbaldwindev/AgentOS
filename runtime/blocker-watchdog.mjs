const REQUIRED_STAGES = Object.freeze([
  Object.freeze({ stage: 'A', minute: 0 }),
  Object.freeze({ stage: 'B', minute: 20 }),
  Object.freeze({ stage: 'C', minute: 40 }),
]);

function requireArray(value, field) {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an array`);
  return value;
}

function normalizeStage(value) {
  const stage = String(value ?? '').trim().toUpperCase();
  return ['A', 'B', 'C'].includes(stage) ? stage : null;
}

function normalizeMinute(value) {
  const minute = Number(value);
  return Number.isInteger(minute) && minute >= 0 && minute <= 59 ? minute : null;
}

function snapshotByStage(schedules) {
  const map = new Map();
  for (const schedule of schedules) {
    const stage = normalizeStage(schedule?.stage);
    if (!stage) continue;
    const list = map.get(stage) ?? [];
    list.push(schedule);
    map.set(stage, list);
  }
  return map;
}

export function inspectControlLoopSchedules({ schedules = [], expected = REQUIRED_STAGES } = {}) {
  requireArray(schedules, 'schedules');
  requireArray(expected, 'expected');
  const byStage = snapshotByStage(schedules);
  const findings = [];

  for (const requirement of expected) {
    const stage = normalizeStage(requirement?.stage);
    const minute = normalizeMinute(requirement?.minute);
    if (!stage || minute === null) throw new TypeError('expected schedule requires valid stage and minute');
    const candidates = byStage.get(stage) ?? [];
    const active = candidates.filter((item) => item?.enabled === true);

    if (candidates.length === 0) {
      findings.push({ type: 'REQUIRED_SCHEDULE_MISSING', stage, expected_minute: minute, severity: 'critical', self_repairable: false });
      continue;
    }
    if (active.length === 0) {
      const repairCandidate = candidates.length === 1 ? candidates[0] : null;
      findings.push({
        type: 'REQUIRED_SCHEDULE_DISABLED',
        stage,
        expected_minute: minute,
        severity: 'critical',
        self_repairable: Boolean(repairCandidate?.id),
        schedule_id: repairCandidate?.id ?? null,
      });
      continue;
    }
    if (active.length > 1) {
      findings.push({
        type: 'COMPETING_ACTIVE_SCHEDULES',
        stage,
        expected_minute: minute,
        severity: 'critical',
        self_repairable: false,
        schedule_ids: active.map((item) => item.id).filter(Boolean),
      });
      continue;
    }

    const live = active[0];
    const liveMinute = normalizeMinute(live.minute);
    if (liveMinute !== minute) {
      findings.push({
        type: 'WRONG_SCHEDULE_CADENCE',
        stage,
        expected_minute: minute,
        actual_minute: liveMinute,
        severity: 'warning',
        self_repairable: false,
        schedule_id: live.id ?? null,
      });
    }
  }

  const disposition = findings.some((item) => item.severity === 'critical') ? 'red' : findings.length ? 'yellow' : 'green';
  return Object.freeze({
    disposition,
    healthy: findings.length === 0,
    findings: Object.freeze(findings.map((item) => Object.freeze(item))),
    required_stages: Object.freeze(expected.map((item) => Object.freeze({ stage: normalizeStage(item.stage), minute: normalizeMinute(item.minute) }))),
    read_only: true,
  });
}

export function planAuthorizedScheduleRepairs({ inspection } = {}) {
  if (!inspection || !Array.isArray(inspection.findings)) throw new TypeError('inspection is required');
  const actions = inspection.findings
    .filter((finding) => finding.type === 'REQUIRED_SCHEDULE_DISABLED' && finding.self_repairable === true && finding.schedule_id)
    .map((finding) => Object.freeze({
      action: 'ENABLE_SCHEDULE',
      stage: finding.stage,
      schedule_id: finding.schedule_id,
      reason: 'required canonical control-loop schedule is disabled',
    }));
  return Object.freeze(actions);
}

export async function applyAuthorizedScheduleRepairs({ actions = [], adapter, maxAttempts = 1 } = {}) {
  requireArray(actions, 'actions');
  if (!adapter || typeof adapter.setEnabled !== 'function' || typeof adapter.read !== 'function') {
    throw new TypeError('adapter with setEnabled/read is required');
  }
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 2) throw new TypeError('maxAttempts must be 1 or 2');

  const results = [];
  for (const action of actions) {
    if (action?.action !== 'ENABLE_SCHEDULE' || !action.schedule_id) {
      results.push(Object.freeze({ status: 'skipped', reason: 'unsupported_action', action }));
      continue;
    }

    let verified = false;
    let attempts = 0;
    let error = null;
    while (!verified && attempts < maxAttempts) {
      attempts += 1;
      try {
        await adapter.setEnabled(action.schedule_id, true);
        const live = await adapter.read(action.schedule_id);
        verified = live?.enabled === true;
        if (!verified) error = 'post-repair verification failed';
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
      }
    }

    results.push(Object.freeze({
      status: verified ? 'repaired_verified' : 'repair_failed',
      schedule_id: action.schedule_id,
      stage: action.stage,
      attempts,
      error: verified ? null : error ?? 'unknown repair failure',
      requires_independent_recheck: true,
    }));
  }
  return Object.freeze(results);
}

export const CANONICAL_CONTROL_LOOP = REQUIRED_STAGES;

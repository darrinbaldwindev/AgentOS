import assert from 'node:assert/strict';
import test from 'node:test';
import { createGreenAgent } from '../runtime/green-agent.mjs';

function makePersistence() {
  const records = new Map([['artifact', new Map()], ['event', new Map()]]);
  let sequence = 0;
  return {
    async create(type, input) {
      const id = `${type}_${++sequence}`;
      const entity = Object.freeze({ id, ...input });
      records.get(type).set(id, entity);
      return entity;
    },
    async list(type) { return [...records.get(type).values()]; },
    async update(type, id, patch) {
      const next = Object.freeze({ ...records.get(type).get(id), ...patch });
      records.get(type).set(id, next);
      return next;
    },
  };
}

const evidence = [{ type: 'test', source: 'fixture/portfolio-scan', status: 'verified', details: 'reproducible' }];

function finding(overrides = {}) {
  return {
    finding_id: 'F-001',
    scan_id: 'S-001',
    project: 'GlobalShopCo',
    state: 'red',
    severity: 'critical',
    confidence: 'high',
    evidence_refs: evidence,
    root_cause: 'fixture drift',
    recommended_action: 'reconcile fixture',
    expected_benefit: 'restore evidence continuity',
    risk_of_action: 'low',
    required_authority: 'owner',
    auto_taskable: true,
    ...overrides,
  };
}

test('Green Agent produces ranked evidence-backed report and authority-limited task handoff', async () => {
  const persistence = makePersistence();
  const tasks = [];
  const agent = createGreenAgent({
    persistence,
    scan: async ({ scanId }) => ({ scan_id: scanId, findings: [finding(), finding({ finding_id: 'F-002', severity: 'warning', confidence: 'medium', state: 'yellow', auto_taskable: false })] }),
    createTask: async (input) => { tasks.push(input); return { task_id: 'TASK-001' }; },
    rescan: async () => ({ findingPresent: false, evidence: { status: 'verified', source: 'independent-rescan' } }),
  });
  const outcome = await agent.runScan({ scanId: 'S-001', scope: 'fixture' });
  assert.equal(outcome.report.status, 'red');
  assert.equal(outcome.report.findings[0].finding_id, 'F-001');
  assert.equal(outcome.report.findings[0].rank > outcome.report.findings[1].rank, true);
  assert.deepEqual(outcome.handoffs, [{ findingId: 'F-001', taskId: 'TASK-001' }]);
  assert.deepEqual(tasks[0].authority.granted_capabilities, []);
  assert.equal(tasks[0].authority.execution_authority, false);
  assert.deepEqual((await persistence.list('event')).map((event) => event.eventType), ['green.scan.completed', 'green.finding.created', 'green.task.handoff', 'green.finding.created']);
});

test('Green Agent preserves historical findings and correlates duplicate observations', async () => {
  const persistence = makePersistence();
  const agent = createGreenAgent({
    persistence,
    scan: async ({ scanId }) => ({ scan_id: scanId, findings: [finding({ scan_id: scanId, auto_taskable: false })] }),
    createTask: async () => ({ task_id: 'unused' }),
    rescan: async () => ({ findingPresent: true, evidence: { status: 'verified', source: 'independent-rescan' } }),
  });
  await agent.runScan({ scanId: 'S-001' });
  await agent.runScan({ scanId: 'S-002' });
  const findings = (await persistence.list('artifact')).filter((item) => item.kind === 'green-finding');
  assert.equal(findings.length, 2);
  assert.equal(findings[0].current, false);
  assert.equal(findings[1].current, true);
  assert.equal(findings[1].supersedes, findings[0].id);
});

test('Green Agent requires independent verified evidence to close and never self-confirms', async () => {
  const persistence = makePersistence();
  let rescans = 0;
  const agent = createGreenAgent({
    persistence,
    scan: async ({ scanId }) => ({ scan_id: scanId, findings: [finding({ scan_id: scanId, auto_taskable: false })] }),
    createTask: async () => ({ task_id: 'unused' }),
    rescan: async () => { rescans += 1; return { findingPresent: false, evidence: { status: 'verified', source: 'independent-rescan' } }; },
  });
  await agent.runScan({ scanId: 'S-001' });
  await assert.rejects(() => agent.closeAfterRescan({ findingKey: 'GlobalShopCo:F-001', taskId: 'TASK-001', resultEvidence: { status: 'unverified' } }), /verified worker result evidence/);
  const closed = await agent.closeAfterRescan({ findingKey: 'GlobalShopCo:F-001', taskId: 'TASK-001', resultEvidence: { status: 'verified', source: 'worker-ledger' } });
  assert.equal(closed.status, 'closed');
  assert.equal(rescans, 1);
});

test('Green Agent rejects empty evidence and unsupported scan findings', async () => {
  const persistence = makePersistence();
  const agent = createGreenAgent({
    persistence,
    scan: async ({ scanId }) => ({ scan_id: scanId, findings: [finding({ scan_id: scanId, evidence_refs: [] })] }),
    createTask: async () => ({ task_id: 'unused' }),
    rescan: async () => ({ findingPresent: false, evidence: { status: 'verified', source: 'independent-rescan' } }),
  });
  await assert.rejects(() => agent.runScan({ scanId: 'S-001' }), /evidence_refs must be non-empty/);
});

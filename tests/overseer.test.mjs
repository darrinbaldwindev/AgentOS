import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createOverseer } from '../runtime/overseer.mjs';

const store = createStateStore();
const workspace = store.create('workspace', { id: 'workspace_overseer', name: 'Overseer' });
const agent = store.create('agent', { id: 'agent_overseer', workspaceId: workspace.id, name: 'Overseer Test' });
const run = store.create('run', { id: 'run_overseer', workspaceId: workspace.id, agentId: agent.id, status: 'completed' });
store.create('event', { id: 'event_provider_failed', runId: run.id, eventType: 'provider.failed', providerId: 'provider.a', diagnosticCode: 'LIMIT' });
store.create('event', { id: 'event_recovered', runId: run.id, eventType: 'run.recovered', providerId: 'provider.b' });

const overseer = createOverseer({ store });
const report = overseer.auditRun(run.id);
assert.equal(report.audit.severity, 'warning');
assert.equal(report.audit.findings[0].code, 'PROVIDER_FAILURE_RECOVERED');
assert.equal(report.audit.findings[0].severity, 'warning');
assert.equal(report.audit.observedEventCount, 2);
assert.equal(store.get('artifact', report.changeLogId).kind, 'overseer-recommendation');
assert.equal(store.get('artifact', report.changeLogId).ownerActionRequired, true);
assert.equal(store.list('event').at(-1).eventType, 'overseer.audit.completed');

const healthyStore = createStateStore();
const healthyWorkspace = healthyStore.create('workspace', { id: 'workspace_healthy', name: 'Healthy' });
const healthyAgent = healthyStore.create('agent', { id: 'agent_healthy', workspaceId: healthyWorkspace.id, name: 'Healthy Agent' });
const healthyRun = healthyStore.create('run', { id: 'run_healthy', workspaceId: healthyWorkspace.id, agentId: healthyAgent.id, status: 'running' });
const healthyReport = createOverseer({ store: healthyStore }).auditRun(healthyRun.id);
assert.equal(healthyReport.audit.severity, 'info');
assert.equal(healthyReport.audit.findings[0].code, 'RUN_HEALTHY');
assert.equal(healthyStore.get('artifact', healthyReport.changeLogId).ownerActionRequired, false);

console.log('CORE-001 Overseer audit tests passed');

import { createStateStore } from '../runtime/core-state.mjs';
import { createMockProvider } from '../runtime/mock-provider.mjs';
import { createProviderRegistry } from '../runtime/provider-registry.mjs';
import { createRecoveryController } from '../runtime/recovery-handoff.mjs';
import { createToolRegistry } from '../runtime/tool-registry.mjs';
import { executeAgentLoop } from '../runtime/agent-loop.mjs';
import { createOverseer } from '../runtime/overseer.mjs';
import { inspectRun } from '../runtime/run-inspector.mjs';

export async function runLocalDeterministicDemo() {
  const store = createStateStore();
  const workspace = store.create('workspace', {
    id: 'demo_workspace',
    name: 'Local deterministic demo',
  });
  const agent = store.create('agent', {
    id: 'demo_agent',
    workspaceId: workspace.id,
    name: 'Local Demo Agent',
  });
  const providers = createProviderRegistry([
    { ...createMockProvider({ fail: true }), id: 'demo_provider_primary' },
    { ...createMockProvider({ response: 'fallback-completed' }), id: 'demo_provider_fallback' },
  ]);
  const recovery = createRecoveryController({ store, providers });
  const tools = createToolRegistry([
    {
      name: 'checkpoint',
      description: 'Creates a deterministic local checkpoint',
      execute: async ({ label }) => ({ checkpoint: label }),
    },
  ]);

  const planResult = await executeAgentLoop({
    runtime: {
      run: async ({ workspaceId, agentId, mission }) => recovery.executeWithRecovery({
        workspaceId,
        agentId,
        mission,
        providerIds: ['demo_provider_primary', 'demo_provider_fallback'],
      }),
    },
    toolRegistry: tools,
    mission: 'bounded-local-demo',
    plan: {
      steps: [
        { kind: 'tool', name: 'checkpoint', input: { label: 'demo-start' } },
        {
          kind: 'provider',
          input: {
            workspaceId: workspace.id,
            agentId: agent.id,
            mission: 'bounded-local-demo',
          },
        },
      ],
    },
  });

  const run = store.list('run')[0];
  const audit = createOverseer({ store }).auditRun(run.id);
  const inspection = inspectRun({ store, runId: run.id });

  return Object.freeze({
    schemaVersion: 1,
    mode: 'deterministic-local-mock',
    verified: planResult.verified,
    stepCount: planResult.stepCount,
    checkpointCreated: planResult.results[0].checkpoint === 'demo-start',
    recovery: Object.freeze({
      completed: inspection.run.status === 'completed',
      recovered: inspection.run.recovered,
      finalProviderId: planResult.results[1].providerId,
    }),
    eventTypes: inspection.eventTypes,
    overseer: Object.freeze({
      severity: audit.audit.severity,
      findingCodes: Object.freeze(audit.audit.findings.map((finding) => finding.code)),
      ownerActionRequired: inspection.overseer.ownerActionRequired,
    }),
  });
}

export function formatLocalDeterministicDemo(summary) {
  if (!summary || summary.mode !== 'deterministic-local-mock') {
    throw new TypeError('a local deterministic demo summary is required');
  }
  return JSON.stringify(summary, null, 2);
}

async function main() {
  const summary = await runLocalDeterministicDemo();
  console.log(formatLocalDeterministicDemo(summary));
}

if (process.argv[1] && process.argv[1].endsWith('demo-local-mission.mjs')) {
  await main();
}

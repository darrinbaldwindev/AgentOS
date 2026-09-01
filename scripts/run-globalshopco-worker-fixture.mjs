import fs from 'node:fs/promises';
import { pollDispatch } from '../src/dispatch/poll.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';
import { createDeterministicSkillAgent } from '../src/workers/deterministic-skill-agent.mjs';

const taskPath = '.agentos/dispatch/tasks/GSCO-TEST-003.json';
const task = JSON.parse(await fs.readFile(taskPath, 'utf8'));
const receiver = task.target;
const writes = [];
const store = {
  async writeTask(value) {
    writes.push(structuredClone(value));
    return { written: true, sha: `fixture-${writes.length}` };
  },
};

const authorityPolicy = createAuthorityPolicy({
  issuers: ['agentos:overseer'],
  capabilities: ['repository_read', 'documentation'],
});

const worker = createDeterministicSkillAgent({
  id: receiver,
  capabilities: ['repository_read', 'documentation', 'deterministic_validation'],
  handler: async (input) => {
    const content = await fs.readFile('docs/RUNTIME_SHELL.md', 'utf8');
    return {
      task_id: input.task_id,
      responder: receiver,
      status: 'completed',
      result: 'read docs/RUNTIME_SHELL.md',
      evidence: {
        file: 'docs/RUNTIME_SHELL.md',
        bytes: Buffer.byteLength(content, 'utf8'),
        nonEmpty: content.length > 0,
      },
      next_action: 'return evidence to Project Overseer',
      created_at: new Date().toISOString(),
    };
  },
});

const result = await pollDispatch({
  tasks: [task],
  receiver,
  authorityPolicy,
  store,
  execute: async (currentTask) => worker.execute(currentTask),
});

if (!result.completed || result.completed.status !== 'completed') {
  throw new Error(`fixture transaction did not complete: ${task.task_id}`);
}

const evidence = result.completed.evidence;
if (evidence?.workerId !== receiver || evidence?.output?.task_id !== task.task_id) {
  throw new Error(`fixture response correlation failed: ${task.task_id}`);
}

console.log(JSON.stringify({
  transaction_id: task.task_id,
  worker: receiver,
  capability: task.authority.granted_capabilities,
  issuer: task.issuer,
  target: task.target,
  transport: 'github-actions-workflow-local-runner',
  execution_host: 'GitHub Actions ubuntu-latest',
  runtime_entrypoint: 'src/dispatch/poll.mjs',
  request: task.objective,
  response: evidence,
  lifecycle: writes.map((entry) => entry.status),
  result: 'COMPLETED',
  production_impact: 'NONE',
}, null, 2));

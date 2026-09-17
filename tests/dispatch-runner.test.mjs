import test from 'node:test';
import assert from 'node:assert/strict';
import { runNextTask } from '../src/dispatch/runner.mjs';
import { createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const policy = createAuthorityPolicy({ issuers: ['GPTChat Overseer'], capabilities: ['tests'] });
const task = {
  task_id: 'runner-001', mission_id: 'mission:runner-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Execute one autonomous task', priority: 'critical', scope: ['tests'], constraints: [],
  acceptance_criteria: ['executor result is persisted'], authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

function storeFrom(log) {
  return { writeTask: async value => { log.push(structuredClone(value)); return { written: true }; } };
}

test('runner claims, executes, verifies and completes one task', async () => {
  const writes = [];
  const completed = await runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async current => ({ task: current.task_id, ok: true }),
  });
  assert.equal(completed.status, 'completed');
  assert.equal(completed.evidence.ok, true);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'completed']);
});

test('runner chains exact persistence sha across every successful state transition', async () => {
  const writes = [];
  const expectedShas = [];
  let writeCount = 0;
  const store = {
    writeTask: async (value, expectedSha) => {
      writes.push(structuredClone(value));
      expectedShas.push(expectedSha);
      writeCount += 1;
      return { written: true, sha: `durable-${writeCount}` };
    },
  };
  const seededTask = { ...task, dispatch_sha: 'dispatch-seed' };

  const completed = await runNextTask({
    tasks: [seededTask], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async current => ({ task: current.task_id, ok: true }),
  });

  assert.equal(completed.status, 'completed');
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'completed']);
  assert.deepEqual(expectedShas, ['dispatch-seed', 'durable-1', 'durable-2', 'durable-3']);
  assert.equal(writes.every(x => x.task_id === task.task_id), true);
  assert.equal(writes.every(x => x.mission_id === task.mission_id), true);
});

test('runner escalates execution failures', async () => {
  const writes = [];
  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async () => { throw new Error('executor failed'); },
  }), /executor failed/);
  assert.equal(writes.at(-1).status, 'escalated');
  assert.equal(writes.at(-1).error.message, 'executor failed');
});

test('runner never executes when the claimed-state write fails', async () => {
  const writes = [];
  let executions = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      return { written: false, error: 'claim persistence unavailable' };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async () => { executions += 1; return { ok: true }; },
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, task.task_id);
    assert.equal(error.outcome.mission_id, task.mission_id);
    return true;
  });

  assert.equal(executions, 0);
  assert.deepEqual(writes.map(x => x.status), ['claimed']);
  assert.equal(writes[0].task_id, task.task_id);
  assert.equal(writes[0].mission_id, task.mission_id);
});

test('runner cannot execute when working-state persistence fails and preserves exact correlation', async () => {
  const writes = [];
  let executions = 0;
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 2) return { written: false, error: 'working persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async () => { executions += 1; return { ok: true }; },
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, task.task_id);
    assert.equal(error.outcome.mission_id, task.mission_id);
    return true;
  });

  assert.equal(executions, 0);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /persistence failure: runner-001/);
});

test('runner preserves the working persistence failure when escalation persistence also fails', async () => {
  const writes = [];
  let executions = 0;
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 2) return { written: false, error: 'working persistence unavailable' };
      if (writeCount === 3) return { written: false, error: 'escalation persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async () => { executions += 1; return { ok: true }; },
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, task.task_id);
    assert.equal(error.outcome.mission_id, task.mission_id);
    assert.match(error.persistenceError.message, /persistence failure: runner-001/);
    assert.equal(error.persistenceOutcome.task_id, task.task_id);
    assert.equal(error.persistenceOutcome.mission_id, task.mission_id);
    return true;
  });

  assert.equal(executions, 0);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes[1].task_id, task.task_id);
  assert.equal(writes[1].mission_id, task.mission_id);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /persistence failure: runner-001/);
  assert.equal(writes.some(x => x.status === 'verification' || x.status === 'completed'), false);
});

test('runner cannot report completion when verification-state persistence fails', async () => {
  const writes = [];
  let executions = 0;
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 3) return { written: false, error: 'verification persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async current => { executions += 1; return { task: current.task_id, ok: true }; },
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, 'runner-001');
    assert.equal(error.outcome.mission_id, task.mission_id);
    return true;
  });

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'escalated']);
  assert.equal(writes.at(-1).task_id, 'runner-001');
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /persistence failure: runner-001/);
  assert.equal(writes.some(x => x.status === 'completed'), false);
});

test('runner preserves the original failure and exact correlation when escalation persistence also fails', async () => {
  const writes = [];
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 3) return { written: false, error: 'verification persistence unavailable' };
      if (writeCount === 4) return { written: false, error: 'escalation persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async current => ({ task: current.task_id, ok: true }),
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, task.task_id);
    assert.equal(error.outcome.mission_id, task.mission_id);
    assert.match(error.persistenceError.message, /persistence failure: runner-001/);
    assert.equal(error.persistenceOutcome.task_id, task.task_id);
    assert.equal(error.persistenceOutcome.mission_id, task.mission_id);
    return true;
  });

  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /persistence failure: runner-001/);
  assert.equal(writes.some(x => x.status === 'completed'), false);
});

test('runner cannot return success when the completed-state write fails', async () => {
  const writes = [];
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 4) return { written: false, error: 'completion persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async current => ({ task: current.task_id, ok: true }),
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, 'runner-001');
    assert.equal(error.outcome.mission_id, task.mission_id);
    return true;
  });

  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'completed', 'escalated']);
  assert.equal(writes[3].task_id, 'runner-001');
  assert.equal(writes[3].mission_id, task.mission_id);
  assert.equal(writes[3].evidence.task, 'runner-001');
  assert.equal(writes.at(-1).task_id, 'runner-001');
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /persistence failure: runner-001/);
});

test('runner preserves completion persistence failure when escalation persistence also fails', async () => {
  const writes = [];
  let executions = 0;
  let writeCount = 0;
  const store = {
    writeTask: async value => {
      writes.push(structuredClone(value));
      writeCount += 1;
      if (writeCount === 4) return { written: false, error: 'completion persistence unavailable' };
      if (writeCount === 5) return { written: false, error: 'escalation persistence unavailable' };
      return { written: true, sha: `write-${writeCount}` };
    },
  };

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy, store,
    execute: async current => { executions += 1; return { task: current.task_id, ok: true }; },
  }), error => {
    assert.match(error.message, /persistence failure: runner-001/);
    assert.equal(error.outcome.task_id, task.task_id);
    assert.equal(error.outcome.mission_id, task.mission_id);
    assert.match(error.persistenceError.message, /persistence failure: runner-001/);
    assert.equal(error.persistenceOutcome.task_id, task.task_id);
    assert.equal(error.persistenceOutcome.mission_id, task.mission_id);
    return true;
  });

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'verification', 'completed', 'escalated']);
  assert.equal(writes[3].task_id, task.task_id);
  assert.equal(writes[3].mission_id, task.mission_id);
  assert.equal(writes[3].evidence.task, task.task_id);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /persistence failure: runner-001/);
});

test('runner rejects conflicting executor task correlation before verification or completion', async () => {
  const writes = [];
  let executions = 0;

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async () => {
      executions += 1;
      return { task: 'runner-other', ok: true };
    },
  }), /executor result task correlation mismatch: runner-001/);

  assert.equal(executions, 1);
  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /task correlation mismatch/);
  assert.equal(writes.some(x => x.status === 'verification' || x.status === 'completed'), false);
});

test('runner rejects conflicting executor mission correlation before verification or completion', async () => {
  const writes = [];

  await assert.rejects(() => runNextTask({
    tasks: [task], receiver: 'AgentOS Overseer Project', authorityPolicy: policy,
    store: storeFrom(writes), execute: async current => ({ task: current.task_id, mission_id: 'mission:other', ok: true }),
  }), /executor result mission correlation mismatch: mission:runner-001/);

  assert.deepEqual(writes.map(x => x.status), ['claimed', 'working', 'escalated']);
  assert.equal(writes.at(-1).task_id, task.task_id);
  assert.equal(writes.at(-1).mission_id, task.mission_id);
  assert.match(writes.at(-1).error.message, /mission correlation mismatch/);
  assert.equal(writes.some(x => x.status === 'verification' || x.status === 'completed'), false);
});

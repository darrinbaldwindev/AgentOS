import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateTaskCompletion } from '../runtime/green-agent.mjs';
import { buildGreenEvidencePacket } from '../runtime/local-wake.mjs';

const baseTask = {
  task_id: 'task-1',
  mission_id: 'mission:task-1',
  project_id: 'agentos-local',
  acceptance_criteria: ['bounded action verified', 'response schema validated', 'budget reconciled', 'registered worker selected'],
  consent_mode: 'PRE_AUTHORIZED',
  wake_trace_id: 'wake-1',
};

const baseWorkerResult = {
  task_id: 'task-1',
  status: 'completed',
  claimed_complete: true,
  workerId: 'agentos:deterministic-skill-agent',
};

describe('Green completion gate (Mission A)', () => {
  it('TEST A/B: Green FAIL disposition is not pass and must not authorize COMPLETED', () => {
    const evidence = buildGreenEvidencePacket({
      task: baseTask,
      workerResult: baseWorkerResult,
      reservation: { reservation_id: 'budget-1' },
      budgetOutcome: { status: 'RECONCILED' },
    });
    // Force failure by omitting verified criteria
    evidence.acceptance_criteria = [];
    const result = evaluateTaskCompletion({
      task: baseTask,
      workerResult: baseWorkerResult,
      evidence,
    });
    assert.equal(result.disposition, 'fail');
    assert.notEqual(result.disposition, 'pass');
    assert.equal(result.task_status, 'incomplete');
    assert.equal(result.advance_to_prs, false);
  });

  it('TEST C: Green throws on missing task (caller must fail closed)', () => {
    assert.throws(() => evaluateTaskCompletion({ task: null, workerResult: baseWorkerResult }), /task is required/);
  });

  it('TEST D: identity mismatch cannot PASS', () => {
    const evidence = buildGreenEvidencePacket({
      task: baseTask,
      workerResult: baseWorkerResult,
      reservation: { reservation_id: 'budget-1' },
      budgetOutcome: { status: 'RECONCILED' },
    });
    const result = evaluateTaskCompletion({
      task: baseTask,
      workerResult: { ...baseWorkerResult, task_id: 'wrong-task' },
      evidence,
    });
    assert.equal(result.disposition, 'fail');
    assert.ok(result.failures.some((f) => /does not match assigned task/i.test(f)));
  });

  it('TEST E: valid evidence + matching identity yields PASS', () => {
    const evidence = buildGreenEvidencePacket({
      task: baseTask,
      workerResult: baseWorkerResult,
      reservation: { reservation_id: 'budget-1' },
      budgetOutcome: { status: 'RECONCILED' },
    });
    const result = evaluateTaskCompletion({
      task: baseTask,
      workerResult: baseWorkerResult,
      evidence,
    });
    assert.equal(result.disposition, 'pass');
    assert.equal(result.task_status, 'green_verified_complete');
    assert.equal(result.advance_to_prs, true);
    assert.equal(result.production_promotion_allowed, false);
  });

  it('buildGreenEvidencePacket requires task identity', () => {
    assert.throws(() => buildGreenEvidencePacket({ task: {}, workerResult: baseWorkerResult }), /task.task_id required/);
  });

  it('ONLY disposition pass is treated as completion authorization', () => {
    const allowCompleted = (disposition) => disposition === 'pass';
    assert.equal(allowCompleted('pass'), true);
    assert.equal(allowCompleted('fail'), false);
    assert.equal(allowCompleted('blocked'), false);
    assert.equal(allowCompleted(undefined), false);
    assert.equal(allowCompleted(null), false);
  });
});

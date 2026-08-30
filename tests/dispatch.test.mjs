import test from 'node:test';
import assert from 'node:assert/strict';
import { claimTask, transitionTask, validateDispatchTask } from '../src/dispatch/dispatch.mjs';

const task = {
  task_id: 'test-001', mission_id: 'mission:test-001', issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project',
  objective: 'Validate dispatch lifecycle', priority: 'high', scope: ['tests'], constraints: ['no destructive changes'],
  acceptance_criteria: ['lifecycle validates'], authority: { granted_capabilities: ['tests'] }, status: 'queued',
};

test('valid dispatch task can be validated and claimed once', () => {
  assert.equal(validateDispatchTask(task, { issuer: 'GPTChat Overseer', target: 'AgentOS Overseer Project' }), true);
  const claimed = claimTask(task, 'AgentOS Overseer Project');
  assert.equal(claimed.status, 'claimed');
  assert.throws(() => transitionTask(claimed, 'claimed'), /invalid transition/);
});

test('issuer and target mismatches are rejected', () => {
  assert.throws(() => validateDispatchTask(task, { issuer: 'Other Agent', target: 'AgentOS Overseer Project' }), /issuer mismatch/);
  assert.throws(() => validateDispatchTask(task, { issuer: 'GPTChat Overseer', target: 'Other Agent' }), /target mismatch/);
});

test('completion requires evidence', () => {
  const working = { ...task, status: 'working' };
  const verification = transitionTask(working, 'verification');
  assert.throws(() => transitionTask(verification, 'completed'), /completion requires evidence/);
  const completed = transitionTask(verification, 'completed', { tests: 'passed' });
  assert.equal(completed.status, 'completed');
  assert.deepEqual(completed.evidence, { tests: 'passed' });
});

test('blocked and escalated are explicit outcomes', () => {
  const claimed = { ...task, status: 'claimed' };
  assert.equal(transitionTask(claimed, 'blocked').status, 'blocked');
  assert.equal(transitionTask(claimed, 'escalated').status, 'escalated');
});

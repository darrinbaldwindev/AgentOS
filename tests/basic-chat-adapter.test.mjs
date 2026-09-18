import test from 'node:test';
import assert from 'node:assert/strict';
import { createStateStore } from '../runtime/core-state.mjs';
import { createPersistenceBridge } from '../runtime/persistence-bridge.mjs';
import { createBasicChatAdapter } from '../runtime/basic-chat-adapter.mjs';

test('basic chat submits through the existing task pipeline and persists both sides of the turn', async () => {
  const persistence = createPersistenceBridge(createStateStore());
  const calls = [];
  const session = {
    async send(input) {
      calls.push(input);
      return { result: { runId: 'run:chat:1', output: 'bounded response' } };
    },
  };
  let tick = 0;
  const chat = createBasicChatAdapter({ persistence, session, now: () => `2026-09-07T03:00:0${tick++}.000Z` });

  const result = await chat.sendMessage({
    threadId: 'thread:test',
    projectId: 'agentos-local',
    text: '  continue safely  ',
    requirements: { reasoning: true },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].missionId, 'mission:thread:test');
  assert.equal(calls[0].message, 'continue safely');
  assert.deepEqual(calls[0].task.requirements, {
    reasoning: true,
    projectId: 'agentos-local',
    interface: 'basic',
  });
  assert.equal(calls[0].task.freePreferred, true);
  assert.equal(calls[0].task.source, 'overseer-user-chat');
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.text, 'bounded response');
  assert.equal(result.runId, 'run:chat:1');

  const history = await chat.history({ threadId: 'thread:test' });
  assert.equal(history.length, 2);
  assert.equal(history[0].role, 'user');
  assert.equal(history[0].text, 'continue safely');
  assert.equal(history[1].role, 'agentos');
  assert.equal(history[1].text, 'bounded response');
  assert.equal(history[1].runId, 'run:chat:1');

  const events = await persistence.list('event');
  assert.equal(events.some((event) => event.eventType === 'basic-chat.turn.completed'), true);
});

test('basic chat records a failed turn without fabricating completion', async () => {
  const persistence = createPersistenceBridge(createStateStore());
  const session = {
    async send() {
      const error = new Error('NO_SUITABLE_MODEL');
      error.code = 'NO_SUITABLE_MODEL';
      throw error;
    },
  };
  const chat = createBasicChatAdapter({ persistence, session, now: () => '2026-09-07T03:10:00.000Z' });

  await assert.rejects(
    () => chat.sendMessage({ text: 'test failure boundary' }),
    (error) => error?.code === 'NO_SUITABLE_MODEL',
  );

  const history = await chat.history();
  assert.equal(history.length, 1);
  assert.equal(history[0].role, 'user');

  const events = await persistence.list('event');
  const failed = events.find((event) => event.eventType === 'basic-chat.message.failed');
  assert.equal(failed.errorCode, 'NO_SUITABLE_MODEL');
});

test('basic chat rejects blank input before dispatch', async () => {
  const persistence = createPersistenceBridge(createStateStore());
  let sent = false;
  const session = { async send() { sent = true; } };
  const chat = createBasicChatAdapter({ persistence, session });

  await assert.rejects(() => chat.sendMessage({ text: '   ' }), /text is required/);
  assert.equal(sent, false);
});

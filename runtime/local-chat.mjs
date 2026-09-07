import { readFile, open } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createLocalPersistence } from './local-persistence.mjs';
import { createBasicChatAdapter } from './basic-chat-adapter.mjs';
import { wakeLocal } from './local-wake.mjs';

const THREAD = 'basic:default';
const CONTROL = 'basic-chat:control';
export async function createLocalChat({ root }) {
  const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
  if (config.mode !== 'DRY_RUN' || config.autonomyEnabled !== false || config.scheduler?.enabled !== false) {
    throw new Error('CHAT_REQUIRES_DRY_RUN_AUTONOMY_AND_SCHEDULER_DISABLED');
  }
  // Exclusive chat host; never attach this slice to the physical scheduler home.
  const lockPath = join(root, 'basic-chat.lock');
  const lock = await open(lockPath, 'wx');
  let queue = Promise.resolve();
  try {
    const persistence = await createLocalPersistence({ filePath: join(root, config.stateFile) });
    if (!await persistence.get('artifact', CONTROL)) {
      await persistence.create('artifact', { id: CONTROL, artifactType: 'chat.control', status: 'ready' });
    }
    for (const run of await persistence.list('run')) {
      if (run.threadId === THREAD && run.status === 'running') {
        await persistence.update('run', run.id, { status: 'failed', error: 'INTERRUPTED_BEFORE_RESPONSE' });
      }
    }
    const chat = createBasicChatAdapter({ persistence, session: {
      async send({ missionId, message, task }) {
        const run = await persistence.create('run', {
          id: `run:${randomUUID()}`, status: 'running', missionId, threadId: THREAD,
          projectId: task.requirements.projectId, source: task.source, freePreferred: task.freePreferred,
        });
        try {
          const result = await wakeLocal({ root, persistence, missionId, threadId: THREAD, objective: message });
          await persistence.update('run', run.id, { status: 'completed', taskId: result.task_id,
            responseArtifactId: `response:${result.task_id}`, wakeTraceId: result.response.wake_trace_id });
          return { result: { runId: run.id, output: 'Completed one bounded local check through the governed AgentOS pipeline. Your message was recorded as the task objective. DRY_RUN; no external actions were taken.' } };
        } catch (error) {
          await persistence.update('run', run.id, { status: 'failed', error: error.message });
          throw error;
        }
      },
    } });
    function serial(action) {
      const result = queue.then(action);
      queue = result.catch(() => {});
      return result;
    }
    return {
      snapshot: () => serial(async () => ({
        history: await chat.history(), control: await persistence.get('artifact', CONTROL),
        runs: (await persistence.list('run')).filter(run => run.threadId === THREAD),
        mode: 'DRY_RUN', autonomyEnabled: false,
      })),
      send: text => serial(async () => {
        if (typeof text !== 'string' || !text.trim() || text.length > 4000) throw new Error('MESSAGE_REQUIRES_1_TO_4000_CHARACTERS');
        if ((await persistence.get('artifact', CONTROL)).status !== 'ready') throw new Error('CHAT_PAUSED_OR_STOPPED');
        return chat.sendMessage({ text, threadId: THREAD });
      }),
      control: action => serial(async () => {
        if (!['pause', 'stop', 'resume'].includes(action)) throw new Error('INVALID_CONTROL_ACTION');
        const status = { pause: 'paused', stop: 'stopped', resume: 'ready' }[action];
        await persistence.update('artifact', CONTROL, { status });
        await persistence.create('event', { eventType: `basic-chat.${action}`, threadId: THREAD, missionId: `mission:${THREAD}` });
        return { status };
      }),
      close: async () => { await queue; await lock.close(); await (await import('node:fs/promises')).unlink(lockPath); },
    };
  } catch (error) {
    await lock.close();
    await (await import('node:fs/promises')).unlink(lockPath);
    throw error;
  }
}

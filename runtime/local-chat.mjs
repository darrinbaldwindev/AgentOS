// BASIC-CHAT V1: governed local chat over canonical wakeLocal.
// No second completion path. Chat requires scheduler disabled.

import { randomUUID } from 'node:crypto';
import { readFile, open, writeFile, unlink, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createLocalPersistence } from './local-persistence.mjs';
import { wakeLocal } from './local-wake.mjs';

async function acquireHostLock(lockPath) {
  // Existence is authoritative. An empty/malformed file may be a live owner's
  // publication window; PID absence alone is not an atomic takeover protocol.
  let handle;
  try {
    handle = await open(lockPath, 'wx');
  } catch (error) {
    if (error?.code === 'EEXIST') throw new Error('BASIC_CHAT_ALREADY_RUNNING_OR_RECOVERY_REQUIRED');
    throw error;
  }
  try {
    await handle.writeFile(`${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`, 'utf8');
    return handle;
  } catch (error) {
    await handle.close();
    // Retain uncertain ownership; never delete a potentially replaced lock.
    throw error;
  }
}

const THREAD = 'basic:default';
const CONTROL = 'basic-chat:control';

const USER_STATES = Object.freeze({
  READY: 'READY',
  WORKING: 'WORKING',
  VERIFYING: 'VERIFYING',
  COMPLETE: 'COMPLETE',
  BLOCKED: 'BLOCKED',
  PAUSED: 'PAUSED',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
});

function mapStatus(runtimeStatus) {
  switch (runtimeStatus) {
    case 'COMPLETED':
      return USER_STATES.COMPLETE;
    case 'INCOMPLETE':
    case 'GREEN_BLOCKED':
      return USER_STATES.BLOCKED;
    case 'AWAITING_GREEN':
      return USER_STATES.VERIFYING;
    default:
      return USER_STATES.NEEDS_ATTENTION;
  }
}

async function readSafeChatConfig(root) {
  const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
  if (config?.schemaVersion !== 1) throw new Error('LOCAL_CONFIG_SCHEMA_INVALID');
  if (config.mode !== 'DRY_RUN' || config.autonomyEnabled !== false) {
    throw new Error('CHAT_REQUIRES_SAFE_MODE');
  }
  return config;
}

export async function createLocalChat({ root }) {
  if (!root) throw new TypeError('root is required');
  const config = await readSafeChatConfig(root);
  const lockPath = join(root, 'basic-chat.lock');
  const lock = await acquireHostLock(lockPath);

  const persistence = await createLocalPersistence({ filePath: join(root, config.stateFile) });
  if (!(await persistence.get('artifact', CONTROL))) {
    await persistence.create('artifact', {
      id: CONTROL,
      artifactType: 'chat.control',
      status: 'ready',
      paused: false,
      stopped: false,
    });
  }

  for (const run of await persistence.list('run')) {
    if (run.threadId === THREAD && run.status === 'running') {
      await persistence.update('run', run.id, {
        status: 'failed',
        error: 'INTERRUPTED_BEFORE_RESPONSE',
      });
    }
  }

  let queue = Promise.resolve();
  function enqueue(fn) {
    const next = queue.then(fn, fn);
    queue = next.catch(() => {});
    return next;
  }

  async function getControl() {
    return (await persistence.get('artifact', CONTROL)) ?? { status: 'ready', paused: false, stopped: false };
  }

  async function setControl(patch) {
    const current = await getControl();
    await persistence.update('artifact', CONTROL, { ...current, ...patch });
    return getControl();
  }

  async function history() {
    const artifacts = await persistence.list('artifact');
    return artifacts
      .filter((a) => a.artifactType === 'chat.message' && a.threadId === THREAD)
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
      .map((a) => ({
        id: a.id,
        role: a.role,
        text: a.text,
        createdAt: a.createdAt,
        status: a.status ?? null,
      }));
  }

  async function snapshot() {
    const control = await getControl();
    const hist = await history();
    let visible = USER_STATES.READY;
    if (control.stopped) visible = USER_STATES.NEEDS_ATTENTION;
    else if (control.paused) visible = USER_STATES.PAUSED;
    else if (control.status === 'working') visible = USER_STATES.WORKING;
    else if (control.lastUserStatus) visible = control.lastUserStatus;
    return {
      ready: !control.paused && !control.stopped,
      paused: Boolean(control.paused),
      stopped: Boolean(control.stopped),
      status: visible,
      history: hist,
      lastTaskId: control.lastTaskId ?? null,
      note: 'Local · DRY_RUN · Autonomy disabled · Scheduler must stay disabled for chat',
    };
  }

  async function send(text) {
    return enqueue(async () => {
      const control = await getControl();
      if (control.stopped) throw new Error('CHAT_STOPPED');
      if (control.paused) throw new Error('CHAT_PAUSED');
      const message = typeof text === 'string' ? text.trim() : '';
      if (!message) throw new TypeError('text is required');
      if (message.length > 4000) throw new Error('MESSAGE_TOO_LONG');

      const messageId = `chat:${randomUUID()}`;
      const createdAt = new Date().toISOString();
      await persistence.create('artifact', {
        id: messageId,
        artifactType: 'chat.message',
        threadId: THREAD,
        role: 'user',
        text: message,
        createdAt,
      });
      await setControl({ status: 'working', lastUserStatus: USER_STATES.WORKING });

      let result;
      try {
        result = await wakeLocal({
          root,
          objective: message,
          requireSchedulerDisabled: true,
        });
      } catch (error) {
        let errText = error?.message ?? String(error);
        if (/LOCAL_WAKE_REQUIRES_SCHEDULER_DISABLED/.test(errText)) {
          errText = 'Basic Chat needs scheduled checks turned off before starting.';
        }
        await persistence.create('artifact', {
          id: `chat:${randomUUID()}`,
          artifactType: 'chat.message',
          threadId: THREAD,
          role: 'agentos',
          text: `Blocked: ${errText}`,
          createdAt: new Date().toISOString(),
          status: USER_STATES.BLOCKED,
        });
        await setControl({
          status: 'ready',
          lastUserStatus: USER_STATES.BLOCKED,
          lastError: errText,
        });
        throw error;
      }

      const userStatus = mapStatus(result.status);
      const assistantText =
        result.status === 'COMPLETED'
          ? 'Completed one bounded local check through the governed AgentOS pipeline. Your message was recorded and verified under Green.'
          : result.status === 'INCOMPLETE' || result.status === 'GREEN_BLOCKED'
            ? `Verification did not pass (${result.status}). Work was not marked complete.`
            : `Turn finished with status ${result.status}.`;

      await persistence.create('artifact', {
        id: `chat:${randomUUID()}`,
        artifactType: 'chat.message',
        threadId: THREAD,
        role: 'agentos',
        text: assistantText,
        createdAt: new Date().toISOString(),
        status: userStatus,
        taskId: result.task_id ?? null,
      });
      await setControl({
        status: 'ready',
        lastUserStatus: userStatus,
        lastTaskId: result.task_id ?? null,
        lastError: null,
      });
      return snapshot();
    });
  }

  async function control(action) {
    const a = String(action || '').toLowerCase();
    if (a === 'pause') {
      await setControl({ paused: true, lastUserStatus: USER_STATES.PAUSED });
    } else if (a === 'resume') {
      await setControl({ paused: false, stopped: false, lastUserStatus: USER_STATES.READY, status: 'ready' });
    } else if (a === 'stop') {
      await setControl({ stopped: true, paused: false, lastUserStatus: USER_STATES.NEEDS_ATTENTION });
    } else {
      throw new Error('UNKNOWN_CONTROL_ACTION');
    }
    return snapshot();
  }

  async function close() {
    try {
      await lock.close();
    } catch {}
    try {
      await unlink(lockPath);
    } catch {}
  }

  return Object.freeze({ send, control, snapshot, history, close, THREAD });
}

export { USER_STATES };

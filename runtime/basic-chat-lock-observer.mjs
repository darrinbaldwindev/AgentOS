import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

function defaultProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function recoveryEvidence(path, reason, extra = {}) {
  return Object.freeze({
    source: 'basic-chat.lock',
    path,
    state: 'recovery_required',
    retained: true,
    uncertain: true,
    reason,
    ...extra,
  });
}

export async function observeBasicChatLock({ root, processAlive = defaultProcessAlive } = {}) {
  if (!root) throw new TypeError('root is required');
  if (typeof processAlive !== 'function') throw new TypeError('processAlive must be a function');

  const path = join(root, 'basic-chat.lock');
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    return [recoveryEvidence(path, 'BASIC_CHAT_LOCK_OBSERVATION_FAILED', { error_code: error?.code ?? null })];
  }

  if (!raw.trim()) return [recoveryEvidence(path, 'BASIC_CHAT_LOCK_RECOVERY_REQUIRED')];

  let owner;
  try {
    owner = JSON.parse(raw);
  } catch {
    return [recoveryEvidence(path, 'BASIC_CHAT_LOCK_RECOVERY_REQUIRED')];
  }

  const pid = Number(owner?.pid);
  if (!Number.isInteger(pid) || pid <= 0) {
    return [recoveryEvidence(path, 'BASIC_CHAT_LOCK_RECOVERY_REQUIRED')];
  }

  let alive;
  try {
    alive = processAlive(pid) === true;
  } catch {
    return [recoveryEvidence(path, 'BASIC_CHAT_LOCK_LIVENESS_UNKNOWN', { pid })];
  }

  if (!alive) {
    return [recoveryEvidence(path, 'BASIC_CHAT_LOCK_RECOVERY_REQUIRED', {
      pid,
      started_at: typeof owner.startedAt === 'string' ? owner.startedAt : null,
    })];
  }

  return [Object.freeze({
    source: 'basic-chat.lock',
    path,
    state: 'held',
    retained: false,
    uncertain: false,
    reason: 'BASIC_CHAT_LOCK_HELD',
    pid,
    started_at: typeof owner.startedAt === 'string' ? owner.startedAt : null,
  })];
}

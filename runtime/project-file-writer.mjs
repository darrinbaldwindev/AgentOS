// AGENTOS-LEVEL2-PROJECT-FILE-WRITE-001
// Bounded non-production project-file mutation primitive for the existing governed
// execution path. This module grants no authority and creates no scheduler, queue,
// ledger, registry, assurance path, or shell authority. Callers must invoke it only
// after the existing governed execution boundary admits the task.

import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { constants as fsConstants } from 'node:fs';
import path from 'node:path';

const MAX_CONTENT_BYTES = 1_048_576;
const LOCK_OWNER_FILE = 'owner.json';
const WINDOWS_HANDLE_LOCK = process.platform === 'win32';

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fail(code, details = {}) {
  const error = new Error(code);
  error.code = code;
  Object.assign(error, details);
  return error;
}

function requiredString(value, name) {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(`${name} is required`);
  return value;
}

function correlationFrom(task = {}) {
  return Object.freeze({
    project_id: requiredString(task.project_id, 'task.project_id'),
    mission_id: requiredString(task.mission_id, 'task.mission_id'),
    task_id: requiredString(task.task_id, 'task.task_id'),
    worker_id: requiredString(task.worker_id, 'task.worker_id'),
  });
}

async function canonicalRoot(root) {
  try { return path.resolve(await fs.realpath(path.resolve(root))); }
  catch { throw fail('PROJECT_FILE_ROOT_CANONICALIZATION_FAILED', { root }); }
}

function within(root, target) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

async function inspectTarget(requestedPath, roots) {
  const requested = path.resolve(requestedPath);
  let exists = true;
  let canonical;
  try {
    canonical = path.resolve(await fs.realpath(requested));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw fail('PROJECT_FILE_TARGET_CANONICALIZATION_FAILED', { requested });
    exists = false;
    let parent;
    try { parent = path.resolve(await fs.realpath(path.dirname(requested))); }
    catch { throw fail('PROJECT_FILE_PARENT_CANONICALIZATION_FAILED', { requested }); }
    canonical = path.join(parent, path.basename(requested));
  }
  if (!roots.some((root) => within(root, canonical))) {
    throw fail('PROJECT_FILE_TARGET_OUTSIDE_APPROVED_ROOT', { requested, canonical });
  }
  return { requested, canonical, exists };
}

function statIdentity(stat) {
  return Object.freeze({ dev: String(stat.dev), ino: String(stat.ino), size: String(stat.size) });
}

function sameIdentity(left, right) {
  return Boolean(left && right && left.dev === right.dev && left.ino === right.ino && left.size === right.size);
}

async function readState(target) {
  try {
    const [bytes, stat] = await Promise.all([fs.readFile(target), fs.stat(target, { bigint: true })]);
    return { exists: true, hash: sha256(bytes), bytes, identity: statIdentity(stat) };
  } catch (error) {
    if (error?.code === 'ENOENT') return { exists: false, hash: null, bytes: null, identity: null };
    throw error;
  }
}

async function readLockOwner(lock) {
  try { return JSON.parse(await fs.readFile(WINDOWS_HANDLE_LOCK ? lock : path.join(lock, LOCK_OWNER_FILE), 'utf8')); }
  catch { return null; }
}

function sameLockOwner(left, right) {
  return Boolean(left && right && left.lock_id === right.lock_id && left.intent_hash === right.intent_hash && left.worker_id === right.worker_id);
}

function sameLockDirectory(left, right) {
  return Boolean(left && right && left.dev === right.dev && left.ino === right.ino);
}

async function lockDirectoryIdentity(lock) {
  try {
    const stat = await fs.lstat(lock, { bigint: true });
    if ((WINDOWS_HANDLE_LOCK ? !stat.isFile() : !stat.isDirectory()) || stat.isSymbolicLink()) return null;
    return { dev: String(stat.dev), ino: String(stat.ino) };
  } catch { return null; }
}

function validatePreparedTempPath(target, temp) {
  if (typeof temp !== 'string') return false;
  if (path.dirname(temp) !== path.dirname(target)) return false;
  const prefix = `.${path.basename(target)}.agentos-`;
  return path.basename(temp).startsWith(prefix) && path.basename(temp).endsWith('.tmp');
}

export async function createProjectFileWriter({ approvedRoots, persistence, maxContentBytes = MAX_CONTENT_BYTES, hooks = {}, reconcileAbandonedLock = null, reconcilePreparedWrite = null } = {}) {
  if (WINDOWS_HANDLE_LOCK && !Number.isInteger(fsConstants.UV_FS_O_TEMPORARY)) {
    throw fail('PROJECT_FILE_LOCK_PRIMITIVE_UNAVAILABLE', { recovery_required: true });
  }
  if (!Array.isArray(approvedRoots) || approvedRoots.length === 0) throw new TypeError('approvedRoots must be non-empty');
  if (!persistence || typeof persistence.get !== 'function' || typeof persistence.create !== 'function') {
    throw new TypeError('persistence.get and persistence.create are required');
  }
  if (reconcileAbandonedLock !== null && typeof reconcileAbandonedLock !== 'function') {
    throw new TypeError('reconcileAbandonedLock must be a function or null');
  }
  if (reconcilePreparedWrite !== null && typeof reconcilePreparedWrite !== 'function') {
    throw new TypeError('reconcilePreparedWrite must be a function or null');
  }
  if (!Number.isInteger(maxContentBytes) || maxContentBytes < 1) throw new TypeError('maxContentBytes must be a positive integer');

  const roots = [];
  for (const root of approvedRoots) roots.push(await canonicalRoot(root));

  async function execute({ task, targetPath, content, expectedPreimageSha256 = null, idempotencyKey } = {}) {
    const correlation = correlationFrom(task);
    requiredString(targetPath, 'targetPath');
    requiredString(idempotencyKey, 'idempotencyKey');
    if (typeof content !== 'string' && !Buffer.isBuffer(content)) throw new TypeError('content must be a string or Buffer');
    const desired = Buffer.isBuffer(content) ? Buffer.from(content) : Buffer.from(content, 'utf8');
    if (desired.length > maxContentBytes) throw fail('PROJECT_FILE_CONTENT_TOO_LARGE');
    if (expectedPreimageSha256 !== null && !/^[a-f0-9]{64}$/i.test(expectedPreimageSha256)) {
      throw new TypeError('expectedPreimageSha256 must be a sha256 hex string or null');
    }

    const target = await inspectTarget(targetPath, roots);
    const posthash = sha256(desired);
    const intent = Object.freeze({ ...correlation, path: target.canonical, expected_preimage_sha256: expectedPreimageSha256, postimage_sha256: posthash });
    const intentHash = sha256(JSON.stringify(intent));
    const keyHash = sha256(idempotencyKey);
    const receiptId = `project_file_write_${keyHash.slice(0, 32)}`;
    const preparedId = `project_file_write_prepared_${keyHash.slice(0, 32)}`;

    async function receiptIfPresent() {
      const prior = await persistence.get('artifact', receiptId);
      if (!prior) return null;
      if (prior.intent_hash !== intentHash) throw fail('PROJECT_FILE_IDEMPOTENCY_CONFLICT', { receipt_id: receiptId });
      const current = await readState(target.canonical);
      if (!current.exists || current.hash !== posthash) throw fail('PROJECT_FILE_RECEIPT_MISMATCH', { receipt_id: receiptId });
      return Object.freeze({ success: true, replayed: true, recovered: false, receipt_id: receiptId, ...intent });
    }

    function receiptFromPrepared(prepared, result = 'MUTATED_VERIFIED', recoveryEvidenceId = null) {
      return {
        id: receiptId,
        artifact_kind: 'project.file.write.receipt',
        idempotency_key_sha256: keyHash,
        intent_hash: intentHash,
        ...intent,
        preimage_sha256: prepared.preimage_sha256,
        postimage_sha256: posthash,
        prepared_artifact_id: preparedId,
        result,
        recovery_required: false,
        recovered_from_prepared_intent: true,
        ...(recoveryEvidenceId ? { recovery_evidence_id: recoveryEvidenceId } : {}),
        recorded_at: new Date().toISOString(),
      };
    }

    async function finalizePreparedReceipt(prepared, result, recoveryEvidenceId = null) {
      await assertOwnLock();
      const receipt = receiptFromPrepared(prepared, result, recoveryEvidenceId);
      try {
        await persistence.create('artifact', receipt);
      } catch (error) {
        const raced = await persistence.get('artifact', receiptId);
        if (!raced || raced.intent_hash !== intentHash) {
          throw fail('PROJECT_FILE_RECEIPT_PERSISTENCE_FAILED', { cause: error, prepared_id: preparedId, path: target.canonical, postimage_sha256: posthash, recovery_required: true });
        }
      }
      return Object.freeze({ success: true, replayed: true, recovered: true, receipt_id: receiptId, ...intent, preimage_sha256: prepared.preimage_sha256 });
    }

    async function recoverPreparedIfPresent({ allowPublish = false } = {}) {
      const prepared = await persistence.get('artifact', preparedId);
      if (!prepared) return null;
      if (prepared.intent_hash !== intentHash) throw fail('PROJECT_FILE_IDEMPOTENCY_CONFLICT', { prepared_id: preparedId });

      const current = await readState(target.canonical);
      if (current.exists && current.hash === posthash && sameIdentity(current.identity, prepared.prepared_file_identity)) {
        return finalizePreparedReceipt(prepared, 'MUTATED_VERIFIED');
      }

      const targetStillPreimage = current.hash === prepared.preimage_sha256;
      const tempPath = prepared.prepared_temp_path;
      if (!targetStillPreimage || !validatePreparedTempPath(target.canonical, tempPath)) {
        throw fail('PROJECT_FILE_RECOVERY_STATE_MISMATCH', {
          prepared_id: preparedId,
          path: target.canonical,
          actual_postimage_sha256: current.hash,
          recovery_required: true,
        });
      }

      const tempState = await readState(tempPath);
      if (!tempState.exists || tempState.hash !== posthash || !sameIdentity(tempState.identity, prepared.prepared_file_identity)) {
        throw fail('PROJECT_FILE_RECOVERY_STATE_MISMATCH', { prepared_id: preparedId, path: target.canonical, recovery_required: true });
      }

      if (!allowPublish) return null;
      if (!reconcilePreparedWrite) {
        throw fail('PROJECT_FILE_RECOVERY_STATE_MISMATCH', { prepared_id: preparedId, path: target.canonical, recovery_required: true });
      }
      const decision = await reconcilePreparedWrite({ prepared, current, target: target.canonical, temp: tempPath, intent });
      if (decision?.status !== 'RESUME' || typeof decision.evidence_id !== 'string' || decision.evidence_id.length === 0) {
        throw fail('PROJECT_FILE_RECOVERY_STATE_MISMATCH', { prepared_id: preparedId, path: target.canonical, recovery_required: true });
      }
      if (typeof hooks.beforeRecoveryPublish === 'function') await hooks.beforeRecoveryPublish({ target: target.canonical, temp: tempPath, intent });
      await assertOwnLock();
      const recheckBeforeRecoveryPublish = await readState(target.canonical);
      if (recheckBeforeRecoveryPublish.exists !== current.exists ||
          recheckBeforeRecoveryPublish.hash !== current.hash ||
          (recheckBeforeRecoveryPublish.exists && !sameIdentity(recheckBeforeRecoveryPublish.identity, current.identity))) {
        throw fail('PROJECT_FILE_EXTERNAL_MUTATION', {
          prepared_id: preparedId,
          path: target.canonical,
          recovery_required: true,
        });
      }
      await fs.rename(tempPath, target.canonical);
      const after = await readState(target.canonical);
      if (!after.exists || after.hash !== posthash || !sameIdentity(after.identity, prepared.prepared_file_identity)) {
        throw fail('PROJECT_FILE_POSTWRITE_VERIFICATION_FAILED', { actual_postimage_sha256: after.hash, recovery_required: true });
      }
      return finalizePreparedReceipt(prepared, 'RECOVERED_PREPARED_AND_VERIFIED', decision.evidence_id);
    }

    const priorReceipt = await receiptIfPresent();
    if (priorReceipt) return priorReceipt;
    // Recovery may create a new success receipt, so it must run under the same
    // target ownership as a fresh mutation. Only existing-receipt replay is read-only.

    const lock = `${target.canonical}.agentos-write-lock`;
    const lockNamespaceGuard = `${lock}.namespace-guard`;
    const lockOwner = Object.freeze({ lock_id: randomUUID(), pid: process.pid, ...correlation, target_path: target.canonical, intent_hash: intentHash, idempotency_key_sha256: keyHash, acquired_at: new Date().toISOString() });

    if (typeof hooks.beforeLock === 'function') await hooks.beforeLock({ target: target.canonical, intent });
    let lockOwned = false;
    let ownedLockIdentity = null;
    let windowsLockHandle = null;

    async function acquireLockNamespaceGuard(reason) {
      if (WINDOWS_HANDLE_LOCK) return null;
      let handle;
      try {
        handle = await fs.open(lockNamespaceGuard, 'wx', 0o600);
        await handle.writeFile(JSON.stringify({ lock_id: lockOwner.lock_id, worker_id: lockOwner.worker_id, reason, acquired_at: new Date().toISOString() }));
        await handle.sync();
        return handle;
      } catch (error) {
        if (handle) await handle.close().catch(() => undefined);
        if (error?.code === 'EEXIST') {
          throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, guard: lockNamespaceGuard, recovery_required: true });
        }
        throw error;
      }
    }

    async function releaseLockNamespaceGuard(handle) {
      if (!handle) return;
      await handle.close();
      await fs.rm(lockNamespaceGuard, { force: true });
    }

    async function retireLock(expectedOwner, expectedIdentity, reason) {
      if (WINDOWS_HANDLE_LOCK) {
        // The open Windows handle, not a pathname check, owns deletion. Close
        // removes only this handle's file even if another writer replaced the
        // canonical path between validation and release.
        if (!windowsLockHandle) throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, recovery_required: true });
        let currentOwner;
        let currentIdentity;
        try {
          if (typeof hooks.beforeLockRetire === 'function') await hooks.beforeLockRetire({ lock, reason, expectedOwner });
          currentOwner = await readLockOwner(lock);
          currentIdentity = await lockDirectoryIdentity(lock);
          if (typeof hooks.afterLockValidation === 'function') await hooks.afterLockValidation({ lock, reason, expectedOwner });
        } finally {
          await windowsLockHandle.close();
          windowsLockHandle = null;
        }
        let successorExists = false;
        try { await fs.lstat(lock); successorExists = true; }
        catch (error) { if (error?.code !== 'ENOENT') throw error; }
        if (!sameLockOwner(expectedOwner, currentOwner) || !sameLockDirectory(expectedIdentity, currentIdentity) || successorExists) {
          throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: currentOwner, recovery_required: true });
        }
        return;
      }

      const guard = await acquireLockNamespaceGuard(`retire:${reason}`);
      try {
        const currentOwner = await readLockOwner(lock);
        const currentIdentity = await lockDirectoryIdentity(lock);
        if (!sameLockOwner(expectedOwner, currentOwner) || !sameLockDirectory(expectedIdentity, currentIdentity)) {
          throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: currentOwner, recovery_required: true });
        }
        if (typeof hooks.beforeLockRetire === 'function') await hooks.beforeLockRetire({ lock, reason, expectedOwner });
        if (typeof hooks.afterLockValidation === 'function') await hooks.afterLockValidation({ lock, reason, expectedOwner });
        const retired = `${lock}.retired-${randomUUID()}`;
        try { await fs.rename(lock, retired); }
        catch (error) { throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, cause: error, recovery_required: true }); }
        const movedOwner = await readLockOwner(retired);
        const movedIdentity = await lockDirectoryIdentity(retired);
        if (!sameLockOwner(expectedOwner, movedOwner) || !sameLockDirectory(expectedIdentity, movedIdentity)) {
          try { await fs.rename(retired, lock); }
          catch { /* Preserve the moved lock as recovery evidence; never delete it. */ }
          throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: movedOwner, retired, recovery_required: true });
        }
        await fs.rm(retired, { recursive: true });
      } finally {
        await releaseLockNamespaceGuard(guard);
      }
    }

    async function assertOwnLock() {
      if (!sameLockOwner(lockOwner, await readLockOwner(lock)) ||
          !sameLockDirectory(ownedLockIdentity, await lockDirectoryIdentity(lock))) {
        throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, recovery_required: true });
      }
    }

    async function establishLock() {
      if (WINDOWS_HANDLE_LOCK) {
        const flags = fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_RDWR | fsConstants.UV_FS_O_TEMPORARY;
        try {
          windowsLockHandle = await fs.open(lock, flags, 0o600);
          await windowsLockHandle.writeFile(JSON.stringify(lockOwner));
          await windowsLockHandle.sync();
          const stat = await windowsLockHandle.stat({ bigint: true });
          ownedLockIdentity = { dev: String(stat.dev), ino: String(stat.ino) };
          lockOwned = true;
          return;
        } catch (error) {
          if (windowsLockHandle) {
            await windowsLockHandle.close();
            windowsLockHandle = null;
          }
          if (error?.code !== 'EEXIST') throw error;
          const observedOwner = await readLockOwner(lock);
          if (observedOwner?.pid === process.pid) {
            throw fail('PROJECT_FILE_LIVE_CONTENTION', { lock, owner: observedOwner, retryable: true, recovery_required: false });
          }
          // A genuine crash closes a temporary handle automatically. An
          // extant path is ambiguous (including legacy directory locks), so
          // never delete or take it over by name.
          throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: observedOwner, recovery_required: true });
        }
      }

      let created = false;
      const guard = await acquireLockNamespaceGuard('acquire');
      try {
        try {
          await fs.mkdir(lock);
          await fs.writeFile(path.join(lock, LOCK_OWNER_FILE), JSON.stringify(lockOwner), { flag: 'wx', mode: 0o600 });
          ownedLockIdentity = await lockDirectoryIdentity(lock);
          if (!ownedLockIdentity || !sameLockOwner(lockOwner, await readLockOwner(lock))) {
            throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, recovery_required: true });
          }
          lockOwned = true;
          created = true;
        } catch (error) {
          if (error?.code !== 'EEXIST') throw error;
        }
      } finally {
        await releaseLockNamespaceGuard(guard);
      }
      if (created) return;

      const observedOwner = await readLockOwner(lock);
      const observedIdentity = await lockDirectoryIdentity(lock);
      if (observedOwner?.pid === process.pid) {
        throw fail('PROJECT_FILE_LIVE_CONTENTION', { lock, owner: observedOwner, retryable: true, recovery_required: false });
      }
      if (!reconcileAbandonedLock) {
        throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: observedOwner, recovery_required: true });
      }
      const decision = await reconcileAbandonedLock({ lock, owner: observedOwner, requested_owner: lockOwner, target: target.canonical, intent });
      if (decision?.status === 'LIVE') {
        throw fail('PROJECT_FILE_LIVE_CONTENTION', { lock, owner: observedOwner, retryable: true, recovery_required: false });
      }
      if (decision?.status !== 'ABANDONED' || typeof decision.evidence_id !== 'string' || decision.evidence_id.length === 0) {
        throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: observedOwner, recovery_required: true });
      }
      const recheckedOwner = await readLockOwner(lock);
      if (!sameLockOwner(observedOwner, recheckedOwner) || !sameLockDirectory(observedIdentity, await lockDirectoryIdentity(lock))) {
        throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, owner: recheckedOwner, recovery_required: true });
      }
      await retireLock(observedOwner, observedIdentity, 'takeover');

      const takeoverGuard = await acquireLockNamespaceGuard('takeover-acquire');
      try {
        try {
          await fs.mkdir(lock);
        } catch (error) {
          if (error?.code === 'EEXIST') throw fail('PROJECT_FILE_LIVE_CONTENTION', { lock, owner: await readLockOwner(lock), retryable: true, recovery_required: false });
          throw error;
        }
        await fs.writeFile(path.join(lock, LOCK_OWNER_FILE), JSON.stringify({ ...lockOwner, recovered_abandoned_lock_evidence_id: decision.evidence_id }), { flag: 'wx', mode: 0o600 });
        ownedLockIdentity = await lockDirectoryIdentity(lock);
        if (!ownedLockIdentity || !sameLockOwner(lockOwner, await readLockOwner(lock))) {
          throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock, recovery_required: true });
        }
        lockOwned = true;
      } finally {
        await releaseLockNamespaceGuard(takeoverGuard);
      }
    }

    await establishLock();

    const temp = path.join(path.dirname(target.canonical), `.${path.basename(target.canonical)}.agentos-${process.pid}-${randomUUID()}.tmp`);
    let published = false;
    let preparedPersisted = false;
    try {
      if (typeof hooks.afterLockAcquired === 'function') await hooks.afterLockAcquired({ target: target.canonical, lock, intent, lockOwner });
      await assertOwnLock();
      const lockedReceipt = await receiptIfPresent();
      if (lockedReceipt) return lockedReceipt;
      const lockedRecovery = await recoverPreparedIfPresent({ allowPublish: true });
      if (lockedRecovery) return lockedRecovery;

      const before = await readState(target.canonical);
      if (before.exists && before.hash === posthash) throw fail('PROJECT_FILE_RECONCILIATION_REQUIRED', { path: target.canonical, postimage_sha256: posthash });
      if (before.exists) {
        if (expectedPreimageSha256 === null || before.hash !== expectedPreimageSha256.toLowerCase()) throw fail('PROJECT_FILE_VERSION_CONFLICT', { actual_preimage_sha256: before.hash });
      } else if (expectedPreimageSha256 !== null) {
        throw fail('PROJECT_FILE_VERSION_CONFLICT', { actual_preimage_sha256: null });
      }

      const handle = await fs.open(temp, 'wx', 0o600);
      try {
        await handle.writeFile(desired);
        await handle.sync();
      } finally {
        await handle.close();
      }

      const preparedStat = await fs.stat(temp, { bigint: true });
      const prepared = {
        id: preparedId,
        artifact_kind: 'project.file.write.prepared',
        idempotency_key_sha256: keyHash,
        intent_hash: intentHash,
        ...intent,
        preimage_sha256: before.hash,
        postimage_sha256: posthash,
        prepared_file_identity: statIdentity(preparedStat),
        prepared_temp_path: temp,
        prepared_at: new Date().toISOString(),
      };
      try {
        await persistence.create('artifact', prepared);
        preparedPersisted = true;
      } catch (error) {
        const raced = await persistence.get('artifact', preparedId);
        if (!raced || raced.intent_hash !== intentHash) {
          if (raced) throw fail('PROJECT_FILE_IDEMPOTENCY_CONFLICT', { prepared_id: preparedId });
          throw fail('PROJECT_FILE_PREPARED_PERSISTENCE_FAILED', { cause: error, prepared_id: preparedId });
        }
        throw fail('PROJECT_FILE_RECOVERY_REQUIRED', { prepared_id: preparedId, recovery_required: true });
      }

      if (typeof hooks.beforePublish === 'function') await hooks.beforePublish({ target: target.canonical, temp, intent });
      await assertOwnLock();
      const recheckBeforePublish = await readState(target.canonical);
      if (recheckBeforePublish.exists !== before.exists || recheckBeforePublish.hash !== before.hash || (recheckBeforePublish.exists && !sameIdentity(recheckBeforePublish.identity, before.identity))) {
        throw fail('PROJECT_FILE_EXTERNAL_MUTATION', {
          prepared_id: preparedId,
          path: target.canonical,
          recovery_required: true,
        });
      }
      await fs.rename(temp, target.canonical);
      published = true;
      if (typeof hooks.afterPublish === 'function') await hooks.afterPublish({ target: target.canonical, intent });

      const after = await readState(target.canonical);
      if (!after.exists || after.hash !== posthash || !sameIdentity(after.identity, prepared.prepared_file_identity)) {
        throw fail('PROJECT_FILE_POSTWRITE_VERIFICATION_FAILED', { actual_postimage_sha256: after.hash, recovery_required: true });
      }
      const receipt = { ...receiptFromPrepared(prepared), recovered_from_prepared_intent: false };
      await assertOwnLock();
      try { await persistence.create('artifact', receipt); }
      catch (error) { throw fail('PROJECT_FILE_RECEIPT_PERSISTENCE_FAILED', { cause: error, prepared_id: preparedId, path: target.canonical, postimage_sha256: posthash, recovery_required: true }); }
      return Object.freeze({ success: true, replayed: false, recovered: false, receipt_id: receiptId, ...intent, preimage_sha256: before.hash });
    } catch (error) {
      if ((published || preparedPersisted) && !error.recovery_required) error.recovery_required = true;
      throw error;
    } finally {
      if (!preparedPersisted || published) await fs.rm(temp, { force: true }).catch(() => undefined);
      if (lockOwned) await retireLock(lockOwner, ownedLockIdentity, 'release');
    }
  }

  return Object.freeze({ execute, capability: 'project.file.write', approvedRoots: Object.freeze([...roots]) });
}

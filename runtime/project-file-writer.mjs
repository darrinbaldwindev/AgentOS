// AGENTOS-LEVEL2-PROJECT-FILE-WRITE-001
// Bounded non-production project-file mutation primitive for the existing governed
// execution path. This module grants no authority and creates no scheduler, queue,
// ledger, registry, assurance path, or shell authority. Callers must invoke it only
// after the existing governed execution boundary admits the task.

import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_CONTENT_BYTES = 1_048_576;

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

async function readHash(target) {
  try {
    const bytes = await fs.readFile(target);
    return { exists: true, hash: sha256(bytes), bytes };
  } catch (error) {
    if (error?.code === 'ENOENT') return { exists: false, hash: null, bytes: null };
    throw error;
  }
}

export async function createProjectFileWriter({ approvedRoots, persistence, maxContentBytes = MAX_CONTENT_BYTES, hooks = {} } = {}) {
  if (!Array.isArray(approvedRoots) || approvedRoots.length === 0) throw new TypeError('approvedRoots must be non-empty');
  if (!persistence || typeof persistence.get !== 'function' || typeof persistence.create !== 'function') {
    throw new TypeError('persistence.get and persistence.create are required');
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
    const receiptId = `project_file_write_${sha256(idempotencyKey).slice(0, 32)}`;

    const prior = await persistence.get('artifact', receiptId);
    if (prior) {
      if (prior.intent_hash !== intentHash) throw fail('PROJECT_FILE_IDEMPOTENCY_CONFLICT', { receipt_id: receiptId });
      const current = await readHash(target.canonical);
      if (!current.exists || current.hash !== posthash) throw fail('PROJECT_FILE_RECEIPT_MISMATCH', { receipt_id: receiptId });
      return Object.freeze({ success: true, replayed: true, receipt_id: receiptId, ...intent });
    }

    const lock = `${target.canonical}.agentos-write-lock`;
    if (typeof hooks.beforeLock === 'function') await hooks.beforeLock({ target: target.canonical, intent });
    try { await fs.mkdir(lock); }
    catch (error) {
      if (error?.code === 'EEXIST') throw fail('PROJECT_FILE_LOCK_RECOVERY_REQUIRED', { lock });
      throw error;
    }

    const temp = path.join(path.dirname(target.canonical), `.${path.basename(target.canonical)}.agentos-${process.pid}-${randomUUID()}.tmp`);
    let published = false;
    try {
      // Authoritative compare-and-swap validation must occur after this writer owns
      // the target lock. Any pre-lock observation is advisory only; validating here
      // closes the stale-preimage race between target inspection and lock acquisition.
      const before = await readHash(target.canonical);
      if (before.exists && before.hash === posthash) {
        throw fail('PROJECT_FILE_RECONCILIATION_REQUIRED', { path: target.canonical, postimage_sha256: posthash });
      }
      if (before.exists) {
        if (expectedPreimageSha256 === null || before.hash !== expectedPreimageSha256.toLowerCase()) {
          throw fail('PROJECT_FILE_VERSION_CONFLICT', { actual_preimage_sha256: before.hash });
        }
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

      if (typeof hooks.beforePublish === 'function') await hooks.beforePublish({ target: target.canonical, temp, intent });
      await fs.rename(temp, target.canonical);
      published = true;
      if (typeof hooks.afterPublish === 'function') await hooks.afterPublish({ target: target.canonical, intent });

      const after = await readHash(target.canonical);
      if (!after.exists || after.hash !== posthash) {
        throw fail('PROJECT_FILE_POSTWRITE_VERIFICATION_FAILED', { actual_postimage_sha256: after.hash });
      }

      const receipt = {
        id: receiptId,
        artifact_kind: 'project.file.write.receipt',
        idempotency_key_sha256: sha256(idempotencyKey),
        intent_hash: intentHash,
        ...intent,
        preimage_sha256: before.hash,
        postimage_sha256: posthash,
        result: 'MUTATED_VERIFIED',
        recovery_required: false,
        recorded_at: new Date().toISOString(),
      };
      try {
        await persistence.create('artifact', receipt);
      } catch (error) {
        throw fail('PROJECT_FILE_RECEIPT_PERSISTENCE_FAILED', { cause: error, path: target.canonical, postimage_sha256: posthash, recovery_required: true });
      }
      return Object.freeze({ success: true, replayed: false, receipt_id: receiptId, ...intent, preimage_sha256: before.hash });
    } catch (error) {
      if (published && !error.recovery_required) error.recovery_required = true;
      throw error;
    } finally {
      await fs.rm(temp, { force: true }).catch(() => undefined);
      await fs.rmdir(lock).catch(() => undefined);
    }
  }

  return Object.freeze({ execute, capability: 'project.file.write', approvedRoots: Object.freeze([...roots]) });
}

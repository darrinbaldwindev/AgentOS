const VALID_CONNECTION_MODES = new Set(['free-limited', 'subscription', 'api', 'oauth', 'mcp', 'native']);
const VALID_STATUS = new Set(['unknown', 'available', 'authenticated', 'healthy', 'degraded', 'offline', 'error', 'expired']);

function nowIso() { return new Date().toISOString(); }

export function createCapabilityPassport({ installationId = null, generatedAt = nowIso(), workers = [] } = {}) {
  return Object.freeze({
    schemaVersion: 1,
    installationId,
    generatedAt,
    refreshedAt: generatedAt,
    workers: workers.map(normalizeWorker),
  });
}

export function normalizeWorker(worker) {
  if (!worker?.id) throw new TypeError('worker.id is required');
  const status = worker.status ?? 'unknown';
  if (!VALID_STATUS.has(status)) throw new Error(`invalid worker status: ${status}`);
  const connectionModes = [...new Set(worker.connectionModes ?? [])];
  for (const mode of connectionModes) {
    if (!VALID_CONNECTION_MODES.has(mode)) throw new Error(`invalid connection mode: ${mode}`);
  }
  return Object.freeze({
    id: worker.id,
    provider: worker.provider ?? null,
    kind: worker.kind ?? 'worker',
    status,
    capabilities: [...new Set(worker.capabilities ?? [])],
    connectionModes,
    subscription: worker.subscription ?? null,
    checkedAt: worker.checkedAt ?? null,
    expiresAt: worker.expiresAt ?? null,
    metadata: worker.metadata ?? {},
  });
}

export function upsertWorker(passport, worker, { refreshedAt = nowIso() } = {}) {
  const normalized = normalizeWorker(worker);
  const existing = passport.workers.filter((candidate) => candidate.id !== normalized.id);
  return createCapabilityPassport({
    installationId: passport.installationId,
    generatedAt: passport.generatedAt,
    workers: [...existing, normalized],
  });
}

export function removeWorker(passport, workerId, { refreshedAt = nowIso() } = {}) {
  return createCapabilityPassport({
    installationId: passport.installationId,
    generatedAt: passport.generatedAt,
    workers: passport.workers.filter((worker) => worker.id !== workerId),
  });
}

export function getWorkerCapability(passport, workerId) {
  return passport.workers.find((worker) => worker.id === workerId) ?? null;
}

export function hasCapability(passport, capability, { healthyOnly = true } = {}) {
  return passport.workers.some((worker) =>
    worker.capabilities.includes(capability) && (!healthyOnly || worker.status === 'healthy' || worker.status === 'authenticated' || worker.status === 'available'),
  );
}

export function findCapabilityGaps(passport, requiredCapabilities = []) {
  return [...new Set(requiredCapabilities)].filter((capability) => !hasCapability(passport, capability));
}

export function expireWorkers(passport, at = new Date()) {
  const timestamp = at instanceof Date ? at.getTime() : new Date(at).getTime();
  const workers = passport.workers.map((worker) => {
    if (!worker.expiresAt) return worker;
    const expiry = new Date(worker.expiresAt).getTime();
    return Number.isFinite(expiry) && expiry <= timestamp
      ? normalizeWorker({ ...worker, status: 'expired' })
      : worker;
  });
  return createCapabilityPassport({ installationId: passport.installationId, generatedAt: passport.generatedAt, workers });
}

export { VALID_CONNECTION_MODES, VALID_STATUS };

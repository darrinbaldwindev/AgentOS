export function validateWorker(worker) {
  if (!worker?.id || !Array.isArray(worker.capabilities)) throw new TypeError('worker requires id and capabilities');
  if (typeof worker.execute !== 'function') throw new TypeError('worker requires execute(task)');
  return worker;
}

export async function executeWorker(worker, input) {
  validateWorker(worker);
  const startedAt = Date.now();
  try {
    const output = await worker.execute(input);
    return Object.freeze({ workerId: worker.id, output, latencyMs: Date.now() - startedAt, success: true });
  } catch (error) {
    return Object.freeze({ workerId: worker.id, error: error instanceof Error ? error.message : String(error), latencyMs: Date.now() - startedAt, success: false });
  }
}

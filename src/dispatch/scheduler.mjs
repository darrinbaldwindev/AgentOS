import { canRun } from './control.mjs';
import { createAuditEvent } from './audit.mjs';

export function createScheduler({ poll, control, audit = null, actor = 'scheduler', intervalMs = 60_000, maxCycles = Infinity, onError = () => {} }) {
  if (typeof poll !== 'function') throw new Error('poll is required');
  if (!Number.isFinite(intervalMs) || intervalMs < 1) throw new Error('intervalMs must be positive');
  if (!(maxCycles === Infinity || (Number.isInteger(maxCycles) && maxCycles > 0))) throw new Error('maxCycles must be positive or Infinity');

  let stopped = false;
  let cycles = 0;
  let timer = null;

  const record = async (type, outcome = null, metadata = {}) => {
    if (!audit?.record) return;
    await audit.record(createAuditEvent({ type, actor, outcome, metadata }));
  };

  const stop = () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    timer = null;
    void record('runtime.stop');
  };

  const tick = async () => {
    if (stopped || cycles >= maxCycles || !canRun(control)) return;
    cycles += 1;
    await record('runtime.poll.start', null, { cycle: cycles });
    try {
      const result = await poll();
      await record('runtime.poll.complete', 'success', { cycle: cycles });
      return result;
    } catch (error) {
      await record('runtime.poll.error', 'failure', { cycle: cycles, error: error.message });
      onError(error);
    } finally {
      if (!stopped && cycles < maxCycles && canRun(control)) timer = setTimeout(tick, intervalMs);
    }
  };

  return { start: tick, stop, getCycles: () => cycles };
}

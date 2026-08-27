import { canRun } from './control.mjs';

export function createScheduler({ poll, control, intervalMs = 60_000, maxCycles = Infinity, onError = () => {} }) {
  if (typeof poll !== 'function') throw new Error('poll is required');
  if (!Number.isFinite(intervalMs) || intervalMs < 1) throw new Error('intervalMs must be positive');
  if (!(maxCycles === Infinity || (Number.isInteger(maxCycles) && maxCycles > 0))) throw new Error('maxCycles must be positive or Infinity');

  let stopped = false;
  let cycles = 0;
  let timer = null;

  const stop = () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const tick = async () => {
    if (stopped || cycles >= maxCycles || !canRun(control)) return;
    cycles += 1;
    try {
      await poll();
    } catch (error) {
      onError(error);
    }
    if (!stopped && cycles < maxCycles && canRun(control)) timer = setTimeout(tick, intervalMs);
  };

  return { start: tick, stop, getCycles: () => cycles };
}

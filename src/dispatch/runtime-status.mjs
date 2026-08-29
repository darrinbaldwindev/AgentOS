export function createRuntimeStatus({ control, health, scheduler }) {
  return {
    snapshot() {
      return {
        control: control ? { paused: control.paused === true, killed: control.killed === true } : null,
        health: health?.snapshot ? health.snapshot() : null,
        scheduler: scheduler ? { cycles: scheduler.getCycles() } : null,
      };
    },
  };
}

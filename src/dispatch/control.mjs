export function createRuntimeControl({ paused = false, killed = false } = {}) {
  return { paused, killed, updated_at: new Date().toISOString() };
}

export function canRun(control) {
  if (!control) return false;
  return control.paused !== true && control.killed !== true;
}

export function applyControlAction(control, action) {
  if (!['pause', 'resume', 'kill'].includes(action)) {
    throw new Error(`unknown control action: ${action}`);
  }
  if (control?.killed === true && action !== 'kill') {
    throw new Error('runtime is killed and requires a fresh runtime instance');
  }
  if (action === 'pause') return { ...control, paused: true, updated_at: new Date().toISOString() };
  if (action === 'resume') return { ...control, paused: false, updated_at: new Date().toISOString() };
  return { ...control, killed: true, paused: true, updated_at: new Date().toISOString() };
}

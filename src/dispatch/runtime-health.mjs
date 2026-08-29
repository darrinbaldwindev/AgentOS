export function createRuntimeHealth({ now = () => new Date() } = {}) {
  let state = { status: 'starting', last_poll_at: null, last_error_at: null, cycles: 0 };

  return {
    started() {
      state = { ...state, status: 'running' };
      return state;
    },
    pollStarted() {
      state = { ...state, last_poll_at: now().toISOString(), cycles: state.cycles + 1 };
      return state;
    },
    pollFailed() {
      state = { ...state, status: 'degraded', last_error_at: now().toISOString() };
      return state;
    },
    stopped() {
      state = { ...state, status: 'stopped' };
      return state;
    },
    snapshot() {
      return { ...state };
    },
  };
}

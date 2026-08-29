export function createRuntimeHealth({ now = () => new Date() } = {}) {
  let state = { status: 'starting', last_poll_at: null, last_error_at: null, cycles: 0, consecutive_errors: 0, consecutive_successes: 0 };

  return {
    started() {
      state = { ...state, status: 'running' };
      return state;
    },
    pollStarted() {
      state = { ...state, last_poll_at: now().toISOString(), cycles: state.cycles + 1 };
      return state;
    },
    pollSucceeded() {
      state = { ...state, status: 'running', consecutive_errors: 0, consecutive_successes: state.consecutive_successes + 1 };
      return state;
    },
    pollFailed() {
      state = { ...state, status: 'degraded', last_error_at: now().toISOString(), consecutive_errors: state.consecutive_errors + 1, consecutive_successes: 0 };
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

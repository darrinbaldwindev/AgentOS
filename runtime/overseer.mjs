// AgentOS default Overseer: deterministic supervisory audit over run/event state.
// It observes; it does not silently mutate missions or execute tools.

const SEVERITIES = Object.freeze(['info', 'warning', 'critical']);

export function createOverseer({ store }) {
  if (!store || typeof store.list !== 'function' || typeof store.create !== 'function') {
    throw new TypeError('store is required');
  }

  function auditRun(runId) {
    const run = store.get('run', runId);
    if (!run) throw new Error(`Run not found: ${runId}`);
    const events = store.list('event').filter((event) => event.runId === runId);
    const findings = [];

    const failedProviders = events.filter((event) => event.eventType === 'provider.failed');
    const recovered = events.some((event) => event.eventType === 'run.recovered');
    const completed = events.some((event) => event.eventType === 'run.completed' || event.eventType === 'run.recovered');

    if (failedProviders.length > 0) {
      findings.push({
        code: recovered ? 'PROVIDER_FAILURE_RECOVERED' : 'PROVIDER_FAILURE_UNRECOVERED',
        severity: recovered ? 'warning' : 'critical',
        recommendation: recovered
          ? 'Review the failed provider diagnostic and keep the handoff path available.'
          : 'Configure or repair a compatible fallback before retrying the mission.',
      });
    }

    if (run.status === 'completed' && !completed) {
      findings.push({
        code: 'RUN_STATE_EVENT_MISMATCH',
        severity: 'warning',
        recommendation: 'Reconcile run status with its append-only event history.',
      });
    }

    if (findings.length === 0) {
      findings.push({
        code: 'RUN_HEALTHY',
        severity: 'info',
        recommendation: 'No actionable runtime anomaly detected.',
      });
    }

    const severityRank = { info: 0, warning: 1, critical: 2 };
    const severity = findings.reduce((max, finding) => severityRank[finding.severity] > severityRank[max] ? finding.severity : max, 'info');
    const audit = Object.freeze({ runId, severity, findings: Object.freeze(findings.map(Object.freeze)), observedEventCount: events.length });

    const changeLog = store.create('artifact', {
      runId,
      kind: 'overseer-recommendation',
      status: 'pending-review',
      severity,
      audit,
      ownerActionRequired: severity !== 'info',
    });

    store.create('event', {
      runId,
      eventType: 'overseer.audit.completed',
      severity,
      recommendationArtifactId: changeLog.id,
    });

    return Object.freeze({ audit, changeLogId: changeLog.id });
  }

  return Object.freeze({ auditRun, severities: SEVERITIES });
}

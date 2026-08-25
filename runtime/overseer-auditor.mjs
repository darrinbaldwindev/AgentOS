// CORE-002: canonical persistence-backed Overseer audit service.

export function createOverseerAuditor({ persistence }) {
  if (!persistence || typeof persistence.get !== 'function' || typeof persistence.list !== 'function' || typeof persistence.create !== 'function') {
    throw new TypeError('persistence is required');
  }

  async function auditRun(runId) {
    const run = await persistence.get('run', runId);
    if (!run) throw new Error(`RUN_NOT_FOUND:${runId}`);

    const events = (await persistence.list('event')).filter((event) => event.runId === runId);
    const failedProviders = events.filter((event) => event.eventType === 'provider.failed');
    const recovered = events.some((event) => event.eventType === 'run.recovered');
    const completed = events.some((event) => event.eventType === 'run.completed' || event.eventType === 'run.recovered');
    const findings = [];

    if (failedProviders.length) {
      findings.push({
        code: recovered ? 'PROVIDER_FAILURE_RECOVERED' : 'PROVIDER_FAILURE_UNRECOVERED',
        severity: recovered ? 'warning' : 'critical',
        recommendation: recovered
          ? 'Review the failed provider diagnostic and retain the handoff path.'
          : 'Configure or repair a compatible fallback before retrying the mission.',
      });
    }

    if (run.status === 'completed' && !completed) {
      findings.push({
        code: 'RUN_STATE_EVENT_MISMATCH',
        severity: 'warning',
        recommendation: 'Reconcile run status with append-only event history.',
      });
    }

    if (!findings.length) findings.push({
      code: 'RUN_HEALTHY',
      severity: 'info',
      recommendation: 'No actionable runtime anomaly detected.',
    });

    const rank = { info: 0, warning: 1, critical: 2 };
    const severity = findings.reduce((max, finding) => rank[finding.severity] > rank[max] ? finding.severity : max, 'info');
    const audit = Object.freeze({ runId, severity, findings: Object.freeze(findings.map(Object.freeze)), observedEventCount: events.length });

    const artifact = await persistence.create('artifact', {
      runId,
      kind: 'overseer-recommendation',
      status: 'pending-review',
      severity,
      audit,
      ownerActionRequired: severity !== 'info',
    });

    await persistence.create('event', {
      runId,
      eventType: 'overseer.audit.completed',
      severity,
      recommendationArtifactId: artifact.id,
    });

    return Object.freeze({ audit, changeLogId: artifact.id });
  }

  return Object.freeze({ auditRun });
}

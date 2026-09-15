const SEVERITY_WEIGHT = Object.freeze({ info: 1, warning: 5, critical: 10 });
const CONFIDENCE_WEIGHT = Object.freeze({ low: 1, medium: 2, high: 3 });
const VALID_STATES = new Set(['green', 'yellow', 'red']);
const PAUSED_STATES = new Set(['blocked', 'cancelled', 'superseded']);

function requireText(value, field) { if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field} must be a non-empty string`); return value; }
function validateFinding(finding) {
  if (!finding || typeof finding !== 'object') throw new TypeError('finding must be an object');
  for (const field of ['finding_id', 'scan_id', 'project', 'state', 'severity', 'confidence', 'root_cause', 'recommended_action', 'expected_benefit', 'risk_of_action', 'required_authority']) requireText(finding[field], field);
  if (!VALID_STATES.has(finding.state)) throw new TypeError(`invalid finding state: ${finding.state}`);
  if (!SEVERITY_WEIGHT[finding.severity]) throw new TypeError(`invalid finding severity: ${finding.severity}`);
  if (!CONFIDENCE_WEIGHT[finding.confidence]) throw new TypeError(`invalid finding confidence: ${finding.confidence}`);
  if (!Array.isArray(finding.evidence_refs) || finding.evidence_refs.length === 0) throw new TypeError('finding evidence_refs must be non-empty');
  if (typeof finding.auto_taskable !== 'boolean') throw new TypeError('finding auto_taskable must be boolean');
  return finding;
}
function rankFinding(finding) { return SEVERITY_WEIGHT[finding.severity] * 10 + CONFIDENCE_WEIGHT[finding.confidence] * 2 + (finding.state === 'red' ? 3 : finding.state === 'yellow' ? 2 : 0); }
function findingKey(finding) { return `${finding.project}:${finding.finding_id}`; }
function validateAssuranceClaim(claim, index) {
  if (!claim || typeof claim !== 'object') throw new TypeError(`assurance claim ${index} must be an object`);
  requireText(claim.claim_id, `assurance claim ${index}.claim_id`); requireText(claim.summary, `assurance claim ${index}.summary`);
  if (!Array.isArray(claim.evidence_refs) || claim.evidence_refs.length === 0) throw new TypeError(`assurance claim ${claim.claim_id} evidence_refs must be non-empty`);
  return claim;
}

/**
 * Read-only hard gate for worker completion claims.
 * A worker claim is never sufficient by itself: Green independently checks task identity,
 * every acceptance criterion, implementation/test evidence, authorization boundaries,
 * side effects, and unresolved gaps. Only PASS may advance to PRS.
 */
export function evaluateTaskCompletion({ task, workerResult, evidence = {}, timestamp = new Date(0).toISOString() } = {}) {
  if (!task || typeof task !== 'object') throw new TypeError('task is required');
  if (!workerResult || typeof workerResult !== 'object') throw new TypeError('workerResult is required');
  requireText(task.task_id, 'task.task_id');
  if (!Array.isArray(task.acceptance_criteria) || task.acceptance_criteria.length === 0) throw new TypeError('task.acceptance_criteria must be non-empty');

  const failures = [];
  const claimedTaskId = workerResult.task_id ?? workerResult.taskId ?? null;
  const taskIdentityVerified = claimedTaskId === task.task_id;
  if (!taskIdentityVerified) failures.push('worker result does not match assigned task');

  const criterionEvidence = Array.isArray(evidence.acceptance_criteria) ? evidence.acceptance_criteria : [];
  const criteria = task.acceptance_criteria.map((criterion) => {
    const match = criterionEvidence.find((item) => item && (item.criterion === criterion || item.acceptance_criterion === criterion));
    const verified = match?.status === 'verified';
    if (!verified) failures.push(`acceptance criterion not independently verified: ${criterion}`);
    return Object.freeze({ criterion, status: verified ? 'verified' : 'insufficient_evidence', evidence_ref: match ?? null });
  });

  const implementationVerified = evidence.implementation?.status === 'verified';
  if (!implementationVerified) failures.push('implementation evidence is not independently verified');

  const testsVerified = evidence.tests?.status === 'verified';
  if (!testsVerified) failures.push('relevant test evidence is not independently verified');

  const authorizationVerified = evidence.authorization?.status === 'verified';
  if (!authorizationVerified) failures.push('authorization/scope compliance is not independently verified');

  const unauthorizedChanges = Array.isArray(evidence.authorization?.unauthorized_changes) ? evidence.authorization.unauthorized_changes : [];
  if (unauthorizedChanges.length > 0) failures.push('unauthorized changes detected');

  const sideEffects = Array.isArray(evidence.side_effects) ? evidence.side_effects : [];
  const blockingSideEffects = sideEffects.filter((item) => item && item.allowed !== true);
  if (blockingSideEffects.length > 0) failures.push('unapproved side effects detected');

  const gaps = Array.isArray(evidence.gaps) ? evidence.gaps.filter(Boolean) : [];
  if (gaps.length > 0) failures.push('unresolved completion gaps remain');

  const workerClaimedComplete = workerResult.status === 'complete' || workerResult.status === 'completed' || workerResult.claimed_complete === true;
  if (!workerClaimedComplete) failures.push('worker has not supplied a completion claim');

  const disposition = failures.length === 0 ? 'pass' : 'fail';
  return Object.freeze({
    task_id: task.task_id,
    timestamp,
    assurance_owner: 'green-agent',
    read_only: true,
    worker_claimed_complete: workerClaimedComplete,
    task_identity: Object.freeze({ status: taskIdentityVerified ? 'verified' : 'failed', claimed_task_id: claimedTaskId }),
    acceptance_criteria: Object.freeze(criteria),
    implementation: Object.freeze({ status: implementationVerified ? 'verified' : 'insufficient_evidence', evidence_ref: evidence.implementation ?? null }),
    tests: Object.freeze({ status: testsVerified ? 'verified' : 'insufficient_evidence', evidence_ref: evidence.tests ?? null }),
    authorization: Object.freeze({ status: authorizationVerified && unauthorizedChanges.length === 0 ? 'verified' : 'failed', evidence_ref: evidence.authorization ?? null }),
    side_effects: Object.freeze(sideEffects),
    gaps: Object.freeze(gaps),
    disposition,
    task_status: disposition === 'pass' ? 'green_verified_complete' : 'incomplete',
    advance_to_prs: disposition === 'pass',
    remediation_required: disposition !== 'pass',
    failures: Object.freeze([...new Set(failures)]),
    production_promotion_allowed: false,
  });
}

/** Read-only scheduler/wake reliability evaluation; it never schedules or mutates state. */
export function inspectScheduleHealth({ expectedWakes = [], tasks = [], now = Date.now(), dispatchSlaMs = 15 * 60_000, usefulProgressSlaMs = 30 * 60_000 } = {}) {
  if (!Number.isFinite(now)) throw new TypeError('now must be a finite timestamp');
  const findings = []; const taskByTrace = new Map();
  for (const task of tasks) if (task?.wake_trace_id) { const list = taskByTrace.get(task.wake_trace_id) ?? []; list.push(task); taskByTrace.set(task.wake_trace_id, list); }
  for (const expected of expectedWakes) {
    requireText(expected.wake_trace_id, 'expected wake_trace_id'); const expectedAt = Date.parse(expected.expected_at);
    if (!Number.isFinite(expectedAt)) throw new TypeError('expected_at must be date-time');
    if (['cancelled', 'paused', 'approved_pending'].includes(expected.status)) continue;
    const linked = taskByTrace.get(expected.wake_trace_id) ?? [];
    if (linked.length === 0 && now - expectedAt > dispatchSlaMs) { findings.push({ type: 'MISSED_WAKE', wake_trace_id: expected.wake_trace_id, expected_at: expected.expected_at, age_ms: now - expectedAt }); continue; }
    const active = linked.find((task) => !PAUSED_STATES.has(task.status));
    if (active) {
      const dispatchAt = Date.parse(active.dispatched_at ?? active.started_at ?? active.scheduler_wake_at ?? '');
      if (Number.isFinite(dispatchAt) && dispatchAt - expectedAt > dispatchSlaMs) findings.push({ type: 'WAKE_LATENCY_BREACH', wake_trace_id: expected.wake_trace_id, latency_ms: dispatchAt - expectedAt });
      if (['working', 'verification', 'claimed'].includes(active.status)) {
        const progressAt = Date.parse(active.last_useful_work_at ?? active.started_at ?? '');
        if (Number.isFinite(progressAt) && now - progressAt > usefulProgressSlaMs) findings.push({ type: 'STALLED_WORK_DETECTED', wake_trace_id: expected.wake_trace_id, last_useful_work_at: active.last_useful_work_at ?? null, age_ms: now - progressAt });
      }
    }
    if (linked.length > 1) findings.push({ type: 'DUPLICATE_WAKE', wake_trace_id: expected.wake_trace_id, execution_count: linked.length });
  }
  return Object.freeze({ status: findings.length === 0 ? 'green' : findings.some((f) => f.type === 'MISSED_WAKE' || f.type === 'STALLED_WORK_DETECTED') ? 'red' : 'yellow', findings: Object.freeze(findings.map((f) => Object.freeze(f))), evaluated_at: new Date(now).toISOString(), assurance_owner: 'green-agent', read_only: true });
}

/** Independently challenge a supplied evidence packet without executing remediation. */
export function evaluateAssurancePacket({ packet, timestamp = new Date(0).toISOString() } = {}) {
  if (!packet || typeof packet !== 'object') throw new TypeError('packet is required');
  for (const field of ['packet_id', 'project', 'repository', 'commit_sha']) requireText(packet[field], `packet.${field}`);
  if (!Array.isArray(packet.claims) || packet.claims.length === 0) throw new TypeError('packet.claims must be non-empty');
  const claims = packet.claims.map(validateAssuranceClaim); const limitations = Array.isArray(packet.limitations) ? packet.limitations : []; const evidence = claims.flatMap((claim) => claim.evidence_refs);
  const unverifiedClaims = claims.filter((claim) => claim.evidence_refs.some((ref) => !ref || ref.status !== 'verified')); const blockingLimitations = limitations.filter((limitation) => limitation && limitation.non_blocking !== true); const disposition = unverifiedClaims.length > 0 ? 'red' : blockingLimitations.length > 0 ? 'yellow' : 'green';
  return Object.freeze({ packet_id: packet.packet_id, project: packet.project, repository: packet.repository, commit_sha: packet.commit_sha, timestamp, assurance_owner: 'green-agent', claims: claims.map((claim) => ({ claim_id: claim.claim_id, summary: claim.summary, status: claim.evidence_refs.every((ref) => ref && ref.status === 'verified') ? 'verified' : 'insufficient_evidence', evidence_refs: claim.evidence_refs })), limitations, blocking_limitations: blockingLimitations, disposition, production_promotion_allowed: false, challenge: unverifiedClaims.length > 0 ? 'unverified claim evidence blocks promotion' : blockingLimitations.length > 0 ? 'blocking limitation prevents GREEN promotion' : 'all supplied claims have verified evidence and no blocking limitations were declared; Green Agent remains observation-only and cannot authorize promotion', provenance: { source: 'green-agent', timestamp }, evidence_count: evidence.length });
}

export function createGreenAgent({ persistence, scan, createTask, rescan } = {}) {
  if (!persistence || typeof persistence.list !== 'function' || typeof persistence.create !== 'function') throw new TypeError('persistence is required');
  if (typeof scan !== 'function') throw new TypeError('scan is required'); if (typeof createTask !== 'function') throw new TypeError('createTask is required'); if (typeof rescan !== 'function') throw new TypeError('rescan is required');
  async function runScan({ scope, scanId, timestamp = new Date(0).toISOString() } = {}) {
    requireText(scanId, 'scanId'); const result = await scan({ scope, scanId }); if (!result || result.scan_id !== scanId || !Array.isArray(result.findings)) throw new Error('invalid scan result');
    const findings = result.findings.map(validateFinding).sort((a, b) => rankFinding(b) - rankFinding(a)); const report = { scan_id: scanId, timestamp, scope: scope ?? 'portfolio', findings: findings.map((finding) => ({ ...finding, rank: rankFinding(finding), correlation_key: findingKey(finding) })), assurance_owner: 'green-agent', prs_role: 'independent-assurance-boundary', status: findings.some((finding) => finding.state === 'red') ? 'red' : findings.some((finding) => finding.state === 'yellow') ? 'yellow' : 'green' };
    const reportArtifact = await persistence.create('artifact', { kind: 'green-report', status: 'observed', scanId, report }); await persistence.create('event', { eventType: 'green.scan.completed', scanId, artifactId: reportArtifact.id, findingCount: findings.length }); const handoffs = [];
    for (const finding of report.findings) { const prior = (await persistence.list('artifact')).find((artifact) => artifact.kind === 'green-finding' && artifact.correlationKey === finding.correlation_key && artifact.current === true); const findingArtifact = await persistence.create('artifact', { kind: 'green-finding', status: prior ? 'reobserved' : 'open', current: true, correlationKey: finding.correlation_key, scanId, finding, supersedes: prior?.id ?? null }); if (prior) await persistence.update('artifact', prior.id, { current: false, supersededBy: findingArtifact.id }); await persistence.create('event', { eventType: prior ? 'green.finding.reobserved' : 'green.finding.created', scanId, findingId: finding.finding_id, artifactId: findingArtifact.id });
      if (finding.auto_taskable) { const task = await createTask({ issuer: 'green-agent', finding: findingArtifact, authority: { granted_capabilities: [], execution_authority: false, required_authority: finding.required_authority }, acceptance_criteria: ['worker result evidence recorded', 'independent post-work rescan evidence recorded'] }); if (!task || typeof task.task_id !== 'string') throw new Error('task creation did not return task_id'); await persistence.create('event', { eventType: 'green.task.handoff', scanId, findingId: finding.finding_id, taskId: task.task_id, executionAuthority: false }); handoffs.push({ findingId: finding.finding_id, taskId: task.task_id }); }
    }
    return Object.freeze({ report, reportArtifactId: reportArtifact.id, handoffs });
  }
  async function closeAfterRescan({ findingKey: key, taskId, resultEvidence } = {}) {
    requireText(key, 'findingKey'); requireText(taskId, 'taskId'); if (!resultEvidence || resultEvidence.status !== 'verified') throw new Error('verified worker result evidence is required'); const current = (await persistence.list('artifact')).find((artifact) => artifact.kind === 'green-finding' && artifact.correlationKey === key && artifact.current === true); if (!current) throw new Error(`finding not found: ${key}`); const rescanResult = await rescan({ finding: current.finding, taskId }); if (!rescanResult || !rescanResult.evidence || rescanResult.evidence.status !== 'verified') throw new Error('independent rescan evidence is required'); const closed = rescanResult.findingPresent === false; await persistence.update('artifact', current.id, { status: closed ? 'closed' : 'open', closedBy: closed ? 'independent-rescan' : null, rescanEvidence: rescanResult.evidence }); await persistence.create('event', { eventType: closed ? 'green.finding.closed' : 'green.finding.reopened', findingKey: key, taskId, evidence: rescanResult.evidence }); return Object.freeze({ findingKey: key, status: closed ? 'closed' : 'open', evidence: rescanResult.evidence });
  }
  return Object.freeze({ runScan, closeAfterRescan, rankFinding, findingKey, inspectScheduleHealth, evaluateTaskCompletion });
}

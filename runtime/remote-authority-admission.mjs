// Canonical composition seam for converting an authority-free remote candidate into
// a locally admitted dispatch task. This module does not authenticate transports or
// invent grants: both authenticated actor context and grant evidence must come from
// existing local AgentOS authority sources supplied by the caller.

import { createHash, randomUUID } from 'node:crypto';
import { createAuthorityPolicy, authoriseDispatch } from '../src/dispatch/authority.mjs';

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

function stringArray(value, name) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new TypeError(`${name} must be an array of non-empty strings`);
  }
  return [...new Set(value.map((item) => item.trim()))];
}

function stableId(prefix, value) {
  return `${prefix}_${createHash('sha256').update(value).digest('hex').slice(0, 32)}`;
}

export function createRemoteAuthorityAdmissionProducer({
  persistence,
  authoritySource,
  trustedIssuers = [],
  allowedCapabilities = [],
  now = () => new Date(),
  idFactory = randomUUID,
} = {}) {
  if (!persistence || typeof persistence.createMany !== 'function') throw new TypeError('persistence.createMany is required');
  if (!authoritySource || typeof authoritySource.resolveGrant !== 'function') throw new TypeError('authoritySource.resolveGrant is required');
  if (typeof idFactory !== 'function') throw new TypeError('idFactory must be a function');
  const issuerSet = new Set(stringArray(trustedIssuers, 'trustedIssuers'));
  const capabilitySet = new Set(stringArray(allowedCapabilities, 'allowedCapabilities'));

  async function admit({ candidate, actorContext, targetHostId, execution = null } = {}) {
    if (!candidate || typeof candidate !== 'object') throw new TypeError('candidate is required');
    if (candidate.admission_state !== 'AWAITING_AUTHORITY') throw new Error('REMOTE_CANDIDATE_NOT_AWAITING_AUTHORITY');
    if (!actorContext || typeof actorContext !== 'object' || actorContext.authenticated !== true) {
      throw new Error('REMOTE_ACTOR_NOT_AUTHENTICATED');
    }
    const actorId = requiredString(actorContext.actor_id, 'actorContext.actor_id');
    const issuer = requiredString(actorContext.issuer, 'actorContext.issuer');
    const projectId = requiredString(candidate.project_id, 'candidate.project_id');
    if (actorId !== candidate.actor_id || issuer !== candidate.issuer) throw new Error('REMOTE_ACTOR_CONTEXT_MISMATCH');
    if (!issuerSet.has(issuer)) throw new Error('REMOTE_ISSUER_NOT_TRUSTED');

    const requested = stringArray(candidate.requested_capabilities, 'candidate.requested_capabilities');
    if (!requested.length) throw new Error('REMOTE_CAPABILITY_REQUIRED');
    if (!requested.every((capability) => capabilitySet.has(capability))) throw new Error('REMOTE_CAPABILITY_NOT_ALLOWED');

    const grant = await authoritySource.resolveGrant({ candidate, actorContext, requestedCapabilities: Object.freeze([...requested]) });
    if (!grant || grant.status !== 'GRANTED') throw new Error('REMOTE_AUTHORITY_GRANT_REQUIRED');
    const grantActorId = requiredString(grant.actor_id, 'grant.actor_id');
    const grantIssuer = requiredString(grant.issuer, 'grant.issuer');
    const grantProjectId = requiredString(grant.project_id, 'grant.project_id');
    if (grantActorId !== actorId || grantIssuer !== issuer || grantProjectId !== projectId) {
      throw new Error('REMOTE_AUTHORITY_GRANT_PROVENANCE_MISMATCH');
    }
    const granted = stringArray(grant.granted_capabilities, 'grant.granted_capabilities');
    const evidenceId = requiredString(grant.evidence_id, 'grant.evidence_id');
    if (!requested.every((capability) => granted.includes(capability))) throw new Error('REMOTE_AUTHORITY_GRANT_INCOMPLETE');
    if (!granted.every((capability) => capabilitySet.has(capability))) throw new Error('REMOTE_AUTHORITY_GRANT_OUTSIDE_POLICY');

    const taskId = `task:remote:${requiredString(idFactory(), 'idFactory result')}`;
    const missionId = requiredString(grant.mission_id, 'grant.mission_id');
    const wakeTraceId = `wake:remote:${requiredString(idFactory(), 'idFactory result')}`;
    const admittedAt = now().toISOString();
    if (admittedAt === 'Invalid Date') throw new TypeError('now must return a valid Date');

    const task = {
      schema_version: 1,
      project_id: projectId,
      mission_id: missionId,
      task_id: taskId,
      delivery_id: requiredString(candidate.delivery_id, 'candidate.delivery_id'),
      request_id: requiredString(candidate.request_id, 'candidate.request_id'),
      wake_trace_id: wakeTraceId,
      actor_id: actorId,
      issuer,
      admitted_by: issuer,
      authority_admitted: true,
      authority_evidence_id: evidenceId,
      authority: { action: 'execute', granted_capabilities: Object.freeze([...granted]) },
      required_capabilities: Object.freeze([...requested]),
      target_host_id: requiredString(targetHostId, 'targetHostId'),
      environment: 'DRY_RUN',
      pickup_state: 'QUEUED',
      status: 'queued',
      scope: Object.freeze([...(candidate.scope ?? [])]),
      constraints: Object.freeze([...(candidate.constraints ?? [])]),
      objective: requiredString(candidate.objective, 'candidate.objective'),
      created_at: admittedAt,
      ...(execution == null ? {} : { execution: structuredClone(execution) }),
    };

    authoriseDispatch(task, createAuthorityPolicy({ issuers: [...issuerSet], capabilities: [...capabilitySet] }));

    const requestMarkerId = stableId('remote_admission_request', task.request_id);
    const taskArtifactId = stableId('remote_delivery_task', task.delivery_id);
    try {
      await persistence.createMany([
        { type: 'artifact', input: { id: requestMarkerId, artifactType: 'remote.admission.request', payload: {
          request_id: task.request_id, delivery_id: task.delivery_id, task_id: task.task_id,
          mission_id: task.mission_id, authority_evidence_id: evidenceId,
        } } },
        { type: 'artifact', input: { id: taskArtifactId, artifactType: 'dispatch.task', payload: task } },
      ]);
    } catch (error) {
      throw Object.assign(new Error('REMOTE_ADMISSION_REPLAY_OR_CONFLICT'), { cause: error });
    }

    return Object.freeze({ task: Object.freeze(task), artifact_id: taskArtifactId, request_marker_id: requestMarkerId });
  }

  return Object.freeze({ admit });
}

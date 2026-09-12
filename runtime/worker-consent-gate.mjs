// AGENTOS-P0-WORKER-CONSENT-001
// Provider-neutral execution-consent adapter for the governed execution boundary.
// This module does not create authority, policy, approval, scheduler, persistence,
// worker, or provider-specific safety bypasses. It consumes a caller-supplied
// canonical consent resolver and optional intervention registry.

export const WORKER_CONSENT_STATES = Object.freeze({
  PRE_AUTHORIZED: 'PRE_AUTHORIZED',
  CONFIRMATION_REQUIRED: 'CONFIRMATION_REQUIRED',
  PROHIBITED: 'PROHIBITED',
});

function requireFunction(target, name, label) {
  if (!target || typeof target[name] !== 'function') {
    throw new TypeError(`${label}.${name} is required`);
  }
}

function consentError(code, decision) {
  const error = new Error(code);
  error.code = code;
  error.consent = decision ?? null;
  return error;
}

export function createWorkerConsentGate({ resolveConsent, interventions = null } = {}) {
  if (typeof resolveConsent !== 'function') {
    throw new TypeError('resolveConsent is required');
  }
  if (interventions !== null) requireFunction(interventions, 'record', 'interventions');

  async function recordIntervention({ actorContext, task, decision }) {
    if (!interventions) return null;
    return interventions.record({
      actorContext,
      task,
      consent: decision,
      reason: decision.reason ?? null,
      required_authority: decision.required_authority ?? null,
      blocked_operation: task?.execution?.operation ?? null,
    });
  }

  async function assertAllowed({ actorContext, task } = {}) {
    if (!actorContext || typeof actorContext !== 'object') throw new TypeError('actorContext is required');
    if (!task || typeof task !== 'object') throw new TypeError('task is required');

    const decision = await resolveConsent({ actorContext, task });
    if (!decision || typeof decision !== 'object') throw consentError('WORKER_CONSENT_DECISION_INVALID', decision);

    const state = decision.state;
    if (!Object.values(WORKER_CONSENT_STATES).includes(state)) {
      throw consentError('WORKER_CONSENT_STATE_INVALID', decision);
    }

    if (state === WORKER_CONSENT_STATES.PROHIBITED) {
      await recordIntervention({ actorContext, task, decision });
      throw consentError('WORKER_CONSENT_PROHIBITED', decision);
    }

    if (state === WORKER_CONSENT_STATES.CONFIRMATION_REQUIRED) {
      if (decision.confirmed !== true) {
        await recordIntervention({ actorContext, task, decision });
        throw consentError('WORKER_CONSENT_CONFIRMATION_REQUIRED', decision);
      }
      // Confirmation satisfies only the consent gate. It does not alter task,
      // actorContext, capability, scope, authority, policy, risk, or approval.
    }

    return Object.freeze({
      state,
      confirmed: decision.confirmed === true,
      decision_id: decision.decision_id ?? null,
      reason: decision.reason ?? null,
    });
  }

  return Object.freeze({ assertAllowed });
}

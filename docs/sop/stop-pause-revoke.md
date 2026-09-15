# SOP-CTRL-001 — Stop, Pause and Revoke

**Owner:** SOP Overseer  
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT  
**Version:** 0.1.0  
**Last verified:** 2026-09-15  
**Audience:** all users and operators

## Purpose

Prevent dangerous ambiguity around stopping work or withdrawing future authority.

## Canonical state language

These states must not be collapsed:

- **Stop requested** — AgentOS accepted/initiated the user's stop request.
- **Stopping…** — shutdown/cancellation is in progress and final cessation is not yet verified.
- **Execution stopped** — evidence confirms the bounded execution has ceased.
- **Unable to confirm stop** — AgentOS cannot prove cessation; treat the work as uncertain and escalate/recover.
- **Verification pending / failed** — execution state and outcome verification are not complete.
- **Recovery required** — state cannot be safely continued or declared complete without reconciliation.

`Stop requested` must never be rendered as `Stopped immediately` unless the runtime genuinely guarantees and proves that semantic for the affected action.

## Pause versus Stop versus Revoke

**Pause** prevents or defers subsequent work according to the implemented lifecycle; it must not be assumed to undo an already in-flight side effect.

**Stop** requests termination/cancellation of current bounded work. The UI/operator must wait for evidence before treating execution as stopped.

**Revoke** withdraws authority for future or continuing actions within the revocation contract. Revocation is not automatically proof that a side effect already committed was reversed.

The exact runtime semantics must be revalidated for each worker/capability. Documentation must not generalize Basic Chat semantics to browser, Windows UI, external APIs or financial actions that do not yet share the same proven lifecycle.

## User procedure

1. Select the relevant job/mission and issue Pause, Stop or Revoke through the canonical AgentOS surface.
2. Observe the returned state. If it says `Stop requested` or `Stopping…`, do not assume cessation.
3. Wait for `Execution stopped` evidence or a terminal blocked/recovery state.
4. If AgentOS reports `Unable to confirm stop`, avoid starting conflicting/replacement work against the same resource until recovery/reconciliation is complete.
5. Review `What happened`/evidence where available to understand what completed before the stop took effect.

## Failure / escalation

Escalate to recovery when a lock/owner is uncertain, the worker becomes unreachable, evidence is stale/conflicting, a side effect may have occurred without a durable receipt, or the stop result cannot be correlated to the exact running task.

Do not delete uncertain locks or replay the task merely to make the UI appear stopped. Recovery must follow the canonical runtime's ownership/replay rules.

## Current evidence boundary

Basic Chat has bounded lifecycle work and frontend truth-state contracts, but physical Windows acceptance and broader Level 2 mutation semantics remain separate gates. This SOP therefore defines truthful language and operator behavior; it does not claim universal immediate cancellation across all future AgentOS capabilities.

## Dependencies

- Basic Chat lifecycle lineages (#87, #92, #93, #96, #98, #102, #111)
- Frontend trust/recovery contracts (#110/#111)
- worker ownership/lock semantics
- evidence/receipt and recovery semantics

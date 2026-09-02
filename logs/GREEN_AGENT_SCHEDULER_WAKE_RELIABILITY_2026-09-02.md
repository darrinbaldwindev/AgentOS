# Green Agent — Scheduler / Wake Reliability Handoff

**Date:** 2026-09-02
**Authority:** CHATGPT Overseer
**Source:** Gemini independent research + AgentOS Project Overseer reconciliation
**Purpose:** Durable implementation/test baseline for Green Agent scheduler and wake reliability.

## Decision
Accepted direction: strengthen Green Agent's independent ability to detect and verify missed, delayed, stalled, and duplicate scheduled work without creating a second scheduler, runtime, state store, or assurance system.

## Governance boundary
Green Agent remains read-only: analyse, evaluate, report, challenge, and escalate. It must not reschedule work, mutate mission state, become the scheduler, or bypass AgentOS governance. Cross-project/cross-tenant audit must remain scoped through existing ActorContext/capability controls.

## Confirmed gaps
1. Negative/omission detection: Green currently validates execution evidence but cannot reliably prove Expected Execution minus Actual Execution when a scheduled wake disappears before dispatch.
2. Wake correlation continuity: Green does not yet verify an end-to-end wake_trace_id/dispatch trace from scheduler tick through mission/worker execution to signed PRS evidence.
3. Stale/progress invariant: Green lacks a deterministic read-only rule distinguishing process heartbeat from useful execution progress.
4. Scheduler/wake reliability hazards require deterministic proof: queue/drop behavior, stalled workers, duplicate delivery/idempotency windows, and clock/SLA drift must be tested rather than assumed.

## Existing capabilities to reuse
- Existing lifecycle states: queued, claimed, dispatched, running, completed, failed, cancelled.
- Existing execution timestamps such as scheduled_at, dispatched_at, started_at, completed_at and last_heartbeat; do not introduce redundant next_wake_at/last_pushed_at concepts without code evidence showing a genuine need.
- Existing scheduler/controller as the sole timing/orchestration authority.
- Existing PRS evidence and audit stream.
- Existing ActorContext, capability passports, policy engine, and tenant/project scope controls.
- Existing Green Agent runtime and verification contracts.

## Minimum additions
### 1. End-to-end wake_trace_id
Generate a unique trace identifier at the scheduler timer/wake boundary and propagate it unchanged through:
Scheduler -> Mission Context -> Dispatch/Worker Execution -> PRS Evidence.
Green must be able to verify continuity and identify missing links.

### 2. last_useful_work_at
Extend active mission progress evidence so heartbeat/liveness data can distinguish system_liveness from useful work progress. Define useful work narrowly and deterministically; meaningless heartbeat activity must not keep a stalled mission green.

### 3. Green Agent inspect_schedule_health()
Implement as pure read-only evaluation using existing state/evidence:
- MISSED_WAKE: expected scheduled work remains queued/pending beyond its legitimate SLA window.
- WAKE_LATENCY_BREACH: actual dispatch/execution occurs beyond the defined SLA.
- STALLED_WORK_DETECTED: running work has no qualifying useful progress beyond timeout.
- DUPLICATE_WAKE: multiple execution records are associated with the same wake_trace_id.
Rules must account for legitimate pause, approval, retry, backpressure, cancellation, and other valid states to avoid false positives.

## Required deterministic tests
1. Dropped Wake: simulate queue rejection/drop after scheduler wake and prove Green detects the omission using pre-existing expected-wake evidence.
2. Stalled Work / Unproductive Heartbeat: worker remains alive and emits heartbeats while useful execution is blocked; Green must emit STALLED_WORK_DETECTED.
3. Duplicate Wake: deliver the same wake twice; verify existing locking/idempotency behavior and unified trace evidence. Detection is required even if prevention is handled elsewhere.
4. Clock/SLA Drift: move test time beyond scheduled_at plus SLA and verify the correct Green finding without production scheduler changes.
5. Recovery/rescan: after a controlled failure, verify Green's subsequent independent rescan accurately reflects recovery.

## Critical omission-detection requirement
A scheduler failure cannot be proven solely from the absence of a mission record. The system must preserve sufficient expected-wake evidence before/at the scheduler boundary for Green to distinguish a genuine missed wake from an unscheduled item. Determine the smallest existing evidence surface that provides this proof; do not invent a second scheduler ledger.

## PRS reporting
Preserve raw schedule/execution evidence and attach Green findings through existing PRS mechanisms. Green findings should be independently traceable to the evidence that caused them. PRS remains assurance, not a second runtime or scheduler.

## Implementation order
1. Phase 1 — trace and useful-progress evidence.
2. Phase 2 — Green inspect_schedule_health().
3. Phase 3 — deterministic failure-injection/integration tests.
4. Phase 4 — PRS audit/escalation integration.

## Acceptance principle
Do not declare scheduler reliability GREEN because the scheduler reports healthy. Green must independently establish:
- Was the work expected?
- Did the wake occur and traverse the chain?
- Did useful work progress?
- Was execution unique/idempotent?
- Is the evidence complete and policy-compliant?

## Research status
Gemini architecture research is complete for this issue. Further Gemini research is only warranted if implementation/testing reveals a genuinely new unresolved architecture, security, or reliability question.

## Next action
AgentOS Project Overseer: reconcile this durable handoff with current code, implement Phase 1 using existing contracts, then execute Phase 2/3 validation. No duplicate architecture. No production scheduler state or credentials changes.

# Green Agent — Continuous Reporting-Chain Governance

**Status:** Accepted control-plane policy
**Date:** 2026-09-01

## Decision

Green Agent is responsible for continuously assessing the integrity of the Project Overseer -> ChatGPT Overseer reporting chain as an independent assurance function. Issues must not depend on opportunistic repository scans to be discovered.

Green Agent does **not** own execution, remediation, scheduling, dispatch or canonical state. It observes evidence/events and raises findings/challenges into the AgentOS control plane.

## Required monitoring

For each mission/task completion or material state transition, Green Agent should assess whether:

- a report/event was emitted;
- the report reached the required ChatGPT Overseer destination;
- project_id, mission_id, task_id and correlation_id are present and consistent;
- trigger, author, executor and verifier are attributable;
- claimed status is supported by evidence;
- commit/test/build evidence exists where applicable;
- authority/scope is observable and valid;
- blockers and next actions are recorded;
- handoffs are acknowledged;
- required reports are not stale or missing.

## Continuous coverage model

Reporting integrity is an event-driven control, not an occasional scan finding.

1. **Event trigger:** task/milestone/state transition emits a control event.
2. **Expected-report rule:** policy determines whether a report is mandatory and its deadline/TTL.
3. **Watch state:** Green Agent records pending expected reports.
4. **Arrival check:** incoming report is correlated and evidence-checked.
5. **Timeout/mismatch:** missing, late, malformed or contradictory reporting creates a durable finding/challenge.
6. **Escalation:** unresolved findings are surfaced to the appropriate Overseer/AgentOS decision path.
7. **Resolution evidence:** the finding remains open until evidence demonstrates resolution; it is not cleared merely because a later scan cannot reproduce it.

## Failure classes

- `REPORT_MISSING`
- `REPORT_LATE`
- `REPORT_UNCORRELATED`
- `REPORT_INCOMPLETE`
- `REPORT_UNSUPPORTED_CLAIM`
- `REPORT_DESTINATION_MISMATCH`
- `REPORT_AUTHORITY_MISMATCH`
- `REPORT_STATUS_CONFLICT`
- `REPORT_HANDOFF_UNACKNOWLEDGED`
- `REPORT_STALE`

## Boundaries

Green Agent may inspect, compare, classify, challenge and recommend. It may not modify project repositories, execute project work, silently alter canonical state, bypass consent, or mark its own findings resolved without independent evidence.

The scheduler may emit triggers but does not become the Green Agent. The Event Bus transports signals but does not decide health. The Mission Ledger records history but does not independently certify it. PRS remains the independent project assurance layer and can consume the same evidence for deeper assurance.

## Definition of done

The reporting chain is considered governed only when deterministic tests demonstrate that a required report cannot silently disappear between Project Overseer and ChatGPT Overseer, and that missing/late/contradictory reports create durable, attributable findings without requiring a random repository scan.

# Green Agent Escalation Protocol

**Status:** Accepted control-plane contract
**Date:** 2026-09-01

## Purpose

Define how Green Agent findings become durable escalations rather than transient scan results.

## Flow

`DETECTION -> VALIDATION -> FINDING -> ESCALATION -> OVERSEER DECISION -> AUTHORISED ACTION -> EVIDENCE -> INDEPENDENT VERIFICATION -> RESOLUTION`

## Rules

1. Green Agent must not remediate a finding it raises.
2. Every escalation receives a unique escalation ID and preserves project/mission/task/correlation context.
3. The escalation records severity, reason, evidence references, detected-at time, expected response, and current state.
4. Escalations are durable until independent evidence supports resolution.
5. A later scan cannot silently close an unresolved escalation.
6. The receiving Overseer must acknowledge the escalation or it becomes an unacknowledged-escalation finding.
7. Repeated failures may increase severity according to policy, but Green Agent does not grant itself authority to execute.
8. Human intervention remains mandatory whenever policy requires it.

## Reporting-chain examples

- Missing report -> `REPORT_MISSING` -> escalate.
- Late report -> `REPORT_LATE` -> escalate.
- GREEN claim without evidence -> `REPORT_UNSUPPORTED_CLAIM` -> challenge/escalate.
- Wrong destination -> `REPORT_DESTINATION_MISMATCH` -> escalate.
- Conflicting status -> `REPORT_STATUS_CONFLICT` -> escalate.
- No acknowledgement -> `REPORT_HANDOFF_UNACKNOWLEDGED` -> escalate.

## Non-goals

Green Agent is not the scheduler, dispatcher, worker, remediation agent, canonical state owner, or PRS replacement.

## Acceptance

A deterministic fixture must prove that Green Agent can raise an escalation, the escalation survives repeated scans, the receiving Overseer acknowledges it, authorised remediation occurs through the normal AgentOS path, and only independently verified evidence resolves the escalation.

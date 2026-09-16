# Audit Log and User-History Truth Contract

**Document ID:** SOP-AUDIT-001
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Principle
An audit/history surface is a view of durable evidence, not a second ledger and not authority.

## Required distinctions
Show separately where applicable: requested, admitted, acknowledged, started, side effect attempted, side effect independently verified, receipt persisted, stopped, blocked, failed, Green state and PRS state.

Do not collapse `stop requested` into `stopped`, `receipt exists` into `side effect proven`, worker verification into independent assurance, or scheduled into authorised/executed.

## Integrity
History entries should bind canonical task/mission/worker/result identifiers, evidence source and timestamps. Corrections must preserve the prior durable record or an auditable supersession relationship rather than silently rewriting history.

## User-facing truth
Plain-language history may summarize technical evidence but must preserve uncertainty and negative states. UNKNOWN must not render as success.

## Privacy
Audit retention, export and deletion follow data-retention/legal-hold controls. Sensitive values and secrets must be redacted without erasing the evidence needed to establish what class of action occurred.

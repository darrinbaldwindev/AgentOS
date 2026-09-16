# Permission / Approval Negative-State Examples

**Document ID:** SOP-APPROVAL-002
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Purpose
Prevent user interfaces, workers and receipts from turning incomplete authority evidence into permission.

| Evidence state | Safe interpretation |
|---|---|
| No approval record | NOT APPROVED |
| Approval requested | REQUESTED, not approved |
| UI opened | PRESENTED, not approved |
| User viewed prompt | VIEWED, not approved |
| Ambiguous reply | UNKNOWN; hold |
| Approval for different target/action | NOT APPLICABLE |
| Approval expired/revoked | NOT APPROVED |
| Approval exists but actor/mission correlation conflicts | CONFLICT; hold |
| Connector capability exists | CAPABLE, not approved |
| Worker says approved without canonical evidence | UNVERIFIED; hold |
| Approval recorded after side effect | does not retroactively authorize prior side effect |
| Stop/revoke requested | REQUESTED; verify enforcement separately |

## Required binding
Approval evidence should bind actor, mission/task, exact protected action, target/scope, constraints, time/expiry where applicable, canonical authority source and durable identifier.

## UX rule
Simple, Essentials and Tech Head may simplify wording but must never collapse REQUESTED, UNKNOWN, REVOKED or CONFLICT into APPROVED.

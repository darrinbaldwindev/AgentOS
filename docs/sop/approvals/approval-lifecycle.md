# SOP-APPROVAL-001 — Requesting, Recording, Expiring and Revoking Approval

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
Approval is explicit, bounded evidence from an authorised approver. It is never inferred from credentials, capability availability, a schedule, prior similar approval, silence, model confidence or historical behavior.

## Approval record
Bind: approval ID; approver identity; requester/mission/task; exact action; exact target; scope; conditions; risk class; authority source; issue time; expiry/time window; one-shot/reusable semantics; budget/spend ceiling if relevant; code/data head/version if material; evidence reference; revocation state; downstream use/correlation.

## Procedure
1. Determine whether canonical policy requires approval.
2. Present the actual action/target/risk and material consequences to the authorised approver.
3. Record the bounded decision without broadening it.
4. Before execution verify identity, scope, target, expiry, conditions and current revocation state.
5. Revalidate when the target/head, requested action, risk, budget, recipient, supplier, production environment or other material condition changes.
6. Treat expired/revoked/mismatched/ambiguous approval as DENIED/NOT AUTHORISED.
7. Preserve approval evidence with the execution receipt without copying unnecessary secrets/PII.

## Revocation
Revocation stops future admission under that approval. It does not prove already-running work stopped; combine with the Stop/Pause/Revoke SOP and verify actual execution state.

## Prohibited shortcuts
- approval to inspect != approval to mutate;
- approval to draft != approval to send/publish;
- approval to test != approval to deploy;
- approval for one repository/head != blanket approval for another;
- API credentials != approval;
- scheduler enablement != approval for arbitrary tasks;
- worker assignment != approval;
- CI/Green/PRS != owner commercial/legal approval.

Approval evidence cannot self-certify the action it authorises.
# SOP-to-Enforcement Traceability Contract

**Document ID:** SOP-ACCEPT-002
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Objective
Prevent the SOP library becoming prose that is disconnected from implementation.

For every P0 rule, maintain a traceability row with:
- requirement/rule ID;
- source SOP section;
- canonical runtime enforcement point;
- machine-readable policy/schema if any;
- positive test(s);
- negative/adversarial test(s);
- evidence/receipt fields;
- user-facing state/surface;
- Green verification expectation;
- PRS challenge expectation;
- implementation status: `UNMAPPED`, `MAPPED`, `TESTED`, `INDEPENDENTLY VERIFIED`, `BLOCKED`;
- exact head/version last verified.

## Rules
- Documentation text alone never advances implementation status.
- A test name without exact-head execution evidence is `MAPPED`, not `TESTED`.
- Worker-owned tests do not substitute for independent assurance.
- If enforcement changes, dependent traceability rows become revalidation-due.
- A rule with no enforcement point must remain visibly `UNMAPPED` rather than being described as enforced.

## Priority
Start with authority/approval, protected actions, controlled file mutation, path boundary, replay/idempotency, recovery, receipts, stop/revoke, budgets, provider/data routing, Green and PRS boundaries.

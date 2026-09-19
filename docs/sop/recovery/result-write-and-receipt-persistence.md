# SOP-REC-003 — Result Write and Receipt Persistence Failure

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
A side effect, result write, receipt write and independent durability verification are separate events. A truthy recorder acknowledgement is not independent proof of durability. Contradictory persistence evidence fails closed.

## Failure classes
- execution did not occur;
- execution occurred, result write failed;
- result persisted, receipt failed;
- receipt acknowledgement returned but durable artifact is missing;
- artifact exists for wrong task/mission/worker/head;
- acknowledgement and artifact contradict;
- crash occurred between side effect, verification, persistence or release;
- retry/replay cannot determine prior side-effect state.

## Procedure
1. Preserve exact task/mission/wake/worker/code/target correlation.
2. Do not re-execute merely because a receipt/result is missing.
3. Inspect canonical durable state and target postimage/readback where authorised.
4. Classify prior side effect as VERIFIED_OCCURRED, VERIFIED_NOT_OCCURRED or UNKNOWN.
5. If UNKNOWN, enter canonical recovery/manual review rather than replaying a non-idempotent action.
6. Accept a receipt only when its correlation and persistence semantics match the canonical contract.
7. Reject explicit `persisted:false`, wrong-correlation artifacts, contradictory acknowledgement/artifact evidence, stale receipts and receipts that claim a side effect not independently supported where such support is required.
8. Persist recovery outcome separately; do not rewrite historical evidence to look successful.

## Current Level-2 boundary
AgentOS PR #120 hardens contradictory PowerShell receipt persistence on its exact lineage, but explicitly states `{persisted:true}` remains a trusted-recorder acknowledgement rather than independent durability proof. This SOP must not upgrade that implementation statement to independent assurance.

## Promotion rule
Receipt persistence evidence alone cannot establish continuous project-file ownership, physical Windows acceptance, Green or PRS. Those remain separate exact-head gates.
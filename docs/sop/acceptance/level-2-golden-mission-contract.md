# AgentOS Level-2 Golden Mission Acceptance Contract

**Document ID:** SOP-ACCEPT-001
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT / INDEPENDENT-ASSURANCE-REQUIRED

## Purpose
Define one repeatable non-production fixture mission that proves the Level-2 chain without creating a new scheduler, ledger, worker registry, authority source, Green or PRS implementation.

## Golden mission
On an approved fixture repository/root, the canonical AgentOS path must:
1. receive a mission with exact mission/task/worker correlation;
2. resolve canonical authority and approval for the bounded target/action;
3. inspect the target and record preimage identity/hash;
4. perform one bounded edit through the existing worker/mutation path;
5. verify exact changed target and expected diff;
6. run bounded tests/acceptance criteria;
7. persist mutation/result receipts;
8. independently verify the evidence through Green;
9. independently challenge the exact head/evidence through PRS;
10. expose final state and any uncertainty through the canonical user-facing truth model.

## Mandatory negative variants
The same fixture suite must exercise: duplicate/replayed task, concurrent writer/ownership displacement, crash before mutation, crash after mutation before receipt, crash after execution before verification, result/receipt-write failure, stale lock, changed target/path alias, interrupted tests, approval revoked/expired, correlation conflict and recovery replay.

## Acceptance rule
A happy-path pass is insufficient. Level-2 acceptance requires the defined negative variants to fail closed or recover deterministically, with no false success/false GREEN.

## Evidence packet
Bind repository + exact head, OS/runtime version, mission/task/worker IDs, authority/approval evidence, target/preimage/postimage, mutation receipt, test evidence, recovery evidence, Green evidence and PRS evidence.

## Boundary
Hosted CI can prove hosted behavior only. Physical owner-Windows acceptance remains separately required. Worker self-report cannot satisfy Green or PRS.

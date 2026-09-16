# AgentOS Failure-Injection Catalogue

**Document ID:** SOP-ASSURE-001
**Status:** DRAFT / TEST-DESIGN / PRS-INPUT

## Purpose
Provide a reusable adversarial catalogue for CI/fixtures and independent PRS challenge. This document does not certify results.

## Level-2 P0 injections
1. duplicate/replayed task before pickup;
2. replay after side effect but before receipt persistence;
3. concurrent writers on same target;
4. ownership displacement immediately before publish;
5. ownership displacement after publish before verification;
6. crash before mutation;
7. crash during atomic/prepared mutation;
8. crash after mutation before receipt;
9. crash after execution before verification;
10. result-write/receipt-write failure;
11. stale lock and abandoned lock recovery;
12. changed target through symlink/junction/reparse/alias;
13. preimage changed after inspection;
14. interrupted tests;
15. verification reads stale evidence;
16. approval expires/revokes before side effect;
17. authority/correlation identity mismatch;
18. worker attempts self-verification as independent Green;
19. receipt exists without target mutation;
20. target mutation exists without receipt.

## Cross-cutting injections
Provider outage mid-mission, budget exhaustion, connector permission revoked, disk-full/persistence failure, malformed/unknown receipt schema, clock/timestamp anomalies, duplicate external-send retry and partial restore/migration.

## Expected outcome
Every case defines one of: deterministic recovery, explicit BLOCKED/UNKNOWN, or verified failure. No injection may be normalized into success merely because later state appears plausible.

## Evidence
Bind exact head, fixture, injection point, expected invariant, observed state, receipts/logs, Green result and independent PRS result.

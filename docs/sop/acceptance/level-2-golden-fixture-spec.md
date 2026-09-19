# Level-2 Golden Fixture Specification

**Document ID:** SOP-TRACE-002
**Status:** DRAFT / TEST-DESIGN

## Fixture boundary
Use a dedicated non-production temporary project root containing one version-controlled text fixture, one bounded validation command and no credentials, customer data, production configuration or external side effects.

## Canonical mission shape
The mission must carry immutable mission/task/wake/worker/request identities, actor/authority evidence references, explicit consent mode, acceptance criteria, exact target, approved root, action class and idempotency/replay identity using fields already supported by the canonical runtime. If a required semantic has no canonical field, mark it UNMAPPED; do not create a parallel mission format merely for this fixture.

## Happy path
1. inspect fixture and bind preimage;
2. authorize exact bounded mutation;
3. change one deterministic token;
4. verify exact target/postimage/diff;
5. run deterministic fixture validation;
6. persist canonical result/mutation receipt;
7. reload evidence from canonical persistence;
8. project result through user-facing evidence view;
9. route unchanged exact evidence to Green and PRS.

## Required injections
Replay same delivery; conflicting mission/task/wake; preimage drift; concurrent writer; successor ownership displacement before publish and before release; crash before mutation; crash after mutation before receipt; crash before verification; receipt-write failure; stale lock; symlink/junction/alias escape; revoked/expired approval; interrupted validation; malformed receipt reload.

## Pass rule
Every injection has a predefined expected disposition. A test passes only when the observed state matches that disposition and the evidence packet preserves the exact failure/recovery state. Later plausible filesystem state cannot retroactively convert a failed/unknown receipt path to success.

## Output packet
Exact repo/head, runtime/OS, fixture identity, canonical IDs, authority reference, pre/post hashes, diff, lock/ownership evidence, validation result, receipt ID/persistence/reload evidence, recovery/replay evidence, Green reference, PRS reference and unresolved uncertainty.

## Physical Windows
Hosted execution may exercise the fixture but cannot satisfy owner-machine acceptance. Physical execution is a later owner-authorized gate after upstream P0 defects are closed.

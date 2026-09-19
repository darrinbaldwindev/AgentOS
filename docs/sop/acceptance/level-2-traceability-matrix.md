# Level-2 SOP-to-Enforcement Traceability Matrix

**Document ID:** SOP-TRACE-001
**Status:** DRAFT / EXACT-HEAD-SCOPED
**Reconciled:** 2026-09-19

This matrix maps requirements to current evidence. It does not create enforcement or assurance.

| Requirement | Current implementation/evidence | State | Current gap / next proof |
|---|---|---|---|
| Bounded governed Windows execution | AgentOS #104 exact head `6b32b2cad54eb58bbf8d30285c82af875a211686`; hosted exact-head CI recorded SUCCESS | TESTED for hosted bounded scope | physical owner-Windows acceptance; independent promotion gates |
| Continuous ownership through mutation -> verification -> success receipt -> release | #104 project-file path; PRS #17 independently reproduced successor-displacement false-success defect on challenged earlier exact AgentOS target | BLOCKED | repair one continuous crash-releasing ownership fence, then exact-head adversarial rerun |
| Authenticated actor + canonical grant provenance | #104 remote admission consumes authenticated actor/grant-shaped composition dependencies | BLOCKED | bind and prove real canonical transport/session authenticator and durable grant source end-to-end |
| Admission -> local-wake compatibility | PRS #17 challenged target showed admitted non-PowerShell payload omitted local-wake-required fields | BLOCKED / REVALIDATION-DUE | exact-current-#104 independent rerun after any repair |
| Receipt persistence contradiction rejection | AgentOS #120 exact head `a0b13feafdfc85a81ba5656c188118f7cf5effc9`; cross-platform exact-head tests recorded SUCCESS | TESTED | independent exact-head challenge; physical durability remains separate |
| Runtime-shell eligibility normalization | AgentOS #112 exact head `dbd7a18b845f6fa24c8b1c9a7e58825d949211fc`; Tests + Wake SUCCESS | TESTED for bounded eligibility scope | does not prove authority/mutation readiness |
| Duplicate/replay/correlation fail-closed behavior | #104 records bounded verified correlation/replay regression coverage | TESTED for cited paths | map remaining execution-authorizing paths; independent exact-head challenge |
| Crash/result-write/recovery fail-closed behavior | #104/#120 recovery and receipt lineages plus SOP-REC controls | MAPPED / PARTIALLY TESTED | golden-mission failure injections across exact current integrated head |
| Physical Windows Level-2 evidence | PRS #24 contract + PRS #17 evaluator provenance hardening | BLOCKED / OWNER_REQUIRED | real owner machine, exact code/config identity, scheduler/local-wake exercise, required negatives, independent custody |
| Green independence | governance contract requires independent Green | MAPPED | exact-current-head Green evidence; worker self-report cannot satisfy |
| PRS independence | PRS #17 adversarial lineage exists and currently withholds certification/promotion | INDEPENDENTLY VERIFIED for challenged exact targets only | rerun against repaired/current exact AgentOS head before transferring any disposition |

## Controlling interpretation
A later AgentOS head does not inherit an earlier PRS PASS or FAIL without checking whether the challenged implementation is unchanged or rerunning the probe. Conversely, hosted CI success does not erase an independently reproduced defect on a challenged target.

## Golden-mission closure order
1. close continuous ownership;
2. close authenticated actor/canonical grant provenance and admission compatibility;
3. run integrated golden mission and all P0 failure injections on one exact candidate head;
4. obtain independent Green evidence;
5. obtain PRS exact-head challenge;
6. only then perform owner-authorized physical Windows acceptance;
7. preserve DRAFT/unmerged/non-production state until separate promotion authority exists.

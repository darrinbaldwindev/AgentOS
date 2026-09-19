# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 1.7.0  
**Last verified:** 2026-09-19

## Evidence baseline
Cycles 001–016 established the evidence-controlled SOP foundation. Cycles 017–018 transition the library from document expansion to **SOP -> enforcement -> automated test -> runtime evidence -> Green -> PRS**. This register creates no runtime authority and is not legal approval or overall assurance.

## P0 AgentOS governance and Level-2 controls
| ID | Domain | Status |
|---|---|---|
| SOP-AUTH-001 / SOP-APPROVAL-001..002 | authority, approvals, negative states | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-CTRL-001 | stop/pause/revoke | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-WIN-001 | bounded Windows worker | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-FILE-001..002 | controlled mutation + path/link boundary | IMPLEMENTATION-ADVANCED / INTEGRATION-GATED |
| SOP-REC-001..005 | crash/result/ownership/replay/backup recovery | IMPLEMENTATION-ADVANCED / INTEGRATION-GATED |
| SOP-EVID-001..002 | receipts/evidence/Green/PRS + user explanation | DRAFT |
| SOP-MISSION-001 / SOP-SCHED-001 | mission authority + scheduled work | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-MCP-001 / SOP-CONNECTOR-001..002 | capability/connectors/protected actions | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-DATA-001..003 / SOP-COST-001 | data + budget boundaries | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-SEC-001..003 / SOP-IR-001 | security/incident/credential evidence | DRAFT / REVIEW REQUIRED |

## Enforcement-transition controls
| ID | Control | Status |
|---|---|---|
| SOP-ACCEPT-001 | Level-2 golden mission acceptance contract | DRAFT / IMPLEMENTATION-DEPENDENT / INDEPENDENT-ASSURANCE-REQUIRED |
| SOP-ACCEPT-002 | SOP-to-enforcement traceability contract | ACTIVE INTERNAL TRACEABILITY |
| SOP-ACCEPT-003 | machine-readable policy candidate schema | PRODUCT-DIRECTION / DESIGN INPUT |
| SOP-ACCEPT-004 | canonical evidence envelope | PRODUCT-DIRECTION / DESIGN INPUT |
| SOP-ACCEPT-005 | capability registry evidence contract | PRODUCT-DIRECTION / DESIGN INPUT |
| SOP-ASSURE-001 | failure-injection catalogue | DRAFT / TEST-DESIGN / PRS-INPUT |
| SOP-TRACE-001 | Level-2 exact-head traceability matrix | ACTIVE INTERNAL TRACEABILITY |
| SOP-TRACE-002 | Level-2 golden fixture specification | DRAFT / TEST-DESIGN |
| SOP-ONBOARD-002 | AgentOS Doctor evidence contract | PRODUCT-DIRECTION / IMPLEMENTATION-DEPENDENT |
| SOP-DOC-002 | SOP maintenance-mode/new-document gate | DRAFT |

## Cycle-018 implementation evidence
- AgentOS #125 exact head `203273761794cca8c7a9636d45eae0249a435a72`: bounded POSIX continuous-fence SG-08 repair; exact-head hosted tests succeeded and independent PRS #30 did not reproduce the prior false-success class (`NEGATIVE_CASES_PASS`, `defect_count:0`). This is slice evidence, not overall Green or promotion.
- AgentOS #129 exact head `ecd7fa33536fa963c51dbbcf381ee676e385c117`: read-only durable session/grant/consent evidence validator; exact-head tests succeeded and PRS #31 independently challenged the loader contract with negative cases passing. Trusted issuers/authenticated transport/integration remain absent, so SG-01/02 remains blocked at the issuer/integration boundary.
- Cycle-017 SOP exact head `85cfbc9a6664cf5b087b69aecf9327761989ab3b`: AgentOS Tests #2015 SUCCESS and Project Overseer Wake #697 SUCCESS; documentation/workflow scope only.

## Data SOP identifier reconciliation
- SOP-DATA-002 remains **Export, Delete, Disconnect and Uninstall**.
- **Local Files, Indexing and Zero-Cloud Evidence** is now SOP-DATA-003. It was previously labelled DATA-002; Cycle 018 corrects the identifier without changing its substantive scope.

## Supporting operational controls
Audit/history, notification ACK, workspace/admin/user modes, onboarding, providers/BYOK/fallback/data handling, worker handoff, portfolio intake/closure/vertical cycle, documentation freshness, support/diagnostics, release/migration, privacy/telemetry, retirement, Morning Brief, Marketing->Content360, commerce/supplier/product/safety/provenance, affiliate, marketplace synchronization, Business/Commercial gate and accessibility remain registered with their prior implementation/legal-review boundaries.

## Legal register
LEGAL-REG-AU and SOP-LEGAL-001..023 remain DRAFT with their existing legal/jurisdiction review gates. Legal text is not approved merely because it is registered.

## Maintenance-mode rule
Create new SOPs only for genuinely new capability/action classes, materially distinct jurisdiction/operator workflows, unresolved safety/evidence domains, or repeated incidents showing a missing control. Prefer implementation mapping, consolidation and revalidation over document count.

## Primary maturity metric
Track material P0 requirements by `UNMAPPED -> MAPPED -> TESTED -> INDEPENDENTLY VERIFIED`, exact-head and scope scoped. Slice PASSes must not be composed into an overall PASS without an integrated exact-head run and the required independent gates.

## Critical truth boundaries
Documentation describes authority; it does not grant it. Capability verification is not action permission. #125 SG-08 evidence does not transfer to #104. #129 validates evidence but cannot issue it. Hosted CI is not physical owner-Windows acceptance. Worker verification is not Green/PRS. UNKNOWN remains UNKNOWN. General project-file mutation remains fail-closed until an integrated candidate satisfies the remaining authority, Green/PRS and physical gates.

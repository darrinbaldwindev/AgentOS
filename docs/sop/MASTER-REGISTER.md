# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 1.6.0  
**Last verified:** 2026-09-16

## Evidence baseline
Cycles 001–016 established the evidence-controlled SOP foundation. Cycle 016 begins the deliberate transition from document expansion to **SOP -> enforcement -> automated test -> runtime evidence -> Green -> PRS**. This register creates no runtime authority and is not legal approval or assurance.

## P0 AgentOS governance and Level-2 controls
| ID | Domain | Status |
|---|---|---|
| SOP-AUTH-001 / SOP-APPROVAL-001..002 | authority, approvals, negative states | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-CTRL-001 | stop/pause/revoke | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-WIN-001 | bounded Windows worker | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-FILE-001..002 | controlled mutation + path/link boundary | BLOCKED / IMPLEMENTATION-DEPENDENT |
| SOP-REC-001..005 | crash/result/ownership/replay/backup recovery | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-EVID-001..002 | receipts/evidence/Green/PRS + user explanation | DRAFT |
| SOP-MISSION-001 / SOP-SCHED-001 | mission authority + scheduled work | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-MCP-001 / SOP-CONNECTOR-001..002 | capability/connectors/protected actions | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-DATA-001..002 / SOP-COST-001 | data + budget boundaries | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-SEC-001..003 / SOP-IR-001 | security/incident/credential evidence | DRAFT / REVIEW REQUIRED |

## Enforcement-transition controls — Cycle 016
| ID | Control | Status |
|---|---|---|
| SOP-ACCEPT-001 | Level-2 golden mission acceptance contract | DRAFT / IMPLEMENTATION-DEPENDENT / INDEPENDENT-ASSURANCE-REQUIRED |
| SOP-ACCEPT-002 | SOP-to-enforcement traceability contract | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-ACCEPT-003 | machine-readable policy candidate schema | PRODUCT-DIRECTION / DESIGN INPUT |
| SOP-ACCEPT-004 | canonical evidence envelope | PRODUCT-DIRECTION / DESIGN INPUT |
| SOP-ACCEPT-005 | capability registry evidence contract | PRODUCT-DIRECTION / DESIGN INPUT |
| SOP-ASSURE-001 | failure-injection catalogue | DRAFT / TEST-DESIGN / PRS-INPUT |
| SOP-ONBOARD-002 | AgentOS Doctor evidence contract | PRODUCT-DIRECTION / IMPLEMENTATION-DEPENDENT |
| SOP-DOC-002 | SOP maintenance-mode/new-document gate | DRAFT |

## Supporting operational controls
Audit/history, notification ACK, workspace/admin/user modes, onboarding, providers/BYOK/fallback/data handling, worker handoff, portfolio intake/closure/vertical cycle, documentation freshness, support/diagnostics, release/migration, privacy/telemetry, retirement, Morning Brief, Marketing->Content360, commerce/supplier/product/safety/provenance, affiliate, marketplace synchronization, Business/Commercial gate and accessibility remain registered from v1.5 and retain their prior implementation/legal review status.

## Legal register
LEGAL-REG-AU and SOP-LEGAL-001..023 remain DRAFT with their existing legal/jurisdiction review gates. Legal text is not approved merely because it is registered.

## Maintenance-mode rule
After the remaining closure set, create new SOPs only for genuinely new capability/action classes, materially distinct jurisdiction/operator workflows, unresolved safety/evidence domains, or repeated incidents showing a missing control. Prefer consolidation and traceability over document count.

## Primary maturity metric
Track material P0 requirements by `UNMAPPED -> MAPPED -> TESTED -> INDEPENDENTLY VERIFIED`, exact-head scoped. Documentation text alone cannot advance the state.

## Critical truth boundaries
Documentation describes authority; it does not grant it. Policy/schema proposals do not create a second authority system. Capability verification is not action permission. Hosted CI is not physical owner-Windows acceptance. Worker verification is not Green/PRS. UNKNOWN remains UNKNOWN. Project-file mutation remains fail-closed until current Level-2 gates are independently satisfied.

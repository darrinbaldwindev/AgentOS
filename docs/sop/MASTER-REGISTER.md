# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 1.2.0  
**Last verified:** 2026-09-16  
**Review cadence:** every substantive capability/legal-surface change; full review before beta/release/public commercial activation.

## Evidence baseline
Cycles 001–012 reconcile AgentOS/PRS/frontend and portfolio evidence. This register coordinates documentation only; it creates no runtime authority and is not legal advice, legal approval, Green or PRS certification.

## Core SOP register
| ID | SOP | Priority | Status |
|---|---|---:|---|
| SOP-AUTH-001 | Authority and permissions | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-CTRL-001 | Stop / Pause / Revoke | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-EVID-001 | Evidence / Green / PRS | P0 | DRAFT |
| SOP-WIN-001 | Bounded Windows worker | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-FILE-001 | Controlled project-file mutation | P0 | BLOCKED / DRAFT |
| SOP-REC-001..005 | interruption, timeout, result-write, ownership/replay, backup/restore recovery | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-IR-001 | Incident response | P0 | DRAFT / REVIEW REQUIRED |
| SOP-SEC-001..002 | internal vulnerability reporting + external disclosure gate | P0 | DRAFT / REVIEW REQUIRED |
| SOP-MISSION-001 | Creating and authorising a mission | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-APPROVAL-001 | Approval lifecycle | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-GIT-001 | Pull request and exact-head review | P0 | DRAFT |
| SOP-SCHED-001 | Scheduled work / Night Shift / Autonomy Hours | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-MCP-001 | MCP/plugin/capability onboarding | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-DATA-001..002 | data classification + export/delete/disconnect/uninstall | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-COST-001 | Budget and cost control | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-ONBOARD-001 | Install/doctor/first-run evidence | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-PROVIDER-001 | Provider/model/local/BYOK configuration | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-EVID-002 | User-facing What happened? explanation | P1 | DRAFT |
| SOP-USER-001 | Simple / Essentials / Tech Head truth contract | P1 | DRAFT |
| SOP-AGENT-001..002 | creating roles + worker handoff/ACK | P1 | DRAFT |
| SOP-PORT-001..003 | repo intake, evidence closure, autonomous vertical cycle | P1 | DRAFT |
| SOP-DOC-001 | Documentation freshness/revalidation | P1 | DRAFT |
| SOP-SUPPORT-001 | Troubleshooting/support evidence | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-RELEASE-001..002 | update/upgrade/rollback + release-note truth | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-RETIRE-001 | Worker/project retirement | P1 | DRAFT |
| SOP-REPORT-001 | Morning Brief and portfolio status | P1 | DRAFT |
| SOP-MKT-001 | Marketing truth -> Content360 handoff | P1 | DRAFT |
| SOP-COM-001..004 | product validation, responsibility, listing publication, supplier onboarding | P1 | DRAFT; legal/implementation review where marked in source SOP |
| SOP-AFF-001..002 | deal/destination freshness + affiliate program intake/approval | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| MATRIX | Cross-project SOP applicability matrix | P1 | DRAFT / REVALIDATION REQUIRED |

## Legal / mandatory operational SOP register
Classification is obligation-specific: MANDATORY / CONDITIONALLY MANDATORY / RECOMMENDED CONTROL / LEGAL REVIEW REQUIRED / NOT APPLICABLE / UNKNOWN.

| ID | SOP | Status |
|---|---|---|
| LEGAL-REG-AU | Australian legal compliance register | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-001..016 | disclosure, privacy, consumer, terms, collection, reviews, safety, tracking, pricing, retention, jurisdiction, promotions, disputes, IP/AI, accessibility, launch checklist | DRAFT / review status per source SOP |
| SOP-LEGAL-017 | UK affiliate/privacy/tracking/direct-marketing annex | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-018 | Environmental/sustainability claims | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-019 | US affiliate/privacy/consumer annex | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-020 | UK affiliate advertising annex | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-021 | Australia environmental/sustainability claims annex | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-022 | Australia franchise applicability gate | DRAFT / LEGAL REVIEW REQUIRED |

## Mandatory legal-document candidates
Public text is not approved merely because a SOP exists. Terms, privacy policy/collection notices, affiliate disclosure, tracking/consent controls, refunds/guarantees, subscription/cancellation, product safety/recall, commercial messaging, breach response, IP/open-source notices, accessibility statements and franchise documents each require actual operator/product/jurisdiction/implementation evidence plus authorised review.

## Portfolio applicability baseline
Use `docs/sop/portfolio/SOP-APPLICABILITY-MATRIX.md`. AgentOS, GlobalShopCo/headless/eBay, Affiliate Websites AU/UK/US, MyPrimeDelivery, GhostKitchen/Franchise, GemVerse and Content360 share governance but retain distinct operator/jurisdiction/activity gates.

## Critical truth boundaries
Documentation describes authority; it does not grant it. Policy is not proof of enforcement. Research is not legal approval. Legal draft is not certification. Marketplace/program acceptance is not statutory compliance. Consumer verification is not publisher affiliate approval. Supplier research is not supplier onboarding. Credentials/capabilities/schedules do not create consent or authority. UNKNOWN remains UNKNOWN. Fresh runtime/repository/primary-source evidence outranks stale prose. Project-file mutation remains blocked until current Level-2 gates are independently satisfied.

## Revalidation triggers
Revalidate affected controls when operator, jurisdiction, audience, product, price, data flow, provider, tracker, supplier, marketplace, affiliate program, billing, entitlement, communication channel, law/regulator guidance, repository head, release or runtime behavior materially changes.
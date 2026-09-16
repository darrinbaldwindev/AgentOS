# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 1.4.0  
**Last verified:** 2026-09-16  
**Review cadence:** every substantive capability/legal-surface change; full review before beta/release/public commercial activation.

## Evidence baseline
Cycles 001–014 reconcile AgentOS/PRS/frontend and portfolio evidence. This register coordinates documentation only; it creates no runtime authority and is not legal advice, legal approval, Green or PRS certification.

## Core SOP register
| ID | SOP | Priority | Status |
|---|---|---:|---|
| SOP-AUTH-001 | Authority and permissions | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-CTRL-001 | Stop / Pause / Revoke | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-EVID-001..002 | Evidence/Green/PRS + user-facing What happened? | P0/P1 | DRAFT |
| SOP-WIN-001 | Bounded Windows worker | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-FILE-001..002 | Controlled mutation + path/link boundary threat model | P0 | BLOCKED / DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-REC-001..005 | interruption, timeout, result-write, ownership/replay, backup/restore recovery | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-IR-001 | Incident response | P0 | DRAFT / REVIEW REQUIRED |
| SOP-SEC-001..002 | internal vulnerability reporting + external disclosure gate | P0 | DRAFT / REVIEW REQUIRED |
| SOP-MISSION-001 | Creating and authorising a mission | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-APPROVAL-001 | Approval lifecycle | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-GIT-001 | Pull request and exact-head review | P0 | DRAFT |
| SOP-SCHED-001 | Scheduled work / Night Shift / Autonomy Hours | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-MCP-001 | MCP/plugin/capability onboarding | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-DATA-001..002 | data classification + local-files/indexing/zero-cloud evidence | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-CONNECTOR-001..002 | disconnect/residual data + protected actions | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-COST-001 | Budget and cost control | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-AUDIT-001 | audit-log/user-history truth | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-NOTIFY-001 | notification delivery/acknowledgement truth | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-ADMIN-001 | team roles and permissions | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-USER-001..002 | user modes + permission/approval UX truth | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-ONBOARD-001 | Install/doctor/first-run evidence | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-PROVIDER-001..002 | provider/model/BYOK + outage/fallback/cost routing | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-AGENT-001..002 | creating roles + worker handoff/ACK | P1 | DRAFT |
| SOP-PORT-001..003 | repo intake, evidence closure, autonomous vertical cycle | P1 | DRAFT |
| SOP-DOC-001 | Documentation freshness/revalidation | P1 | DRAFT |
| SOP-SUPPORT-001..002 | troubleshooting + incident user communications | P1 | DRAFT / REVIEW REQUIRED |
| SOP-RELEASE-001..002 | update/upgrade/rollback + release-note truth | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-RETIRE-001 | Worker/project retirement | P1 | DRAFT |
| SOP-REPORT-001 | Morning Brief and portfolio status | P1 | DRAFT |
| SOP-MKT-001 | Marketing truth -> Content360 handoff | P1 | DRAFT |
| SOP-COM-001..007 | product/supplier/listing/subscription/refund/safety operations | P1 | DRAFT; legal/implementation review per source |
| SOP-AFF-001..003 | deal/destination, program intake, disclosure placement | P1 | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-MKTPLACE-001 | marketplace account/policy intake | P1 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-COMMERCIAL-001 | Business/Commercial tier documentation gate | P1 | DRAFT / PRODUCT-DIRECTION |
| SOP-ACCESS-001 | accessibility testing evidence | P1 | DRAFT / IMPLEMENTATION-DEPENDENT / JURISDICTION REVIEW REQUIRED |
| MATRIX | Cross-project SOP applicability matrix | P1 | DRAFT / REVALIDATION REQUIRED |
| DOC-IA | Documentation information architecture | P1 | DRAFT |

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
| SOP-LEGAL-023 | Open-source dependencies and notices | DRAFT / LEGAL REVIEW REQUIRED |

## Mandatory legal-document candidates
Public text is not approved merely because a SOP exists. Terms, privacy policy/collection notices, affiliate disclosure, tracking/consent controls, refunds/guarantees, subscription/cancellation, product safety/recall, commercial messaging, breach response, IP/open-source notices, accessibility statements and franchise documents each require actual operator/product/jurisdiction/implementation evidence plus authorised review.

## Portfolio applicability baseline
Use `docs/sop/portfolio/SOP-APPLICABILITY-MATRIX.md`. AgentOS, GlobalShopCo/headless/eBay, Affiliate Websites AU/UK/US, MyPrimeDelivery, GhostKitchen/Franchise, GemVerse and Content360 share governance but retain distinct operator/jurisdiction/activity gates.

## Critical truth boundaries
Documentation describes authority; it does not grant it. Policy is not proof of enforcement. Research is not legal approval. Legal draft is not certification. Marketplace/program acceptance is not statutory compliance. Consumer verification is not publisher affiliate approval. Supplier research is not supplier onboarding. Pricing direction is not billing implementation. Local/zero-cloud is an evidence claim, not a label. Connector revocation is not provider deletion. Notification handoff is not human acknowledgement. Credentials/capabilities/schedules do not create consent or authority. UNKNOWN remains UNKNOWN. Fresh runtime/repository/primary-source evidence outranks stale prose. Project-file mutation remains blocked until current Level-2 gates are independently satisfied.

## Revalidation triggers
Revalidate affected controls when operator, jurisdiction, audience, product, price, data flow, provider, tracker, supplier, marketplace, affiliate program, billing, entitlement, communication channel, law/regulator guidance, repository head, release or runtime behavior materially changes.

# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 0.9.0  
**Last verified:** 2026-09-16  
**Review cadence:** every substantive capability/legal-surface change; full review before beta/release/public commercial activation.

## Evidence baseline
Cycles 001–009 reconcile AgentOS/PRS/frontend and portfolio evidence. This register coordinates documentation only; it creates no runtime authority and is not legal advice, legal approval, Green or PRS certification.

## Core SOP register
| ID | SOP | Priority | Status |
|---|---|---:|---|
| SOP-AUTH-001 | Authority and permissions | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-CTRL-001 | Stop / Pause / Revoke | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-EVID-001 | Evidence / Green / PRS | P0 | DRAFT |
| SOP-WIN-001 | Bounded Windows worker | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-FILE-001 | Controlled project-file mutation | P0 | BLOCKED / DRAFT |
| SOP-REC-001 | Interrupted/uncertain/replay recovery | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-REC-002 | Process-tree timeout | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-REC-003 | Result-write and receipt persistence failure | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-REC-004 | Ownership, replay and receipt-target recovery | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-IR-001 | Incident response | P0 | DRAFT / REVIEW REQUIRED |
| SOP-SEC-001 | Vulnerability and security reporting | P0 | DRAFT / REVIEW REQUIRED |
| SOP-MISSION-001 | Creating and authorising a mission | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-APPROVAL-001 | Approval lifecycle | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-GIT-001 | Pull request and exact-head review | P0 | DRAFT |
| SOP-SCHED-001 | Scheduled work / Night Shift / Autonomy Hours | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-MCP-001 | MCP/plugin/capability onboarding | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-DATA-001 | Data classification and handling | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-COST-001 | Budget and cost control | P0 | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-USER-001 | Simple / Essentials / Tech Head truth contract | P1 | DRAFT |
| SOP-AGENT-001 | Creating Overseers and Workers | P1 | DRAFT |
| SOP-AGENT-002 | Worker handoff and acknowledgement | P1 | DRAFT |
| SOP-PORT-001 | Repository intake and reconciliation | P1 | DRAFT |
| SOP-PORT-002 | Evidence closure and decision gates | P1 | DRAFT |
| SOP-PORT-003 | Autonomous vertical execution cycle | P1 | DRAFT |
| SOP-COM-001 | Product and supplier validation | P1 | DRAFT |
| SOP-COM-002 | Supplier/importer/marketplace responsibility | P1 | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-REPORT-001 | Morning Brief and portfolio status | P1 | DRAFT |

## Legal / mandatory operational SOP register
Classification is obligation-specific: MANDATORY / CONDITIONALLY MANDATORY / RECOMMENDED CONTROL / LEGAL REVIEW REQUIRED / NOT APPLICABLE / UNKNOWN.

| ID | SOP | Status |
|---|---|---|
| LEGAL-REG-AU | Australian legal compliance register | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-001 | Affiliate & sponsored disclosure | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-002 | Privacy, data breach & commercial messaging | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-003 | Consumer law: claims, refunds, guarantees & warranties | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-004 | Terms / standard-form contracts / unfair-term gate | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-005 | Privacy collection notices / APP 5 | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-006 | Reviews, testimonials & endorsements | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-007 | Product safety, recalls & marketplace publication | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-008 | Cookies, tracking, analytics & adtech | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-009 | Pricing, discounts, scarcity & promotions | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-010 | Data retention, deletion & legal hold | DRAFT / IMPLEMENTATION-DEPENDENT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-011 | Jurisdiction applicability matrix | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-012 | Competitions, giveaways & prize promotions | DRAFT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-013 | Complaints, disputes & escalation | DRAFT / IMPLEMENTATION-DEPENDENT |
| SOP-LEGAL-014 | Copyright, IP & AI-generated content | DRAFT / LEGAL REVIEW REQUIRED |
| SOP-LEGAL-015 | Accessibility and inclusive publication | DRAFT / IMPLEMENTATION-DEPENDENT / JURISDICTION REVIEW REQUIRED |
| SOP-LEGAL-016 | Portfolio launch compliance checklist | DRAFT / LEGAL REVIEW REQUIRED |

## Mandatory legal-document candidates
A public document is not approved merely because a SOP exists.

| Document/control | Gate |
|---|---|
| Terms of Service / Terms of Use | operator + product + jurisdiction + contract model + legal review |
| Privacy Policy | actual data-flow inventory + privacy applicability + jurisdiction + review |
| Collection notices | collection point + purpose + disclosures + jurisdiction |
| Affiliate/sponsorship disclosure | actual commercial relationship + destination jurisdiction + surface-specific placement |
| Cookie/tracking notice & consent controls | tracker inventory + jurisdiction + actual configuration |
| Refund/returns/consumer-guarantee information | seller model + jurisdiction + actual fulfilment/refund process |
| Subscription/cancellation notice | billing/entitlement implementation + jurisdiction; NOT YET PROVEN |
| Product safety/recall procedure | product/seller role + category + jurisdiction |
| Commercial electronic messaging controls | consent/source + sender identification + unsubscribe + jurisdiction |
| Data-breach response plan | processing/applicability + incident roles + notification thresholds |
| Copyright/open-source notices | ownership + dependency/license inventory |
| Accessibility statement | tested accessibility evidence; do not claim conformance from intent |

## Portfolio applicability baseline
- AgentOS: privacy/data flows, automated decisions, contracts/subscriptions, connected apps, security, communications; global expansion needs overlays.
- Affiliate Websites AU: affiliate disclosure, tracking/privacy, advertising claims, messaging.
- Affiliate Websites UK: separate UK advertising/affiliate + privacy/ePrivacy/direct-marketing + consumer annex required.
- Affiliate Websites USA: federal plus state-specific applicability analysis required.
- GlobalShopCo / marketplace work: ACL/consumer, pricing, freight/delivery, product safety, privacy/tracking, communications.
- MyPrimeDelivery: affiliate disclosure, Prime/deal freshness, pricing, privacy/tracking.
- GhostKitchen/Franchise: consumer claims/pricing plus food/franchise/local regulation before operation.
- Marketing / Content360: inherit destination project's jurisdiction and approved factual claims; transformation cannot manufacture authority or facts.

## Critical truth boundaries
Documentation describes authority; it does not grant it. Policy is not proof of enforcement. Research is not legal approval. Legal draft is not legal advice/certification. Marketplace/program acceptance is not statutory compliance. Consumer verification is not publisher affiliate approval. Credentials/capabilities/schedules do not create consent or authority. UNKNOWN remains UNKNOWN. Fresh runtime/repository/primary-source evidence outranks stale prose. Project-file mutation remains blocked until current Level-2 gates are independently satisfied.

## Revalidation triggers
Revalidate affected SOP/legal controls when operator, jurisdiction, audience, product, price, data flow, provider, tracker, supplier, marketplace, affiliate program, billing, entitlement, communication channel, law/regulator guidance, repository head or runtime behavior materially changes.
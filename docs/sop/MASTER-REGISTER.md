# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 0.2.0  
**Last verified:** 2026-09-15  
**Review cadence:** every substantive AgentOS capability change; full review before beta/release.

## Evidence baseline
Cycle 002 re-scanned current AgentOS main/open Level 2 evidence, PR #104, SOP PR #113, and current Overseer #49 comments. This register is documentation coordination only and is not runtime authority.

## Immediate contradiction / staleness register

| ID | Finding | Classification | Action |
|---|---|---|---|
| DOC-C01 | `docs/COMMERCIAL-PRODUCT-SOURCE-OF-TRUTH-2026-09-12.md` still presents `$39/year Co-worker`, while `docs/COMMERCIAL_PRODUCT_MODEL_2026-09-02.md` now defines Free `$0`, Standard `$49/year`, Advanced/Pro `$99/year`, AI Plus `$22/month`, Commercial/Business TBD. | MATERIAL STALE CANONICAL-LOOKING DOC | Explicit supersession/reconciliation notice required; preserve history. |
| DOC-C02 | Existing architecture text can read as broadly capable local execution while current Level 2 project-file mutation remains blocked on #104. | OVERSTATEMENT RISK | Bounded Windows SOP and blocked mutation SOP now make this distinction explicit. |
| DOC-C03 | Character-role material uses Willow/Isla/Jack/Henry as role labels while owner direction separates stable identity/role from replaceable persona. | PRODUCT-DIRECTION DRIFT | Do not claim persona replacement is implemented. |
| DOC-C04 | Existing documentation uses `Everyday` while current frontend direction uses Simple / Essentials / Tech Head. | TERMINOLOGY CONFLICT | Reconcile before public documentation. |

## SOP register

| ID | SOP | Priority | Status | Evidence dependency |
|---|---|---:|---|---|
| SOP-AUTH-001 | Authority and permissions | P0 | DRAFT / IMPLEMENTATION-DEPENDENT | governance; runtime admission; #104 authority binding |
| SOP-CTRL-001 | Stop / Pause / Revoke | P0 | DRAFT / IMPLEMENTATION-DEPENDENT | lifecycle; frontend trust contract; worker state |
| SOP-EVID-001 | Evidence / Green / PRS | P0 | DRAFT | Green gate; mission evidence; PRS independence |
| SOP-WIN-001 | Bounded Windows worker | P0 | DRAFT / IMPLEMENTATION-DEPENDENT | #104; physical Windows acceptance |
| SOP-FILE-001 | Controlled project-file mutation | P0 | BLOCKED / DRAFT | #104 SG-08; authority; receipts; recovery |
| SOP-REC-001 | Interrupted/uncertain/replay recovery | P0 | DRAFT / IMPLEMENTATION-DEPENDENT | recovery state; ownership; idempotency; receipts |
| SOP-IR-001 | Incident response | P0 | DRAFT / REVIEW REQUIRED | security/recovery controls + escalation ownership |
| SOP-MOD-001 | Model/provider/local/BYOK selection | P1 | PLANNED | routing implementation; provider contracts; entitlement |
| SOP-PRIV-001 | Local/cloud/mixed data processing | P1 | PLANNED | actual provider/data flows |
| SOP-ONB-001 | Install / first run / onboarding | P1 | PLANNED | install/doctor/current frontend |
| SOP-JOB-001 | Jobs / recurring work / Autonomy Hours / Night Shift | P1 | IMPLEMENTATION-DEPENDENT | scheduler/autonomy evidence |
| SOP-BRW-001 | Browser operation | P1 | NOT YET SUPPORTABLE AS SHIPPED | Level 3 direction |
| SOP-COMMS-001 | Email/calendar/external communications | P1 | NOT YET SUPPORTABLE AS SHIPPED | integrations + approval controls |
| SOP-ADM-001 | Business administration | P1 | PRODUCT DIRECTION | commercial multi-seat architecture |
| SOP-EDU-001 | School/family/student administration | P2 | PRODUCT DIRECTION / LEGAL REVIEW REQUIRED | controls + jurisdiction review |
| SOP-DATA-001 | Export / deletion / uninstall | P1 | PLANNED | persistence/storage implementation |
| SOP-TRB-001 | Troubleshooting | P1 | PLANNED | supported install/runtime paths |

## Policy register
A policy is not proof of runtime enforcement.

| Policy | Status | Runtime enforcement evidence |
|---|---|---|
| Acceptable Use | RECOMMENDED POLICY / DRAFT NEEDED | UNKNOWN |
| Privacy / Data Handling | RECOMMENDED POLICY / DRAFT NEEDED | PARTIAL / MUST MAP |
| AI Use / Responsible AI | RECOMMENDED POLICY / DRAFT NEEDED | PARTIAL / MUST MAP |
| Security | RECOMMENDED POLICY / DRAFT NEEDED | PARTIAL architecture controls |
| Credential and Secret Handling | RECOMMENDED POLICY / DRAFT | MUST MAP storage/access/redaction/rotation |
| Local Files | RECOMMENDED POLICY / DRAFT NEEDED | Level 2 incomplete |
| Retention and Deletion | RECOMMENDED POLICY / DRAFT NEEDED | UNKNOWN |
| Permissions and Authority | INTERNAL POLICY / DRAFT NEEDED | partial architecture/runtime evidence |
| Human Approval | INTERNAL POLICY / DRAFT NEEDED | partial runtime evidence |
| Autonomous Execution | INTERNAL POLICY / DRAFT NEEDED | production activation not proven |
| External Communication | RECOMMENDED POLICY / DRAFT NEEDED | NOT YET MAPPED |
| Purchasing / Financial Action | RECOMMENDED POLICY / DRAFT NEEDED | NOT YET MAPPED |
| Capability/MCP Supply Chain | RECOMMENDED POLICY / DRAFT | implementation enforcement NOT ESTABLISHED |
| Incident Response | represented by SOP-IR-001 draft | enforcement varies |
| Vulnerability Disclosure | RECOMMENDED POLICY / DRAFT NEEDED | process not established |
| Logging and Evidence | INTERNAL POLICY / DRAFT NEEDED | substantial architecture/runtime evidence |
| Recovery | represented partly by SOP-REC-001 | Level 2 recovery incomplete |
| Model and Provider | INTERNAL POLICY / DRAFT NEEDED | architecture direction; implementation varies |
| BYOK | RECOMMENDED POLICY / DRAFT NEEDED | broad shipped support not established |
| Business Administration | PRODUCT DIRECTION / DRAFT NEEDED | not established |
| Education / Child / Student | LEGAL REVIEW REQUIRED | not established |
| Accessibility | RECOMMENDED POLICY / DRAFT NEEDED | frontend baseline partial |
| Third-Party Services | RECOMMENDED POLICY / DRAFT NEEDED | integration-specific evidence required |

## Legal / notice register
These are drafting work items, not legal approvals. Jurisdiction must be identified before applicability claims.

| Document | Baseline | Status |
|---|---|---|
| Terms of Service / Use | global baseline + country overlays | LEGAL REVIEW REQUIRED |
| Privacy Policy | actual data-flow inventory first | LEGAL REVIEW REQUIRED |
| Cookie notice | implementation/jurisdiction dependent | LEGAL REVIEW REQUIRED |
| AI disclosures | jurisdiction/use-case dependent | LEGAL REVIEW REQUIRED |
| Third-party provider notice | provider inventory dependent | DRAFT NEEDED / LEGAL REVIEW REQUIRED |
| Open-source notices | dependency/license inventory dependent | DRAFT NEEDED / LEGAL REVIEW REQUIRED |
| Subscription/payment/refund/cancellation notice | billing + jurisdiction dependent | NOT YET SUPPORTABLE / LEGAL REVIEW REQUIRED |
| Business/DPA/security documentation | business architecture + processing dependent | PRODUCT DIRECTION / LEGAL REVIEW REQUIRED |
| Vulnerability/security disclosure | security contact/process dependent | DRAFT NEEDED |
| Copyright/trademark notices | ownership/registration facts dependent | LEGAL REVIEW REQUIRED where claims exceed fact |

## Terminology authority

| Term | Canonical meaning |
|---|---|
| Overseer | single user-facing orchestration front door inside AgentOS; provider/model agnostic role |
| Specialist agent | subordinate role/capability coordinated by Overseer; not an independent competing front door |
| Persona | replaceable presentation property; replacement is PRODUCT DIRECTION until implemented |
| Authority | explicit bounded permission; never inferred from model confidence/persona/autonomy level |
| Evidence | durable information about what happened; not equivalent to Green or PRS |
| Green | independent verification gate; worker success cannot self-award it |
| PRS | independent assurance distinct from execution and Green |
| Stop requested | stop command/request initiated; does not itself prove execution ceased |
| Execution stopped | evidence confirms execution ceased within bounded runtime semantics |
| Recovery required | continuation cannot be trusted without recovery/reconciliation |
| Simple / Essentials / Tech Head | disclosure modes over one truth model; not authority levels or commercial tiers |

## Dependency / revalidation map
- Authority SOP -> actor identity + canonical grant + capability policy + approval + budget + receipts.
- Stop SOP -> UI command + worker lifecycle + in-flight action semantics + evidence + recovery.
- Evidence SOP -> exact correlation + receipt schema + Green + PRS.
- Windows SOP -> #104 admitted operations + authority + physical Windows acceptance + Green/PRS.
- File mutation SOP -> authenticated authority + containment + continuous ownership + bounded edit + atomic/recoverable write + idempotency + receipts + recovery + Green/PRS.
- Recovery SOP -> canonical checkpoints + ownership + target-state reconciliation + idempotency + receipts.
- Credential policy -> actual secret storage/access/redaction/rotation/deletion mechanisms.
- Capability/MCP policy -> actual capability registry/passport/admission/update/revocation mechanisms.
- Privacy/legal docs -> actual data-flow/provider/storage/telemetry inventory + jurisdiction.
- Commercial docs -> canonical commercial model; billing/entitlement implementation separately proven.

Any changed dependency marks its dependent document REVIEW REQUIRED until revalidated.
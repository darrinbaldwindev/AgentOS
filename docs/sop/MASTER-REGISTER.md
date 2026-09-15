# AgentOS SOP / Policy / Legal Master Register

**Document ID:** SOP-REG-001  
**Owner:** SOP Overseer  
**Status:** DRAFT  
**Version:** 0.1.0  
**Last verified:** 2026-09-15  
**Review cadence:** every substantive AgentOS capability change; full review before beta/release.

## Evidence baseline

Bootstrap evidence uses current `main` `962cb3820b83506f9e6d90f50e003690dd85a8a1`, current open PR inventory, current PR #104 head `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`, current Overseer #49, and existing architecture/product documents. This register is documentation coordination only and is not a runtime authority.

## Immediate contradiction / staleness register

| ID | Finding | Classification | Action |
|---|---|---|---|
| DOC-C01 | `docs/COMMERCIAL-PRODUCT-SOURCE-OF-TRUTH-2026-09-12.md` still presents `$39/year Co-worker` as active while `docs/COMMERCIAL_PRODUCT_MODEL_2026-09-02.md` now defines Free `$0`, Standard `$49/year`, Advanced/Pro `$99/year`, AI Plus `$22/month`, Commercial/Business TBD. | MATERIAL STALE CANONICAL-LOOKING DOC | Add explicit supersession/reconciliation notice; do not silently rewrite history. |
| DOC-C02 | Existing architecture text can read as broadly capable local execution while current Level 2 project-file mutation remains blocked on #104. | OVERSTATEMENT RISK | User/operator SOPs must bound current behaviour and label future capability as direction. |
| DOC-C03 | Existing character-role material uses Willow/Isla/Jack/Henry as role labels. Owner direction now separates stable internal identity/canonical role from replaceable persona. | PRODUCT-DIRECTION DRIFT | Preserve current personas as presentation defaults where applicable; do not claim persona replacement is implemented. |
| DOC-C04 | Existing documentation uses `Everyday` in one commercial source while current frontend direction uses Simple / Essentials / Tech Head. | TERMINOLOGY CONFLICT | Frontend/runtime evidence controls shipped wording; reconcile canonical terminology before public docs. |

## SOP register

| ID | SOP | Priority | Status | Evidence dependency |
|---|---|---:|---|---|
| SOP-AUTH-001 | Authority and permissions | P0 | DRAFT / IMPLEMENTATION-DEPENDENT | governance layer; runtime admission; #104 authority binding |
| SOP-CTRL-001 | Stop / Pause / Revoke | P0 | DRAFT / IMPLEMENTATION-DEPENDENT | Basic Chat lifecycle; frontend trust contract; worker lifecycle |
| SOP-EVID-001 | Evidence / Green / PRS | P0 | DRAFT | Green gate; mission ledger; PRS independence |
| SOP-WIN-001 | Windows worker operation | P0 | PLANNED / BLOCKED FOR BROAD CLAIM | #104; physical Windows acceptance |
| SOP-FILE-001 | Controlled file mutation | P0 | BLOCKED | #104 SG-08 continuous ownership; mutation receipts; recovery |
| SOP-REC-001 | Recovery / interrupted execution / replay | P0 | PLANNED | mission state; locks; idempotency; durable receipts |
| SOP-SEC-001 | Credentials and secrets | P0 | PLANNED | credential storage/access implementation |
| SOP-CAP-001 | Capability/MCP install, identity, permission, update, rollback | P0 | PLANNED | capability registry/passport; supply-chain controls |
| SOP-INC-001 | Incident response | P0 | PLANNED | security/recovery controls and escalation ownership |
| SOP-MOD-001 | Model/provider/local/BYOK selection | P1 | PLANNED | routing implementation; provider contracts; entitlement |
| SOP-PRIV-001 | Local/cloud/mixed data processing | P1 | PLANNED | actual provider/data flows |
| SOP-ONB-001 | Install / first run / onboarding | P1 | PLANNED | install/doctor/current frontend |
| SOP-JOB-001 | Jobs / recurring work / Autonomy Hours / Night Shift | P1 | IMPLEMENTATION-DEPENDENT | scheduler/autonomy policy/runtime evidence |
| SOP-BRW-001 | Browser operation | P1 | NOT YET SUPPORTABLE AS SHIPPED | Level 3 direction |
| SOP-COMMS-001 | Email/calendar/external communications | P1 | NOT YET SUPPORTABLE AS SHIPPED | integrations + approval controls |
| SOP-ADM-001 | Business administration | P1 | PRODUCT DIRECTION | commercial multi-seat architecture |
| SOP-EDU-001 | School/family/student administration | P2 | PRODUCT DIRECTION / LEGAL REVIEW REQUIRED | product controls + jurisdiction review |
| SOP-DATA-001 | Export / deletion / uninstall | P1 | PLANNED | persistence/storage implementation |
| SOP-TRB-001 | Troubleshooting | P1 | PLANNED | current supported install/runtime paths |

## Policy register

All entries below are candidate internal/product policies unless separately approved. A policy is not proof of runtime enforcement.

| Policy | Status | Runtime enforcement evidence |
|---|---|---|
| Acceptable Use | RECOMMENDED POLICY / DRAFT NEEDED | UNKNOWN |
| Privacy / Data Handling | RECOMMENDED POLICY / DRAFT NEEDED | PARTIAL / MUST MAP |
| AI Use / Responsible AI | RECOMMENDED POLICY / DRAFT NEEDED | PARTIAL / MUST MAP |
| Security | RECOMMENDED POLICY / DRAFT NEEDED | PARTIAL architecture controls |
| Credential and Secret Handling | RECOMMENDED POLICY / DRAFT NEEDED | UNKNOWN / MUST MAP |
| Local Files | RECOMMENDED POLICY / DRAFT NEEDED | Level 2 incomplete |
| Retention and Deletion | RECOMMENDED POLICY / DRAFT NEEDED | UNKNOWN |
| Permissions and Authority | INTERNAL POLICY / DRAFT NEEDED | partial architecture/runtime evidence |
| Human Approval | INTERNAL POLICY / DRAFT NEEDED | partial runtime evidence |
| Autonomous Execution | INTERNAL POLICY / DRAFT NEEDED | autonomy model exists; production activation not proven |
| External Communication | RECOMMENDED POLICY / DRAFT NEEDED | NOT YET MAPPED |
| Purchasing / Financial Action | RECOMMENDED POLICY / DRAFT NEEDED | NOT YET MAPPED |
| Capability/MCP Supply Chain | RECOMMENDED POLICY / DRAFT NEEDED | NOT YET MAPPED |
| Incident Response | RECOMMENDED POLICY / DRAFT NEEDED | NOT YET MAPPED |
| Vulnerability Disclosure | RECOMMENDED POLICY / DRAFT NEEDED | documentation/process not established |
| Logging and Evidence | INTERNAL POLICY / DRAFT NEEDED | substantial architecture/runtime evidence |
| Recovery | INTERNAL POLICY / DRAFT NEEDED | partial; Level 2 recovery incomplete |
| Model and Provider | INTERNAL POLICY / DRAFT NEEDED | architecture direction; implementation varies |
| BYOK | RECOMMENDED POLICY / DRAFT NEEDED | implementation not established as broad shipped feature |
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
| Cookie notice | only where web/tracking implementation makes it applicable | LEGAL REVIEW REQUIRED |
| AI disclosures | jurisdiction/use-case dependent | LEGAL REVIEW REQUIRED |
| Third-party provider notice | provider inventory dependent | DRAFT NEEDED / LEGAL REVIEW REQUIRED |
| Open-source notices | dependency/license inventory dependent | DRAFT NEEDED / LEGAL REVIEW REQUIRED |
| Subscription/payment/refund/cancellation notice | billing implementation + jurisdiction dependent | NOT YET SUPPORTABLE / LEGAL REVIEW REQUIRED |
| Business/DPA/security documentation | business architecture + actual processing dependent | PRODUCT DIRECTION / LEGAL REVIEW REQUIRED |
| Vulnerability/security disclosure | security contact/process dependent | DRAFT NEEDED |
| Copyright/trademark notices | ownership/registration facts dependent | LEGAL REVIEW REQUIRED where claims exceed fact |

## Terminology authority

| Term | Canonical meaning |
|---|---|
| Overseer | single user-facing orchestration front door inside AgentOS; provider/model agnostic role |
| Specialist agent | subordinate role/capability coordinated by Overseer; not an independent competing front door |
| Persona | replaceable presentation property such as name/avatar/voice; replacement is PRODUCT DIRECTION until implemented |
| Authority | explicit bounded permission to perform an action; never inferred from model confidence/persona/autonomy level |
| Evidence | durable information about what happened; not equivalent to Green or PRS |
| Green | independent verification gate; worker success cannot self-award it |
| PRS | independent assurance after relevant verification; distinct from execution and Green |
| Stop requested | a stop command/request has been accepted or initiated; does not itself prove execution has stopped |
| Execution stopped | evidence confirms execution has ceased within the bounded semantics of that worker/runtime |
| Recovery required | normal continuation cannot be trusted without a recovery/reconciliation procedure |
| Simple / Essentials / Tech Head | presentation/disclosure modes over one truth model; not authority levels or commercial tiers |

## Dependency / revalidation map

- Authority SOP -> actor identity + canonical grant + capability policy + approval + budget + receipts.
- Stop SOP -> UI command + worker lifecycle + in-flight action semantics + evidence + recovery.
- Evidence SOP -> task/mission/worker/result correlation + receipt schema + Green gate + PRS state.
- Windows SOP -> #104 operations + approved-root containment + physical Windows acceptance + Green/PRS.
- File mutation SOP -> atomicity + continuous ownership + rollback/recovery + idempotency + mutation receipts.
- Privacy/legal docs -> actual data-flow/provider/storage/telemetry inventory + jurisdiction.
- Commercial docs -> canonical commercial product model; billing/entitlement evidence must be separately proven.

Any changed dependency marks its dependent document REVIEW REQUIRED until revalidated.

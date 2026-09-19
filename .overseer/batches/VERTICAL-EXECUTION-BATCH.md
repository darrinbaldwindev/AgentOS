# AgentOS Vertical Execution Batch — Manus Family Safety Batch 002

**Repository:** `darrinbaldwindev/AgentOS`  
**Worker role:** Manus under ChatGPT Portfolio Overseer / AgentOS Overseer  
**Controlling issue:** AgentOS #130 — Family Safety + Split View  
**Current implementation anchor:** AgentOS #135  
**Exact starting head:** `e5d744ce0cc160ce12b6183aaf173b5c79206d9c`  
**Starting CI:** AgentOS Tests run `35432096322` — SUCCESS  
**Fresh-scan date:** 2026-09-19 Australia/Brisbane  
**Batch status:** ACTIVE  

## Canonical procedure
This batch is subordinate to:
1. `darrinbaldwindev/Overseer/.overseer/doctrine/PORTFOLIO-BATCH-ENGINE.md`
2. AgentOS profile in `darrinbaldwindev/Overseer/.overseer/profiles/PROJECT-BATCH-PROFILES.md`
3. `darrinbaldwindev/Overseer/.overseer/doctrine/VERTICAL-BATCH-EXECUTION.md`
4. `darrinbaldwindev/Overseer/.overseer/communication/WORK-MODE-CONTROL.md`
5. live repository / issue / PR / CI evidence
6. `darrinbaldwindev/Overseer#49`

Repository/runtime/CI evidence outranks this batch. Manus is a worker, not an authority source, verifier-of-record, Green, PRS, scheduler, ledger, registry or persistence plane.

## Governance boundaries
No merge, approval, mark-ready, rebase, deployment, credential/security-setting change, production write, unrestricted PowerShell, admin/elevation, physical-host action, parental-control activation, device remediation, publication, spend, external contact, Green/PRS bypass or overall GREEN claim.

No new family-specific scheduler, authority service, mission ledger, receipt system, persistence layer, memory system, Green system or PRS system.

## Current verified stack
- #131 — product/architecture contract: Family Safety + Split View.
- #132 — restrictive profile policy evaluator; cannot mint capability.
- #133 — Family Safety evidence semantics; stale/missing/blocked/unknown checks cannot become a positive safety claim.
- #134 — profile resource isolation contract for memory/files/credentials/browser sessions/connections/projects.
- #135 — read-only Windows posture probe for Firewall + Microsoft Defender.
- #135 exact head `e5d744ce0cc160ce12b6183aaf173b5c79206d9c`; AgentOS Tests `35432096322` SUCCESS.

## ACTIVE NOW

### MFS-002-01 — Authoritative Windows posture research
**State:** ACTIVE

**Objective**
Identify the next safest high-value Windows Family Safety checks that AgentOS can inspect read-only without elevation or remediation.

**Candidate checks to assess**
1. local account / administrator separation;
2. screen-lock / session-lock posture;
3. Windows Update / security-update posture;
4. Microsoft Defender / Security Center provider caveats when third-party antivirus is installed;
5. remote-access exposure that can be inspected safely;
6. browser-extension posture only if there is a reliable, non-invasive source.

**Evidence requirements**
- prefer Microsoft primary documentation and Windows-native documented interfaces;
- identify exact command/API/WMI/CIM/registry source proposed;
- state whether standard-user access is sufficient;
- state whether the source is stable across supported Windows 10/11 editions;
- define expected output and UNKNOWN conditions;
- document third-party security-product/domain-managed-device caveats;
- no claim that absence/presence alone proves the device safe.

**Acceptance**
Produce a ranked-but-not-authority-granting implementation recommendation identifying 1–2 checks suitable for the next bounded AgentOS adapter slice, plus checks that must remain HOLD/UNKNOWN.

### MFS-002-02 — False-safe adversarial challenge
**State:** ACTIVE

Challenge the existing #133/#135 model for false-safe conditions including:
- PowerShell command exists but is unavailable under policy/edition;
- partial/truncated JSON;
- stale evidence;
- future timestamps;
- Firewall profile omissions;
- third-party antivirus causing Defender fields to appear disabled;
- domain/MDM-managed settings;
- command success with semantically incomplete output;
- localized/display-name drift;
- no data / access denied / unsupported provider;
- one passing check masking another UNKNOWN check.

**Acceptance**
Every materially ambiguous state remains UNKNOWN or NEEDS_ATTENTION; no research recommendation may emit or justify a whole-device `SAFE` claim.

### MFS-002-03 — Evidence composition contract review
**State:** PENDING

Determine the cleanest way for #135 findings to feed #133 without adding a second summary truth source.

Required properties:
- exact finding IDs;
- source + observed timestamp preserved;
- required check list explicit;
- stale/blocked/unknown findings propagate conservatively;
- summary remains `safeClaimPermitted: false`;
- adapter cannot self-certify its own evidence.

### MFS-002-04 — Family profile + Split View UX implications
**State:** PENDING

Translate the safety evidence into a plain-language parent-facing projection without creating UI-local truth.

Required distinctions:
- `Checks passed for assessed controls`;
- `Needs attention`;
- `Parent action required`;
- `Unknown / could not verify`.

Split View requirement:
- parent can keep chat/Overseer on one side and Safety Check/evidence on the other;
- child-facing surface should not expose unnecessary surveillance detail;
- changing Simple/Essentials/Tech Head must not change policy or evidence state.

## BLOCKED / HOLD
- **HOLD:** physical Windows execution against owner hardware — separate explicit acceptance action.
- **HOLD:** changing Firewall/Defender/Update/account/screen-lock settings.
- **HOLD:** parent re-authentication or approval issuance until canonical authority/identity source is defined.
- **HOLD:** live browser-process/profile isolation beyond current validation contract.
- **HOLD:** production parental controls / family-safety certification claims.

## Manus output contract
Manus must return:
1. concise executive result;
2. source-backed Windows check matrix;
3. exact recommended next 1–2 bounded checks;
4. rejected/HOLD checks with reasons;
5. adversarial false-safe matrix;
6. proposed evidence mapping into #133;
7. Split View / parent-assurance implications;
8. explicit UNKNOWNs and limitations;
9. no merge/deploy/production/physical-host action.

Worker claims are leads. ChatGPT Overseer must independently reconcile any recommendation against repository evidence and exact-head CI before implementation status changes.

## Replenishment targets after Manus returns
1. implement only the smallest recommended read-only check(s) on a fresh stacked draft branch;
2. add deterministic injected-executor fixtures;
3. integrate output through the #133 evidence contract rather than a new summary plane;
4. exact-head CI;
5. independent adversarial challenge where warranted;
6. update #130 and Overseer #49;
7. keep physical Windows validation explicitly separate.

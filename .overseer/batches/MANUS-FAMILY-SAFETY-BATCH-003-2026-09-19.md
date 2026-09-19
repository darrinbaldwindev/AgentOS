# Manus Family Safety Batch 003 — Split View + Parent Assurance

## Project
AgentOS (`darrinbaldwindev/AgentOS`)

## Controlling product epic
- AgentOS issue #130 — Family Safety + Split View
- Existing Web UI / Activity Dashboard surface: #21

## Exact starting lineage
- Batch 002 checkpoint: `56aa350bfc849eaffe7338c253659daaf78b83af`
- Family Safety Windows posture probe #135 exact head: `e5d744ce0cc160ce12b6183aaf173b5c79206d9c`
- #135 AgentOS Tests run `35432096322`: SUCCESS
- Family Safety evidence contract #133 current exact head: `0db5737408cd20e1799d882a3198c249b568c6e2`
- Profile isolation contract #134 current exact head: `94a28157191815909459e88511088b6678721cdc`

## Worker role
Manus is a bounded research/design worker under ChatGPT Overseer. Manus does not become an authority source, governance layer, scheduler, worker registry, ledger, Green system, PRS system, or canonical UI state source.

Worker output is evidence/recommendation input only. ChatGPT Overseer must reconcile it against current repository/issue/CI evidence before implementation.

## Batch objective
Deepen the signature AgentOS **Split View + Parent Assurance** product model so the next implementation slice can be narrow, testable and consistent with existing AgentOS authority and profile isolation.

Core product promise:

> Talk on one side. See the work happen on the other.

The second pane must support browser/app/widget/document/activity surfaces without becoming a new permission source.

## ACTIVE TASKS

### MFS-003-01 — Split View interaction architecture
State: ACTIVE

Research and propose a bounded interaction model for:
- Chat / Overseer pane;
- contextual work pane;
- browser surface;
- app surface;
- document/file surface;
- widgets;
- worker/activity/evidence surface.

Determine:
- what canonical state belongs to AgentOS vs UI-only presentation state;
- how pane changes remain presentation-only;
- how browser/app/widget actions continue through canonical AgentOS permissions;
- safe defaults for Simple / Essentials / Tech Head;
- how Split View behaves on narrow screens and single-pane fallback;
- what state must survive restart vs what may be ephemeral.

### MFS-003-02 — Parent Assurance information architecture
State: ACTIVE

Design the minimum parent-facing surface that answers, without surveillance overreach:
- what the child can currently do;
- what AgentOS blocked;
- what requires parent approval;
- what device checks are VERIFIED / NEEDS_ATTENTION / UNKNOWN / BLOCKED;
- whether any safety-relevant settings changed;
- what requires parent action.

Requirements:
- no absolute “safe” claim;
- do not expose unnecessary raw chat/browsing content;
- prefer policy/evidence summaries over indiscriminate activity history;
- clearly separate device posture, profile restrictions and action approvals;
- account for offline/local-first operation.

### MFS-003-03 — Cross-profile Split View isolation threat model
State: ACTIVE

Challenge leakage and authority-bypass cases across:
- browser sessions;
- local files;
- memory/chat history;
- credentials;
- projects;
- widgets;
- app integrations;
- worker/activity surfaces.

Required negative cases:
- switching Child → Parent without reauthentication;
- stale work pane survives profile switch;
- child opens a parent browser/session surface;
- widget reveals another profile’s data;
- Tech Head mode exposes or widens child capability;
- restoring a previous Split View after restart bypasses current policy;
- deep-link / URL / app intent bypasses profile restrictions;
- one pane shows data from profile A while actions execute as profile B.

### MFS-003-04 — Parent approval UX contract
State: ACTIVE

Recommend a minimal step-up approval interaction for sensitive actions while preserving the rule that UI cannot synthesize authority.

Cover:
- approval request presentation;
- parent reauthentication indication;
- exact action/scope shown to parent;
- one-time vs time-bounded approval;
- denial / expiry / revocation;
- child retry behavior;
- durable evidence/receipt references;
- avoiding accidental blanket approval.

Do not design a new authority system. Assume canonical AgentOS authority/consent evidence remains external to the UI.

### MFS-003-05 — Implementation-ready acceptance contract
State: ACTIVE

Return a compact recommended next implementation slice of **1–2 modules only**, including:
- exact responsibilities;
- state contract;
- explicit non-goals;
- 8–15 adversarial test cases;
- failure states;
- what exact-head CI would prove;
- what still requires independent security / PRS / physical acceptance;
- whether the slice should land in existing #21 frontend lineage or remain a family-safety runtime contract first.

## Research expectations
Prefer authoritative and primary UX/security/privacy sources where relevant, including platform accessibility and parental-control guidance. Community examples may be used as secondary inspiration but must not be treated as normative security evidence.

Distinguish:
- documented platform behavior;
- established UX/security practice;
- recommendation/inference;
- UNKNOWN.

## Explicitly reject
- covert monitoring;
- keylogging;
- background screen capture for parent surveillance;
- full child transcript forwarding by default;
- profile UI as a permission source;
- age alone as authority;
- a separate family scheduler/ledger/governance plane;
- unrestricted browser/app control;
- “device safe” certification;
- automatic remediation/elevation;
- hidden parent impersonation;
- production activation.

## Deliverable
Return one structured report with:
1. executive findings;
2. Split View canonical-vs-presentation state matrix;
3. Parent Assurance information architecture;
4. cross-profile threat matrix;
5. parent approval UX contract;
6. Simple / Essentials / Tech Head behavior matrix;
7. recommended 1–2 module implementation slice;
8. adversarial acceptance cases;
9. unknowns / blockers;
10. sources and confidence.

## Governance boundaries
This batch grants no authority to:
- merge or approve PRs;
- mark ready;
- deploy;
- alter credentials/security settings;
- perform production writes;
- activate parental controls;
- perform physical-host actions;
- contact users/partners;
- spend money;
- create unrestricted PowerShell/browser/UI automation;
- claim Green, PRS completion, production readiness or overall safety.

## Completion rule
Manus completion is a worker report only. Batch tasks become VERIFIED only after ChatGPT Overseer independently reconciles the report against repository truth and, where implementation follows, exact-head tests/CI and independent assurance as applicable.

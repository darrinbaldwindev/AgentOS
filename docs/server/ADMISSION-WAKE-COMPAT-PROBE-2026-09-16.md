# Admission -> Local-Wake Compatibility Probe

Date: 2026-09-16
Work item: S-SRV-02B / A-AG-P0
Status: DEFECT REPRODUCED; semantic-source inventory completed; runtime repair remains blocked on consent provenance
Exact AgentOS target: `5bb27bb4290bbdf743c53c7f48e75af14db37966`

## Purpose

Re-probe the historical PRS admission -> local-wake compatibility finding against the current AgentOS PR #104 exact head before any production-code repair, then identify which missing fields already have canonical source semantics and which do not.

This branch is deliberately probe/evidence only. It does not modify the active #104 hot path.

## Exact source comparison

### Canonical admission output

`runtime/remote-authority-admission.mjs` at the exact target constructs a persisted `dispatch.task` with, among other fields:

- `project_id`
- `mission_id`
- `task_id`
- `delivery_id`
- `request_id`
- `wake_trace_id`
- `actor_id`
- `issuer`
- `admitted_by`
- `authority_admitted`
- `authority_evidence_id`
- `authority`
- `required_capabilities`
- `target_host_id`
- `environment`
- `pickup_state`
- `status`
- `scope`
- `constraints`
- `objective`
- `created_at`
- optional `execution`

It does **not** populate:

- `consent_mode`
- `acceptance_criteria`
- `target`

### Canonical non-PowerShell local-wake requirements

`runtime/local-wake.mjs` at the same exact target:

1. calls `validateExecutionEnvelope(task)`, which requires `task.consent_mode === 'PRE_AUTHORIZED'` and otherwise throws `CONSENT_REQUIRED`;
2. subsequently requires `Array.isArray(task.acceptance_criteria)` with at least one entry;
3. requires `task.target` to equal the canonical receiver;
4. otherwise returns/raises a blocked/invalid disposition before normal execution.

The pickup eligibility gate does not synthesize these fields; it validates authority admission, queue state, safe environment, host identity, capabilities, scope/constraints and freshness.

## Semantic-source inventory

Fresh exact-head inventory found the older canonical dispatch envelope contract at `.agentos/dispatch/schema.md`. It explicitly defines both `target` and `acceptance_criteria` as required dispatch fields. Existing durable task fixtures (`.agentos/dispatch/tasks/agentos-a1-001.json`, `agentos-e2e-001.json`, and `GSCO-TEST-003.json`) also carry source-authored `target` and source-authored observable `acceptance_criteria`.

This establishes an important ownership distinction:

### `target`

**Canonical dispatch semantic exists.** The target is the receiving agent identifier and is expected to be source-authored in a dispatch instruction. The remote authority admission producer currently does not receive/preserve it.

### `acceptance_criteria`

**Canonical dispatch semantic exists.** Acceptance criteria are observable completion conditions and are expected to be source-authored in a dispatch instruction. They must not be invented by admission or local wake. The remote request/candidate contract currently does not receive/preserve them.

### `consent_mode`

**No equivalent canonical source was evidenced in this inventory.** The remote bridge contract explicitly forbids untrusted remote requests from supplying `consent_mode` and deliberately returns an authority-free candidate with consent absent. The authority module validates issuer/capability grants, but does not establish consent mode. Local wake nevertheless requires `PRE_AUTHORIZED`.

Therefore `consent_mode` remains a distinct governance/provenance gap. A grant being `GRANTED` is not, by itself, evidence that consent mode may be synthesized as `PRE_AUTHORIZED`.

## Revised repair boundary

The smallest semantically safe repair is now clearer, but still not fully executable:

1. Extend the existing trusted/source-authored dispatch/request composition contract so `target` and `acceptance_criteria` can be preserved into the authority-free candidate without allowing them to grant authority.
2. Validate them deterministically at normalization/admission boundaries.
3. Preserve them through canonical admission into the persisted dispatch task.
4. Keep `consent_mode` absent until a real canonical consent/authorization source is identified and explicitly bound.
5. Do **not** equate authentication, a GRANTED capability grant, issuer trust, target selection, or acceptance criteria with consent.
6. Do not add a second adapter/control plane merely to fill the shape.

A partial code change for only target/criteria would improve schema preservation but would not make admission -> local-wake executable because `consent_mode` would still fail closed. For that reason this evidence branch does not mutate production runtime.

## Disposition

**DEFECT REPRODUCED on current exact head `5bb27bb4290bbdf743c53c7f48e75af14db37966`.**

**Target provenance: EVIDENCED at canonical dispatch-contract level.**

**Acceptance-criteria provenance: EVIDENCED at canonical dispatch-contract level.**

**Consent-mode provenance: UNKNOWN / BLOCKING.**

A canonical non-PowerShell task emitted by current remote authority admission cannot satisfy current canonical local-wake execution-envelope requirements without an out-of-band mutation or another transformation step. No such transformation is authorized by this probe.

This finding remains separate from:

- SG-08 continuous ownership/crash safety;
- authenticated transport provenance;
- canonical grant-source provenance;
- physical Windows acceptance;
- Green/security/PRS completion assurance.

## Required implementation acceptance

A repair on the active canonical lineage should:

1. choose one canonical ownership point for these fields rather than add a second adapter/control plane;
2. preserve source-authored target and acceptance criteria;
3. bind consent only from a source that explicitly proves the required consent semantics;
4. preserve request/delivery/project/mission/task/wake/actor/authority/host correlation;
5. keep authority evidence source-backed;
6. add deterministic negatives for missing/malformed target, acceptance criteria and consent;
7. prove denied inputs produce no worker/process side effect;
8. run exact-head Ubuntu and Windows CI;
9. obtain independent unchanged-head Jess/Michael/PRS evidence before any completion/promotion claim.

## Important semantic warning

The mechanical mismatch could be removed by copying local-wake fixture defaults into admission, but doing so would manufacture governance evidence. In particular, `PRE_AUTHORIZED` must not be inferred solely from a capability grant.

Next implementation action: locate or define—through the existing AgentOS authority/governance ownership, not a new Server authority plane—the canonical evidence that permits `consent_mode = PRE_AUTHORIZED`. Until then, runtime compatibility remains BLOCKED_STABLE.

No overall GREEN. No merge/deploy/production authorization.
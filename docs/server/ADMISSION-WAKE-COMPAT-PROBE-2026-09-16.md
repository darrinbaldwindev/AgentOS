# Admission -> Local-Wake Compatibility Probe

Date: 2026-09-16
Work item: S-SRV-02B / A-AG-P0
Status: DEFECT REPRODUCED by exact-source contract comparison; no runtime repair in this branch
Exact AgentOS target: `5bb27bb4290bbdf743c53c7f48e75af14db37966`

## Purpose

Re-probe the historical PRS admission -> local-wake compatibility finding against the current AgentOS PR #104 exact head before any production-code repair.

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

## Disposition

**DEFECT REPRODUCED on current exact head `5bb27bb4290bbdf743c53c7f48e75af14db37966`.**

A canonical non-PowerShell task emitted by current remote authority admission cannot satisfy current canonical local-wake execution-envelope requirements without an out-of-band mutation or another transformation step. No such transformation is authorized by this probe.

This finding is narrower than, and must remain separate from:

- SG-08 continuous ownership/crash safety;
- authenticated transport provenance;
- canonical grant-source provenance;
- physical Windows acceptance;
- Green/security/PRS completion assurance.

## Repair constraints

A repair on the active canonical lineage should:

1. choose one canonical ownership point for these fields rather than add a second adapter/control plane;
2. derive values only from source-backed existing contracts; do not hard-code consent or acceptance truth merely to satisfy local wake;
3. preserve request/delivery/project/mission/task/wake/actor/authority/host correlation;
4. keep authority evidence source-backed;
5. add deterministic negatives for missing/malformed consent, acceptance criteria and target;
6. prove denied inputs produce no worker/process side effect;
7. run exact-head Ubuntu and Windows CI;
8. obtain independent unchanged-head Jess/Michael/PRS evidence before any completion/promotion claim.

## Important semantic warning

The mechanical mismatch could be removed by copying local-wake fixture defaults into admission, but doing so without a canonical source for consent, acceptance criteria and target would manufacture governance evidence. That is not an acceptable repair.

The next implementation step must first identify the existing canonical source/contract for these values and bind it at the existing admission/composition seam.

No overall GREEN. No merge/deploy/production authorization.
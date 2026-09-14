# AgentOS Vertical Execution Batch

## Project / control
- Repository: `darrinbaldwindev/AgentOS`
- Canonical portfolio mission: `darrinbaldwindev/Overseer#49`
- Canonical execution procedure: `darrinbaldwindev/Overseer/.overseer/doctrine/PORTFOLIO-BATCH-ENGINE.md`
- Project profile: `darrinbaldwindev/Overseer/.overseer/profiles/PROJECT-BATCH-PROFILES.md#AgentOS`
- Security matrix: `darrinbaldwindev/Overseer/.overseer/security/AGENTOS-SECURITY-GATE-MATRIX.md`
- Active implementation PR: `AgentOS#104` — `agent/overseer/windows-worker-bridge`
- Purpose: bounded Level 2 execution manifest. Repository/runtime/CI evidence always outranks this file.

## Fresh-scan checkpoint
- Reconciled: 2026-09-15 02:04+10:00 (Brisbane).
- Pre-cycle PR head: `bbfee5221652c9bf0551ce5b31eb0b1cf6e78af1`.
- A-AG-04 implementation/test head: `5e3d7c2ac6f515dceda832ef09b3087f20fb1d7b`.
- PR state at scan: OPEN / DRAFT / UNMERGED / runtime-disabled.
- Exact-head AgentOS Tests `34865951625`: SUCCESS.
  - Ubuntu / Node 22: test suite PASS, npm audit PASS.
  - Windows / Node 26: test suite PASS, npm audit PASS.
- A-AG-04 adds no new persistence or authority system. It proves the existing remote execution receipt artifact preserves exact `authority_evidence_id` across persistence restart/reload and that a duplicate durable receipt cannot replace the original authority provenance.
- SG-08 continuous ownership remains BLOCKED. SG-01/02 authenticated actor + canonical grant binding remain BLOCKED. Functional CI does not promote either security gate.

## Governance boundaries
This batch does **not** authorize merge, approve, mark-ready, rebase, deploy, credential/security-policy changes, production writes, unrestricted PowerShell, runtime enablement, purchases/spend, external contact/publication, physical owner-host action, bypass of Green/PRS, or creation of duplicate scheduler/queue/registry/mission-ledger/authority/persistence/governance systems.

Core invariant: **NO MODEL DECIDES ITS OWN AUTHORITY.** Functional verification, security assurance and PRS assurance remain separate.

## Current vertical batch

### A-AG-01 — continuous project-file ownership fence
- state: BLOCKED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-09, SG-10, SG-11, SG-14, SG-18, SG-19
- objective: one crash-releasing kernel-enforced fence held continuously from final verification through publish/prepared recovery and durable success receipt.
- blocker: existing exact lineage still lacks independent evidence that ownership remains continuously valid through that whole sequence.
- next: keep single-threaded; do not parallelize or create a second lock/ledger.

### A-AG-02 — authenticated actor + canonical grant binding
- state: BLOCKED
- risk_class: S2
- security_gates: SG-01, SG-02, SG-03, SG-04, SG-09, SG-10, SG-11, SG-18, SG-19
- objective: bind an existing authenticated actor source and canonical grant resolver.
- blocker: current admission producer consumes caller-supplied authenticated actor context and injected grant evidence; no bindable canonical transport/grant source is yet evidenced.
- next: architecture discovery only until a real existing source is identified. No self-grant or duplicate authority registry.

### A-AG-03 — Basic Chat lifecycle/readiness
- state: VERIFIED (functional exact-head scope only)
- security_disposition: PENDING_SG18
- exact prior evidence: PR #111 `429b6d5bc14b2790f1a9bace09b76e699cb88b8c`, Tests `34859721665` SUCCESS.
- next: independent Green false-readiness/evidence-leakage sample on the exact eligible lineage.

### A-AG-04 — authority-evidence receipt persistence/reload
- state: VERIFIED_EXACT_HEAD (functional)
- exact head: `5e3d7c2ac6f515dceda832ef09b3087f20fb1d7b`
- exact CI: AgentOS Tests `34865951625` SUCCESS, Ubuntu + Windows.
- risk_class: S2
- security_gates: SG-02, SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch tests only.
- negative_tests: persistence restart/reload retains exact authority evidence; duplicate durable receipt cannot replace original provenance; existing upstream binder denies missing/blank admitted authority evidence.
- receipt_evidence: exact `authority_evidence_id` + delivery/request/task/mission durable receipt lineage.
- green_required: yes
- prs_required: conditional
- owner_boundary: merge/deploy/runtime enablement
- security_disposition: PENDING_SG18

### A-AG-05 — receipt replay/correlation adjacency
- state: PENDING
- risk_class: S2
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- objective: homogeneous deterministic replay/correlation regressions around the now-stable receipt primitive.
- acceptance: duplicate result/receipt, stale receipt and cross-task/cross-mission mismatch fail closed without replacing canonical provenance.
- dependency: A-AG-04 exact-head stability.
- safe action boundary: tests only unless a minimal reproduced defect requires a narrow fix.
- green_required: yes
- prs_required: conditional
- owner_boundary: merge/deploy
- security_disposition: PENDING

### A-AG-06 — local-wake correlation preservation
- state: VERIFIED (bounded prior scope)
- exact prior evidence: `a69562dfe19696b79474c1a3f01a10d67b8d8e90`, runs `34849679000` and `34849679095` SUCCESS.
- security_disposition: PENDING_SG18 before promotion.

### A-AG-07 — physical Windows acceptance packet
- state: BLOCKED / OWNER_REQUIRED
- dependencies: SG-08 closure, SG-01/02 closure, exact-head Green/PRS where required, explicit owner physical-host authority.
- no physical Windows action is authorized by this batch.

## PRS / Green assurance
- stale-owner false-GREEN baseline remains historical evidence only; it does not transfer to successor heads.
- successor ownership challenge remains BLOCKED on A-AG-01 + exact-head Green.
- admission false-GREEN challenge remains BLOCKED on A-AG-02 + exact-head Green.
- Basic Chat false-readiness/evidence-leakage sample is eligible only for the exact stable PR #111 lineage; this execution context does not impersonate Green or PRS.

## Execution order / replenishment
1. Keep A-AG-01 single-threaded and BLOCKED until a real ownership primitive is available.
2. Keep A-AG-02 BLOCKED until a real canonical authenticated actor/grant source is evidenced.
3. Consume A-AG-05 homogeneous receipt replay/correlation regressions only while A-AG-04 remains exact-head stable.
4. Route stable eligible lineages to independent Green; PRS follows only where required and only on identical evidence lineage.
5. Keep physical Windows acceptance owner-gated and downstream of software/security prerequisites.
6. Continue adjacent safe Level 2 work if a blocked primitive cannot move; never manufacture progress by widening authority.

No overall AgentOS GREEN is implied by this batch.

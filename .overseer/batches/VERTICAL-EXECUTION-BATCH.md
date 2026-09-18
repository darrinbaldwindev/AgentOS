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
- Reconciled: 2026-09-15 07:00+10:00 (Brisbane).
- Pre-cycle exact head `0d27c8bfb9a39f2f5449a859a145cd7494926933` retained A-AG-01 SG-08 continuous project-file ownership and A-AG-02 SG-01/02 authenticated actor/canonical grant binding as controlling BLOCKED primitives.
- Replay inspection found a candidate sparse-retained-claim ambiguity. A bounded stricter runtime experiment at `2ef81a226faf95635a4f0133ea062ca49dccd2ac` made null-vs-present mission/task/wake lineage an explicit correlation mismatch. Exact-head AgentOS Tests `34896755271` rejected that semantic change on both OSes because four established claimed-runtime compatibility fixtures deliberately classify legacy sparse retained claims as conservative duplicate delivery. The new negative test itself passed.
- The stricter runtime experiment was withdrawn rather than redefining compatibility behavior. At exact head `e7f4898cca841fa51a818990d9fbf1bc81258db8`, both runtime files are byte-for-byte restored to the pre-cycle baseline; the net cycle diff before this docs reconciliation is test-only.
- New deterministic regression: a retained claim missing mission, task, or wake identity cannot authorize a richer replay, cannot rewrite/upgrade its stored lineage, and invokes the boundary zero times. Existing conservative `DUPLICATE_DELIVERY` remains the fail-closed disposition for that legacy sparse case.
- Exact-head AgentOS Tests `34897414042`: Ubuntu/Node22 full suite + npm audit SUCCESS; Windows/Node26 full suite + npm audit SUCCESS.
- An earlier corrective head `340ecc275ef438bf47d62c421fefdf99f5e524db` produced one Ubuntu cancellation in the pre-existing project-file-writer same-key concurrency test (`Promise resolution is still pending but the event loop has already resolved`) while all replay tests passed and Windows passed. The unchanged final head then passed the complete Ubuntu suite. Treat that cancellation as an SG-08 ownership/concurrency assurance signal, not as proof of closure and not as a replay failure.
- A-AG-01 remains BLOCKED. A-AG-02 remains BLOCKED. No authority/ownership/persistence/scheduler/governance plane was added.

## Governance boundaries
This batch does **not** authorize merge, approve, mark-ready, rebase, deploy, credential/security-policy changes, production writes, unrestricted PowerShell, runtime enablement, purchases/spend, external contact/publication, physical owner-host action, bypass of Green/PRS, or creation of duplicate scheduler/queue/registry/mission-ledger/authority/persistence/governance systems.

Core invariant: **NO MODEL DECIDES ITS OWN AUTHORITY.** Functional verification, security assurance and PRS assurance remain separate.

## Current vertical batch

### A-AG-01 — continuous project-file ownership fence
- state: BLOCKED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-09, SG-10, SG-11, SG-14, SG-18, SG-19
- authority_required: scoped non-production branch/test write only when this single-threaded primitive is being changed.
- objective: one crash-releasing kernel-enforced fence held continuously from final verification through publish/prepared recovery and durable success receipt.
- negative_tests: replacement-after-verification; successor/three-writer; stale identity; TOCTOU; crash/replay; duplicate mutation/result; prepared-recovery stale-owner.
- receipt_evidence: actor/task/file/pre-postimage/ownership/result lineage.
- green_required: yes
- prs_required: yes
- owner_boundary: merge/deploy/physical production
- security_disposition: BLOCKED
- blocker: current exact lineage still lacks independent proof that ownership remains continuously valid through final verification -> publish/prepared recovery -> durable success receipt -> release. Cross-platform test success alone cannot promote SG-08. The one exact-head project-file-writer concurrency cancellation observed this cycle reinforces that this primitive remains assurance-sensitive even though a later unchanged-head/full-suite run passed.
- next: keep single-threaded; independently reproduce/explain the same-key concurrency cancellation before treating that test harness as stable; route an unchanged eligible ownership lineage to independent Green/PRS only after the actual primitive is proven. Do not create a second lock/ledger.

### A-AG-02 — authenticated actor + canonical grant binding
- state: BLOCKED
- risk_class: S2
- security_gates: SG-01, SG-02, SG-03, SG-04, SG-09, SG-10, SG-11, SG-18, SG-19
- authority_required: real existing authenticated identity/grant read plus scoped tests.
- objective: bind an existing authenticated actor source and canonical grant resolver.
- negative_tests: host-as-auth; spoof actor; payload self-grant; absent/mismatch/cross-project/replayed grant.
- receipt_evidence: issuer/source/version/request/task/mission where the canonical source actually provides them.
- green_required: yes
- prs_required: yes
- owner_boundary: credentials/security policy
- security_disposition: BLOCKED
- blocker: current admission producer consumes caller-supplied authenticated actor context and injected grant evidence; no bindable canonical transport/grant source is yet evidenced.
- next: architecture discovery only until a real existing source is identified. No self-grant or duplicate authority registry.

### A-AG-03 — Basic Chat lifecycle/readiness
- state: VERIFIED (functional bounded scope)
- exact prior evidence: PR #111 `352c83fdbcff65dd9dc592fb3b8d65d4aa130969`, Tests `34863648579` SUCCESS.
- risk_class: S1
- security_gates: SG-03, SG-05, SG-10, SG-14, SG-18
- authority_required: none for read-only readiness projection.
- negative_tests: scheduler-enabled fail-close; autonomy fail-close; lifecycle/restart; no self-Green injection.
- receipt_evidence: exact task/mission/wake evidence projection only.
- green_required: yes before promotion
- prs_required: conditional
- owner_boundary: no mutation/physical readiness inferred.
- security_disposition: PASS_BOUNDED on prior sampled scope.

### A-AG-04 — authority-evidence receipt persistence/reload
- state: VERIFIED (functional bounded scope)
- risk_class: S2
- security_gates: SG-02, SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch tests only.
- negative_tests: restart/reload retains exact authority evidence; duplicate durable receipt cannot replace original provenance; upstream binder denies missing/blank admitted authority evidence.
- receipt_evidence: exact `authority_evidence_id` + delivery/request/task/mission durable receipt lineage.
- green_required: yes
- prs_required: conditional
- owner_boundary: merge/deploy/runtime enablement
- security_disposition: PENDING_SG18 for any promoted capability.

### A-AG-05A — canonical required correlation + duplicate provenance
- state: VERIFIED (functional bounded scope)
- risk_class: S1
- security_gates: SG-10, SG-11, SG-14, SG-18
- authority_required: scoped test-only evidence work.
- negative_tests: blank required IDs; duplicate durable receipt ID.
- receipt_evidence: immutable IDs/provenance/disposition.
- green_required: yes if promoted
- prs_required: conditional
- owner_boundary: merge/deploy
- security_disposition: PASS_BOUNDED on sampled scope.

### A-AG-05B — mismatch/replay/direct-adapter correlation closure
- state: SPLIT_REQUIRED / PARTIAL_FUNCTIONAL_VERIFIED
- current_verified_test_lineage: `e7f4898cca841fa51a818990d9fbf1bc81258db8`, Tests `34897414042` SUCCESS cross-platform.
- risk_class: S2 parent item; read-only/test evidence-consumer regressions are S1.
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch/test write.
- objective: close previously overstated receipt replay/correlation scope without creating new persistence/authority layers.
- verified: exact expected delivery/mission/task/wake lineage passes; cross-mission/cross-task/cross-wake borrowing fails closed; malformed durable task/wake fields fail closed through the direct adapter; after restart/reload the exact lineage remains consumable while stale expected mission lineage is denied; a legacy retained claim missing mission/task/wake cannot authorize or rewrite itself into a richer replay lineage and invokes zero times.
- negative_tests_verified: exact expected lineage; cross-mission; cross-task; cross-wake; malformed durable task; malformed durable wake; restart/reload exact lineage; restart/reload stale expected lineage; sparse retained mission; sparse retained task; sparse retained wake.
- remaining_negative_tests: conflicting replay semantics where not already covered by the canonical claim/recovery store; freshness/expiry remains UNKNOWN/N/A unless a real canonical freshness source exists.
- receipt_evidence: durable receipt/claim identity + delivery/request/mission/task/wake/authority-evidence identity + exact head/run where applicable.
- green_required: yes on an unchanged eligible lineage before promotion.
- prs_required: conditional; completion-grade PRS remains ineligible while A-AG-01/A-AG-02 are blocked.
- owner_boundary: no new persistence/authority plane; merge/deploy/runtime enablement.
- security_disposition: PENDING_SG18; parent remains SPLIT_REQUIRED.
- note: the rejected stricter runtime experiment is not part of the verified behavior; established conservative sparse-claim duplicate classification was preserved.
- next: do not add new replay semantics unless an uncovered execution-authorizing path is evidenced; freshness remains UNKNOWN/N/A without a canonical source.

### A-AG-06 — bounded receipt provenance evidence projection
- state: VERIFIED / PASS_BOUNDED
- exact prior repaired head: `2c52de5820f1dfb0dc2536ec1a6887443b5a063d`.
- risk_class: S1
- security_gates: SG-05, SG-10, SG-11, SG-14, SG-18
- authority_required: none; read-only evidence projection.
- negative_tests: noncanonical durable artifact ID; missing receipt; malformed required correlation; secret-shaped field exclusion.
- receipt_evidence: exact durable artifact ID plus bounded whitelisted projection.
- green_required: satisfied only for the cited bounded prior scope; does not transfer automatically to newer heads.
- prs_required: conditional
- owner_boundary: no new evidence authority; merge/deploy
- security_disposition: PASS_BOUNDED on the cited exact head only.

### A-AG-07 — physical Windows acceptance packet
- state: BLOCKED / OWNER_REQUIRED
- risk_class: S2
- security_gates: SG-03, SG-08, SG-10, SG-11, SG-14, SG-18, SG-20
- authority_required: explicit owner-authorized physical Windows action.
- negative_tests: wrong head; production root; missing receipt.
- receipt_evidence: exact head/host/root/test/result.
- green_required: yes
- prs_required: yes if promoted
- owner_boundary: physical Windows execution
- security_disposition: BLOCKED
- dependencies: SG-08 closure, SG-01/02 closure, exact-head Green/PRS where required.

### A-AG-08 — Windows shared-state persistence contention / atomic replacement
- state: VERIFIED_EXACT_HEAD (functional bounded scope)
- substantive_head: `74fe4e8edeae851e06d75e663c04d4b0c15419d4`
- exact_tests: AgentOS Tests `34891305730` SUCCESS on Ubuntu/Node22 and Windows/Node26 including npm audits.
- risk_class: S2
- security_gates: SG-09, SG-10, SG-11, SG-14, SG-18
- authority_required: scoped non-production branch implementation/test only; no new authority.
- objective: preserve the existing local persistence single-writer contract under real Windows contention without creating a second persistence mechanism.
- negative_tests: concurrent independent state handles; stale CAS rejection; failed atomic batch invisibility; abandoned lock not stolen; eight real scheduler processes cannot execute one delivery twice; bounded failure if Windows atomic replacement remains unavailable.
- receipt_evidence: exact branch head + workflow run + cross-platform full-suite result.
- green_required: yes before any capability promotion.
- prs_required: conditional; this does not substitute for A-AG-01 ownership assurance.
- owner_boundary: merge/deploy/runtime enablement; no production writes.
- security_disposition: PENDING_SG18 despite functional exact-head success.
- note: the first Windows fix closed lock-acquisition `EPERM` but exposed atomic-replacement `EPERM`; the second bounded retry retained the existing lock continuously and made both concurrency paths pass. This is not an SG-08 ownership claim.

## PRS / Green assurance
- Historical stale-owner false-GREEN evidence remains a defect baseline only and does not transfer to successor heads.
- Completion-grade ownership challenge remains BLOCKED on A-AG-01 + exact-head Green.
- Admission challenge remains BLOCKED on A-AG-02 + exact-head Green.
- A-AG-08 and A-AG-05B have bounded functional exact-head CI evidence only; SG-18 remains PENDING and PRS status is not promoted by this executor.

## Execution order / replenishment
1. Preserve A-AG-01 as the single-threaded SG-08 critical primitive; independently reproduce/explain the observed project-file-writer same-key concurrency cancellation before treating the ownership test harness as stable, without conflating A-AG-08 persistence success with ownership proof.
2. Keep A-AG-02 BLOCKED until a real canonical authenticated actor/grant source is evidenced; no substitute authority source.
3. Treat A-AG-05B sparse retained replay behavior as bounded functional evidence only; do not redefine legacy sparse-claim semantics or invent freshness.
4. Route unchanged eligible A-AG-08/A-AG-05B evidence to independent Green only after exact-head eligibility is confirmed; then PRS only where prerequisites are satisfied.
5. Keep physical Windows acceptance owner-gated and downstream of software/security prerequisites.
6. Continue adjacent Everyday frontend / Night Shift / Morning Brief / upgrade-boundary work only where it does not widen authority.

No overall AgentOS GREEN is implied by this batch.
## Owner-start continuation — 2026-09-16 receipt prerequisite

- Candidate branch: `work/powershell-receipt-proof`, based on fresh #104 `bae44534d6d11b967fdac09bd734f8c073f23f2f`; isolated draft change, no rebase/merge of #104.
- W-AG-02 / A-AG-05B: execution integration remains BLOCKED. A genuinely uncovered receipt prerequisite was repaired: arbitrary truthy recorder results (including `{persisted:false}`) could promote the execution boundary to VERIFIED. The canonical adapter now requires explicit acknowledgement or an exactly matching canonical artifact; contradictory acknowledgement/artifact evidence fails closed. Existing claim retention, budget reconciliation and replay denial remain owned by their canonical primitives.
- Targeted evidence: nine new negative cases fail against original adapter, pass with repair; canonical persisted artifact reload preserves exact receipt. Independent worker review reports 43 targeted tests passing on implementation blobs. This is not Jess/Michael/PRS approval, not full-suite/Windows evidence.
- Receipt acknowledgement remains a trusted-recorder contract, not independent proof of disk durability. The positive integration test exercises actual local persistence and reload. No new persistence plane.
- A-AG-01 SG-08 and A-AG-02 SG-01/02 remain BLOCKED_STABLE. No local-wake enablement, project-file mutation, physical acceptance or overall GREEN.
- Security gates: SG-09/10/11/18/19; risk S2 bounded non-production patch. Independent Jess and Michael exact-candidate review remain required before PRS eligibility.

Next executable order:
1. Resolve candidate full-suite/Ubuntu/Windows CI on its exact committed head; do not borrow predecessor CI.
2. Independent Jess functional and Michael security challenge on identical unchanged candidate.
3. Bind authenticated actor and canonical grant dependencies before bounded local-wake execution; no injected authority substitute.
4. Repair one existing SG-08 kernel ownership lifecycle before mutation; preserve prepared-recovery/receipt ordering obligations.
5. Keep physical five-minute acceptance downstream; no owner laptop action currently closes these software gates.

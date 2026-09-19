# Frontend Cycle 022 — Fail-closed state reconciliation

Date: 2026-09-19 Australia/Brisbane  
Role: AgentOS Frontend Overseer  
Status: EXECUTED / EXACT-HEAD CI PASS / DRAFT LINEAGES REMAIN UNMERGED

## Fresh scan

- `main`: `44e0bd506767a6b4f00f169c5ef4f8ddeefaf4eb` — product-surface consolidation contract is now canonical main direction.
- #110: `a27aa1864e5fe90a1f3c8e2d5b0c0c35c2fff198`, DRAFT / OPEN / UNMERGED; fresh metadata reports mergeable true, superseding Cycle 021's transient not-mergeable observation.
- #111 predecessor: `3ac4d306087ac0ef34d65ba63c76b704bc821e4a`.
- #112: `dbd7a18b845f6fa24c8b1c9a7e58825d949211fc`, exact-head AgentOS Tests and Project Overseer Wake reported SUCCESS in current PR metadata.
- #104: `6b32b2cad54eb58bbf8d30285c82af875a211686`, exact-head AgentOS Tests reported SUCCESS in current PR metadata.
- #123: `b993632ef44d26c91cab08190968205a6316106d`; independent PRS reproduced the SG-08 continuous-ownership false-success class for normal and prepared-recovery publish.
- #124: `8bba77aa04b535d6c7a1c0edad495336572b5951`; new bounded POSIX `flock` kernel-fence viability spike. It is not integrated into mutation/receipt/recovery sequencing and does not close SG-08.

## Canonical product-direction reconciliation

Main now defines six user-facing pillars: Chat & Projects, Workers & AI, Automations, Connections, Control & Cost, Evidence & Recovery. Simple / Essentials / Tech Head remain presentation views over one truth and authority model. The frontend lane will absorb work into these pillars rather than add headline surfaces without canonical backing evidence.

## Defect found

Cycle 021 made failed send/control requests refresh `/api/state`, but if that reconciliation request itself failed, the catch path swallowed the refresh error and the final render could reuse the old snapshot. That could re-enable Send/Pause/Resume/Stop from stale pre-error availability precisely when canonical state was unavailable.

This is a frontend fail-closed defect. It does not prove any runtime control was accepted or rejected incorrectly.

## Repair

#111 now:
- rejects non-2xx `/api/state` refreshes;
- rejects invalid top-level state payloads;
- uses one `reconcileAfterError()` path after failed sends and controls;
- if canonical refresh cannot be established, converts only presentation availability to fail-closed unknown: `ready:false`, `paused:false`, `stopped:false`, `status:'UNKNOWN'`;
- preserves previously displayed history/jobs/evidence fields but disables new work and controls because canonical availability cannot be confirmed;
- applies the same fail-closed behavior to initial state-load failure.

This does not synthesize Pause, Stop, authority, execution, recovery, Green, PRS or readiness. It deliberately chooses `Unable to confirm status` and disabled actions over stale positive availability.

Regression coverage in `tests/basic-chat-control-presentation-static.test.mjs` pins the fail-closed reconciliation rule.

## Exact-head verification

#111 exact head: `d737fc513cc9b4a9d19b2ba7c18d43ccfe8c9728`.

AgentOS Tests #1994 / run `35413633711`: SUCCESS on exact head.
- general test suite: SUCCESS;
- npm dependency audit: SUCCESS;
- Windows-native Basic Chat lifecycle: SUCCESS.

## Runtime / readiness disposition

SG-08 remains BLOCKED. #123's independent PRS evidence strengthens the reason for HOLD: point-in-time/pathname ownership checks still permit durable false success after ownership displacement. #124 is a useful primitive viability experiment only. Frontend mutation readiness therefore remains `unknown / NO_CANONICAL_MUTATION_READINESS_SOURCE`.

#112 has moved and is CI-green at its current head, but current PR metadata still describes Level-2 dependency/ownership/authority discovery rather than the single runtime-owned composed frontend readiness snapshot required for live readiness wiring. No frontend readiness synthesis is authorized.

## Next vertical work

1. Reconcile the canonical six-pillar product contract into the frontend vertical batch and future UI information architecture.
2. Continue Basic Chat transport/state truth audit for malformed successful POST payloads and other stale-positive presentation paths.
3. Track #124 only as SG-08 primitive evidence; do not wire project-file mutation until continuous ownership is integrated and independently assured.
4. Search #112/current runtime for a real composed readiness source before wiring readiness.
5. Seek canonical read contracts for Chat & Projects and Status/Attention Inbox without creating frontend registries.
6. Keep Jack interactive authority and Recovery actions blocked until canonical action contracts exist.
7. Physical browser/mobile acceptance remains separate from hosted CI.

## Protected boundaries

No merge, approval, ready transition, rebase, deployment, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness, beta activation or overall GREEN.

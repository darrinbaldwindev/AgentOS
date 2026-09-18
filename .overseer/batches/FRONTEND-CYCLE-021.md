# Frontend Cycle 021 — Control-error truth refresh

Date: 2026-09-18 Australia/Brisbane  
Role: AgentOS Frontend Overseer  
Status: EXECUTED / DRAFT LINEAGES REMAIN UNMERGED

## Fresh evidence

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- #111 validated predecessor: `aa274b837f454b8268a5e658f11916a70c66d1f6`.
- #111 predecessor CI: AgentOS Tests #1729 / run `35282531423` SUCCESS; Ubuntu general suite + npm dependency audit and Windows-native Basic Chat lifecycle SUCCESS.
- #104: `607f2683b7d3b234fc6ffa70e2a7d42e31499c3a`.
- #104 CI: AgentOS Tests #1745 / run `35297751947` SUCCESS on Windows/Node26 and Ubuntu/Node22, including dependency audits.
- #112: `33eca1d257179a873a8aca2eea1a4e5e994415a0` unchanged.

## Defect found

The Basic Chat send-error path refreshed `/api/state` after a failed request, but the control-error path only displayed the error and rendered the previous client snapshot. If `/api/control` rejected because canonical server state had changed, the UI could continue presenting stale button availability until a later refresh.

This is a presentation reconciliation defect, not evidence that the runtime accepted or rejected the wrong control.

## Repair

On #111, failed control requests now:
1. present the bounded ordinary-language error;
2. refresh canonical `/api/state`;
3. render controls from the refreshed snapshot.

The repair does not retry the control and does not mutate authority, execution, readiness, Green, PRS or recovery state.

Regression coverage in `tests/basic-chat-control-presentation-static.test.mjs` requires the control handler to refresh canonical state after an error and retain canonical render-derived button availability.

Current #111 exact head after implementation/regression commits: `3ac4d306087ac0ef34d65ba63c76b704bc821e4a`.

Fresh exact-head CI is required. The successful #1729 predecessor is not borrowed for the new head.

## Runtime reconciliation

#104's new SG-08 research reconciliation supports the existing diagnosis but explicitly does not establish assurance. It directs the runtime lane to scan existing dependencies/runtime primitives for a kernel-backed cross-platform ownership primitive and to keep SG-08 HOLD if none satisfies continuous ownership through final verification -> publish/prepared recovery -> durable receipt -> release.

Therefore frontend project-file mutation remains `unknown / NO_CANONICAL_MUTATION_READINESS_SOURCE`.

#112 still does not evidence the composed read-only frontend readiness snapshot needed to live-wire host lifecycle + Windows capability + expected exact head + physical acceptance.

## Durable coordination

The canonical frontend vertical batch was replenished through Cycle 021 on PR #110's documentation lineage; the batch cross-reference update reached `d24360f3ee9653acffaabc9af682e838767fae26`. PR #110 and #111 remain DRAFT / OPEN / UNMERGED. The next cycle must consume exact-head CI for #111 `3ac4d306...` before claiming this repair validated.

## Protected boundaries

Projects and Inbox remain unwired pending canonical read contracts. Interactive Jack Allow/Revoke remains blocked pending canonical lifetime/expiry/revoke/consequence and durable action semantics. Recovery remains contract-only. Physical browser/mobile acceptance remains unproven.

No merge, approval, ready transition, rebase, deploy, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness, beta activation or overall GREEN.

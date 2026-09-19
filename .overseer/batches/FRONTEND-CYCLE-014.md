# Frontend Cycle 014 — Stop-state hardening

Date: 2026-09-16 Australia/Brisbane

## Fresh scan

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- #101: `d91abaecf602d7ef223c4888f10fa9361677302e`.
- #104: `5bb27bb4290bbdf743c53c7f48e75af14db37966`.
- #110: scan head `86d01ce1407c63c370171d5088e7112f5b901be9` before Cycle 014 coordination commits.
- #111: scan head `b4386cfd960fc1659917b223c75004982a2c157d`; Cycle 014 implementation head `2d44e6fbac7a78c0d2eddc0fdb7e8d82b654606f`.
- #112: `33eca1d257179a873a8aca2eea1a4e5e994415a0`.

## Runtime movement consumed

#104 advanced three commits from the previous frontend checkpoint. The new SG-08 design checkpoint and regressions make the defect sharper, not resolved: POSIX pathname ownership can be lost immediately before success-receipt persistence, allowing durable `MUTATED_VERIFIED` / `recovery_required:false` before release detects the successor. The design explicitly rejects another instantaneous `assertOwnLock()` as a repair and requires one kernel-held/crash-releasing ownership primitive across verification -> publish/recovery -> durable receipt -> release. Mutation therefore remains UNKNOWN/BLOCKED.

#112 advanced eight commits. Capability normalization now fails closed on conflicting alias/canonical evidence instead of silently choosing one. No canonical composed frontend readiness snapshot was evidenced in the scanned movement, so Basic Chat readiness remains intentionally unwired.

## Frontend defect found and repaired

Fresh inspection of #111 found an API-level control contradiction. The UI correctly disabled Resume after Stop, but `createLocalChat().control('resume')` still wrote `stopped:false`. A direct API caller could therefore clear a Stop request without the host restart promised by the user-facing copy.

Cycle 014 repaired this on the existing #111 lineage:
- Stop is sticky for the current host lifetime;
- Resume after Stop fails closed with `CHAT_STOPPED`;
- Pause after Stop also fails closed rather than mutating the stopped state;
- ordinary Pause -> Resume behavior remains separate;
- no execution cancellation, authority revocation or stronger stop guarantee was invented.

Implementation commits:
- `e380140f70130fe4aeb994e9ecbe0f9609582c15` — runtime repair;
- `2d44e6fbac7a78c0d2eddc0fdb7e8d82b654606f` — deterministic regressions.

## Exact-head verification

AgentOS Tests #1505, run `35040772946`, completed SUCCESS on exact head `2d44e6fbac7a78c0d2eddc0fdb7e8d82b654606f`:
- general `test` job SUCCESS;
- full test-suite step SUCCESS;
- npm dependency audit SUCCESS;
- Windows-native Basic Chat lifecycle SUCCESS.

This validates the tested implementation head only. It does not prove active-action cancellation, physical browser/mobile acceptance, physical Windows acceptance for the Level-2 worker, SG-08 mutation safety, authority revocation, Green/PRS assurance or overall readiness.

## Current truth

`Stop requested` remains future-action prevention/request state, not proof that an already-running action terminated and not permission revocation. Project-file mutation remains blocked by SG-08. Jack interactive Allow/Revoke remains blocked. Recovery remains contract-only. Physical browser/mobile acceptance remains unproven. No overall GREEN.

## Next vertical actions

1. Continue scanning #104 for a real continuous ownership primitive; do not infer mutation readiness from receipts or CI.
2. Continue scanning #112/runtime for one canonical read-only readiness composition snapshot before live-wiring readiness.
3. Expand the shell only from canonical read contracts. Recent Jobs is read-only; Projects/Inbox/Connectors/live readiness/Jack actions remain contract-gated.
4. Keep Stop semantics aligned across UI and direct API paths; any future true cancellation must have its own runtime evidence before stronger wording.
5. Execute physical browser/mobile acceptance only when a trustworthy runnable target exists.

## Protected HOLD

No merge, approval, ready transition, rebase, deploy, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

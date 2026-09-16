# Frontend Cycle 016 — canonical Recent Jobs lifecycle repair

Date: 2026-09-16 Australia/Brisbane

Status: DRAFT / UNMERGED / NO OVERALL GREEN

## Fresh reconciliation

Live repository/API state outranks stale coordination text.

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- #101: `d91abaecf602d7ef223c4888f10fa9361677302e`.
- #104: `5bb27bb4290bbdf743c53c7f48e75af14db37966`.
- #110: `f9728ba553878f9a142d4bcd87f8ec711c1d3cfb` at scan.
- #111: `2d44e6fbac7a78c0d2eddc0fdb7e8d82b654606f` at scan; Cycle 014 exact-head AgentOS Tests #1505 / run `35040772946` SUCCESS.
- #112 live PR API: `33eca1d257179a873a8aca2eea1a4e5e994415a0`.

A pre-existing Cycle 015 coordination file was discovered during the attempted durable write. It records a concurrent earlier Jobs integration cycle and contains older/conflicting dependency heads. It was not overwritten; this Cycle 016 records the fresh live reconciliation instead.

## Defect found

Recent Jobs accepted presentation-style states such as `verifying` and `complete`, but the canonical dispatch runner persists `verification`, `completed`, and `escalated`. Real canonical tasks in those states could therefore be shown as `Unable to confirm`.

## Repair executed on #111

- projection now preserves canonical `verification`, `completed`, and `escalated` states;
- unknown states still fail closed;
- UI labels `completed` as `Execution completed`, deliberately not claiming Green/PRS assurance;
- `verification` -> `Checking result`;
- `escalated` -> `Escalated — needs attention`;
- deterministic projection tests now exercise the actual canonical runner states.

Implementation commits:
- `40a129e2612c932ff865fb4856cd7fc28636372e` — projection lifecycle correction;
- `3976413d9efd4960ad89bc6df9e5cf07eff1ef6c` — canonical-state regressions;
- `df148157d241fa5577260da95606d9b33b9eec90` — truthful UI labels.

Fresh exact-head CI for `df148157...` is required. Predecessor CI is not borrowed.

## Runtime blockers unchanged

#104 SG-08 remains BLOCKED; no real continuous ownership primitive has been evidenced on the live head. No canonical runtime-owned composed frontend readiness snapshot was found. Project-file mutation remains UNKNOWN/BLOCKED. Jack Allow/Revoke remains blocked. Recovery remains contract-only. Physical browser/mobile acceptance remains unproven.

## Next vertical actions

1. Consume exact-head CI for #111 `df148157...` and repair failures without weakening canonical lifecycle semantics.
2. Continue #104 SG-08 change detection.
3. Continue runtime-owned readiness composition search; never synthesize it in frontend state.
4. Keep dispatch execution completion separate from Green completion and Henry/PRS assurance in every Jobs surface.
5. Expand Projects/Inbox/Connectors only from canonical read contracts.
6. Run physical browser/mobile acceptance only when a trustworthy runnable target exists.

## Protected HOLD

No merge, approval, ready transition, rebase, deploy, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

# Frontend Cycle 018 — Jobs disclosure hardening

Date: 2026-09-17 Australia/Brisbane

Status: DRAFT / UNMERGED / NO OVERALL GREEN

## Fresh reconciliation

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1` unchanged.
- Cycle 017 exact head `f89dd5cb49ffa7efe0649ca2aee433d19cf0fd34` completed AgentOS Tests #1679 / run `35097976181` SUCCESS: general suite, npm dependency audit and Windows-native Basic Chat lifecycle all passed.
- #104 advanced again to `e59eea89021b89631fac865d6610f927e4103ef0`, 11 commits beyond the prior frontend checkpoint. The delta is concentrated in canonical dispatch conflict/safe-write handling and tests. It is useful dispatch durability work, not proof of SG-08 project-file ownership.
- #112 remains `33eca1d257179a873a8aca2eea1a4e5e994415a0`.

## Frontend execution

Cycle 017 added project identity to the bounded Jobs projection as a required correlation fact. Cycle 018 keeps that identity out of ordinary Essentials disclosure while making it visible in Tech Head mode:

- Essentials: `Task <id>` only.
- Tech Head: `Project <projectId> · Task <taskId> · Mission <missionId>`.
- Simple: Recent Jobs remains hidden by the existing presentation-only CSS rule.

This preserves one canonical Jobs projection across all modes. No mode changes permissions, execution, authority, capability, persistence, assurance or readiness.

Added a static regression that requires project/mission correlation to be Tech Head disclosure only and guards against project identity becoming an API/mutation action.

Implementation commits on #111:
- `795145b7e7cc29fd92efc44bd3bc1ea2ba83c7e8` — Tech Head project/task/mission disclosure.
- `bb5eef4811755988ddb7ee834c81256e0a04cacb` — mode-disclosure regression.

Exact-head AgentOS Tests #1705 / run `35195380788` is queued. Predecessor Cycle 017 success is not borrowed for this head.

## #104 boundary

The fresh #104 PR remains DRAFT / UNMERGED and its own controlling description still states SG-08 continuous ownership across final verification -> publish/prepared recovery -> durable success receipt -> release is not proven. The new safe-write/conflict movement does not establish that ownership fence. Project-file mutation remains UNKNOWN/BLOCKED in frontend truth.

## Still blocked

- Projects: no canonical mainstream project-composition read contract evidenced.
- Inbox: no explicit user-attention/notification contract evidenced.
- Readiness: no single runtime-owned composed frontend readiness snapshot evidenced.
- Jack interactive Allow/Revoke: no complete canonical durable grant/revoke semantics.
- Recovery UI: no live exact-correlated producer/read path evidenced.
- Physical browser/mobile acceptance: not proven.

## Next vertical actions

1. Consume exact-head #111 CI #1705 and repair any failure without weakening disclosure or correlation.
2. Continue #104 SG-08 change detection; do not convert dispatch durability into mutation readiness.
3. Trace a runtime-owned composed readiness snapshot on live lineages; wire only if canonical and read-only.
4. Keep Projects/Inbox unavailable until their real source contracts exist.
5. Continue three-mode shell expansion only where the same canonical truth can be progressively disclosed.

## Protected HOLD

No merge, approval, ready transition, rebase, deploy, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

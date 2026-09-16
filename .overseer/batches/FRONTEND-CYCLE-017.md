# Frontend Cycle 017 — Recent Jobs project isolation

Date: 2026-09-16 Australia/Brisbane

Status: DRAFT / UNMERGED / NO OVERALL GREEN

## Fresh reconciliation

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- #104 moved materially to `86005652d7454c0be4862d49846bd5bccc1daec7` (210 commits / 83 files on the draft lineage). Compared with the previous frontend checkpoint `5bb27bb...`, the newest six commits modify the canonical dispatch runner and its tests, including preservation of `dispatch_sha` and fail-closed escalation when the completed state cannot be durably persisted.
- #111 cycle-start head: `df148157d241fa5577260da95606d9b33b9eec90`; Cycle 016 AgentOS Tests #1584 / run `35047224549` SUCCESS.
- #112 live head remains `33eca1d257179a873a8aca2eea1a4e5e994415a0`.

## Defect found

Recent Jobs required task/mission/wake identity but did not require `project_id`, and the Basic Chat snapshot projected every canonical `dispatch.task` artifact in the shared local persistence file. If another project wrote canonical tasks into the same store, Basic Chat could present them as its own Recent Jobs.

This is a truth/isolation defect, not an authority defect: the UI was observational, but the scope could be wrong.

## Repair executed on #111

- `projectBasicChatJobs` now requires a non-empty canonical `project_id` on every projected task.
- The bounded projection includes `projectId` as correlation metadata.
- Callers may supply an expected project ID; mismatched tasks fail closed and are excluded.
- Basic Chat now explicitly scopes Recent Jobs to its canonical local project `agentos-local`.
- Added regressions proving a foreign-project task and a task missing project identity are excluded.
- Sensitive fields remain excluded and no new store, endpoint, scheduler, authority source, mutation path, Green source or PRS source was added.

Implementation commits:
- `a90bf843f8c46cf00902ac2c7b48c7280af3d907` — require project correlation in Jobs projection.
- `d6676bf1710dc0a81e65a2335596cb5dd724e16c` — scope Basic Chat Recent Jobs to `agentos-local`.
- `b98c33376d42cbd3632783afe28e0ae5851459c0` — deterministic project-isolation regressions.

Fresh exact-head CI for `b98c333...` is required; predecessor success is not borrowed.

## Projects / Inbox reconnaissance

The canonical state vocabulary does contain a generic `project` entity in `runtime/core-state.mjs` and local persistence, but no mainstream Basic Chat project-composition contract or current project list producer was evidenced. Existing default-branch `project` creation hits are primarily tests/demo/session setup. Therefore Projects remains unwired.

No explicit notification/inbox/user-attention contract was found in the fresh default-branch search. Arbitrary runtime/audit events will not be relabelled as Inbox items. Inbox remains unwired.

## Runtime blockers

#104 has meaningful dispatch durability movement, but its own current PR description still says SG-08 continuous ownership across final verification -> publish/prepared recovery -> durable success receipt -> release is not proven. Project-file mutation remains UNKNOWN/BLOCKED. No canonical runtime-owned composed frontend readiness snapshot was evidenced. Jack Allow/Revoke and live recovery remain blocked. Physical browser/mobile acceptance remains unproven.

## Next vertical actions

1. Consume exact-head #111 CI for `b98c333...`; repair failures without weakening project isolation.
2. Continue #104 SG-08 change detection and distinguish dispatch durability improvements from mutation ownership proof.
3. Continue runtime-owned readiness composition search; never synthesize it in frontend state.
4. Keep Projects and Inbox unavailable until canonical read contracts exist.
5. Continue shared-shell work only on surfaces backed by canonical facts.

## Protected HOLD

No merge, approval, ready transition, rebase, deploy, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

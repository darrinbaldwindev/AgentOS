# Frontend Cycle 019 — Stop restart truth repair

Date: 2026-09-18 Australia/Brisbane

Status: DRAFT / UNMERGED / NO OVERALL GREEN

## Fresh reconciliation

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1` unchanged.
- #111 Cycle 018 exact head `bb5eef4811755988ddb7ee834c81256e0a04cacb` passed AgentOS Tests #1705 / run `35195380788`: Ubuntu general suite + npm audit SUCCESS and Windows-native Basic Chat lifecycle SUCCESS.
- #104 advanced to `f01021301255ebde0f9b3c6baf2b1d55bea05420`, nine commits beyond the Cycle 018 checkpoint. The new delta strengthens canonical dispatch correlation/escalation tests, including rejection of executor results missing mission correlation. It does not prove the separate SG-08 project-file ownership fence; #104 remains DRAFT and its own description still says mutation is AMBER/BLOCKED.
- #112 remains `33eca1d257179a873a8aca2eea1a4e5e994415a0`.

## Defect found

Cycle 014 deliberately defined Basic Chat Stop as sticky for the current host lifetime and the UI tells the user to restart the local host before sending another job. Fresh source inspection found the persisted `basic-chat:control` artifact was only initialized when absent. Therefore `stopped:true` survived a clean host close/restart, contradicting the advertised host-lifetime boundary and leaving the user unable to clear Stop through the documented path.

This is a frontend/runtime truth defect. It is not authority revocation, execution cancellation or scheduler state.

## Repair executed on #111

At successful creation of a newly locked Basic Chat host:
- existing persisted `paused`/`stopped` flags are reset to false;
- status/lastUserStatus are reset to ready;
- only those transient host-control fields are reset;
- existing task/evidence/history/correlation fields remain untouched;
- no authority, permission, scheduler, worker, Green, PRS, readiness or mutation state is changed.

Stop remains sticky inside the current host lifetime: Resume/Pause after Stop still reject with `CHAT_STOPPED`, and future sends remain blocked until that host closes.

Added deterministic regression proving:
1. Stop blocks the first host;
2. clean close releases that host;
3. a newly acquired host clears the transient Stop/Pause flags and becomes ready.

Implementation commits:
- `bc70ab24132b3e6b1fd871c4b141bdc24c6384fa` — reset transient host controls on new host acquisition.
- `aa274b837f454b8268a5e658f11916a70c66d1f6` — restart-boundary regression.

Exact-head AgentOS Tests #1729 / run `35282531423` is queued. Cycle 018 success is not borrowed for this new head.

## #104 correlation movement

Fresh #104 head adds a deterministic test requiring canonical executor result mission correlation. Missing mission identity escalates and must not enter verification/completed; fully correlated evidence may proceed. This improves dispatch truth and aligns with frontend exact-correlation doctrine, but does not establish project-file mutation readiness.

## Still blocked

- SG-08 continuous project-file ownership through publish/recovery/receipt/release.
- Runtime-owned composed frontend readiness snapshot.
- Canonical Projects composition source.
- Explicit Inbox/user-attention source.
- Interactive Jack Allow/Revoke semantics.
- Live recovery producer/read path.
- Physical browser/mobile acceptance.

## Next vertical actions

1. Consume exact-head #111 CI #1729; repair failures without weakening the host-lifetime Stop invariant.
2. Inspect startup failure handling around host lock acquisition so a failed transient-control reset cannot strand a host lock; change only if evidence confirms a defect.
3. Continue #104 SG-08 change detection and keep dispatch correlation improvements separate from mutation readiness.
4. Continue runtime-owned readiness composition search; never synthesize readiness in frontend persistence.
5. Keep Projects/Inbox unavailable until canonical read contracts exist.

## Protected HOLD

No merge, approval, ready transition, rebase, deploy, credential change, production write/autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

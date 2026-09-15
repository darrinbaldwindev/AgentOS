# Frontend Cycle 015 — Canonical Jobs Integration

Date: 2026-09-15
Role: AgentOS Frontend Overseer
Status: DRAFT / UNMERGED / NO OVERALL GREEN

## Fresh reconciliation

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1` at cycle start.
- PR #101: `d91abaecf602d7ef223c4888f10fa9361677302e`.
- PR #104: `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`; SG-08 project-file ownership false-success remains controlling negative evidence.
- PR #111 cycle-start head: `120a3ce924263f4b65b9cfd5d9ef257268b14f50`.
- PR #112 moved to `6b8bcea4ed287e76fff4943b53e91926db5da7b0`.
- SOP PR #113 moved concurrently and independently.

## Executed vertical slice

Cycle 014 established a pure read-only `projectBasicChatJobs` projection over canonical `dispatch.task` artifacts. Cycle 015 wires that projection into the existing Basic Chat runtime snapshot and product surface without adding a task store, endpoint, scheduler, authority source, retry path or assurance source.

Runtime snapshot now returns at most five bounded Jobs records from the existing canonical persistence surface. The projection requires exact task artifact identity plus mission/wake correlation and excludes objective/prompt content, worker output, authority payloads, credentials, evidence payloads, PRS and recovery claims.

UI behavior:
- Essentials and Tech Head show `Recent jobs` as a read-only surface.
- Simple hides the Jobs surface to preserve minimum complexity.
- Tech Head may reveal the already-projected mission identifier; Essentials shows task identity only.
- Jobs exposes no Start, Stop, Retry, Approve, Verify, Revoke or mutation controls.
- unknown canonical status is presented as `Unable to confirm`, never promoted to success.

Added integration regression proving the live Basic Chat snapshot contains bounded canonical Jobs and does not leak the submitted objective.

## Failure consumed

Intermediate head `d062b5f7ab7d8b9761548b998eb7142edf922781` triggered AgentOS Tests #1397 failure because compacted JavaScript broke existing static presentation-contract regexes. Runtime/evidence/Jobs tests themselves were passing. The implementation was reformatted to preserve the existing guarded presentation contract rather than weakening those tests.

## Boundaries retained

- Projects remains unwired: no equivalent canonical project-composition contract has been evidenced for the mainstream shell.
- Inbox remains unwired: runtime events are not automatically user notifications.
- Jobs is observational only and does not establish completion, Green, PRS, recovery, authority, readiness or mutation safety.
- Project-file mutation remains UNKNOWN/BLOCKED under SG-08.
- Jack interactive Allow/Revoke remains blocked.
- Recovery remains contract-only for Basic Chat.
- Physical browser/mobile acceptance remains unproven.
- Founding Beta remains HOLD.

## Verification

Final exact-head CI must be recorded only after the current PR #111 head completes. Do not borrow success from an earlier head.

## Next vertical actions

1. Consume exact-head #111 CI and repair any remaining failures without weakening truth boundaries.
2. Search current runtime/main/#112 for a legitimate project-composition source; if absent, keep Projects unavailable rather than fabricate it.
3. Search for an explicit user-attention/notification contract before implementing Inbox; do not relabel arbitrary audit/runtime events as notifications.
4. Continue monitoring #104 for SG-08 ownership repair and authority lifetime/revocation semantics.
5. Execute physical browser/mobile acceptance only when a trustworthy runnable draft target exists.

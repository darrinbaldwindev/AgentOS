# SOP-SCHED-001 — Scheduled Work, Night Shift and Autonomy Hours

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
Scheduling determines when an already-authorised mission/task becomes eligible for consideration. It does not grant new permissions, expand capability, approve spend, waive Green/PRS, authorise communications or turn product direction into production autonomy.

## Required schedule envelope
Record: schedule ID; mission/task template identity; owner; cadence/window/timezone; start/end/expiry; target project; authority/approval references; capability/tool limits; budget; concurrency/overlap policy; missed-run policy; retry/replay/idempotency behavior; stop/pause/revoke; evidence/receipt requirements; Morning Brief/report destination; revalidation trigger.

## Admission at every run
Each scheduled run must re-check current mission/task authority, approval validity, capability eligibility, budget, target identity, stop/revoke state and required policy gates. A schedule created under valid authority cannot keep executing after that authority expires or is revoked.

## Failure/recovery
Duplicate tick, restart replay, stale schedule, overlapping run, missing correlation, missing receipt, uncertain previous side effect or changed target must fail closed or enter canonical recovery rather than manufacture a second execution.

## Night Shift / Autonomy Hours
Unattended time does not increase authority. Protected actions remain protected. Unknowns that would require owner judgment are queued for Morning Brief/approval rather than guessed.

## Morning Brief minimum
Report exact work attempted/completed, evidence/receipts, changed artifacts, tests, blockers/UNKNOWNs, approvals required, spend if authorised, Green/PRS state and next safe actions. Do not convert worker success or scheduler firing into overall GREEN.

## Physical acceptance
Hosted CI/simulation cannot substitute for explicitly required owner-machine acceptance. Never fabricate real ticks, restart continuity or physical-host evidence.
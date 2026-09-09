# Work bridge assurance — 2026-09-09

## Resumed execution: completion publication

Recovered local commit `ad0285276f98083cc967a987861ad38cca4e87cc`;
live PR #91 remained at `afc0d1d` with CI run 542 successful.
That remote CI does not certify the recovered local changes.

A new filesystem rename-failure regression reproduced a ledger `COMPLETED`
action without a persisted final response. The mandatory pre-finalization ledger
entry now says `COMPLETION_AUTHORIZED`, with next action `persist_final_response`.
It remains before response publication so ledger failure also prevents completion.
The final persisted response is the completion record; authorization alone is
not completion. No runtime consumer of the old action was found. Independent
reconciliation must require the persisted response and correlated evidence.

The new regression failed before the change. After the change, all 335 AgentOS
tests passed locally under Node v24.19.0, including the existing post-Green ledger
failure regression. This does not establish atomic cross-file commits, power-loss
durability, remote receipt completion, or physical Windows acceptance.

Baseline: PR #91, `afc0d1d0292e8e5f767a2b34c9b83310b1599ef4`.
Base branch remains `agent/overseer/v1-rc-basic-chat`; no rebase or merge.

## Reproduced and repaired

An older queued task in persisted state was selected by a new local wake. Its
worker result could be evaluated against the new wake's mission and budget,
yielding COMPLETED with mixed identities. The new regression failed before the
fix. Selection now supplies only the wake's task to the canonical runner and
checks task/mission/wake identity before execution and finalization. The older
task remains queued for explicit recovery.

Remote claim publication now flushes a temporary record before exclusive hard-link
publication. Duplicate callers cannot read a partially written new claim.
Conflicting request/host identities are blocked rather than reported as ordinary
duplicates. Corrupt claims remain untouched and fail closed. Unsupported hard-link
filesystems fail closed; Windows filesystem and power-loss acceptance remain open.
The parent directory is not fsynced; this is not a power-loss durability guarantee.

Invalid admission/pickup clocks or non-finite expiry windows cannot bypass freshness.
Whitespace-only completion evidence is rejected. Future provider-health observations
are rejected rather than classified fresh.

## Validation

- Focused bridge/local-wake/health tests: 66 passed before the package command addition.
- Full suite: `node --test tests/*.test.mjs tests/**/*.test.mjs` — 334 passed.
- `npm run test:integrations` is the repeatable offline contract gate, including
  mock authentication/permissions/plan/quota/degraded/failure cases, stale/future
  snapshots, recovery observations and existing routing tests.
- These are local Linux results, not live connector certification, independent
  approval, PRS production assurance or physical Windows remote acceptance.

## Gates still open

1. Persisted admitted-task pickup through existing scheduler/local wake. Do not feed
   raw remote JSON into a path that creates PRE_AUTHORIZED tasks.
2. Shared JSON-state concurrent writer protection. A delivery claim suppresses one
   delivery; it does not serialize different wakes. `local-persistence.mjs` loads
   an in-memory snapshot and replaces the complete state file on each write.
3. Result-write failure through the complete remote bridge. Runner-level coverage
   and an offline PRS missing-receipt fixture do not prove that end-to-end gate.
4. Host identity publication race and crashed claimant recovery. Never steal claims
   solely because they are stale; reconcile correlated durable outcomes first.
5. Green evidence currently checks asserted verification fields. It does not resolve
   all receipt evidence or enforce full bridge identity; PRS must not auto-certify it.
6. Authenticated transport, exact code identity, independent persisted evidence
   reconciliation and owner-mobile/Windows unattended DRY_RUN acceptance.

No new scheduler, queue or authority layer was created. No ready transition,
deployment, credential change, purchase or production autonomy was performed.

## Next cycle — existing scheduler fixture wiring

Remote baseline rechecked: `54db1e76f9d7a3c62ad26a137618ca28975f987d`, base
`90ebe42289990b3c6d054aac37b278eaf6554144`. CI #544 / run 34341864965 passed.
The only returned review was the earlier COMMENTED Amazon Q review; it does not
constitute independent review of this new slice.

The existing OS tick can now discover a locally persisted, already-authorised
`dispatch.task` when a fixture config explicitly sets `remoteBridge.enabled`.
This setting is absent by default. DRY_RUN and autonomy-disabled gates remain.
Only delivery identity crosses into wake; remote task/authority arguments cannot
replace persisted task content. Exact project, host, capabilities, issuer,
consent and admission are checked before the existing durable delivery claim.
The canonical registry and runner execute the same bounded deterministic worker.

The existing JSON store now serializes writers using a filesystem lock, reloads
state inside each mutation, supports revision-based compare-and-set, and publishes
result and receipt together in one atomic file replacement. Failed writes cannot
leak their in-memory changes into later writes. Abandoned locks require explicit
reconciliation; there is no expiry-based stealing. Host identity publication also
uses a complete-file exclusive link, avoiding first-start partial reads.

The mandatory mission ledger authorizes finalization; it does not claim completed
receipt publication. Failure after worker start charges the reserved unit. A failed
receipt leaves no completed response/receipt/event, retains the delivery claim and
records RECOVERY_REQUIRED. Blocked pickup is recorded on the existing task so a
subsequent tick can consider the next delivery without adding a blocker database.

Validation: `node --test tests/*.test.mjs tests/**/*.test.mjs`: 348 passed.
New focused cases: existing scheduler A vs unrelated B; eight actual Node scheduler
processes, one completion; atomic receipt-write failure with charged budget;
stale persisted crash-shaped claim never stolen; Green fail; capability mismatch;
superseded/stale/unadmitted task; blocked task does not starve next delivery;
12 independent persistence handles preserve writes and yield one CAS winner;
failed batch does not leak; abandoned writer lock is retained.

Remaining limitations:
- This starts with a trusted local admitted fixture. Authenticated inbound transport
  and a production admission writer are absent. No physical mobile/Windows proof.
- The worker performs the existing deterministic bounded action; this is not an
  arbitrary remote objective executor. Green's existing evidence assertions are
  not independent proof of arbitrary acceptance criteria.
- Receipt includes git HEAD and a dirty flag plus config hash. Dirty worktree
  fixtures are not exact-head production evidence; an installed non-git build needs
  an independently verified build identity before this path can operate there.
- Receipt evidence references and Green fields still need independent resolution
  for upstream reconciliation; PRS must not auto-certify this slice.
- Atomic rename is not a multi-file/power-loss transaction. Directory fsync,
  Windows filesystem behavior, hostile local writers, crash recovery authorization
  and remote transmission remain unproven. Lock recovery is deliberately manual.
- A crash after a durable completed receipt but before ancillary scheduler logging
  is ambiguous to the caller; reconciliation must read the receipt, never rerun.

REMOTE PHYSICAL EXECUTION = NOT PROVEN. No overall GREEN.

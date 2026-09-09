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

# Control Loop Mission Ledger

The three scheduled AgentOS control-loop stages (A/B/C) must leave durable evidence of what happened. Scheduler firing alone is never treated as completed work.

## Record contract

Each invocation creates one append-only NDJSON mission record containing:

- `mission_id` — unique invocation identity;
- `timestamps.utc` — exact UTC timestamp;
- `timestamps.brisbane` — Australia/Brisbane display timestamp;
- `stage` — `A`, `B`, or `C`;
- `schedule_id` and predecessor checkpoint;
- starting repository/control-plane head;
- intended next action and exact next checkpoint;
- actions actually performed;
- worker/task identity when delegated;
- touched files, commits, and PRs;
- tests/results and evidence references;
- safety decisions and blockers;
- controlled outcome (`no_op_recovery`, `blocked`, `executed_awaiting_green`, `green_verified`, `prs_verified`, `failed`).

The current-state index is derived from the append-only ledger and exposes the latest run, per-stage state, awaiting verification, blockers, and next action.

## Sequential correlation

A must consume the previous C checkpoint. B must consume A's checkpoint. C must consume B's checkpoint. A fresh stage may not invent unrelated work when its predecessor is missing, stale, invalid, or failed.

## Safety

The ledger records control-plane activity; it does not grant authority. Existing `DRY_RUN`, autonomy-disabled, no-credential, no-production-write, and approval boundaries remain in force.

Corrections must append a superseding record rather than silently rewriting history.

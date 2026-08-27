# CORE-003 / Dispatch Integration

## Canonical authority

`.agentos/state` is the canonical machine-readable current state. GitHub remains authoritative for repository lifecycle facts. The dispatch subsystem is operational state under `.agentos/dispatch` and must not become a second source of truth for system identity, mission identity, or accepted decisions.

## Control-plane flow

`agentos:overseer` (default system Overseer)
→ canonical state / mission context
→ dispatch task
→ authority gate
→ worker
→ verification
→ canonical state update
→ next decision / continuation

The canonical state already identifies `agentos:overseer` as the default operational control-plane target and records `.agentos/state` as the state authority. fileciteturn175file0L1-L6 fileciteturn174file0L1-L6

## Integration rules

1. Mission and decision identifiers must originate from canonical state.
2. Dispatch tasks may reference canonical mission/decision IDs but must not redefine them.
3. Dispatch authority can grant execution capabilities but cannot change system authority.
4. Completion evidence should be sufficient to update canonical state or support an Overseer decision.
5. Historical Markdown remains documentation/history rather than machine authority.
6. Repository lifecycle actions remain governed by GitHub state.

## Next implementation target

Add explicit `mission_id` and optional `decision_id` references to the dispatch envelope, validate those references against canonical state, and reject orphaned or conflicting dispatch tasks. This creates a single chain of authority from Overseer decision to execution.

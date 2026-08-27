# AgentOS Canonical State

This directory is the machine-readable authority for **current AgentOS state**.

## Authority rules

1. `.agentos/state/` is authoritative for current machine state.
2. `.agentos/dispatch/` is authoritative for active task dispatch records.
3. GitHub is authoritative for repository lifecycle facts (commits, branches, PR state, checks).
4. Root Markdown coordination documents are human-readable history/specification and must not silently override canonical state.
5. When sources disagree, Overseer records a reconciliation; history is preserved.

## Required state files

- `current.json` — current system snapshot and schema version.
- `agents.json` — registered agents and capability/eligibility state.
- `missions.json` — mission lifecycle state.
- `decisions.json` — durable architectural and governance decisions.

State changes should be atomic, validated, and attributable to an agent/run where possible.

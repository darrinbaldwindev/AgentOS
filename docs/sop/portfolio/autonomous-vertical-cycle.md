# SOP-PORT-003 — Autonomous Vertical Execution Cycle

**Status:** DRAFT / INTERNAL  
**Last verified:** 2026-09-15

## Purpose
Define safe autonomous continuation for an Overseer without turning autonomy into unlimited authority.

## Cycle
`fresh scan -> reconcile -> prioritise -> execute bounded work -> verify -> post-scan -> replenish -> durable checkpoint -> continue or stop`

### Fresh scan
Refresh canonical repo/head, active PRs/issues, coordination source, CI/tests, assurance, blockers and material external evidence.

### Reconcile
Compare current evidence against prior checkpoints, product direction and dependent work. Surface stale or contradictory evidence.

### Prioritise
P0 safety/authority/material false claims and blockers; P1 core product/user delivery; P2 completeness/usability/research.

### Execute
Work vertically through a meaningful dependency chain rather than producing shallow updates across many lanes. Search before creating new systems/artifacts.

### Verify/post-scan
Re-read changed state and exact heads. Distinguish produced output from accepted/verified outcome.

### Replenish/checkpoint
Queue the next highest-value unblocked actions and write a durable checkpoint containing evidence, changes, blockers, protected actions and next gate.

## Stop conditions
Stop or block when evidence is unavailable, owner/legal approval is required, a protected action boundary is reached, authority is uncertain, a material contradiction cannot be reconciled safely, or further work would create duplicate control-plane architecture.

## Autonomy invariant
Autonomy determines how independently work is progressed inside an already authorised envelope. It does not grant new capabilities, credentials, spending authority, production authority, legal authority or assurance authority.
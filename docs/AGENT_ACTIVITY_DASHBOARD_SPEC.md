# Agent Activity Dashboard Specification

Status: DESIGN / OBSERVABILITY REQUIREMENT

## Purpose
Provide a single durable, human-readable view showing who is doing what, what has been done, and what evidence exists.

## Required table

| Agent/Role | Project | Current Task | State | Started | Last Heartbeat | Last Completed | Evidence | Verifier | Next Task |
|---|---|---|---|---|---|---|---|---|---|

## States

READY, ASSIGNED, EXECUTING, CHECKPOINTED, VERIFYING, VERIFIED, BLOCKED, FAILED, STALE, OFFLINE.

## Evidence rules

- EXECUTING requires a task claim and timestamp.
- CHECKPOINTED requires persisted checkpoint evidence.
- VERIFIED requires an independent verifier result.
- STALE is derived from heartbeat/lease expiry, not inferred from silence alone.
- Never display a worker as active solely because a task was assigned.

## History

The dashboard must show both current state and recent completed work. Each completed item should link to its task ID, evidence/checkpoint, verifier result and resulting state transition.

## Sources of truth

Current state: canonical AgentOS state/leases.
Task: durable dispatch queue.
Evidence: task evidence/checkpoints.
History: append-only progress/log records.

The dashboard is a projection of these sources, not a second authority.

## Runtime requirement

A controller should regenerate/update this projection after every meaningful state transition and on heartbeat reconciliation. If the controller is unavailable, the dashboard must identify the data as stale and show its last update time.

## Owner view

The owner should be able to answer immediately:
1. Who is working right now?
2. What are they doing?
3. How long have they been doing it?
4. What have they completed recently?
5. What evidence proves completion?
6. What is blocked?
7. What happens next?

## Initial implementation

Start as a generated Markdown/JSON projection committed to the AgentOS control plane. Later expose the same projection through a web UI/API without changing the underlying task/state semantics.

# Local Control Model Architecture

Status: DESIGN BASELINE
Purpose: Provide a durable local control layer for timing, queue orchestration and worker dispatch without making an LLM responsible for deterministic timing.

## Roles

GPTChat Overseer = strategic supervisor and escalation authority.
Local Scheduler/Controller = deterministic timing, queue polling, locks, stale-task detection, state persistence and dispatch coordination.
Local Control Model = optional reasoning layer for prioritisation/routing when deterministic rules are insufficient.
Workers/providers = execution layer (Repo/Code, QA/Test, Research, Architecture, Skills, Security/Health; Gemini, Manus, Amazon Q or other providers where connected and authorised).

## Principle

Code controls time and state. Models advise on decisions. No model may silently grant authority.

## Runtime loop

1. Scheduler wakes on supported runtime trigger.
2. Read canonical state and dispatch queue.
3. Recover stale claims where policy permits.
4. Select eligible work deterministically.
5. Ask local control model for routing/prioritisation only when needed.
6. Validate authority, dependencies and provider capability.
7. Dispatch worker.
8. Persist claim/execution/checkpoint/evidence.
9. Verify result.
10. Queue the next eligible task or escalate.

## Timing target

5-minute cascade is the target runtime cadence. ChatGPT automation is not used as the high-frequency scheduler.

Recommended phases:
- :00 strategic/controller reconciliation
- :05 Project Overseers
- :10 workers
- :15 verification/reconciliation
- repeat

Event-driven execution may occur earlier.

## Safety modes

DISABLED: no unattended dispatch.
DRY_RUN: simulate wake/selection/dispatch without external execution.
SUPERVISED: dispatch only within explicit approved scope.
AUTONOMOUS: enabled only after acceptance tests pass and owner-controlled activation is present.

## Acceptance tests

- Wake at target cadence.
- Deterministic/idempotent task claim.
- Worker dispatch and response checkpoint.
- Evidence-gated verification.
- Duplicate wake does not duplicate work.
- Stale-task recovery.
- Restart recovery.
- Provider unavailable/degraded path.
- Complete log/state reconciliation.

## Current limitation

This document defines the architecture; it does not claim that a local runtime or model is installed, running, or connected. Implementation and runtime tests must provide evidence before those states are reported.

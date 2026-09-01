# AgentOS Elastic Worker Pool

**Status:** Design/implementation contract — 2026-09-01

## Objective

Maximise useful parallel work per mission cycle without creating duplicate runtimes, routers, schedulers or assurance systems.

AgentOS should maintain a small canonical catalogue of worker roles and create as many bounded worker instances as the active mission graph safely justifies.

## Model

```text
                 OVERSEER
                    |
                 MISSION DAG
                    |
        +-----------+-----------+
        |           |           |
      WORKER      WORKER      WORKER
     INSTANCE    INSTANCE    INSTANCE
        |           |           |
        +-----------+-----------+
                    |
              RECONCILIATION
                    |
          VERIFICATION / PRS
```

A worker instance is an execution allocation, not a new authority. Worker roles remain capability descriptions and must not become competing Overseers.

## Canonical role catalogue

The initial roles are:

1. REPO-CODE — repository inspection, implementation and code review.
2. QA-TEST — test design, regression and evidence verification.
3. RESEARCH — research, evidence gathering and requirements analysis.
4. ARCHITECTURE — system design, interfaces and trade-offs.
5. SKILLS — reusable skill discovery, lifecycle and routing support.
6. SECURITY-HEALTH — security, dependency, recovery and control-plane health.

Additional specialist roles may be added only when repeated workload demonstrates a capability gap. Prefer capability tags over role proliferation.

## Elastic dispatch rules

For each mission:

1. Decompose the objective into independent or dependency-linked tasks.
2. Identify the minimum required capability set for every task.
3. Select eligible workers using the canonical registry/capability layer.
4. Run independent tasks in parallel where authority, workspace and resource limits permit.
5. Enforce per-task and mission budgets before execution.
6. Limit concurrency by available resources, provider limits, authority scope and verification capacity.
7. Correlate every worker result to mission, task and execution identifiers.
8. Reconcile conflicting results before accepting a shared conclusion.
9. Verify completed work independently where required.
10. Requeue failed or incomplete work only when idempotency and retry policy permit it.

## Scaling heuristic

Do not maximise the raw number of workers. Maximise **verified useful throughput**.

A candidate worker instance is justified when:

- its task can execute independently or has an available dependency;
- its required capability is available and healthy;
- its authority is bounded to the task;
- the expected value exceeds execution cost/risk;
- verification capacity exists;
- concurrency will not create duplicate or conflicting work.

A task should remain serial when parallel execution would increase contention, duplicate effort, authority exposure or reconciliation risk.

## Worker lifecycle

```text
eligible -> reserved -> claimed -> working -> verification -> completed
                                      |              |
                                      +-> blocked   +-> rejected
                                      |
                                      +-> recover/requeue
```

A worker must never self-expand its authority by creating additional task routers, schedulers, Overseers or assurance mechanisms.

## Provider neutrality

Provider/model identity is an execution attribute. The same role can be supplied by different eligible providers or local workers. Selection must be based on verified capability, health, authority, cost, latency and reliability rather than commercial affiliation.

## Safety and Green requirements

Elasticity must remain fail-closed:

- malformed or unauthorised tasks do not execute;
- duplicate task claims are rejected;
- stale work is recoverable without double execution;
- budget exhaustion stops further work;
- prohibited operations remain prohibited regardless of worker preference;
- provider safety/consent controls are never bypassed;
- Green Agent remains read/analyse/report/challenge;
- PRS remains independently assuring;
- a worker claim alone never creates GREEN status.

## Verification target

The implementation should eventually prove, with deterministic fixtures:

- one mission produces multiple independent eligible tasks;
- independent tasks execute concurrently or are demonstrably scheduled without unnecessary serialisation;
- each task has unique correlated execution evidence;
- a dependency task waits for its prerequisite;
- duplicate claims do not produce duplicate execution;
- budget/concurrency limits are enforced;
- conflicting worker results enter reconciliation rather than silently overwriting one another;
- failed work can recover from the last valid checkpoint;
- the final mission result is accepted only after required verification.

## Architecture constraint

Reuse the existing AgentOS mission, task, dispatch, worker registry, authority, checkpoint, evidence, Green Agent and PRS mechanisms. This document does not authorize a second runtime, scheduler, router, registry or assurance platform.

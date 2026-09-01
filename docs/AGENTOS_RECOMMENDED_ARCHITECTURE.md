# AgentOS Recommended Architecture

**Status:** Accepted architecture direction — 2026-09-01

## Purpose

This document incorporates the latest architectural recommendations without creating parallel runtimes, routers, schedulers, or assurance systems.

## Target architecture

```text
                         AGENTOS
                            |
                 +----------+----------+
                 |                     |
           CONTROL PLANE         EXECUTION PLANE
                 |                     |
             OVERSEER              WORKERS
                 |             +-------+-------+
          policy / gates       |       |       |
          evidence / state   Codex   Gemini   other
          agent registry
          mission control
                 |
                 +------------------+
                                    |
                         AUTOMATION / INTEGRATION
                                    |
                                   n8n
                                    |
                    GitHub / Shopify / WordPress / APIs

                         PRS ASSURANCE LAYER
                                    |
                    independent evidence / findings
```

## Boundaries

### AgentOS — control and execution authority

AgentOS remains the provider-neutral engine. It owns missions/tasks, dispatch, routing, permissions/authority, scheduling, worker execution, verification and canonical control-plane state.

### Overseer — control-plane intelligence

The Overseer plans, prioritises, delegates, reconciles projects, evaluates evidence and makes state recommendations. It cannot declare GREEN without satisfying the canonical evidence gates.

### Workers — execution

Workers execute bounded delegated work. Codex is the preferred engineering worker where repository execution is available. Gemini, Manus, local workers and other providers remain replaceable worker classes.

### Agent Registry — capability discovery

Add a provider-neutral registry describing agent identity, role, capabilities, workspace access, permissions, availability and trust level. The Overseer selects workers by capability and task requirements, not by hard-coded provider names.

### PRS — independent assurance

PRS remains the Project Reliability & Assurance layer. It consumes relevant AgentOS/project evidence, evaluates project health and requirements traceability, and publishes findings. PRS must not become a second runtime, scheduler, router or authority.

### n8n — external integration plane

n8n is an optional integration/automation layer for external services, webhooks, schedules and business workflows. It must not become the canonical AgentOS task authority or duplicate AgentOS dispatch.

### LangGraph — optional stateful execution component

LangGraph may be integrated where a durable state-machine/graph execution primitive materially reduces implementation complexity. It must sit underneath existing AgentOS contracts and must not replace the canonical AgentOS dispatcher, authority layer or state model without repository evidence and an explicit architectural decision.

## Governance flow

```text
MISSION
  -> PLAN
  -> CAPABILITY MATCH
  -> AUTHORITY / CONSENT GATE
  -> DISPATCH
  -> WORKER EXECUTION
  -> EVIDENCE
  -> INDEPENDENT VERIFICATION
  -> OVERSEER REVIEW
  -> GREEN / RED / BLOCKED
```

A worker's self-reported completion is not sufficient evidence of GREEN.

## Budget governance

The commercial MVP direction is a governance layer around existing AgentOS primitives:

- hard mission/task budget caps;
- pre-flight allowance checks;
- execution circuit breakers;
- durable cost/usage evidence;
- policy-boundary escalation;
- verification/test gates;
- auditable mission history.

Do not add a second gateway or provider abstraction if existing AgentOS boundaries can support the capability.

## GitHub / CI-CD wedge

The first commercial-facing proving surface should remain lightweight:

1. CLI/governor around an AgentOS mission;
2. GitHub Action/PR gate;
3. hard budget circuit breaker;
4. deterministic tests/verification;
5. machine-readable evidence;
6. human approval only at defined policy boundaries.

Do not add billing or production provider activation merely from commercial hypotheses.

## Safety and consent

Every task must resolve to:

- `PRE_AUTHORIZED` — eligible within declared authority and capability;
- `CONFIRMATION_REQUIRED` — blocked until the required consent exists;
- `PROHIBITED` — hard blocked; human confirmation cannot override policy.

Provider safety/consent mechanisms remain authoritative. AgentOS must never bypass them.

## Green Agent

The Green Agent is a read/analyse/report/challenge role. It scans evidence, identifies improvement opportunities and can propose scoped work through AgentOS. It cannot directly mutate production state or change project status. A finding closes only after evidence-backed rescanning.

## Event-driven direction

The scheduler should become a trigger, not the execution authority:

```text
Scheduler -> scoped trigger -> authenticated dispatch -> durable queue
          -> Project Overseer/worker -> bounded execution -> evidence/verification
```

Events should carry correlation, project, mission, execution, budget and retry identifiers. Empty or unscoped triggers fail closed.

## Implementation priority

1. Reconcile existing AgentOS primitives before adding components.
2. Close scheduler/heartbeat safety and scoped dispatch boundaries.
3. Complete local worker execution evidence.
4. Add/standardise agent capability registry where missing.
5. Add budget ledger/circuit-breaker capability using existing mission/task state.
6. Prove GitHub PR/test governance with deterministic fixtures.
7. Integrate Green Agent and PRS through evidence contracts.
8. Add n8n integration adapters only where an external workflow requires them.
9. Evaluate LangGraph only against a concrete stateful workflow that benefits from it.
10. Keep advanced infrastructure (Temporal, heavy sandboxing, Kubernetes, custom LLM gateway) deferred until evidence justifies it.

## Existing backlog reconciliation

This direction intentionally builds on, rather than duplicates, existing work:

- Issue #20 — supervised scheduler adapter;
- Issue #35 — fail-closed Heartbeat/scoped dispatch rework;
- Issue #36 — local worker execution bridge;
- Issue #40 — Green Agent;
- Issue #41 — worker safety/consent and Human Intervention Registry;
- Issue #38 — PRS integration;
- Issue #17 — local + GitHub workspace providers;
- Issue #19 — Skill Agent/workforce architecture;
- Issue #10 — dual-Overseer operating loop.

## Non-goals

This recommendation does not authorize live provider credentials, production deployment, billing, external AI activation, uncontrolled portfolio scans, or replacing existing AgentOS architecture with third-party frameworks.

## Success condition

AgentOS should be able to select an appropriate worker by capability, execute a bounded mission, enforce authority and budget limits, capture evidence, independently verify the result, expose the state to Overseer/PRS/Green Agent, and integrate external workflows without creating competing sources of truth.

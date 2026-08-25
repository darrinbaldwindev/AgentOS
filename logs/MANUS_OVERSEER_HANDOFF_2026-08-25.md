# Manus Overseer Handoff — 2026-08-25

## Purpose
Bring the portfolio-level Manus Overseer up to date with the current canonical AgentOS Overseer position without changing Manus Overseer's secondary role.

## Canonical hierarchy

- **Darrin** remains final authority.
- **Manus Overseer** is the portfolio-level secondary Overseer responsible for oversight across projects.
- **AgentOS Overseer** is the primary AI/runtime intelligence inside the AgentOS project and is the successor to AgentOS Main, inheriting Main's legitimate continuity, knowledge and authority.
- Project coordination roles remain distinct from AgentOS Overseer and must not create a competing AgentOS identity.
- Specialist agents are workers under the AgentOS hierarchy.
- Models/providers are execution resources, not persistent AgentOS identities.

## Current AgentOS Overseer evolution

The project has moved from architecture into implementation and verification. Recent CORE-002 work has established and tested:

- first-class Overseer boot and persistent identity;
- single-chat/session continuity;
- user-task pipeline;
- provider-independent model registry and routing;
- provider-neutral execution boundary;
- canonical persistence bridge;
- AgentRuntime migration to canonical persistence;
- durable file persistence and restart tests;
- persistence-backed Overseer auditing and recommendation artifacts.

The latest work is still treated as **substantially implemented but not production-ready** until the complete Overseer execution path is verified end-to-end.

## Immediate gate

The next major technical proof is:

Overseer boot -> user task -> model routing -> AgentRuntime -> provider -> run/events/artifacts persisted -> persistence restart -> Overseer continuity restored.

After that, runtime-shell hardening, capability probes, recovery/safety and internal acceptance become the remaining gates for Major 1.

## Release/maturity model

### Major 1 — Internal Use / Dogfood
Acceptance criterion: Darrin can use AgentOS Overseer as the primary AgentOS working intelligence for real work with durable continuity, safe boundaries, recovery and auditability.

### Tier 1 — Personal AgentOS Overseer
Trusted personal operating intelligence with persistent missions, project awareness, bounded tools and basic delegation.

### Tier 2 — Supervised Autonomous Overseer
Extended autonomous operation, task decomposition, specialist delegation, queues, monitoring, recovery, scheduling and approval gates.

### Tier 3 — Multi-Agent AgentOS
Overseer coordinates multiple specialist agents with capability matching, lifecycle management, parallel work and verification.

### Tier 4 — Autonomous Project Operator
Overseer can take high-level project objectives through planning, allocation, execution, testing, documentation and release recommendation under human governance.

### Tier 5 — Governed Self-Evolving System
System identifies, proposes, tests and measures improvements to itself; self-modification remains governed and approval-controlled.

## Milestone discipline

Every capability should be tracked as Major -> Milestone -> Micro-milestone. Small objectively verifiable milestones are encouraged. Calendar dates should not replace capability gates.

## Manus Overseer action boundary

Manus Overseer should use this state for portfolio oversight, cross-project risk detection, conflict identification and reusable recommendations. It should not create a second AgentOS Overseer or override AgentOS Overseer's canonical runtime role.

## Current recommendation

Prioritise completion and verification of Major 1. Avoid speculative architecture that does not advance internal-use readiness.

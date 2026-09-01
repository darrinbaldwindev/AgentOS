# AgentOS Governance Layer

**Status:** Accepted architecture addition
**Date:** 2026-09-01

## Purpose

Extend AgentOS with six provider-neutral capabilities plus a constitutional governance layer, without creating competing runtime, router, scheduler, or assurance systems.

## Components

### 1. Policy Engine
A single machine-readable policy boundary governs capability, workspace, authority, spending, environment, tool/credential access, approvals, and escalation. Unknown scope fails closed. Provider safety controls remain authoritative.

### 2. Mission Ledger
Every mission/run records lifecycle, authority decisions, worker/provider, cost, retries, checkpoints, evidence, verification, interventions, and final disposition. Existing canonical AgentOS state remains authoritative; the ledger must not become a second source of truth.

### 3. Trust and Reputation
Maintain evidence-backed worker performance signals including capability fit, verification pass rate, reliability, failure history, cost efficiency, and trust level. Trust must never grant authority beyond policy.

### 4. Recovery / Resume
Failed or interrupted work resumes from the last fully verified checkpoint. Remaining work is represented as a bounded handoff and may be assigned to an eligible fallback worker. Corrupt or unverified checkpoints are rejected.

### 5. Event Bus
Formalise provider-neutral control-plane events such as TASK_CREATED, TASK_CLAIMED, TASK_STARTED, TASK_BLOCKED, TASK_FAILED, EVIDENCE_CREATED, VERIFICATION_PASSED, VERIFICATION_FAILED, TASK_COMPLETED, INTERVENTION_REQUIRED and HANDOFF_CREATED. Events coordinate consumers; canonical state remains authoritative.

### 6. Simulation / Sandbox
New capabilities and policies should support SIMULATE -> OBSERVE -> VERIFY -> AUTHORISE -> ACTIVATE. Simulation must expose proposed actions, permissions, cost, affected workspace, policy decisions and expected evidence without touching production state.

## Constitutional Governance

The following principles are architectural invariants:

1. No authority escalation by delegation.
2. No GREEN status without sufficient evidence.
3. Worker claims are not independent verification.
4. Provider safety and consent controls cannot be bypassed.
5. Production actions require explicit authority under applicable policy.
6. PRS is independent assurance and cannot execute project work.
7. Green Agent is read/analyse/report/challenge only and cannot remediate.
8. Scheduler/heartbeat is a trigger and cannot directly execute project work.
9. External integrations such as n8n cannot become canonical AgentOS task authority.
10. Unknown project scope, capability, authority, or policy state fails closed.
11. Human intervention requirements are durable, auditable, and never silently bypassed.
12. Existing canonical AgentOS dispatch, state, authority and verification primitives take precedence over proposed external frameworks.
13. New frameworks such as LangGraph may be integrated only where concrete evidence shows material value and no duplicate authority is created.
14. Historical evidence and audit records must not be overwritten to manufacture GREEN status.
15. Autonomous remediation is permitted only when explicitly authorised by policy and supported by sufficient verification evidence.

## Architecture Position

AgentOS remains the provider-neutral control and execution authority. Overseer remains the intelligence/control-plane supervisory role. PRS remains independent assurance. Green Agent remains an assurance/improvement scout. n8n is an external integration plane. GitHub Actions is a CI/CD enforcement surface. Codex, Gemini, Manus and other models/workers are replaceable worker implementations.

## Implementation Guardrail

This document is an architecture contract, not authorization to activate credentials, live providers, billing, production deployment, uncontrolled portfolio execution, or provider-specific bypasses. Implementation must reconcile against existing P0 work and avoid duplicate subsystems.

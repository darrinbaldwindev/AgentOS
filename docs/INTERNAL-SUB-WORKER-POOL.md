# AgentOS Internal Sub-Worker Pool

## Purpose

AgentOS uses a small provider-agnostic pool of ready-to-dispatch internal worker roles. These are workers, not Overseers, and do not require separate user-facing chat windows.

## Core roles

1. REPO-CODE — repository scans, implementation, GitHub work and code review.
2. QA-TEST — test design, execution where available, regression and evidence verification.
3. RESEARCH — research, evidence gathering, comparisons and requirements.
4. ARCHITECTURE — system design, integrations, interfaces and trade-offs.
5. SKILLS — reusable skill discovery, registry, routing, lifecycle and skill-memory integration.
6. SECURITY-HEALTH — security, dependency/risk review, health, recovery and control-plane consistency.

## Dispatch model

Overseer → worker role → task → execution → evidence → checkpoint → response → verification.

Provider/model choice is separate from worker capability. Manus, Amazon Q, Gemini, Ollama/TinyLlama and other providers may execute a role when their capabilities and permissions match.

## Rules

- Internal worker roles do not supersede Overseers.
- Do not create a parallel task router.
- Reuse the canonical AgentOS control-plane, task, logging, checkpoint and verification mechanisms.
- Never claim VERIFIED without evidence.
- Prefer existing AgentOS primitives over duplicate implementations.
- Roles are ready-to-dispatch definitions, not claims of six continuously running hidden model instances.
- A persistent runtime should only be introduced where an actual execution capability requires it.

## Initial rollout

Start with the six roles above. Validate dispatch and evidence flow before adding more roles. Keep the pool small and expand only when workload demonstrates a need.

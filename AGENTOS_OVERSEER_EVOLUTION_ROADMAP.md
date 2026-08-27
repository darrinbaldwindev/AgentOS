# AgentOS Overseer — Evolution Roadmap

**Status:** Active roadmap
**Effective date:** 2026-08-27
**Primary owner:** Human owner
**Primary AI role:** AgentOS Overseer / GPTChat Overseer

## Mission
AgentOS Overseer operates, supervises, maintains and evolves AgentOS within owner-defined authority boundaries. Manus Overseer operates at portfolio breadth; AgentOS Overseer operates at AgentOS depth.

## Architecture principle
**AgentOS is the vendor-neutral control and operating layer for AI agents, not another single-purpose agent.** Separate:
1. **Control & Governance:** Overseer, policy, authority, risk, approvals, evidence, audit and self-governance.
2. **Mission & Coordination:** objectives, task graphs, decomposition, routing, delegation, reconciliation and scheduling.
3. **Runtime & Execution:** agent lifecycle, sessions, tools, sandboxing, resource limits, browser/computer use and provider adapters.
4. **State & Knowledge:** authoritative project state, continuity, mission state, semantic/observational memory, skills, provenance and transcripts.
5. **Integration:** GitHub, Shopify, web, desktop, APIs, MCP/ACP and future providers.

External workers such as Manus, Codex, Claude Code, OpenHands, Henry, Browser Use and local agents remain replaceable.

## Research incorporation
The 2026-08-27 capability review incorporated portable ideas from HeyHenry, Rivet agentOS, OpenAI Agents SDK, OpenHands, Devin, LangGraph, AutoGen, Mastra, Letta, Browser Use, Goose and current Agent Operating System research. These are reference inputs, not dependencies. Do not copy vendor-specific architecture blindly; extract portable primitives, define AgentOS-native interfaces, test them, and preserve provider independence.

## Capability expansion
AgentOS should progressively incorporate:
- mission/task graphs: sequential, parallel, conditional, loops and joins;
- specialist agent registry;
- routing based on capability, cost, reliability, latency, risk and permissions;
- durable resumable sessions and mission checkpoints;
- universal transcript/event schema with replay and audit;
- versioned reusable Skills with inputs, outputs, tools, permissions, tests, provenance, metrics and rollback;
- separation of authoritative project state from semantic, observational and personal agent memory;
- model/provider/agent portability via adapters and ACP/MCP-compatible interfaces;
- deny-by-default filesystem/network/process/environment permissions;
- sandboxing and resource budgets;
- browser and desktop/computer-use workers as optional capabilities;
- guardrails at input, output, tool and approval boundaries;
- risk-based human-in-the-loop approval gates;
- manager-style and agent-to-agent delegation;
- agent health, reliability, cost, token, latency and workload telemetry;
- automatic retry, recovery, provider handoff and reassignment;
- independent verification/evaluation agents and evidence-backed completion;
- schedules, webhooks and event-driven autonomous loops;
- distributed workers and multi-agent observation;
- visual/operator and voice interfaces as optional control surfaces;
- governed self-improvement with proposals, regression tests, evaluation and capability-promotion gates.

## Evolution stages
### Stage 0 — Definition and evidence baseline
Lock Overseer identity/authority, inventory specifications/prototypes/contracts, preserve evidence, and distinguish Specified, Prototyped, Verified, Implemented and Production-ready states.

### Stage 1 — Overseer foundation
Build durable Overseer configuration, startup/context loading, project-state reader, bounded planning, evidence/findings, recommendations, append-only audit, confidence/uncertainty handling and owner escalation.

### Stage 2 — Runtime vertical slice
Build Workspace → Agent → Run → Event → Artifact persistence, provider adapters, AgentRuntime, bounded tools, sandbox boundary, plan → execute → verify → finish lifecycle and run inspection.

### Stage 3 — Overseer controls runtime
Connect Overseer to active/historical runs. Add mission intake, specialist registration, capability discovery, bounded delegation, routing, verification, project health, recommendations and evidence-backed completion.

### Stage 4 — Continuity and recovery
Build checkpoint/recovery, provider/model handoff, resumable missions, failure classification, retry/escalation, state integrity verification and recovery audit trails.

### Stage 5 — Multi-agent orchestration
Build task graphs, parallel workers, inter-agent contracts, result reconciliation, conflict handling, resource/budget controls, agent health monitoring and reusable Skill registry.

### Stage 6 — Controlled autonomy
Build authorised schedules/events, autonomous maintenance loops, safe diagnostics, recommendation-to-action pipelines, reversible changes, approval gates, auditability and kill/pause semantics.

### Stage 7 — Governed self-improvement
Build evidence-driven capability-gap detection, controlled tool/agent/Skill creation proposals, evaluation harness, regression detection, learning/change history, capability promotion gates and Overseer self-audit.

## GPTChat Overseer delegation mandate
GPTChat Overseer may continue AgentOS work autonomously within the configured authority boundary. It must not merely select the best agent; it should **decompose missions, delegate bounded work, monitor workers, verify results, recover from failures, reconcile conflicting outputs and update durable continuity state**.

Preferred loop:
**Objective → decomposition → worker selection → permission grant → execution → observation → verification → reconciliation → state update → next decision.**

Use the best available worker for each task. Workers may include Henry, Manus, Codex, Claude Code, OpenHands, Browser Use, local agents or future compatible workers. Prefer delegation when a task can be safely parallelised or benefits from specialist capability.

## Priority rule
Do not expand broad architecture at the expense of the executable vertical slice. Map research-derived capabilities to implementation gaps and prioritise one coherent tested path over documentation-only expansion.

## Non-negotiable autonomy gates
Production autonomy requires least-privilege permissions, approval gates for high-impact actions, durable audit history, secrets isolation, bounded execution/sandboxing, cancellation/kill semantics, recovery testing, regression evaluation, independent verification for consequential completion claims, owner-defined privacy/deployment policy, and immutable authority boundaries that self-improvement cannot modify.

## Mature definition
A mature AgentOS Overseer can understand state, create missions, decompose work, select and delegate to agents, operate tools safely, observe execution, verify outcomes, reconcile conflicts, recover from failures, preserve continuity, learn operational reliability, detect regressions, propose improvements and execute only permitted changes — while remaining interruptible, auditable and subordinate to the owner.

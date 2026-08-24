# AgentOS Overseer — Evolution Roadmap

**Status:** Active roadmap
**Effective date:** 2026-08-24
**Primary owner:** Human owner
**Primary AI role:** AgentOS Overseer

## 1. Mission

AgentOS Overseer is the primary AI agent of the AgentOS project. Its job is to operate, supervise, maintain and evolve AgentOS within owner-defined authority boundaries.

It is not the Manus portfolio Overseer. Manus Overseer operates at portfolio breadth; AgentOS Overseer operates at AgentOS depth.

## 2. Current reality

As of 2026-08-24, AgentOS has a substantial specification/prototype/validation foundation but is not yet the product runtime. The critical gap is executable vertical integration: durable project state, durable agents/runs/events, bounded tools, a provider adapter, a safe execution boundary, recovery/provider handoff, and Overseer observation.

The current project status explicitly prioritizes this vertical slice over additional broad architecture work.

## 3. Evolution stages

### Stage 0 — Definition and evidence baseline
**State:** COMPLETE / IN PROGRESS

Objectives:
- lock AgentOS Overseer identity and authority;
- establish the distinction from Manus Overseer;
- inventory existing specifications, prototypes, contracts and continuity records;
- identify the specification-to-runtime gap;
- preserve evidence and status terminology.

Exit criteria:
- role and authority are explicit;
- project baseline is documented;
- no production-readiness claim is made without runtime evidence.

### Stage 1 — AgentOS Overseer foundation
**Target:** first usable internal supervisory agent

Build:
- durable Overseer profile/configuration;
- startup/context loading;
- AgentOS project state reader;
- task intake and bounded planning;
- evidence/finding model;
- recommendation model;
- append-only Overseer activity/audit log;
- explicit confidence and uncertainty handling;
- owner escalation boundary.

Usable when:
- Overseer can start, understand current AgentOS state, inspect a bounded area, produce evidence-backed findings, preserve its continuity, and stop safely when authority is insufficient.

### Stage 2 — AgentOS runtime vertical slice
**Target:** first real AgentOS operation

Build:
- Workspace → Agent → Run → Event → Artifact persistence;
- deterministic provider adapter;
- AgentRuntime loop;
- bounded tool registry;
- execution/sandbox boundary;
- plan → execute → verify → finish lifecycle;
- run inspection.

Usable when:
- a user can create/select a workspace, assign one bounded task, observe the run and inspect its history without relying on a production model or unrestricted host access.

### Stage 3 — Overseer controls the runtime
**Target:** primary AgentOS operating intelligence

Connect AgentOS Overseer to the real runtime so it can:
- inspect active and historical runs;
- detect failures and incomplete work;
- diagnose bounded problems;
- assign/recommend work to specialist agents;
- verify outcomes;
- maintain project health state;
- create recommendations/change-log entries;
- request owner approval for consequential actions.

Usable when:
- AgentOS Overseer can supervise a real end-to-end AgentOS task and explain what happened with evidence.

### Stage 4 — Continuity and recovery
**Target:** resilient long-running AgentOS

Build:
- checkpoint/recovery;
- provider/model handoff;
- resumable mission state;
- failure classification;
- retry and escalation policy;
- state integrity verification;
- recovery audit trail.

Usable when:
- simulated provider/tool failure can occur and the system can recover or escalate without losing mission state or falsifying completion.

### Stage 5 — Multi-agent orchestration
**Target:** coordinated AgentOS workforce

Build:
- specialist registration;
- capability discovery;
- bounded task delegation;
- inter-agent contracts;
- result reconciliation;
- conflict handling;
- resource/budget controls;
- agent health monitoring.

Usable when:
- Overseer can delegate a bounded multi-agent task, observe each agent, reconcile outputs and produce a verified result.

### Stage 6 — Controlled autonomy
**Target:** autonomous AgentOS operation

Build:
- scheduled/event-driven supervision where explicitly authorized;
- autonomous maintenance loops;
- safe self-diagnostics;
- recommendation-to-action pipeline;
- reversible changes;
- approval gates for high-impact actions;
- comprehensive auditability;
- kill switch / pause semantics.

Usable when:
- Overseer can run recurring operational loops without continuous human prompting while remaining bounded, observable, interruptible and recoverable.

### Stage 7 — Self-improvement with governance
**Target:** mature AgentOS Overseer

Build:
- evidence-driven capability-gap detection;
- controlled tool/agent creation proposals;
- evaluation harness;
- regression detection;
- learning/change history;
- capability promotion gates;
- self-audit against its own charter.

Usable when:
- Overseer can propose improvements, evaluate them against explicit tests/criteria, and only promote changes through the configured authority boundary.

## 4. Significant milestones

| Milestone | Meaning | User value |
|---|---|---|
| M0 | Role locked | Clear AgentOS Overseer identity and authority |
| M1 | First supervised inspection | Overseer can understand and report AgentOS state |
| M2 | First executable vertical slice | AgentOS performs one bounded real task |
| M3 | First Overseer-supervised run | Overseer becomes operational rather than documentary |
| M4 | First recovery/handoff | AgentOS survives provider/runtime failure |
| M5 | First coordinated multi-agent task | AgentOS becomes a real agent system |
| M6 | Safe autonomous loop | AgentOS can operate for extended periods with bounded autonomy |
| M7 | Governed self-improvement | AgentOS can improve itself without becoming its own unchecked authority |

## 5. When it can be used

### Now
Use as a design/inspection/continuity system. Do not describe it as a production autonomous runtime.

### After M1
Useful as an internal AgentOS engineering Overseer for repository inspection, project-state analysis, recommendations and continuity.

### After M2
Useful for controlled real tasks using deterministic/local adapters and bounded tools.

### After M3
Useful as the primary operating agent for AgentOS development and supervised execution.

### After M4
Suitable for longer-running tasks where provider/runtime failures must be expected and recovered from.

### After M5
Suitable for meaningful multi-agent workflows.

### After M6
Candidate for ongoing autonomous operation, subject to explicit security, privacy, deployment and owner-approval gates.

### After M7
Candidate for mature self-evolving AgentOS operation, still constrained by immutable authority boundaries and evaluation gates.

## 6. Non-negotiable gates

No stage may claim completion merely because documentation exists. Evidence must be classified as Specified, Prototyped, Verified, Implemented, or Production-ready.

Production autonomy requires, at minimum:
- least-privilege tool permissions;
- explicit approval gates for high-impact actions;
- durable audit history;
- secrets isolation;
- bounded execution/sandboxing;
- cancellation/kill semantics;
- recovery testing;
- regression evaluation;
- owner-defined privacy and deployment policy.

## 7. Priority rule

Do not expand broad AgentOS architecture while the core vertical slice remains unimplemented. Prefer completing one coherent executable path over adding more specifications.

Manus Overseer should consume reusable evidence/state/governance capabilities where beneficial, but AgentOS Overseer remains the primary development target.

## 8. Definition of mature AgentOS Overseer

A mature AgentOS Overseer can understand AgentOS state, plan bounded work, coordinate agents, operate tools safely, observe execution, verify outcomes, recover from failures, preserve continuity, detect regressions, recommend improvements, and execute only those changes permitted by policy — while remaining interruptible, auditable and subordinate to the owner.

# AgentOS External Agent Systems Research — 2026-08-27

## Purpose

This document captures a research pass across modern desktop agents, agent runtimes, multi-agent frameworks, coding agents, browser agents, memory systems, orchestration frameworks, and emerging Agent Operating System research. The goal is not to copy vendors. The goal is to extract durable primitives and incorporate the strongest ideas into AgentOS while preserving vendor/model/runtime portability.

## Core conclusion

AgentOS should be treated as a vendor-neutral autonomous control plane plus runtime/coordination layer. It should be able to use external agents and runtimes as workers instead of competing with every specialist product.

Recommended conceptual split:

- Control & Governance Plane: intent, policy, authority, risk, approvals, confidence, audit, evidence, evaluation, self-improvement governance.
- Runtime & Coordination Plane: agent lifecycle, task graph execution, scheduling, routing, sessions, context, memory coordination, tool execution, recovery, resource control.
- Worker layer: Codex, Claude Code, OpenHands, Manus, Devin, Goose, Henry, Browser Use, custom agents, local models and future providers.
- State layer: authoritative project state, durable mission state, event log, artifacts, memory, skills and evaluation records.
- Interface layer: web UI, CLI, voice, chat, desktop operator and API.

## Systems reviewed

### 1. HeyHenry

Key ideas worth incorporating:
- desktop/computer-use operator;
- voice-first interface;
- persistent preferences/context;
- reusable Skills taught once and triggered repeatedly;
- specialised sub-agents running in parallel;
- isolated context per sub-agent;
- broad application integration;
- user-owned provider credentials.

AgentOS adaptation:
- define a Desktop/ComputerUse worker capability;
- make Skills first-class, versioned, testable and portable;
- allow Overseer to spawn isolated specialist workers;
- make voice/UI an interface, never the source of truth;
- keep provider credentials outside durable mission state.

Source: https://heyhenry.ai/products/henry-ai

### 2. Rivet agentOS

Key ideas:
- lightweight isolated execution;
- virtual filesystem/process/network model;
- deny-by-default permissions;
- resource limits;
- built-in agent integrations;
- ACP sessions;
- universal transcripts;
- persistence and replay;
- cron/webhooks;
- agent-to-agent delegation;
- durable workflows with retries, branching and resume;
- optional full sandboxes for heavy workloads.

AgentOS adaptation:
- preserve a runtime abstraction independent of one sandbox technology;
- require explicit filesystem/network/process/environment permissions;
- implement universal Run/Event/Transcript records;
- support ACP-compatible workers;
- implement durable task graphs;
- make heavy sandbox escalation possible rather than mandatory.

Source: https://github.com/rivet-dev/agentos

### 3. OpenAI Agents SDK

Key ideas:
- very small agent primitives;
- tools and handoffs;
- guardrails;
- sandbox agents;
- persistent sessions;
- human-in-the-loop;
- MCP tools;
- tracing;
- evaluation and replay-oriented observability.

AgentOS adaptation:
- standardise Agent, Tool, Handoff, Guardrail, Session and Trace concepts;
- put tool guardrails around every consequential operation;
- support manager-style orchestration as well as direct handoffs;
- persist traces as first-class evidence.

Source: https://openai.github.io/openai-agents-python/

### 4. OpenHands

Key ideas:
- provider/model agnostic coding agent;
- unified SDK;
- reasoning loop;
- state management;
- typed tools and observations;
- workspace abstraction;
- skills/condensers/MCP;
- Docker sandbox;
- remote execution;
- GitHub workflows.

AgentOS adaptation:
- keep coding-agent interfaces model agnostic;
- treat workspace as a portable capability;
- support context compression/condensing;
- expose GitHub workflow execution as a standard worker capability.

Source: https://docs.openhands.dev/sdk

### 5. Devin

Key ideas:
- coordinator role;
- child/managed agent sessions;
- parallel work packages;
- playbooks;
- session messaging;
- compute budgets;
- sleep/terminate controls;
- scheduled follow-ups;
- conflict-aware decomposition.

AgentOS adaptation:
- mission planner should split work into independent packages;
- every child run gets a budget, owner, objective and stop condition;
- support pause/resume/terminate;
- add playbooks as a specialisation of Skills;
- track resource consumption and effectiveness per agent.

Source: https://docs.devin.ai/work-with-devin/advanced-capabilities

### 6. LangGraph

Key ideas:
- low-level controllable agent runtime;
- graph-based orchestration;
- single, multi-agent and hierarchical architectures;
- human-in-loop;
- persistence/memory;
- explicit control over agency.

AgentOS adaptation:
- use a durable Mission Graph abstraction;
- support nodes, dependencies, conditions, loops, fan-out and joins;
- persist graph state independently of agent transcripts;
- allow human checkpoints inside graphs.

Source: https://www.langchain.com/langgraph

### 7. AutoGen

Key ideas:
- event-driven core;
- AgentChat;
- teams;
- selector-based routing;
- swarm/handoff patterns;
- Magentic-One style orchestration;
- memory protocol;
- state save/resume;
- distributed runtimes;
- Docker code execution;
- MCP extensions.

AgentOS adaptation:
- create Team/Workgroup abstractions;
- support centralized selector and decentralized handoff routing;
- make state serializable and portable;
- implement a pluggable memory protocol;
- support event-driven distributed workers.

Source: https://microsoft.github.io/autogen/

### 8. Mastra

Key ideas:
- typed agents;
- production workflows;
- retries/branches;
- Harness for multi-mode agents;
- shared state and storage;
- semantic recall;
- observational memory;
- server/deployment model;
- model routing.

AgentOS adaptation:
- create Agent Harness concept with modes such as plan/build/review/operate;
- support observational memory separately from authoritative state;
- implement typed workflow contracts;
- provide a unified server/control API.

Source: https://mastra.ai/

### 9. Letta

Key ideas:
- persistent agents;
- identity and long-lived state;
- continual learning;
- git-tracked memory/context;
- skills and tools;
- channels;
- proactive scheduled work.

AgentOS adaptation:
- make Agent Identity durable;
- track memory/skills as versioned state;
- support sleep-time maintenance and memory consolidation;
- permit proactive scheduled missions;
- keep organisational memory separate from raw conversational memory.

Source: https://www.letta.com/agent/

### 10. Browser Use

Key ideas:
- browser agent sessions;
- managed browsers;
- persistent profiles/workspaces;
- extraction/form filling/research/testing/monitoring;
- recurring schedules;
- large integration surface;
- browser as a general-purpose execution capability.

AgentOS adaptation:
- browser should be a standard worker capability;
- define BrowserSession, BrowserProfile and BrowserArtifact records;
- support website monitoring and scheduled browser missions;
- make browser permissions and domains explicit.

Source: https://docs.browser-use.com/

### 11. Goose

Key ideas:
- open-source general-purpose local agent;
- desktop, CLI and API;
- provider agnostic;
- many model providers;
- MCP extensions;
- ACP integration;
- install/execute/edit/test workflows.

AgentOS adaptation:
- ACP/MCP should be strategic interoperability layers;
- workers should be locally runnable where possible;
- provider abstraction should permit swapping models without changing mission logic.

Source: https://github.com/aaif-goose/goose

## Other important categories to keep watching

- Claude Code: subagents, Skills, hooks, MCP and coding workflows.
- Cline: interactive/autonomous coding plus MCP/browser capabilities.
- Replit Agent: high-level build-to-deploy agent workflows.
- Manus: general autonomous computer/web agent and large Skills ecosystem.
- OpenClaw: personal-agent and tool/skill ecosystem concepts.
- Stagehand/Browserbase: browser-control primitives and browser observability.
- Skyvern: browser automation with workflow/API orientation.
- Aider: repository mapping and focused coding-agent workflows.
- SWE-agent and related research agents: benchmark-driven coding loops.
- E2B/Daytona/Modal-style sandboxes: external heavy-execution substrate.
- MCP and ACP: interoperability protocols that should be treated as infrastructure, not vendor features.

## Emerging AOS research

Recent 2026 Agent Operating System research argues for a vendor-neutral architecture with two planes: Control & Governance and Runtime & Coordination. The proposal explicitly separates intent, policy, trust, authority, confidence, auditability and human oversight from lifecycle, workflow coordination, routing, memory coordination, scheduling and runtime assurance.

AgentOS should adopt this separation explicitly.

Source: https://arxiv.org/abs/2608.03214

A second 2026 paper argues that the agent ecosystem is still in an experimentation phase and needs stable abstractions analogous to POSIX/Kubernetes before agent applications become portable and composable.

Source: https://arxiv.org/abs/2607.25076

## Unified AgentOS capability model

### Agent

A durable worker identity with:
- capabilities;
- model/provider options;
- tools;
- skills;
- permissions;
- cost profile;
- reliability score;
- latency profile;
- health;
- current workload;
- provenance;
- allowed environments.

### Mission

A durable objective with:
- intent;
- success criteria;
- risk class;
- authority scope;
- budget;
- deadline;
- task graph;
- dependencies;
- required evidence;
- approval policy;
- recovery policy.

### Task

An executable unit with:
- objective;
- inputs;
- expected outputs;
- assigned worker;
- required capabilities;
- permission set;
- budget;
- timeout;
- retry policy;
- verification method;
- completion evidence.

### Run

A concrete execution instance with:
- immutable run ID;
- agent ID;
- mission/task IDs;
- workspace;
- provider/model;
- events;
- tool calls;
- costs;
- artifacts;
- checkpoints;
- approvals;
- outcome;
- verification evidence.

### Skill

A reusable capability package with:
- name/version;
- description;
- inputs/outputs;
- tools required;
- permissions required;
- model requirements;
- examples;
- tests/evaluations;
- provenance;
- success rate;
- rollback version;
- promotion status.

### Memory

Separate at least five classes:
1. authoritative project state;
2. mission/run state;
3. semantic knowledge;
4. episodic experience;
5. agent personal/context memory.

Memory retrieval must never silently override authoritative state.

### Evidence

Every consequential claim should be traceable to:
- tool output;
- file/artifact;
- test;
- external source;
- human approval;
- or an explicit model inference marked as uncertain.

### Verification

Completion requires an independent or structurally separate verification step for high-risk tasks. A model saying "done" is not completion evidence.

## Orchestration patterns AgentOS should support

1. Direct execution.
2. Manager → specialist handoff.
3. Manager → specialist-as-tool.
4. Parallel fan-out.
5. Fan-out → independent verification → join.
6. Sequential pipeline.
7. Conditional branch.
8. Retry loop.
9. Human approval checkpoint.
10. Competitive multi-agent solution search.
11. Debate/review pattern.
12. Hierarchical teams.
13. Event-driven reaction.
14. Scheduled mission.
15. Long-running resumable mission.
16. Provider fallback.
17. Agent replacement without mission-state loss.

## Safety and governance model

Every tool call should pass through policy evaluation appropriate to its risk class.

Risk classes:
- R0: read-only/low impact;
- R1: reversible local changes;
- R2: external communication or durable project changes;
- R3: financial, production, credential or security-sensitive action;
- R4: owner-defined critical action.

Default permissions should be least privilege. High-risk actions require explicit policy/approval. Every action must be cancellable where technically possible and auditable afterward.

Required controls:
- kill switch;
- mission pause;
- task cancellation;
- token/compute budget;
- time budget;
- network/domain allowlists;
- filesystem scopes;
- secret isolation;
- approval gates;
- immutable audit events;
- recovery tests;
- regression tests;
- evidence requirements.

## Observability model

AgentOS should expose a unified trace hierarchy:

Mission → Task → Run → Turn → Model call → Tool call → Artifact → Verification

Capture:
- latency;
- token usage;
- provider/model;
- cost;
- tool calls;
- handoffs;
- guardrail decisions;
- approvals;
- errors;
- retries;
- recovery;
- final evidence.

Traces must be replayable and exportable.

## Self-improvement model

AgentOS may improve itself only through a governed pipeline:

Observe gap → propose capability → implement candidate → run evaluation → compare regression suite → security review → human/policy gate → promote version → monitor → rollback if necessary.

No agent may grant itself new authority merely because a capability was successfully implemented.

## Strategic rule

Do not make AgentOS dependent on HeyHenry, Rivet, OpenAI, Anthropic, Microsoft, LangChain, Mastra, Letta, Manus, Devin or any other single vendor. Use them as worker/runtime/reference implementations behind stable AgentOS interfaces.

The strongest long-term differentiator is not having the most tools. It is having the best durable control plane: intent, delegation, authority, continuity, evidence, verification, recovery, governance and safe autonomy.

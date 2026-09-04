# AgentOS Current Checkpoint

**Mission:** Build AgentOS as a provider-independent autonomous agent operating environment.

**Phase:** CORE-001 runtime foundation / continuity and agent-connectivity hardening.

## Completed

- Core project/workspace/agent/run/event/artifact state primitives
- Provider-independent AgentRuntime
- Deterministic mock provider
- Tool registry and plan/execute loop
- Provider registry and recovery/handoff
- Mission lineage and handoff context
- Provider-neutral context snapshots
- Pause/resume lifecycle
- Default Overseer audit engine and recommendation/change-log artifacts
- Tool capability policy, secure executor and policy-event auditing
- Mission orchestration boundary
- Formal Continuity Protocol
- AgentOS agent capability eligibility contract
- Agent connectivity health report
- Deterministic assurance evidence gate closure work
- Explicit runtime acceptance gate and canonical local acceptance commands

## In progress

- Clean-machine supported-Windows runtime acceptance: Install → Doctor → Boot → Wake → Restart/Persistence
- Durable checkpoint/change-log integration
- Stronger end-to-end tests

## Next highest-priority action

Execute the documented runtime acceptance gate on a clean supported Windows environment against one exact AgentOS commit, capturing reproducible evidence for Install, Doctor, Boot, Wake, and Restart/Persistence.

## Agent eligibility rule

Required capabilities: `github.read`, `continuity.read`, and `handoff`. Local workspace read/write is preferred. Missing required capabilities means the agent is blocked from autonomous AgentOS project execution.

## Durable decisions

1. AgentOS owns mission continuity; AI providers are interchangeable workers.
2. Overseer is a default AgentOS supervisory agent.
3. Overseer audits and recommends; it does not silently change project intent.
4. Tool capabilities are deny-by-default and explicitly observable.
5. Provider handoff preserves mission/run lineage rather than creating a new mission.
6. Provider chat history is advisory; repository/runtime state is canonical.
7. Secrets and credentials do not belong in continuity snapshots or checkpoints.
8. If checkpoint and code/runtime state disagree, code/runtime state wins and the discrepancy is recorded.
9. An AI agent without reliable GitHub/continuity access is not eligible for autonomous AgentOS project work.
10. Local workspace access is preferred when available because it provides direct access to the active working tree.

## Blockers

- Clean supported-Windows runtime acceptance cannot be established by repository inspection alone.
- AgentOS PR #56 remains open/draft and unmerged; normal review/merge governance is still required.
- No production authority is granted by this checkpoint.

## Risks

- Runtime shell must preserve provider independence.
- Persistence semantics still need a real durable adapter.
- Security policy will need stronger isolation before powerful tools such as shell/deployment are enabled.
- Capability probes must be real integration checks; they must never be inferred from provider names.
- Runtime acceptance evidence must remain tied to the exact tested commit/build and environment.

## Governance / scheduler

- AgentOS scheduler remains paused unless separately authorized.
- This checkpoint does not authorize merging PRs, enabling schedules, activating providers, adding credentials, charging users, or deploying production artifacts.

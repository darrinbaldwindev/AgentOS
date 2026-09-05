# AgentOS Current Checkpoint

**Mission:** Build AgentOS as a provider-independent autonomous agent operating environment.

**Phase:** CORE-001 runtime foundation / continuity and agent-connectivity hardening.

**Current main:** `1db76577f9e7900b9c78fb6836bf52f42d809507` (verified 2026-09-05)

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
- Green Agent observation-only production boundary: assurance GREEN observations cannot authorize production promotion
- CI verification of the Green Agent promotion-boundary security changes
- Local wake default-root hardening, with focused tests and exact-head CI verification
- Real installed-Windows local wake invocation with autonomy disabled and dry-run semantics, independently reconciled in Mission 027

## In progress

- Clean-machine supported-Windows runtime acceptance: Install → Doctor → Boot → Wake → Restart/Persistence
- Durable checkpoint/change-log integration
- Stronger end-to-end tests
- PR #56 budget-reservation hardening requires rebase/revalidation before it can be considered merge-ready
- PR #55 elastic worker pool policy/fixture requires rebase/revalidation before its historical branch/CI state can be considered merge-ready

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
9. An AI agent without reliable GitHub/continuity access is not eligible for autonomous AgentOS project execution.
10. Local workspace access is preferred when available because it provides direct access to the active working tree.
11. Green Agent assurance output is observation-only; it cannot authorize production promotion.

## Blockers

- Clean supported-Windows runtime acceptance cannot be established by repository inspection alone.
- PR #56 remains open/draft/unmerged and is **diverged from current `main`**: the branch is 4 commits ahead and 179 commits behind current `main` (`1db76577f9e7900b9c78fb6836bf52f42d809507`). Merge base is `1c27ad2530cae4987ee2de6d731a7c6e1a12946f`. Its historical CI evidence must not be treated as current-main verification until the branch is rebased/revalidated.
- PR #55 remains open/draft/unmerged and is **diverged from current `main`**: the branch is 2 commits ahead and 175 commits behind current `main` (`1db76577f9e7900b9c78fb6836bf52f42d809507`). Merge base is `7351985aba1b0f4aedddbee272f81a3e21c330f3`. Its fixture has no fresh CI evidence in the accessible Actions state.
- No production authority is granted by this checkpoint.

## Evidence boundary

Mission 027 records fresh evidence for local wake default-root behavior: focused coverage passed, the full suite passed 257/257, diff-check passed, exact-head CI passed, and a real Windows invocation completed in DRY_RUN with autonomy disabled. This evidence is useful but does not substitute for the required clean-environment Install → Doctor → Boot → Wake → Restart/Persistence acceptance record.

## Risks

- Runtime shell must preserve provider independence.
- Persistence semantics still need a real durable adapter.
- Security policy will need stronger isolation before powerful tools such as shell/deployment are enabled.
- Capability probes must be real integration checks; they must never be inferred from provider names.
- Runtime acceptance evidence must remain tied to the exact tested commit/build and environment.
- A GREEN assurance observation must never be treated as a deployment or production authorization signal.
- Stale PR branches can make otherwise-valid CI evidence misleading; CI must be reconciled to the current merge base before merge/green decisions.

## Governance / scheduler

- AgentOS scheduler remains paused unless separately authorized.
- This checkpoint does not authorize merging PRs, enabling schedules, activating providers, adding credentials, charging users, or deploying production artifacts.

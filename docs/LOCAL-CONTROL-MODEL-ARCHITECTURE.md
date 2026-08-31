# Local Control Model Architecture

Status: DESIGN BASELINE
Purpose: Provide a durable local control layer for timing, queue orchestration and worker dispatch without making an LLM responsible for deterministic timing.

## Roles

GPTChat Overseer = strategic supervisor and escalation authority.
Local Scheduler/Controller = deterministic timing, queue polling, locks, stale-task detection, state persistence and dispatch coordination.
Local Control Model = optional reasoning layer for prioritisation/routing when deterministic rules are insufficient.
Workers/providers = execution layer (Repo/Code, QA/Test, Research, Architecture, Skills, Security/Health; Gemini, Manus, Amazon Q or other providers where connected and authorised).

## Local Installation Is a First-Class Capability

AgentOS is intended to be installed and operated on the owner's PC. The installed AgentOS runtime is therefore an execution environment, not merely a remote coordinator or cache of GitHub state.

The local installation may, subject to explicit owner-granted operating-system permissions and configured security policy:

- maintain local working copies of approved repositories;
- clone, fetch, checkout, compare, branch, test and inspect repositories locally;
- execute approved local build, test, lint, scan and development commands;
- synchronize local repositories against canonical GitHub state before task execution;
- maintain a durable local task/state database and execution queue;
- run the deterministic local scheduler/controller and recover after restart;
- manage worker processes and local sub-workers;
- provide approved workers with filesystem/repository context without repeatedly transferring repository contents through remote services;
- use locally installed development tools and runtimes where explicitly permitted;
- retain local execution evidence, logs and checkpoints according to policy;
- detect local repository divergence, dirty worktrees and stale task claims before dispatch;
- perform offline-capable work where the task and required dependencies permit it, while clearly recording unavailable network/provider operations.

Local access does **not** automatically grant unrestricted authority. AgentOS must maintain explicit capability and permission boundaries for filesystem paths, Git operations, shell/process execution, network access, credentials, provider accounts and destructive operations. The installation must expose only the minimum required capabilities to each worker.

## Canonical Repository / Local Workspace Model

GitHub remains the canonical source of truth for shared project code and repository state. The local installation is the controlled execution workspace.

Required synchronization lifecycle:

1. Resolve the approved repository from the canonical portfolio registry.
2. Fetch/refresh the repository metadata and current approved ref.
3. Establish the canonical base commit SHA.
4. Synchronize the local workspace to that approved state before substantive work.
5. Detect and handle unexpected local modifications according to policy; never silently overwrite owner work.
6. Execute the assigned task in the synchronized workspace.
7. Run required local tests/scans and capture evidence.
8. Commit/publish changes through the approved Git workflow where authorised.
9. Refresh GitHub state after execution.
10. Verify the result against the current repository state, not against the pre-task snapshot alone.

A stale local clone, stale scan, cached API response, old task context or previous conversation is insufficient to establish current repository state.

## Runtime loop

1. Scheduler wakes on supported runtime trigger.
2. Read canonical state and dispatch queue.
3. Recover stale claims where policy permits.
4. Refresh approved repository state before substantive work.
5. Synchronize the relevant local workspace and record the base SHA.
6. Select eligible work deterministically.
7. Ask local control model for routing/prioritisation only when needed.
8. Validate authority, dependencies and provider capability.
9. Dispatch worker with the synchronized local workspace/context.
10. Persist claim/execution/checkpoint/evidence.
11. Run required local tests/scans.
12. Refresh and verify against canonical GitHub state.
13. Queue the next eligible task or escalate.

## Local Worker Capability Model

Workers should declare the local capabilities they require, for example:

- repository read/write;
- Git read/write/branch/commit/push;
- filesystem read/write within approved roots;
- shell/process execution;
- test/build tool execution;
- network access;
- provider/API access;
- credential access through the approved local secret mechanism;
- browser/UI automation where explicitly enabled.

The worker registry and capability passport must distinguish **available locally**, **available remotely**, **unavailable**, and **requires owner approval**. A worker must not receive capabilities it did not request or that its policy does not permit.

## Local Installation Benefits To Exploit

AgentOS should actively use the advantages of being installed locally when they improve reliability, privacy, latency or execution capability:

- direct repository access rather than relying solely on remote file APIs;
- real local command/test execution;
- persistent workspaces across worker runs;
- faster incremental scans using Git history and filesystem state;
- local caching with explicit freshness/invalidity rules;
- local process supervision and restart recovery;
- local health checks for installed tools and worker providers;
- local provider connectors where available;
- secure local handling of credentials without putting secrets in repository logs;
- deterministic access to project-specific development environments.

These benefits must be implemented as explicit capabilities and tested; they must not be assumed merely because AgentOS is installed.

## Timing target

5-minute cascade is the target runtime cadence. ChatGPT automation is not used as the high-frequency scheduler.

Recommended phases:
- :00 strategic/controller reconciliation
- :05 Project Overseers
- :10 workers
- :15 verification/reconciliation
- repeat

Event-driven execution may occur earlier.

## Safety modes

DISABLED: no unattended dispatch.
DRY_RUN: simulate wake/selection/dispatch without external execution.
SUPERVISED: dispatch only within explicit approved scope.
AUTONOMOUS: enabled only after acceptance tests pass and owner-controlled activation is present.

Local installation does not by itself enable AUTONOMOUS mode.

## Acceptance tests

- Wake at target cadence.
- Deterministic/idempotent task claim.
- Fresh canonical repository state established before every substantive task.
- Local workspace synchronization to recorded base SHA.
- Dirty-worktree detection and safe recovery.
- Worker dispatch and response checkpoint.
- Local command/test execution where capability is available.
- Evidence-gated verification.
- Duplicate wake does not duplicate work.
- Stale-task recovery.
- Restart recovery with local state persistence.
- Provider unavailable/degraded path.
- Local capability/permission enforcement.
- Repository divergence detection.
- Complete log/state reconciliation.
- End-to-end local installation test on a supported PC environment.

## Current limitation

This document defines the architecture; it does not claim that a local runtime or model is installed, running, or connected. Implementation and runtime tests must provide evidence before those states are reported.

# Local Control Model Architecture

Status: DESIGN BASELINE
Purpose: Provide a durable local control layer for timing, queue orchestration and worker dispatch without making an LLM responsible for deterministic timing.

## Roles

GPTChat Overseer = strategic supervisor and escalation authority.
Local Scheduler/Controller = deterministic timing, queue polling, locks, stale-task detection, state persistence and dispatch coordination.
Local Control Model = optional reasoning layer for prioritisation/routing when deterministic rules are insufficient.
Workers/providers = execution layer (Repo/Code, QA/Test, Research, Architecture, Skills, Security/Health; Gemini, Manus, Amazon Q or other providers where connected and authorised).

## Local Installation Is a First-Class Capability

AgentOS is intended to be installable and operable on the owner's PC. The installed AgentOS runtime is therefore an execution environment, not merely a remote coordinator or cache of GitHub state.

**Local repository/workspace operation is the default AgentOS operating model.** AgentOS is expected to work on repositories available in its authorised local workspace without requiring GitHub. Internet connectivity and remote services are additional capabilities, not prerequisites for local operation.

Local filesystem and repository authority remains bounded by AgentOS policy. AgentOS must never treat the entire computer as an unrestricted workspace. Only approved repository/workspace roots and explicitly authorised operations are available.

The local installation may, subject to the owner's configured security policy and operating-system permissions:

- maintain local working copies of approved repositories;
- clone, fetch, checkout, compare, branch, test and inspect repositories locally;
- execute approved local build, test, lint, scan and development commands;
- synchronize local repositories against canonical GitHub state when Internet access is available and GitHub is configured;
- maintain a durable local task/state database and execution queue;
- run the deterministic local scheduler/controller and recover after restart;
- manage worker processes and local sub-workers;
- provide approved workers with filesystem/repository context without repeatedly transferring repository contents through remote services;
- use locally installed development tools and runtimes where permitted;
- retain local execution evidence, logs and checkpoints according to policy;
- detect local repository divergence, dirty worktrees and stale task claims before dispatch;
- perform offline-capable work when the task and dependencies permit it, while clearly recording unavailable network/provider operations.

## Repository and Network Access Modes

AgentOS must distinguish repository location from network availability. **Local is always the primary workspace. GitHub becomes the recommended/default remote source of truth when Internet connectivity is available.**

### Local Workspace mode — default

The installed AgentOS runtime operates against authorised local repositories/workspaces by default. Local work can continue without Internet when the task and dependencies permit it.

Local access does not mean unrestricted computer access. Filesystem paths, Git operations, process execution, credentials and destructive actions remain separately governed by capability and policy.

### GitHub/Remote synchronization — recommended when Internet is available

When Internet connectivity is available and a repository has an authorised GitHub remote, AgentOS should prefer GitHub as the canonical shared repository reference for synchronization, freshness checks, publishing and verification.

GitHub availability must never be treated as permission to access unrelated local files. A GitHub repository may be used only when its remote access is authorised/configured.

If Internet or GitHub is unavailable, AgentOS can continue using the authorised local workspace for offline-capable work and must record the unavailable remote operation rather than falsely claiming synchronization.

### Hybrid mode — normal connected experience

The normal connected experience is **Local + Internet + GitHub**:

1. AgentOS works in the authorised local workspace.
2. If Internet is available, AgentOS checks the authorised GitHub remote for current canonical state.
3. AgentOS establishes and records the base commit SHA.
4. AgentOS performs the work locally and runs local tests/tools.
5. AgentOS records evidence locally.
6. When publishing is authorised, AgentOS commits/pushes through the approved Git workflow.
7. AgentOS refreshes GitHub and verifies the resulting state.

This gives AgentOS the benefits of local execution while retaining GitHub as the preferred shared source of truth whenever connectivity permits.

### Network access — separately governed

Internet/network access is an independent capability. Local operation must not require Internet access, and enabling local repository access must not automatically grant unrestricted network access.

When Network access is authorised and available, AgentOS may perform approved operations such as GitHub synchronization, package/dependency retrieval, documentation/research and provider/API calls. Network policy must restrict destinations, credentials and sensitive operations where configured.

Useful configurations include:

- local repository only, offline;
- local repository + Internet;
- local repository + authorised GitHub synchronization;
- local repository + Internet + GitHub + authorised providers.

The final configuration is the intended full connected local-development experience.

## Local Access Does Not Mean Unrestricted Computer Access

AgentOS must maintain explicit capability and permission boundaries for filesystem paths, Git operations, shell/process execution, network access, credentials, provider accounts and destructive operations. Workers receive only the minimum capabilities required for their assigned task.

At minimum, the capability model must distinguish:

- `LOCAL_REPO_READ`
- `LOCAL_REPO_WRITE`
- `LOCAL_GIT_READ`
- `LOCAL_GIT_COMMIT`
- `LOCAL_GIT_PUSH`
- `LOCAL_TEST_EXECUTION`
- `LOCAL_PROCESS_EXECUTION`
- `NETWORK_ACCESS`
- `PROVIDER_API_ACCESS`
- `CREDENTIAL_ACCESS`

Each capability requires policy authorisation appropriate to the selected operation. Disabling local repository access must revoke local filesystem/repository capabilities for subsequent work. Disabling Network access must prevent subsequent network operations while leaving authorised offline local work available.

## Canonical Repository / Local Workspace Model

GitHub remains the preferred canonical source of truth for shared project code and repository state when Internet connectivity and an authorised remote are available. The local installation is always the controlled execution workspace.

Required synchronization lifecycle when GitHub/network is available:

1. Resolve the approved repository from the canonical portfolio registry.
2. Fetch/refresh the authorised GitHub repository metadata and current approved ref.
3. Establish the canonical base commit SHA.
4. Synchronize the authorised local workspace to that approved state before substantive work where policy requires it.
5. Detect and handle unexpected local modifications according to policy; never silently overwrite owner work.
6. Execute the assigned task in the local workspace.
7. Run required local tests/scans and capture evidence.
8. Commit/publish changes through the approved Git workflow where authorised.
9. Refresh GitHub state after execution.
10. Verify the result against the current repository state, not against the pre-task snapshot alone.

When GitHub/network is unavailable, steps requiring remote state are skipped explicitly and the resulting offline status is recorded. A stale local clone, stale scan, cached API response, old task context or previous conversation is insufficient to establish current remote repository state.

## Runtime loop

1. Scheduler wakes on supported runtime trigger.
2. Read local canonical control state and dispatch queue.
3. Recover stale claims where policy permits.
4. If Internet/network is available and GitHub is authorised, refresh the approved remote repository state.
5. Synchronize the relevant local workspace when remote synchronization is required by policy.
6. Select eligible work deterministically.
7. Ask local control model for routing/prioritisation only when needed.
8. Validate authority, dependencies and provider capability.
9. Dispatch worker with the local workspace/context.
10. Persist claim/execution/checkpoint/evidence.
11. Run required local tests/scans.
12. If Internet/network is available and GitHub is authorised, refresh and verify against canonical GitHub state.
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
- deterministic access to project-specific development environments;
- Internet connectivity when explicitly enabled and required by the task.

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
- Local workspace is the default execution target.
- AgentOS can continue offline for offline-capable local tasks.
- Fresh canonical GitHub repository state is established before substantive connected tasks where remote synchronization is required.
- Local workspace synchronization to recorded base SHA when GitHub/network is available and policy requires it.
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
- End-to-end Local Workspace + Internet + authorised GitHub test.
- End-to-end offline Local Workspace test with no Internet.
- End-to-end denial test proving unrelated local filesystem paths remain inaccessible.
- End-to-end denial test proving disabled Network prevents network operations.

## Current limitation

This document defines the architecture and policy baseline; it does not claim that a local runtime or model is installed, running, or connected. Implementation and runtime tests must provide evidence before those states are reported.

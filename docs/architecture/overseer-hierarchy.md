# AgentOS Overseer Hierarchy

## Canonical ownership model

AgentOS is a project/platform within a larger portfolio of projects. It is not the portfolio-level Overseer.

### Portfolio level

**GPTChat Overseer** is the top-level Overseer for the owner's projects. It coordinates project-level Overseers, delegates work, reviews outcomes, and determines which project requires attention.

### Project level

Every project has its own **Project Overseer**. Project Overseers own their project's development workflow and can delegate to workers, Skill Agents, models, external agents, browser/app capabilities, local execution capabilities, and repository tooling as authorised.

### AgentOS product level

The AgentOS product contains its own **AgentOS Overseer**. This is the program's primary intelligence/orchestration layer for the end user. It handles the interaction from initial greeting through task understanding, planning, delegation, model/agent selection, verification, and response.

The AgentOS Overseer may select ChatGPT, Gemini, Claude, Manus, other providers, Skill Agents, deterministic tools, local workers, or combinations of them. AgentOS must remain provider/model agnostic.

## Installed-program execution boundary

AgentOS is intended to run as an installed program on the owner's PC. The installation is therefore an active execution environment with access to locally available repositories, files, development tools, processes, runtimes, network interfaces and configured providers, subject to explicit owner-granted permissions and least-privilege policy.

The installed runtime should exploit local capabilities when they improve execution, privacy, reliability or latency. In particular, it should be able to maintain persistent local workspaces, run repository tests/builds/scans locally, supervise worker processes, recover after restart, inspect installed toolchains, cache safely, and provide local repository context to workers without unnecessary remote transfer.

Local access is capability-based, not blanket authority. Filesystem paths, Git operations, shell/process execution, network access, credentials, browser/computer control and destructive actions require explicit policy grants. Workers receive only the capabilities required for their assigned task.

### Local workspace ownership

GitHub remains canonical for shared repository state. The installed AgentOS runtime owns the controlled local execution workspace. Before substantive work, AgentOS must refresh canonical repository state, establish a base commit, synchronize the local workspace, detect dirty/divergent state, and record the workspace identity/base SHA. After work, it must test locally where applicable, publish through the approved Git workflow when authorised, refresh canonical state, and independently verify the result.

A stale local clone or cached remote response is never sufficient evidence of current state.

## Runtime boundary

The AgentOS runtime is infrastructure underneath the AgentOS Overseer. It provides task state, permissions, scheduling, persistence, audit, health, recovery, concurrency protection, resource/cost controls, local workspace/process supervision, and capability enforcement. Runtime safety mechanisms must not be confused with the AgentOS Overseer or granted unrestricted strategic authority.

## Authority flow

```text
Human Owner
    |
    v
GPTChat Overseer
    |
    +--> Project Overseer: AgentOS
    |        |
    |        +--> AgentOS Overseer (inside the product)
    |        |       +--> models / external agents / Skill Agents / local workers / tools
    |        |       +--> AgentOS local runtime
    |        |
    |        +--> AgentOS repository
    |
    +--> Project Overseer: other approved projects
    +--> future approved projects discovered from canonical portfolio registry
```

## Continuous progression

An active project must always have a next useful action until its Definition of Done is satisfied. If the current worker lacks a required capability, the Project Overseer must identify the capability gap and seek an authorised worker/provider or escalate the capability-acquisition task rather than declaring the project idle.

## Design rule

**Overseers decide. Runtime enforces. Workers execute. Local AgentOS provides the controlled execution environment.**

The hierarchy is recursive by design, but authority remains scoped: GPTChat Overseer oversees the portfolio; each Project Overseer oversees its project; the AgentOS Overseer operates the AgentOS product for its user; the installed runtime provides deterministic local execution and enforcement.
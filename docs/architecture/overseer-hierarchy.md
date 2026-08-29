# AgentOS Overseer Hierarchy

## Canonical ownership model

AgentOS is a project/platform within a larger portfolio of projects. It is not the portfolio-level Overseer.

### Portfolio level

**GPTChat Overseer** is the top-level Overseer for the owner's projects. It coordinates project-level Overseers, delegates work, reviews outcomes, and determines which project requires attention.

### Project level

Every project has its own **Project Overseer**. Examples include the AgentOS Project Overseer, GlobalShopCo Project Overseer, GhostKitchen Project Overseer, GemVerse Project Overseer, MyPrimeDelivery Project Overseer, and PRS Project Overseer.

A Project Overseer owns the project's development workflow and can delegate to workers, Skill Agents, models, external agents, browser/app capabilities, and repository tooling as authorised.

### AgentOS product level

The AgentOS product contains its own **AgentOS Overseer**. This is the program's primary intelligence/orchestration layer for the end user. It handles the interaction from initial greeting through task understanding, planning, delegation, model/agent selection, verification, and response.

The AgentOS Overseer may select ChatGPT, Gemini, Claude, Manus, other providers, Skill Agents, deterministic tools, or combinations of them. AgentOS must remain provider/model agnostic.

## Runtime boundary

The AgentOS runtime is infrastructure underneath the AgentOS Overseer. It provides task state, permissions, scheduling, persistence, audit, health, recovery, concurrency protection, and resource/cost controls. Runtime safety mechanisms must not be confused with the AgentOS Overseer or granted unrestricted strategic authority.

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
    |        |       +--> models / external agents / Skill Agents / tools
    |        |       +--> AgentOS runtime
    |        |
    |        +--> AgentOS repository
    |
    +--> Project Overseer: GlobalShopCo
    +--> Project Overseer: GhostKitchen
    +--> Project Overseer: GemVerse
    +--> Project Overseer: MyPrimeDelivery
    +--> Project Overseer: PRS
    +--> other projects
```

## Design rule

**Overseers decide. Runtime enforces. Workers execute.**

The hierarchy is recursive by design, but authority remains scoped: GPTChat Overseer oversees projects; each Project Overseer oversees its project; the AgentOS Overseer operates the AgentOS product for its user.

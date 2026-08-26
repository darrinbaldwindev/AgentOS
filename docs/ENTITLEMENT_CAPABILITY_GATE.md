# AgentOS Entitlement & Capability Gate

**Status:** Architecture baseline
**Date:** 2026-08-27
**Primary authority:** AgentOS Overseer

## Purpose

Provide one policy boundary for deciding what a user/project can access and what AgentOS may do on its behalf. Tier logic must not be scattered through individual features.

## Core rule

**Entitlement determines access; capability determines what can be executed; Overseer determines the best eligible execution path where the user's tier permits intelligent orchestration.**

Commercial tier must never silently reduce model quality in order to force an upgrade. Higher tiers primarily unlock broader AI ecosystem access and more AgentOS capability.

## Capability domains

The gate should eventually cover at least:

- model access and model slots;
- external AI-agent access and agent slots;
- Overseer model/agent selection authority;
- Skill-Agent availability;
- Skill-Agent creation;
- Skill-Agent autonomous creation authority;
- multi-model orchestration;
- multi-agent orchestration;
- scheduling;
- autonomous execution limits;
- GitHub project/repository provisioning;
- integrations;
- memory/continuity capacity;
- monitoring and reporting;
- advanced governance;
- quotas and usage limits.

## Baseline tier policy

### Tier 1 — Free

- 3 models.
- 1 external AI agent.
- User selects the AI resource.
- Overseer does not select the best model/agent.
- No user-created Skill Agents.

### Tier 2.1

- 5 models.
- 2 external AI agents.
- 1 preconfigured Skill Agent.
- Overseer-assisted intelligent model/agent selection enabled.
- Core orchestration enabled.

### Tier 2.2

- Expanded model/agent access.
- 2 preconfigured Skill Agents.
- Broader orchestration and automation.

### Tier 2.3

- Further expanded model/agent access.
- 3 preconfigured Skill Agents.
- Advanced orchestration and coordination.

### Tier 3

- Full supported model ecosystem.
- Full supported external-agent ecosystem.
- Expanded Skill-Agent library.
- User-created Skill Agents.
- Advanced autonomous orchestration.

### Tier 4

- Full supported model ecosystem.
- Full supported external-agent ecosystem.
- Maximum Skill-Agent library and management.
- Advanced custom Skill Agents.
- Maximum autonomy, orchestration, governance and project-management capabilities.

## Decision flow

1. Identify authenticated user/project.
2. Resolve current entitlement.
3. Resolve requested capability.
4. Check capability policy and permissions.
5. Resolve eligible AI resources from the current registry.
6. If intelligent selection is not entitled, return user-choice options.
7. If intelligent selection is entitled, Overseer evaluates eligible resources and chooses/recommends the best path.
8. Enforce limits, permissions and safety policies.
9. Execute or refuse with a clear explanation.
10. Audit the decision where appropriate.

## Resource separation

The gate must distinguish:

- **Model:** GPT, Claude, Gemini, Grok, Mistral, etc.
- **External AI agent:** Manus, Perplexity, etc.
- **AgentOS Skill Agent:** internal reusable worker.

A user may have access to a model without granting AgentOS authority to autonomously invoke it. Resource access and orchestration authority are separate permissions.

## Cost and partner neutrality

The capability gate must not use affiliate commission, API referral revenue or partner ranking as a hidden capability-selection criterion. Selection should be based on task suitability, policy, availability, reliability, user settings and applicable cost/usage controls. Commercial attribution belongs in a separate revenue/partner subsystem.

## Future implementation

The entitlement gate should become a shared service/interface used by runtime, Overseer, model registry, external-agent registry, Skill-Agent framework, scheduling, integrations and project provisioning. Avoid embedding tier numbers directly into business logic where a capability identifier can be used instead.

Example capability identifiers:

- `model.select.user`
- `model.select.overseer`
- `agent.external.access`
- `skill_agent.preconfigured`
- `skill_agent.create`
- `skill_agent.autocreate`
- `orchestration.multi_model`
- `orchestration.multi_agent`
- `project.github_provision`
- `automation.schedule`
- `automation.autonomous`

This makes future tiers or enterprise entitlements possible without redesigning every feature.

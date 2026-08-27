# Overseer → Project Agent Dispatch

**Status:** Priority architecture milestone
**Date:** 2026-08-27
**Authority:** GPTChat Overseer
**Receiving specialist:** AgentOS Overseer Project

## Objective

Enable a degree of autonomous hierarchical delegation without requiring the human to relay every task manually.

GPTChat Overseer is the higher-level authority. AgentOS Overseer Project is the specialist responsible for evolving the AgentOS platform. AgentOS itself will ultimately implement the same pattern for projects and Skill Agents.

## Target loop

**GPTChat Overseer → shared task state → AgentOS Overseer Project → work → verification → progress/decision state → GPTChat Overseer → next task.**

The human remains the authority for decisions outside delegated scope.

## Minimum viable autonomy

The first implementation does not require a live agent-to-agent API. It can use a durable shared dispatch contract in the AgentOS repository.

### Dispatcher writes

The sending Overseer records a task containing:

- task ID;
- issuing authority;
- target agent/project;
- objective;
- priority;
- scope;
- constraints;
- acceptance criteria;
- dependencies;
- authority granted;
- created timestamp;
- status.

### Receiver behaviour

The receiving agent should:

1. discover pending tasks addressed to it;
2. validate authority and scope;
3. claim the task;
4. inspect current repository/project state;
5. execute the highest-value next work within scope;
6. test/verify changes;
7. update durable progress state;
8. mark the task completed, blocked, escalated or superseded;
9. record the next recommended action when useful.

## Status lifecycle

`queued → claimed → working → verification → completed`

Alternative terminal/exception states:

`blocked`, `escalated`, `cancelled`, `superseded`.

A task must not silently disappear.

## Autonomous continuation

After completing a delegated task, the receiver may continue with directly dependent work when:

- it remains inside the delegated objective;
- required authority is already granted;
- the work is reversible or low-risk;
- acceptance criteria remain applicable.

Otherwise it should report the dependency and await another dispatch/decision.

This is the first step toward the desired behaviour where an agent does not require repeated human prompts merely to continue an authorised objective.

## Escalation boundaries

The receiver must escalate when work requires:

- a change in fundamental project/business direction;
- ungranted permissions or secrets;
- material financial commitment;
- destructive/irreversible action outside delegated scope;
- publication or release requiring human approval;
- conflicting authority;
- insufficient information that cannot reasonably be resolved from project state.

## Shared-state contract

The initial implementation should use a repository-backed durable state rather than conversational memory. This permits different Overseer instances to communicate indirectly and gives the project a recoverable audit trail.

Recommended future structure:

```text
.agentos/
  dispatch/
    queue/
    active/
    completed/
    escalated/
  agents/
  projects/
  continuity/
```

The exact directory layout can evolve; the durable contract is more important than the path.

## Security and authority

A task is not authoritative merely because it exists. The receiver must validate the issuer, target, scope and granted capabilities. The Entitlement & Capability Gate remains the policy boundary for executable capabilities.

No agent should gain authority simply by writing a task requesting it.

## Evolution stages

### Stage 1 — Repository-backed dispatch

Agents communicate through durable task state and progress records. Human-triggered runs can consume the queue, establishing the protocol before true background execution exists.

### Stage 2 — Scheduled polling

An authorised runtime periodically checks for pending tasks and invokes the receiving agent.

### Stage 3 — Event-driven dispatch

Repository events/webhooks or an AgentOS control service trigger task processing with appropriate authentication.

### Stage 4 — Autonomous hierarchical operation

GPTChat Overseer can continuously delegate; project Overseers execute; Skill Agents are created/delegated where permitted; completion and escalation flow back through durable state.

## Success criterion

A user should eventually be able to establish an objective once, and the authorised Overseer hierarchy should continue progressing it without the user repeatedly saying “continue”, while preserving visibility, control and escalation boundaries.

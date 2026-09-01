# Project Overseer Wake / Response Protocol

**Status:** Accepted implementation contract — 2026-09-01

## Purpose

Provide a single durable protocol for waking a Project Overseer from a scoped ChatGPT Overseer mission, inspecting the target repository, executing only authorised work, producing evidence, and returning a durable response.

## Canonical flow

```text
CHATGPT OVERSEER
  -> incoming mission artifact
  -> Project repository wake trigger
  -> Project Overseer reads mission
  -> repository/state inspection
  -> authority + consent gate
  -> bounded delegation/execution
  -> verification
  -> response artifact
  -> CHATGPT OVERSEER reconciliation
```

## Mission artifact

Each project mission MUST contain:

- `mission_id`
- `issuer`
- `target_repository`
- `project_overseer`
- `objective`
- `scope`
- `priority`
- `created_at`
- `authority_class`
- `required_evidence`
- `status`

Canonical project paths:

- `.agentos/missions/incoming/<mission_id>.json`
- `.agentos/missions/active/<mission_id>.json`
- `.agentos/missions/completed/<mission_id>.json`
- `.agentos/missions/blocked/<mission_id>.json`
- `.agentos/reports/<mission_id>.json`

## Wake semantics

A repository wake trigger MUST be scoped to the target repository and mission. Empty, malformed, duplicated, unauthorised or stale missions fail closed.

The wake process MUST:

1. authenticate/validate the mission envelope;
2. inspect current repository state before acting;
3. reconcile existing work to avoid duplicate tasks;
4. evaluate authority/consent;
5. execute only bounded authorised work;
6. capture implementation evidence;
7. run deterministic verification where available;
8. write a durable response;
9. preserve blocked/escalated state when execution cannot safely continue.

A wake trigger alone does not grant execution authority.

## Response artifact

The Project Overseer response MUST contain:

- `mission_id`
- `status`
- `started_at`
- `completed_at`
- `repository_commit`
- `inspection_summary`
- `work_claimed`
- `work_implemented`
- `verification`
- `evidence`
- `blockers`
- `escalations`
- `next_action`

Claims MUST remain distinct from implementation and verification evidence.

## Green Agent / PRS

Green Agent may observe, analyse and challenge the mission lifecycle but cannot directly mutate production state or declare GREEN.

PRS independently evaluates relevant evidence. Project GREEN requires the canonical evidence gates; a Project Overseer self-report is insufficient.

## Provider neutrality

The wake protocol is provider-neutral. A Project Overseer may be ChatGPT, Gemini, Manus, Codex, a local worker or another authorised agent. Provider identity is metadata; capability and authority determine eligibility.

## Scheduler

The scheduler is a trigger only. It MUST NOT become a second task authority. The preferred path is:

`scheduled/event trigger -> scoped mission -> authenticated wake -> AgentOS dispatch -> evidence -> response`.

## Safety

Do not use this protocol to activate production credentials, bypass provider safety controls, alter protected scheduler state, or grant permissions implicitly. Such actions remain explicit policy/consent boundaries.

## Completion condition

The Project Overseer is operationally integrated only when a testable mission can be received, inspected, safely acted upon, verified, and durably reported back without relying on conversation history.

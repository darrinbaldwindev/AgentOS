# AgentOS — AI Coordination Charter

**Status:** active internal practice
**Project owner:** Human (User)
**Primary Coordinator:** architect-prime (this chat session)
**Canonical project record:** `agents/continuity_log/` (SESSION_XXX.md files + INDEX.md)
**Effective date:** 2026-08-20

## Purpose

This charter defines how the AgentOS project coordinates durable AI specialist roles while preserving a clear distinction between specialist observations and accepted project facts.

## Coordination scope

| In scope | Out of scope |
|---|---|
| Read-only audits, verification, documentation analysis, bounded research, architecture proposals, schema design, code scaffolding | Production changes, payment actions, destructive migrations, release publication, unattended orchestration, credential management, external service decisions |

## Roles and authority

| Role | Responsibilities | Authority limits |
|---|---|---|
| Project Owner (Human) | Strategic decisions, high-impact approvals, agent creation/recall, budget, monetization strategy | Sole authority for: architecture sign-off, stack changes, referral program terms, release decisions, data/privacy policy |
| Primary Coordinator (architect-prime) | Assigns bounded work, reviews evidence, updates canonical record, maintains continuity, evaluates handoffs | Cannot: make strategic decisions, approve monetization terms, commit to external integrations, alter canonical record without evidence review |
| Specialist Agent (e.g., affiliate-researcher-01) | Performs bounded domain work, reports direct observations and limitations, follows charter | Must not: self-schedule, broaden scope, delegate, make strategic/release/data-loss decisions, alter source/code/state, poll ledgers, assume shared paths |

## Record model

| Record | Purpose | Routine writer |
|---|---|---|
| Canonical project record (`agents/continuity_log/`) | Accepted facts, durable decisions, verified status, architecture specs | Primary Coordinator |
| Shared coordination ledger (`agents/COORDINATION_LEDGER.md`) | Bounded requests, statuses, results, dispositions | Primary Coordinator; specialists only as explicitly delegated via task brief |
| Specialist ledger (optional, `agents/charters/<ROLE>_LEDGER.md`) | One specialist's detailed append-only thread | Primary Coordinator and named specialist under task rules |

## Mandatory boundaries

1. Coordination records are append-only and do not replace the canonical project record.
2. A specialist task must name objective, inputs, permitted/prohibited actions, stop conditions, and required output.
3. Specialists do not poll ledgers, assume shared paths, self-schedule, delegate, or silently alter project authority.
4. A specialist result is not accepted until the Primary Coordinator reviews and records a disposition.
5. If a shared file or attachment is unavailable, return a structured `BLOCKED` report; do not infer a product failure solely from sandbox limitations.
6. All `<<<REPORT_BLOCK>>>` handoffs go through the Human (clipboard) — this is the verified channel.

## Current roles

| Specialist role | Charter reference | Current state | Last thread/reference |
|---|---|---|---|
| affiliate-researcher-01 | `agents/charters/AFFILIATE_RESEARCHER_CHARTER.md` | inactive | none |

## Adoption decision

> This charter authorizes only the internal coordination practice described above. It does not authorize a product UI, automatic scheduling, persistent orchestration, real-time messaging, external integrations, or changes to project persistence/release scope.
# AgentOS Autonomy Milestones

**Status:** Priority roadmap
**Date:** 2026-08-27

## Purpose

Make measurable autonomy a first-class AgentOS development objective. Autonomy should increase through real capability milestones, not vague claims.

## A0 — Manual specialist operation

AgentOS project agents can inspect shared state, execute authorised work and record progress when invoked by a human.

**Current:** achievable.

## A1 — Durable delegated tasks

GPTChat Overseer can place an authorised task in durable shared state; AgentOS Overseer Project can discover, claim, execute and report it.

**Target:** first autonomous delegation loop.

## A2 — Autonomous continuation

After completing a task, the receiving agent can identify and execute directly dependent work without another human prompt, within delegated authority.

**Target:** eliminate unnecessary “continue” prompts.

## A3 — Scheduled autonomous execution

A trusted runtime periodically checks the dispatch queue and starts authorised work.

**Target:** work can progress between user conversations.

## A4 — Event-driven execution

Repository/project events can trigger authorised dispatch and processing.

**Target:** responsive project operations.

## A5 — Overseer orchestration

Overseer can break objectives into tasks, assign work to project agents and Skill Agents, monitor progress and recover from routine failures.

## A6 — Intelligent AI-resource selection

Starting at Tier 2, Overseer can select the best eligible model/external agent for a task based on capability, context, availability, reliability, user settings and applicable cost policy.

Free remains user-directed.

## A7 — Skill-Agent intelligence

Overseer detects repeated workflows and recommends or creates Skill Agents according to tier and authority.

## A8 — Portfolio autonomy

Overseer can monitor multiple projects/repositories, detect stalled work, maintain continuity and coordinate project agents without requiring the human to manually relay every task.

## A9 — High-autonomy AgentOS

Tier 4 capabilities support advanced autonomous planning, multi-agent coordination, recovery, optimisation and governance, while escalating decisions requiring human authority.

## Human control principle

Greater autonomy never means unlimited authority. AgentOS must preserve explicit boundaries for permissions, spending, destructive actions, security-sensitive operations, commercial commitments and fundamental direction changes.

## Measurement

Each autonomy milestone should have observable acceptance tests. A milestone is not complete merely because documentation exists; the corresponding behaviour must be demonstrable in the runtime or integration environment.

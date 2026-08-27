# AgentOS Dispatch Queue

This directory is the initial durable handoff surface for authorised Overseer-to-agent delegation.

## Queue contract

A dispatch item should identify:

- `task_id`
- `issuer`
- `target`
- `objective`
- `priority`
- `scope`
- `constraints`
- `acceptance_criteria`
- `dependencies`
- `authority`
- `status`
- `created_at`

Recommended lifecycle:

`queued → claimed → working → verification → completed`

Exceptions:

`blocked | escalated | cancelled | superseded`

## First target

The initial receiving specialist is `AgentOS Overseer Project`.

This repository-backed queue is deliberately simple. It establishes the communication contract first. Scheduled/event-driven invocation can be added later without changing the task semantics.

## Rule

A queued task does not itself grant permissions. The receiver must validate issuer, scope and authority before execution.

# Dispatch Envelope v0.1

A dispatch item is a durable instruction, not an authority escalation mechanism.

## Required fields

- `task_id`: unique stable identifier.
- `issuer`: authorised agent/authority identifier.
- `target`: receiving agent identifier.
- `objective`: concise outcome to achieve.
- `priority`: `low | normal | high | critical`.
- `scope`: allowed work domains.
- `constraints`: mandatory restrictions.
- `acceptance_criteria`: observable completion conditions.
- `dependencies`: task IDs or external prerequisites.
- `authority`: explicitly granted capabilities and escalation requirements.
- `status`: lifecycle state.
- `created_at`: creation date/time.

## Lifecycle

`queued → claimed → working → verification → completed`

Exception states:

`blocked | escalated | cancelled | superseded`

## Claim rule

A task may transition from `queued` to `claimed` only once. A receiver must verify that `target` matches its identity and that requested work is within the authority supplied by the issuer and the applicable AgentOS capability policy.

## Completion rule

`completed` requires evidence sufficient to evaluate the acceptance criteria. A status update without evidence is not completion.

## Escalation rule

If required work exceeds delegated authority, the receiver must transition to `escalated` and record the missing authority/decision rather than silently proceeding.

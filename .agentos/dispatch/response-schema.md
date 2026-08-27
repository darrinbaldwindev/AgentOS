# Dispatch Response Contract v0.1

A response is the durable return message for a dispatched task.

## Required fields

- `task_id`: exact task identifier being answered.
- `responder`: receiving agent identifier.
- `status`: `working | verification | completed | blocked | escalated | cancelled | superseded`.
- `result`: concise outcome or current finding.
- `evidence`: observable evidence sufficient to evaluate acceptance criteria.
- `next_action`: `none | follow_up_task | escalation`.
- `created_at`: response date/time.

## Correlation rule

Every response must contain the exact `task_id` from the dispatch envelope. A response without a matching task ID is not actionable.

## Completion rule

`completed` is valid only when `evidence` demonstrates the dispatch acceptance criteria. A narrative-only acknowledgement is not completion.

## Authority rule

A responder may report recommendations but cannot grant itself authority. Work outside the delegated authority must be returned as `escalated`.

## Follow-up rule

A completed response may request a follow-up task. The follow-up must receive a new unique task ID and must pass the normal dispatch validation before execution.

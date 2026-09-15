# AgentOS Frontend Recovery Presentation Contract

Status: frontend presentation contract only. This document does not create recovery state, persistence, runtime control, authority, Green, PRS, or a new event stream.

## Purpose

Define how AgentOS should translate canonical recovery evidence into ordinary-user language once a trustworthy read path exists.

The frontend must project canonical facts. It must never infer recovery success from a retry button, a new worker response, a cleared error, or a later successful task.

## Current evidence boundary

Current main contains `events/recovery-event-schemas.ts`, a draft append-only local recovery/observability contract with privacy-safe operational metadata.

Relevant canonical event kinds include:

- `execution_started`
- `execution_completed`
- `model_switched`
- `fallback_selected`
- `provider_status_changed`
- `redirect_failed`
- `tool_failed`
- `recovery_action_recorded`

`execution_completed` can expose an outcome and `recoveryRequired`.

`recovery_action_recorded` can expose:

- the causal failure event;
- recovery action type;
- action status;
- whether state was persisted.

The event stream contract is immutable and append-only with strictly increasing sequence and causal references.

However, code search at this checkpoint did not establish that Basic Chat reads or persists this recovery event stream at runtime. Current usage found is schema/tests/fixtures. Therefore this contract must not be presented as implemented Basic Chat recovery UI.

## Required frontend states

### No recovery needed

Allowed only when canonical completion/runtime evidence says no recovery is required.

Preferred copy:

> No recovery action is required for this job.

Do not derive this from absence of an error banner.

### Recovery required

Evidence requirement:

- canonical execution/completion evidence explicitly indicates recovery is required; or
- a canonical failure event has a recovery action relationship requiring attention.

Preferred copy:

> Recovery is required before this job can continue safely.

Show the affected job/scope when canonical correlation exists.

### Recovery offered

Evidence requirement:

- `recovery_action_recorded.status = offered` or equivalent canonical evidence.

Preferred copy:

> AgentOS has a recovery option ready for review.

This is not approval and not execution.

### Waiting for confirmation

Evidence requirement:

- canonical action is `user_confirmation_required` or equivalent authority/attention evidence.

Preferred copy:

> Your confirmation is needed before recovery can continue.

Never synthesize an Allow/Confirm control without a canonical mutation endpoint.

### Recovery in progress

Evidence requirement:

- accepted recovery action plus canonical execution evidence that recovery work has actually started.

Preferred copy:

> Recovery is in progress.

Do not infer from a button click alone.

### Recovery action completed

Evidence requirement:

- canonical recovery action status is `completed`;
- correlation to the original failure is intact.

Preferred copy:

> The recovery action finished. AgentOS is checking whether the job is safe to continue.

Important: recovery action completed does **not** mean the original job is complete or verified.

### Recovered

Evidence requirement:

A stronger state than action completion. It requires canonical evidence that:

1. the original failure is correlated;
2. the recovery action completed;
3. required verification after recovery passed;
4. any required Green gate passed at the stated scope;
5. required PRS/Henry assurance remains separately represented and is not inherited.

Preferred copy:

> Recovered: the affected step was restored and the required completion check passed.

The scope must be visible. Do not use a generic green tick for broader safety.

### Recovery failed

Evidence requirement:

- canonical recovery action status `failed`, or equivalent runtime failure evidence.

Preferred copy:

> Recovery did not complete. This job still needs attention.

Preserve the original failure and the recovery failure in evidence history.

### Recovery declined

Evidence requirement:

- canonical recovery action status `declined`.

Preferred copy:

> Recovery was not approved. No recovery action was taken.

Do not imply that work was undone unless canonical rollback evidence exists.

### Unable to confirm recovery

Use whenever recovery evidence is missing, stale, contradictory, uncorrelated, or unreadable.

Preferred copy:

> AgentOS cannot confirm the recovery state for this job.

Fail closed. Do not convert uncertainty into `Recovered`.

## Historical evidence rule

Recovery must never erase the original failure.

A user-visible Evidence Timeline should preserve, in order where supported:

1. original execution/failure;
2. recovery requirement;
3. offered/selected recovery action;
4. approval/confirmation if applicable;
5. recovery execution;
6. recovery result;
7. post-recovery verification;
8. Green result;
9. Henry/PRS result when independently available;
10. final job disposition.

A later success must not rewrite a prior failure as if it never happened.

## Correlation rule

The frontend may connect recovery events only when canonical identifiers establish the relationship, such as correlation ID, causation ID, execution ID, project/thread identity, task/mission identity, or another documented canonical reference.

If correlation is missing or contradictory:

> Recovery evidence could not be matched to this job.

No inferred stitching.

## Privacy rule

Recovery UI must follow the canonical event contract's privacy boundary. Do not expose or persist through the recovery presentation layer:

- prompts;
- secrets/passwords/tokens/API keys;
- credential values;
- repository/file contents merely for observability;
- raw tool input/output;
- private artifact payloads;
- external URLs where canonical schema intentionally excludes them.

Technical mode may expose canonical identifiers and bounded diagnostics, not prohibited payloads.

## Green and Henry/PRS separation

Recovery state, Green completion check, and Henry/PRS independent assurance are separate channels.

Examples:

- `Recovery action completed` + `Completion check pending` + `Independent assurance not available` is valid.
- `Recovered` may require a scoped completion check according to the product contract, but must not imply Henry/PRS PASS.
- worker success or fallback success must never manufacture Green PASS or Henry PASS.

## Action vocabulary

Canonical `RecoveryActionKind` values can map to ordinary language approximately as follows once live evidence exists:

| Canonical action | User-facing concept |
|---|---|
| `retry_scheduled` | Retry planned |
| `fallback_offered` | Alternative available |
| `fallback_selected` | Alternative selected |
| `switch_model_offered` | Different model available |
| `connection_required` | Connection needed |
| `permission_guidance_shown` | Permission needs attention |
| `context_compaction_offered` | Reduce working context |
| `partial_output_preserved` | Partial result preserved |
| `user_confirmation_required` | Confirmation required |

These labels are presentation mappings only. They do not authorize any action.

## Minimum runtime read contract needed for Basic Chat

Before implementing a live Recovery panel, Basic Chat needs a canonical read-only adapter capable of returning at least:

- current job/task correlation;
- original failure event or failure reference;
- whether recovery is required;
- recovery action kind;
- recovery action status;
- timestamps/sequence;
- causal/correlation identifiers;
- whether state was persisted where relevant;
- post-recovery verification state;
- Green disposition at explicit scope where required;
- independent PRS/Henry state separately, if available.

The adapter must not create a second event store.

## Negative acceptance assertions

Frontend tests should fail if the UI:

- says `Recovered` merely because a retry was clicked;
- deletes/hides the original failure after later success;
- says `Recovery complete` when only `offered` or `accepted` is evidenced;
- implies rollback without rollback evidence;
- inherits Henry/PRS PASS from recovery or Green;
- stitches unrelated events without canonical correlation;
- exposes prohibited secret/content fields;
- treats absence of recovery evidence as proof that recovery is unnecessary.

## Current implementation status

CONTRACT READY / LIVE BASIC CHAT ADAPTER NOT YET EVIDENCED.

Next safe implementation step is to identify or add a read-only projection over existing canonical recovery events once runtime persistence/access is proven. Do not add frontend-owned recovery persistence.

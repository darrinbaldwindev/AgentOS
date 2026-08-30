# AgentOS Capability & Subscription Advisor

## Purpose

AgentOS may recommend temporary or ongoing external model/agent subscriptions when a project has a capability gap and the external service is materially better suited to the work.

The Advisor is a capability-planning and user-choice layer. It is not an affiliate-driven router.

## Decision order

1. Identify the project capability requirement.
2. Evaluate currently available workers/models/agents.
3. Determine whether a specialist provider materially improves the task.
4. Estimate the expected value and likely duration of the need.
5. If a short-lived need is sufficient, recommend a one-month subscription rather than assuming an ongoing subscription.
6. Present free, trial, paid and affiliate/referral options when legitimately available.
7. Wait for the user's choice/authorisation before activating or purchasing anything.
8. Prepare provider-specific work so the chosen service can be used efficiently immediately after activation.
9. Execute through the normal Overseer → router → worker lifecycle.
10. Track results and subscription utility.
11. Recommend downgrade/cancellation when the specialist capability is no longer justified.

## Commercial neutrality

Affiliate/referral revenue must never determine model, agent or subscription selection.

The selection chain is:

Capability requirement → suitable provider/worker → user choice → commercial option.

If an affiliate relationship exists, it may be surfaced only after suitability has been established and must be clearly disclosed where required.

## Work preparation

When a user chooses a temporary subscription, AgentOS should be able to prepare a bounded workload in advance, including:

- provider-appropriate task decomposition
- prompts/instructions
- required project context
- source/evidence requirements
- expected outputs
- acceptance criteria
- verification steps
- queued tasks ready for dispatch after the service is authorised

Prepared work must remain within the user's authority and must not imply that a provider has executed it before activation.

## Subscription lifecycle

`capability_gap → recommendation → user_choice → activation/connection → prepared_work → execution → evidence → verification → utility_review`

A subscription should not be treated as permanently required merely because it was previously useful.

## Scope

This subsystem applies to external AI models, agents and related specialist services. It complements the AgentOS model registry, capability registry, entitlement engine, worker router and commercial/affiliate systems without replacing any of them.

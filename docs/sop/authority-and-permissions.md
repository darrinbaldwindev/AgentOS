# SOP-AUTH-001 — Authority and Permissions

**Owner:** SOP Overseer  
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT  
**Version:** 0.1.0  
**Last verified:** 2026-09-15  
**Audience:** users, operators, administrators, developers  
**Legal review:** not a legal document

## Purpose

Explain how to reason about what AgentOS may do without implying authority that the runtime has not granted.

## Plain-language rule

AgentOS may only perform an action when the action is inside the authority actually granted for that task and the applicable safety/policy gates permit it. A model deciding that an action is useful is not permission.

Changing Simple / Essentials / Tech Head changes presentation detail only. It must not change authority.

## Effective authority

Treat effective authority as the intersection of the applicable controls, including authenticated actor/user context where implemented, explicit grant/consent, capability eligibility, scope, policy, risk, budget, approval requirements and environment restrictions. Unknown required state fails closed.

An autonomy level or scheduled window does not grant a new capability by itself. `WHEN AgentOS may work` is distinct from `WHAT AgentOS may do`.

## Current Level 2 limitation

Current PR #104 remains draft/unmerged. The current admission path consumes authenticated actor context and canonical grant evidence supplied by a caller, but authenticated transport and canonical grant lookup are not yet wired end-to-end. Project-file mutation is also blocked by unresolved continuous-ownership assurance. Therefore this SOP must not be used to claim broad autonomous Windows/file authority.

## Operator procedure

Before authorising consequential work:

1. Confirm the intended task and affected workspace/resource.
2. Confirm the action is represented by a supported capability, not merely natural-language intent.
3. Confirm scope is bounded: target, path/project, environment, duration/expiry where applicable, and any spending/external-communication boundary.
4. Confirm required approval is explicit and current.
5. Confirm AgentOS reports any missing/unknown authority as blocked rather than inferring permission.
6. After execution, inspect the resulting evidence/receipt. Do not infer Green or PRS from worker success.

## Failure conditions

Stop and escalate/reconcile when:

- actor identity cannot be established where required;
- a grant is missing, ambiguous, expired, mismatched or self-asserted by a payload/worker;
- requested scope exceeds the grant;
- capability identity/health is unknown;
- required approval is absent;
- the action would cross a protected production, credential, payment, deployment or external-communication boundary;
- evidence cannot be correlated to the exact task/mission/worker/result.

## Expected evidence

Where implemented, authority-sensitive execution should preserve source-backed authority provenance into durable execution evidence. Evidence must not synthesize a grant that did not exist.

## Escalation

A documentation gap cannot be solved by broadening authority. Escalate the missing runtime/identity/grant contract to the Project/Portfolio Overseer and keep the affected procedure IMPLEMENTATION-DEPENDENT or BLOCKED.

## Evidence dependencies

- `docs/AGENTOS_GOVERNANCE_LAYER.md`
- `docs/AUTONOMY_SCALE.md`
- AgentOS PR #104 current authority admission and receipt lineage
- current Frontend trust/permission contracts where applicable
- Overseer #49 hard boundaries

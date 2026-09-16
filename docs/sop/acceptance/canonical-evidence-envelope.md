# Canonical Evidence Envelope

**Document ID:** SOP-ACCEPT-004
**Status:** PRODUCT-DIRECTION / IMPLEMENTATION-DESIGN-INPUT

## Goal
Give AgentOS surfaces a shared evidence vocabulary without creating a second ledger.

## Envelope
A canonical action/result view should be able to reference:
- mission_id, task_id, worker_id, actor_id;
- authority/approval reference;
- capability/action class and exact target;
- request/admission/start timestamps;
- precondition/preimage evidence;
- side-effect attempt/result evidence;
- postcondition/postimage evidence;
- verification identity/result;
- receipt identity/persistence state;
- retry/replay/idempotency key;
- stop/revoke state if relevant;
- cost/provider/data-routing evidence if relevant;
- Green state/evidence reference;
- PRS state/evidence reference;
- unresolved uncertainty/blocker.

## Truth rule
The envelope is a projection over canonical evidence sources. It must not manufacture missing states or become an independent authority/persistence system.

## User surfaces
Morning Brief, What Happened?, Basic Chat, Tech Head, audit/history and recovery views may render different detail from the same envelope. They must preserve negative/unknown states.

## Versioning
Schema versions must be explicit. Readers should fail safely on unknown required semantics rather than treating an unrecognized state as success.

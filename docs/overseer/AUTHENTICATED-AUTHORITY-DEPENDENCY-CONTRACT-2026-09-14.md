# Authenticated Authority Dependency Contract — 2026-09-14

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical portfolio coordination:** `darrinbaldwindev/Overseer#49`  
**Scope:** Level 2 remote admission dependency map  
**Status:** BLOCKED pending a real existing authenticated identity source and canonical grant source

## Purpose

Define the smallest integration contract required to bind PR #104 remote admission to real AgentOS identity and authority without inventing a second authentication service, authority registry, scheduler, queue, worker runtime, persistence layer, Green system, or PRS system.

This document is a dependency contract, not an implementation and not authority.

## Existing primitives reviewed

### Role identity

Canonical main exposes `src/governance/role-identity.mjs` (`GOV-ROLE-001`). It establishes provider-neutral operational role identity and fails closed when role/provider/session identity is invalid. It proves that provider identity is not authority and that a worker cannot perform Overseer-only actions.

This primitive is **role identity**, not user/device/transport authentication. It does not prove that a remote actor really owns a claimed `actor_id`.

### Dispatch authority policy

Canonical main exposes `src/dispatch/authority.mjs`. It validates trusted task issuers and ensures granted capabilities are within a configured policy set.

This primitive is **dispatch policy validation**, not a grant issuer. It does not create, authenticate, persist, expire, revoke, or resolve canonical grants.

### Canonical mission/decision context

Canonical main exposes `src/dispatch/canonical-context.mjs`. It binds tasks to known missions and accepted decisions.

This primitive is **canonical task context**, not authentication and not a grant resolver.

### PR #104 admission consumer

PR #104 exposes `runtime/remote-authority-admission.mjs`. The producer already requires:

- `actorContext.authenticated === true`;
- exact actor and issuer match against the candidate;
- trusted issuer membership;
- requested capability membership in the allowed policy set;
- an injected `authoritySource.resolveGrant(...)` result with `status === 'GRANTED'`;
- grant actor, issuer and project provenance matching the authenticated context/candidate;
- requested capabilities fully contained in granted capabilities;
- grant capabilities remaining inside policy;
- a non-empty `evidence_id` and `mission_id`;
- atomic persistence of request marker + admitted dispatch task, failing closed on replay/conflict/write failure.

Current PR #104 regression evidence already proves resolver failure and durable persistence failure cannot return an admitted task.

## Missing runtime sources

Fresh repository discovery found no canonical-main implementation that can honestly supply either of these PR #104 dependencies:

1. **Authenticated actor source** — an existing runtime/API that converts transport/session/device authentication into immutable actor evidence suitable for `actorContext`.
2. **Canonical grant resolver** — an existing runtime/API implementing `resolveGrant({ candidate, actorContext, requestedCapabilities })` from durable AgentOS authority state.

`GOV-ROLE-001`, dispatch issuer/capability policy, and canonical mission context are necessary adjacent controls but are not substitutes for either missing source.

Therefore A-AG-03 / SG-01+SG-02 remains fail-closed. Token possession, provider login, role identity, issuer string, candidate contents, or a caller-supplied Boolean must not be relabelled as authenticated AgentOS authority.

## Implementation-ready dependency interface

The future binding SHOULD consume existing sources through adapters with the following minimum evidence. These are integration requirements, not permission to create new authority sources.

### Authenticated actor evidence

Required output:

```text
actor_id             stable AgentOS actor identifier
issuer               authenticated issuer identity
session_or_subject   durable correlation to authenticated session/subject
project_scope        explicit project/tenant scope
source               identity source identifier
source_version       version/revision when available
authenticated_at     bounded authentication observation time
evidence_id          immutable/durable authentication evidence reference
```

Required properties:

- derived from an authentication mechanism, never from request body claims alone;
- project/tenant scope cannot broaden because the candidate requests it;
- provider/model/role identity does not imply actor authentication;
- authentication evidence is separable from authority grant evidence;
- missing, contradictory or unverifiable fields fail closed before `resolveGrant` and before persistence.

### Canonical authority grant evidence

Minimum fields already required by PR #104:

```text
status = GRANTED
actor_id
issuer
project_id
granted_capabilities[]
evidence_id
mission_id
```

A real canonical source should additionally define, before freshness/revocation promotion is claimed:

```text
grant_id
issued_at
expires_at or explicit non-expiring policy
revocation/version semantics
source/revision
scope constraints
```

These additional fields are intentionally **not** enforced in PR #104 today because no canonical schema/source currently defines them. Inventing fake expiry/version/nonce semantics in the admission consumer would create false security.

## Binding sequence

The allowed future composition order is:

```text
transport/session authentication
-> authenticated actor evidence
-> role identity validation where applicable
-> canonical mission/project scope
-> canonical grant lookup/resolution
-> PR #104 remote-authority-admission validation
-> existing dispatch authority policy
-> durable admission marker + dispatch task
-> existing scheduler/local-wake pickup
-> governed execution
-> receipt/correlation
-> Green
-> PRS where required
```

The admission producer must remain a consumer/composition seam. It must not become the authentication service or grant authority.

## Required negative acceptance cases before SG-01/02 can move

1. unauthenticated transport cannot produce `actorContext`;
2. request-body `actor_id` cannot override authenticated actor identity;
3. role/provider/session identity alone cannot satisfy actor authentication;
4. cross-project actor/grant mismatch is rejected;
5. issuer mismatch between authentication, candidate and grant is rejected;
6. grant from the wrong actor is rejected;
7. requested capability outside grant is rejected;
8. granted capability outside local policy is rejected;
9. authentication source unavailable fails before admission persistence;
10. grant source unavailable fails before admission persistence;
11. revoked/expired/stale grant is rejected once canonical semantics exist;
12. replayed request/delivery cannot create a second admitted task;
13. failure writing either durable admission record cannot return success;
14. exact authentication evidence ID and authority evidence ID remain correlated through task/receipt evidence without treating them as interchangeable.

## Current disposition

- **SG-01 identity/authentication:** BLOCKED — no bindable canonical runtime source evidenced.
- **SG-02 authority/grant provenance:** BLOCKED — no bindable canonical grant resolver evidenced.
- **PR #104 admission consumer:** structurally useful and fail-closed for its current input contract, but not end-to-end authenticated.
- **Project-file mutation / SG-08:** separately BLOCKED; this document does not change ownership-through-publish status.
- **No overall GREEN.**

## Smallest safe next action

When an existing authenticated identity source and existing canonical grant source are evidenced, add a thin adapter into `remote-authority-admission.mjs` inputs and run the negative matrix above. If no such sources exist, escalate an architecture dependency decision rather than silently inventing authority inside the admission path.

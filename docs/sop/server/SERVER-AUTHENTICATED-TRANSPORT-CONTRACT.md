# AgentOS Server — Authenticated Transport Contract

Status: DRAFT / implementation-ready contract, not runtime authority
Workstream: S-SRV-02

## Purpose

Define the smallest server-side transport seam that can feed the existing canonical remote authority admission producer without creating a second AgentOS authority plane.

This document is deliberately transport-neutral. It does not select an identity provider, issue grants, create a grant registry, create a scheduler/queue, or authorize execution.

## Exact source anchor

Fresh source inspection for this cycle used AgentOS PR #104 exact head:

`5bb27bb4290bbdf743c53c7f48e75af14db37966`

Canonical seam:

`runtime/remote-authority-admission.mjs`

The seam already requires:

- an authority-free `candidate` in `AWAITING_AUTHORITY` state;
- an `actorContext` with `authenticated === true`;
- exact `actor_id` and `issuer` agreement between actor context and candidate;
- trusted issuer policy;
- requested capability policy;
- caller-supplied `authoritySource.resolveGrant(...)`;
- grant provenance agreement for actor, issuer and project;
- source-backed `evidence_id` and `mission_id`;
- complete/in-policy granted capabilities;
- persistence-backed replay/conflict rejection.

Therefore AgentOS Server must adapt transport evidence into this seam rather than replace it.

## Server transport envelope

A server transport adapter MAY accept an immutable request envelope shaped conceptually as:

```text
ServerAuthenticatedRequest {
  transport_request_id
  received_at
  authenticated_actor {
    actor_id
    issuer
    authenticated = true
    authentication_evidence_ref
  }
  candidate
  target_host_id
  execution?   // bounded existing execution contract only
}
```

`authentication_evidence_ref` is an opaque reference to evidence produced by the selected real authentication system. It is not an authority grant and must not be converted into one.

The adapter output to canonical admission is only:

```text
admit({
  candidate,
  actorContext: {
    authenticated: true,
    actor_id,
    issuer
  },
  targetHostId,
  execution?
})
```

The canonical `authoritySource` remains externally supplied by existing AgentOS composition. The transport adapter MUST NOT implement `resolveGrant` by trusting request claims.

## Mandatory fail-closed rules

Before canonical admission is invoked, the server adapter must reject:

1. missing authentication result;
2. `authenticated !== true`;
3. missing/blank actor ID;
4. missing/blank issuer;
5. missing authentication evidence reference;
6. malformed candidate;
7. candidate not awaiting authority;
8. actor ID mismatch between authenticated context and candidate;
9. issuer mismatch between authenticated context and candidate;
10. missing/blank target host ID;
11. transport envelope replay where the real transport layer promises uniqueness;
12. any attempt for transport claims to provide or override `authority_evidence_id`, `mission_id`, granted capabilities, Green, PRS or completion state.

Canonical admission remains responsible for trusted issuer policy, capability policy, grant resolution/provenance, dispatch authorization, canonical request/delivery replay markers and admitted task persistence.

## Trust separation

The following identities must remain distinct:

```text
Authentication evidence
    proves who/what authenticated the request

Authority grant evidence
    proves the canonical AgentOS authority source granted the action

Execution evidence
    proves bounded work ran and what happened

Green evidence
    independently verifies functional result

Security evidence
    independently verifies security-relevant result

PRS evidence
    assures eligible evidence after prerequisites
```

No layer may synthesize a later layer.

## Required deterministic fixtures

Implementation of the server transport adapter is not acceptable without at least these synthetic/non-production tests:

| Fixture | Expected result |
|---|---|
| authenticated actor matches candidate, canonical authority source grants | adapter reaches canonical admission; canonical result controls |
| unauthenticated actor | deny before admission |
| actor mismatch | deny before admission |
| issuer mismatch | deny before admission |
| missing auth evidence ref | deny before admission |
| request attempts to inject authority evidence | deny before admission |
| request attempts to inject mission/grant/Green/PRS/completion truth | deny before admission |
| canonical authority source denies/missing grant | propagate canonical denial; no task synthesis |
| canonical persistence reports replay/conflict | propagate canonical replay/conflict; no second task |
| malformed/empty target host | deny before admission |

Tests must prove denial has zero scheduler/local-wake/worker side effect.

## Explicit non-goals

S-SRV-02 does not authorize:

- choosing or provisioning an IdP;
- creating users, organizations or tenants;
- creating a canonical grant database;
- storing credentials/secrets;
- enabling project-file mutation;
- unrestricted PowerShell/shell;
- production server deployment;
- changing scheduler/local-wake semantics;
- changing Green or PRS;
- changing canonical completion truth.

## Implementation boundary / ownership collision rule

PR #104 currently owns the canonical remote admission hot path. Server work MUST NOT modify `runtime/remote-authority-admission.mjs` or its authority/persistence semantics from the Server SOP lineage while that exact work remains active.

The first permissible Server implementation is a thin adapter in a server-specific composition boundary plus deterministic tests. Before creating that adapter, fresh scan must prove no equivalent adapter already exists and identify the real authentication source contract. If the authentication source remains absent/unknown, S-SRV-02 stays implementation-BLOCKED and this contract is the handoff artifact.

## Acceptance state

Documentation contract: ready for exact-head CI verification.
Runtime implementation: BLOCKED pending evidence of a real authenticated identity source and non-overlap with active #104 ownership.
Overall Server GREEN: NOT CLAIMED.
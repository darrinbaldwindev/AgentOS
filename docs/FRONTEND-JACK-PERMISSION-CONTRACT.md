# AgentOS Frontend — Jack Permission Presentation Contract

**Status:** presentation contract only  
**Owner:** AgentOS Frontend Overseer  
**Canonical runtime authority:** existing AgentOS authority/grant/admission systems  
**Not authorised by this document:** creation of a new authority system, approval store, revoke mechanism, scheduler, mission ledger, persistence layer, Green system or PRS system.

## Purpose

Define the minimum canonical facts the frontend must receive before Jack can present a truthful permission decision to an ordinary user.

Jack is the user-facing authority and boundary explainer. Jack must never imply authority that the canonical runtime has not granted, and must never turn a transport identity, provider credential or worker capability into user permission by implication.

## Current evidenced authority seam

The current remote authority admission path can validate and persist:

- authenticated actor identity;
- trusted issuer;
- project provenance;
- requested capabilities;
- granted capabilities;
- authority evidence identifier;
- mission identifier;
- task identifier;
- delivery identifier;
- request identifier;
- target host;
- scope;
- constraints;
- objective;
- admission timestamp;
- dry-run execution environment.

This is enough to prove that a task was admitted under a particular evidence-backed capability grant. It is not yet enough to render a complete user-facing Jack permission card.

## Missing canonical fields before interactive permission UI

The frontend must not invent any of the following. They need a canonical source or explicit UNKNOWN state:

1. **Reason** — plain-language explanation of why the permission is needed now.
2. **Permission lifetime** — one action, this job, session, bounded duration, or durable grant.
3. **Expiry** — canonical expiry timestamp or explicit no-expiry semantics.
4. **Revocation state** — whether the grant is currently active, revoked, expired or unknown.
5. **Canonical revoke operation** — a durable runtime endpoint/action and receipt proving the scope that was revoked.
6. **Reversibility** — whether the requested action can be undone and what rollback evidence exists.
7. **Credential involvement** — whether credentials/secrets/accounts are required or touched, without exposing secret values.
8. **External communication consequence** — whether the action sends a message, posts content, contacts a third party, or publishes externally.
9. **Data disclosure consequence** — what data class leaves the machine/provider boundary, if any.
10. **Cost/capacity consequence** — bounded cost, quota or paid-provider impact when known.
11. **Additional approval boundary** — what later action would require another permission decision.
12. **Mutation consequence** — files/settings/services/accounts that may be changed, scoped canonically.

## Presentation model

A Jack card is a projection over canonical authority facts, never a source of truth.

### Minimum readable card

- **What AgentOS wants to do** — canonical objective/action in ordinary language.
- **Where** — project, host, account, service or target scope when canonical.
- **What this allows** — requested/granted capability summary.
- **Why it is needed** — canonical user-facing reason; otherwise `Reason unavailable — permission cannot be requested safely.`
- **How long** — canonical lifetime/expiry; otherwise `Duration unknown — permission cannot be requested safely.`
- **What can change** — canonical mutation consequence or `No mutation is authorised by this permission` when proven.
- **External effect** — publication/contact/data-transfer consequence when canonical.
- **Credentials** — `Credentials involved`, `No credentials involved`, or `Unable to confirm` from canonical evidence.
- **Cost** — exact/bounded cost where canonical; otherwise omit rather than estimate.
- **Next approval boundary** — what would require another approval when canonical.

### Technical disclosure

Essentials/Tech Head may additionally expose:

- authority evidence ID;
- actor and issuer;
- mission/task/delivery/request IDs;
- raw requested and granted capability identifiers;
- target host ID;
- canonical constraints;
- admission timestamp.

Simple mode should not require understanding these identifiers.

## Decision states

Only these user-facing states are permitted when backed by canonical facts:

- `Permission needed`
- `Allowed once`
- `Allowed for this job`
- `Temporarily allowed until [time]`
- `Allowed within [scope]`
- `Denied`
- `Expired`
- `Revoked`
- `Permission state unavailable`

Do not infer lifetime from a task or mission ID. Do not infer `Revoked` from Stop, Pause, host shutdown, task failure, transport disconnection or worker termination.

## Interactive Allow requirements

A clickable **Allow** control is eligible only when all of these are true:

1. canonical authority mutation endpoint exists;
2. requested scope is deterministic and displayed;
3. lifetime/expiry semantics are deterministic and displayed;
4. target and consequences are displayed;
5. operation returns a durable authority evidence/receipt identifier;
6. replay/idempotency behavior is defined;
7. failure/partial-write behavior fails closed;
8. frontend can refresh from canonical state after the mutation rather than assuming success;
9. approval cannot silently widen capability scope;
10. required Green/PRS policy gates remain outside frontend control.

After Allow, the frontend may show success only after canonical state confirms the exact grant. A successful HTTP response alone is not sufficient authority evidence.

## Interactive Revoke requirements

A clickable **Revoke** control is eligible only when a canonical durable revoke path exists.

Required result fields:

- authority evidence/grant being revoked;
- revoked scope/capabilities;
- effective timestamp;
- revocation receipt/evidence ID;
- whether already-running work is affected;
- whether queued/new work is denied;
- residual actions that cannot be undone;
- canonical state after revocation.

Required wording distinction:

- `Stop requested` = execution/control request.
- `Execution stopped` = canonical termination evidence.
- `Permission revoked` = canonical authority revocation evidence.
- `No further actions authorised` = only when canonical authority state proves no applicable grant remains.

These statements are not interchangeable.

## Fail-closed rules

If any material field is missing, stale, contradictory or cannot be correlated to the current task/grant:

- do not display an enabled Allow/Revoke action;
- do not infer user intent from prior approvals;
- do not infer scope from UI navigation or selected project;
- do not infer credentials from provider connection state;
- do not infer external publication from tool name alone;
- show the smallest useful UNKNOWN explanation;
- retain technical evidence references for diagnosis.

## Character discipline

Jack may explain the decision conversationally, but the authoritative permission facts must remain readable without the mascot/persona.

Willow can explain the plan. Isla can explain execution. Henry can explain independent assurance. None of them can grant or revoke authority through presentation language.

## Current implementation boundary

At the current AgentOS remote-admission contract, provenance/capability/scope information is useful for a read-only authority summary, but the missing lifetime, consequence and durable revoke semantics prevent a truthful interactive Jack permission card.

Therefore the current frontend should continue to:

- show no synthetic Allow/Revoke control;
- avoid `Always allow`;
- avoid `Permission revoked` unless canonical revocation exists;
- avoid implying a provider credential equals action authority;
- continue using truthful Stop semantics separately from authority.

## Acceptance tests for future implementation

Negative tests must fail if the frontend:

- renders Allow with unknown lifetime or scope;
- renders Revoke without a canonical revoke endpoint;
- treats Stop as revocation;
- says `No further actions authorised` from a chat `stopped` flag;
- derives permission from authenticated identity alone;
- derives permission from provider/API credentials;
- broadens granted capabilities beyond canonical evidence;
- retains an enabled approval control after evidence becomes stale;
- reports permission success before canonical refresh confirms it.

Positive tests should prove that the presentation exactly names action, target, scope, lifetime, consequences and evidence source from a single correlated canonical grant snapshot.

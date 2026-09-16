# AgentOS Server — Commercial Entitlement Reconciliation

Status: DRAFT / evidence-controlled
Workstream: S-SRV-11 with S-SRV-03 dependency

## Fresh canonical commercial evidence

Current AgentOS main commit `962cb3820b83506f9e6d90f50e003690dd85a8a1` adds the Commercial / Business deployment model to `docs/COMMERCIAL_PRODUCT_MODEL_2026-09-02.md`.

Current product truth:
- Commercial / Business pricing is **TBD**.
- It is a customer-hosted/private-server deployment and multi-seat licensing model, not merely a larger personal tier.
- Target deployment includes customer server/private cloud/VM/on-prem or approved customer-controlled infrastructure.
- It targets named or otherwise governed seats, central administration, per-user identity/permission/context/audit boundaries, organization governance/security/verification/PRS, central audit/receipts/evidence, organization-approved AI providers/BYOK/local/private endpoints and potential enterprise identity integration.
- A future managed multi-tenant option is distinct and requires organization isolation.
- The document explicitly says payment infrastructure, entitlements, commercial server deployment, seat management and production pricing pages are not thereby implemented.

## Reconciliation with older entitlement architecture

`docs/PRODUCT_ENTITLEMENT_ARCHITECTURE.md` remains a locked baseline for the one-core-platform entitlement principle and older progressive tier model. It requires one AgentOS core with an entitlement/policy layer rather than separate tier codebases.

For Server, the newer Commercial / Business product decision supplements that older baseline. It does not establish storage/API ownership for organizations, memberships or seats.

## Server implementation consequences

### Locked/reusable principle
One AgentOS core. Commercial Server does not fork AgentOS. Entitlement controls access to capability; it does not create execution authority.

### Commercial product direction
Customer-controlled/private Server + multi-seat administration is current documented direction.

### Still unknown / unimplemented
Fresh evidence does not identify:
- canonical organization database/store;
- canonical membership persistence owner;
- canonical seat-assignment persistence owner;
- payment/billing integration;
- production entitlement API;
- enterprise SSO/directory provider;
- final included seat count;
- additional-seat pricing;
- base Server price;
- production intelligence pricing for organizations.

Therefore the earlier approximate five-seat / $999 research target remains **provisional and must not be published as current product truth**. Current canonical pricing is TBD.

## Minimal entitlement-domain ownership proposal

Before code, product/architecture authority should assign exactly one canonical owner for these commercial facts:
- organization identity;
- membership identity/state;
- seat assignment/state;
- entitlement/package identity/version;
- admin role for commercial account management;
- audit identity for entitlement mutations.

This owner is a product entitlement source, **not AgentOS execution authority**. It may answer whether a subject is entitled to request a Server capability; canonical AgentOS governance still decides whether a particular mission/action is authorized.

## Required lifecycle semantics before implementation

Organization: create/active/suspended/retired.
Membership: invited or provisioned/active/suspended/revoked.
Seat: unassigned/active/suspended/revoked/reassigned.
Entitlement: package/version/effective period/status.

Every transition requires server-side authorization and audit attribution. Exact billing semantics remain separate.

## Fail-closed race cases

Design/tests must cover:
- seat revoked after authentication but before admission;
- membership revoked while a request is queued;
- seat reassigned while an older session exists;
- organization suspended during an active mission;
- entitlement downgraded while queued work exists;
- stale entitlement cache after revocation;
- duplicate seat assignment;
- seat count exceeded concurrently;
- cross-org administrator attempts assignment;
- restored backup reactivates revoked membership/seat;
- billing state unavailable: do not silently upgrade entitlement or execution authority.

The exact handling of already-admitted missions must be explicitly defined by canonical authority/product policy; Server must not invent retroactive cancellation semantics.

## Readiness disposition

Commercial Server product direction: DESIGNED at product level.
Final pricing: TBD.
Five-seat included package: PROVISIONAL / not canonical.
Organization/membership/seat source ownership: NEW-GAP candidate requiring explicit assignment.
Entitlement runtime/API: NOT IMPLEMENTED by current canonical evidence.
Execution authority: remains canonical AgentOS governance, separate from entitlement.
Overall Server GREEN: NO.
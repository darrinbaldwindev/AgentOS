# Capability Registry Evidence Contract

**Document ID:** SOP-ACCEPT-005
**Status:** PRODUCT-DIRECTION / IMPLEMENTATION-DESIGN-INPUT

## Principle
A capability registry describes what a worker/provider/tool is known to support and under what constraints. It is not authority to use that capability.

## Candidate record
Bind stable capability ID, provider/worker/tool identity, operations, platform/runtime prerequisites, data classes supported, provider/local boundary, required permissions/approvals, cost/rate-limit characteristics where known, evidence source, verification tests, last verified exact version/head, status and limitations.

Status vocabulary: `DISCOVERED`, `CONFIGURED`, `VERIFIED_FOR_SCOPE`, `DEGRADED`, `UNAVAILABLE`, `UNKNOWN`, `REVALIDATION_DUE`.

## Rules
- Installed/configured != verified.
- Verified capability != authorized action.
- Provider marketing/documentation != local runtime proof.
- A capability change invalidates dependent routing assumptions until revalidated.
- The registry should point to existing canonical worker/provider/tool identities rather than creating competing identities.

## Routing use
Planning/routing may consult verified capability facts alongside authority, data, cost and quality policy. No registry record may bypass approval or protected-action controls.

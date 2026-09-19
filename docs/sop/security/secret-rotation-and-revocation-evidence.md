# Secret Rotation and Revocation Evidence Procedure

**Document ID:** SOP-SEC-003
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Scope
This SOP defines evidence for rotation/revocation. It does not authorize credential creation, viewing, changing or revocation.

## Evidence stages
1. identify credential/secret by non-secret stable reference;
2. identify owner/provider/account and affected capabilities;
3. record reason and approved change authority;
4. establish replacement/transition plan where needed;
5. perform protected credential action only under explicit authority;
6. verify old credential rejection/revocation using safe provider/runtime evidence;
7. verify intended replacement path separately;
8. search bounded configuration/log surfaces for stale references without exposing secret values;
9. record durable receipt and residual UNKNOWNs.

## Truth boundaries
`rotation requested` != `new credential active`; `new credential works` != `old credential revoked`; connector disconnect != provider-side revocation; deleting a local secret != provider deletion.

## Safety
Never place secret values in receipts, issues, PRs, logs, screenshots or documentation. If exposure is suspected, use incident controls and do not reproduce the value for evidence.

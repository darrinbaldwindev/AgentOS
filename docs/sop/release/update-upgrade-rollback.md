# SOP-RELEASE-001 — Update, Upgrade and Rollback

Status: DRAFT / IMPLEMENTATION-DEPENDENT

## Rule
An available update is not authority to install it. Update/upgrade/rollback must preserve canonical state, authority, evidence and recovery semantics.

## Change packet
Record current version/head, target version/head, source/provenance, migration requirements, affected schemas/state/files, compatibility constraints, security notes, backup/restore prerequisite, approvals, downtime/side effects, tests, rollback boundary and revalidation requirements.

## Procedure
1. Verify package/source provenance and exact target.
2. Reconcile release notes against actual diff/evidence.
3. Back up required state using the canonical backup procedure before irreversible migration.
4. Check mission/worker quiescence and concurrent mutation risks.
5. Obtain required approval for install/migration/restart.
6. Apply through bounded supported mechanism.
7. Verify version, state migration, authority/policy integrity, scheduler/mission/worker continuity and representative workflows.
8. If verification fails, stop new work and use the defined rollback/recovery path; do not improvise a second state store.
9. Re-run exact-version Green/PRS gates where their prior evidence was invalidated.

Rollback is not automatically safe: data/schema migrations may be non-reversible. UNKNOWN reversibility blocks an automatic rollback claim.
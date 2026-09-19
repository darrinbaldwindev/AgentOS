# Release Migration and Restore Evidence Checklist

**Document ID:** SOP-RELEASE-003
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Migration packet
Bind source version/schema, target version/schema, exact migration artifact/head, preconditions, backup/checkpoint evidence, data scope, expected transformations, compatibility constraints, rollback/restore path and acceptance tests.

## Execution truth
`migration started`, `migration process exited successfully`, `target schema observed`, `application tests passed`, and `restore proven` are distinct facts.

## Restore drill
A restore claim requires a bounded drill or equivalent evidence against a known backup/fixture, including restore target, integrity checks, application-level verification and any data-loss window. Backup existence alone does not prove restorability.

## Failure handling
On partial migration, interrupted write, unknown target state, checksum mismatch or incompatible rollback, stop automatic continuation and enter recovery/manual-review state. Do not rerun a non-idempotent migration blindly.

## Production boundary
Documentation/test evidence does not authorize a production migration, deployment or destructive rollback.

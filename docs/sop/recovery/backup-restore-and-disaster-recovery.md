# SOP-REC-005 — Backup, Restore and Disaster Recovery

Status: DRAFT / IMPLEMENTATION-DEPENDENT

## Separation rule
Do not call one archive a complete AgentOS backup unless its scope is explicit. Treat separately: application/configuration, authority/policy state, mission/task/ledger state, receipts/evidence, worker registry/capability configuration, user/project files, local indexes/cache, credentials/secrets, and external-provider data.

## Backup record
Bind backup ID, scope, source version/head, timestamp, consistency/quiescence state, encryption/access control, storage location class, retention, checksum/integrity evidence, excluded data, restore prerequisites and owner.

## Restore procedure
1. Identify the failure and required recovery point.
2. Preserve current failed/uncertain evidence before overwrite.
3. Verify backup identity/integrity and compatibility.
4. Restore only authorised scope.
5. Prevent duplicate replay of missions/tasks/side effects.
6. Reconcile authority, approvals, scheduler state, mission state, receipts and project-file truth after restore.
7. Verify representative operations and exact restored version.
8. Mark missing/external/non-restored data explicitly.
9. Require Green/PRS revalidation where restore invalidates prior assurance.

## Disaster recovery
Define recovery objectives only when implementation and tested evidence exist. Never publish invented RPO/RTO. A successful file copy is not a tested disaster-recovery capability. Credentials may require separate secure recovery and must not be copied into ordinary backup logs/receipts.
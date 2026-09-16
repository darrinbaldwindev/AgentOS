# SOP-WIN-001 — Bounded Windows Worker Operation

**Owner:** SOP Overseer  
**Status:** IMPLEMENTATION-DEPENDENT  
**Version:** 0.1-draft  
**Last verified:** 2026-09-15  
**Audience:** operators, developers, assurance reviewers  
**Evidence basis:** AgentOS PR #104 current GitHub evidence; Overseer #49

## Purpose
Describe only the Windows/PowerShell worker behaviour currently evidenced on the active Level 2 lineage. This SOP does not grant runtime authority.

## Current support boundary
The current PR #104 evidence identifies these bounded PowerShell operations:

- `repo.status`
- `repo.diff`
- `test.run`
- `audit.run`
- `process.list`
- `service.list`

Treat this list as branch-scoped evidence, not a permanent product promise.

## Explicitly not supportable as shipped behaviour
Do not describe the current Windows worker as supporting unrestricted shell/PowerShell, elevation, production writes, autonomous scheduler/local-wake PowerShell execution, or proven project-file mutation.

Project-file mutation remains BLOCKED pending independent proof of continuous ownership across final verification, publish/prepared recovery, durable success receipt, and release. Authenticated actor/canonical grant binding and physical Windows acceptance are separate incomplete gates.

## Procedure
1. Establish the exact repository/branch/head and current runtime evidence.
2. Establish canonical context, authority, consent, host capability, tool policy, risk, budget and any required approval before execution.
3. Admit only a currently supported bounded operation.
4. Preserve exact task/mission/wake and authority-evidence correlation where the canonical path provides it.
5. Execute within the approved working scope.
6. Capture execution result and durable receipt/evidence.
7. Reconcile result against the admitted request.
8. Report functional execution separately from Green verification and PRS assurance.

## Fail closed
Stop the procedure and report BLOCKED/UNKNOWN when required authority evidence is missing, scope cannot be established, the requested operation is outside the bounded operation set, correlation cannot be reconciled, or durable result evidence cannot be established.

## Expected result
A bounded operation may produce execution evidence. That evidence does not by itself establish project completion, Green, PRS assurance, physical-Windows acceptance, or permission for a subsequent mutation.

## Evidence produced
Where implemented by the canonical runtime: request/task/mission/wake lineage, authority evidence reference, execution result, receipt/reconciliation evidence, and exact runtime/CI evidence pointer.

## Revalidation triggers
Revalidate whenever PR #104 changes its admitted operations, authority binding, receipt schema, execution path, scheduler/local-wake relationship, Windows acceptance status, ownership primitive, Green finding, or PRS finding.
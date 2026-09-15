# SOP Assurance Evidence Index

**Owner:** SOP Overseer  
**Status:** DRAFT / LIVE INDEX  
**Version:** 0.1  
**Last verified:** 2026-09-15  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`

## Rule
Assurance attaches to exact evidence scope/head. Older-head PASS, worker success, CI success, a receipt, or a policy statement must never be inherited as current Green/PRS without explicit same-scope evidence.

## Current Level 2 evidence ledger

| Scope | Evidence | Current documentation disposition |
|---|---|---|
| AgentOS PR #104 | GitHub PR remains OPEN / DRAFT / UNMERGED. API-reported head is `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`. | IMPLEMENTATION-ADVANCED, not shipped. |
| PR #104 bounded operations | `repo.status`, `repo.diff`, `test.run`, `audit.run`, `process.list`, `service.list`. | May be documented only as branch-scoped bounded operations. |
| Authority provenance | PR body records source-backed `authority_evidence_id` preservation for admitted PowerShell tasks, but authenticated transport/canonical grant lookup are not wired end-to-end. | Partial evidence; no end-to-end authority claim. |
| Project-file mutation | PR body states SG-08 continuous ownership is not independently proven through final verification -> publish/prepared recovery -> durable success receipt -> release. | BLOCKED / NOT YET SUPPORTABLE. |
| Physical Windows acceptance | PR body says physical Windows acceptance remains separate from CI and is not claimed. | Do not infer from CI. |
| Green | PR body says Green promotion remains gated. | No current PASS inherited. |
| PRS | PR body says PRS promotion remains gated. | No current PASS inherited. |
| Newer Overseer #49 control evidence | Latest portfolio checkpoint records an AgentOS software-assurance blocker around timeout/descendant process-tree termination and says `powershell_level1_accepted=false`; PRS remains blocked on the dependency. | Treat as contradictory/newer control evidence requiring exact-head reconciliation before broad Windows completion claims. |

## Contradictory-head warning
Overseer #49 contains newer checkpoint text referencing an AgentOS PR #104 head `fddca3363925b9acb5ecb05552ae5d82ce7fed32`, while the GitHub PR/ref API fetched in this SOP cycle reports `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`. This mismatch is itself material evidence.

Do not choose whichever head is convenient. Until reconciled, documentation that depends on exact-head assurance must remain REVIEW REQUIRED / UNKNOWN for the disputed scope.

## Revalidation procedure
1. Fetch the canonical PR/ref head.
2. Fetch the exact Green finding and its head/scope.
3. Fetch the exact PRS finding and its head/scope.
4. Confirm no code/evidence-affecting change occurred between assurance and the head being documented.
5. Record physical-host evidence separately from hosted CI.
6. Record contradictions rather than collapsing them.
7. Only then promote the affected SOP claim.

## Evidence hierarchy for SOP claims
Fresh exact runtime/repository evidence > exact-head independent assurance > current architecture/policy > older assurance > dated documentation > product direction/hypothesis.

This ordering does not allow documentation to override runtime authority or assurance.
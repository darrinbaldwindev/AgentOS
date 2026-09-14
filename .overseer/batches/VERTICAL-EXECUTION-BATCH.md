# AgentOS Project Overseer — Vertical Execution Batch

**Repository:** `darrinbaldwindev/AgentOS`  
**Canonical portfolio coordination:** `darrinbaldwindev/Overseer#49`  
**Role:** AgentOS Project Overseer  
**Cycle:** Project vertical cycle 001  
**Fresh scan:** 2026-09-14 Australia/Brisbane  
**Canonical main:** `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`  
**Batch branch:** `agent/overseer/project-vertical-batch-001`  
**Batch status:** ACTIVE  
**Immediate portfolio priority:** Level 2 governed Windows worker.

## Purpose

Execute the highest-value safe AgentOS work in deep, evidence-controlled batches while preserving the existing control plane. This file is a bounded execution manifest, not a scheduler, queue, authority source, mission ledger, worker registry, persistence layer, Green system, PRS system, or source of truth.

## Governance boundaries

Do not merge, approve, mark ready, rebase protected work, deploy, change credentials, enable production autonomy, perform production writes, enable unrestricted PowerShell, or bypass Green/PRS. Do not create duplicate schedulers, dispatch systems, policy engines, capability registries, persistence systems, mission ledgers, worker runtimes, Green systems, or PRS systems.

Evidence controls completion. A draft branch or worker claim is not release evidence.

## Fresh-scan reality

- `main` is `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`.
- Portfolio doctrine is adopted at `.overseer/VERTICAL-BATCH-ADOPTION.md`.
- A frontend-specific batch already exists on draft PR #110 at this same canonical path. It is treated as a subordinate frontend lane, not overwritten or promoted by implication.
- PR #104 is the current Level 2 Windows-worker / PowerShell line and remains OPEN/DRAFT with a reported independent Green FAIL on project-file mutation ownership. General mutation remains HOLD.
- PR #91 remains the remote/local bridge lineage; #94 tightens completion correlation; #95 tightens Boolean authority grants; #101 observes host status; #102 hardens Basic Chat lock ownership; #111 advances truthful frontend presentation.
- PR #108 contains a bounded governed-execution preflight but is not wired into the strongest Level 2 lineage.
- Current main still contains two runtime-shell construction paths: `runtime/runtime-shell.mjs` and `runtime/shell-contract.mjs`.

## Cycle 001 execution queue

| ID | State | Task | Acceptance evidence |
|---|---|---|---|
| V001-01 | ACTIVE | Establish/reconcile the project-wide vertical batch without discarding the frontend lane | committed batch file on isolated draft branch |
| V001-02 | ACTIVE | Remove runtime-shell evaluation duplication while preserving both public construction surfaces | one canonical capability evaluation helper; compatibility adapter uses it; deterministic tests |
| V001-03 | PENDING | Run exact-head CI for V001-02 and inspect failures rather than borrowing predecessor results | exact branch-head AgentOS Tests result |
| V001-04 | PENDING | Produce a Level 2 lineage map for #91/#94/#95/#101/#104/#108 and record which contract owns each concern | durable repo evidence map; no merge/rebase |
| V001-05 | HOLD | Enable general project-file mutation | blocked until PR #104 ownership race is independently fixed, exact-head tested, Green PASS and PRS as required |
| V001-06 | PENDING | Inspect whether shell consolidation can become the canonical eligibility seam for governed execution admission without modifying the #104 mutation hot path | deterministic contract evidence only |
| V001-07 | PENDING | Reconcile frontend #110/#111 as a presentation lane against Level 2 runtime truth | no synthetic authority/Green/PRS state |

## Protected HOLDs

- Project-file mutation remains HOLD while the current Level 2 ownership race is unresolved.
- Physical Windows acceptance cannot be inherited from predecessor heads.
- Remote physical execution remains unproven until exact correlated unattended acceptance exists.
- No provider/OAuth/MCP expansion should bypass the P0 governed-execution and ownership gates.

## Replenishment rule

After execution: fresh-scan main, this branch, relevant PR heads and exact-head CI; mark consumed items with evidence; preserve HOLDs; then replenish 2–5 adjacent safe tasks. Significant results must be logged to Overseer #49.

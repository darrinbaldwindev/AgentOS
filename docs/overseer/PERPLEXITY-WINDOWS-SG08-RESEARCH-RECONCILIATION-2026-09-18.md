# Perplexity Windows / SG-08 Research Reconciliation — 2026-09-18

Status: **RESEARCH INPUT / NOT ASSURANCE / NOT GREEN**

Scope: reconcile owner-supplied Perplexity research against the existing PR #104 SG-08 design checkpoint. This document does not claim implementation, physical Windows acceptance, Green, Michael security PASS, PRS PASS, merge readiness, or production readiness.

## Executive reconciliation

The external research independently supports the existing SG-08 diagnosis: a pathname check or one-time ownership assertion cannot close the false-success window. The success-critical ownership lifetime must remain continuous through final verification, publish/prepared recovery, durable success receipt, and release.

The research adds useful Windows-specific evidence and test targets, but it does **not** by itself satisfy the existing repair gate. The current design checkpoint requires scanning existing repository dependencies/runtime modules for a kernel-backed cross-platform primitive before changing production code. If none already exists, SG-08 remains HOLD rather than inventing another lock subsystem.

## High-confidence external findings to evaluate

1. **Windows exclusive handles are a strong base primitive.** Win32 `CreateFile` sharing modes can deny conflicting opens while a handle remains open. This is consistent with the existing PR #104 design note that the Windows temporary open handle is materially closer to the required lifetime.
2. **Byte-range locking is a candidate, not a complete SG-08 solution.** `LockFileEx`/`.NET FileStream.Lock` can provide kernel-backed exclusion, but AgentOS still needs correlation/authority freshness and must prove the same ownership token protects publish/recovery and receipt persistence.
3. **Fencing/generation is useful for stale protocol messages but cannot substitute for filesystem exclusion.** Any generation/authority binding must strengthen existing AgentOS ownership/authority primitives rather than become a second authority or persistence plane.
4. **Replacement is not a mission transaction.** `ReplaceFile`/same-volume replacement can strengthen file publication, but inspect/test/verify/receipt are separate phases and require explicit recovery semantics.
5. **Ordinary successful writes are not proof of durable persistence.** Windows write-back caching means the selected protocol needs an explicit durability barrier and recovery treatment. `FlushFileBuffers`/write-through are candidates whose physical guarantees still require target-machine testing.
6. **PowerShell Execution Policy is not a security boundary.** Treat it as defense-in-depth only. Typed AgentOS operations remain preferable to arbitrary script text. Application Control + constrained language/JEA can be evaluated as layered hardening, not as replacement governance.
7. **Routine worker execution should target least privilege.** User-owned project inspection/mutation should not require an administrator token by default. Elevation should remain explicit and owner-gated for machine-wide/service/system-policy operations.
8. **Hosted Windows CI is not physical Windows acceptance.** Force termination, reboot/power interruption, AV/EDR interference, real ACLs, installer/update/rollback/uninstall and SmartScreen/signing behaviour require physical evidence.

## SG-08 candidate evaluation shortlist

These are research candidates only; no winner is declared.

### A. Existing Windows exclusive handle lifetime

Evaluate whether the current Windows handle can be treated as the canonical ownership token and whether the same semantic can be provided by an **already-existing** cross-platform dependency/runtime primitive.

Required proof:
- exclusive acquisition without pathname check-then-act;
- successor cannot acquire while owner token remains held;
- crash releases kernel ownership;
- token remains held through publish/prepared recovery and durable receipt;
- recovery distinguishes crashed owner from live owner without PID-age trust.

### B. Existing dependency wrapping OS file/byte-range locks

Search current dependencies before adding anything. If an existing dependency exposes `LockFileEx`/`flock`-class semantics with crash release and stable handle lifetime, evaluate it against O1–O18 and the pre-receipt false-success regression.

Do not add a new lock subsystem merely because an external library exists.

### C. Existing ownership primitive plus generation/authority binding

Evaluate binding the existing ownership token to current mission/task/worker correlation plus canonical authority/grant generation. This can reject stale logical transitions, but must not be used as a substitute for continuous kernel-backed exclusion.

## Physical Windows acceptance additions

When owner-gated physical testing begins, retain evidence for at least:

- standard-user install/start;
- bounded `repo.status` / `repo.diff`;
- bounded `test.run` / `audit.run`;
- controlled disposable-file mutation;
- two simultaneous writers;
- owner process killed before mutation, during temp write, after publish, after final verification, and before receipt;
- receipt directory write denied/fails;
- authority/grant revoked before publish and before receipt;
- replay and correlation mismatch;
- temp/rename collision;
- access denied/read-only target;
- Defender/EDR interference where available;
- reboot recovery at success-critical fault points;
- installer update, rollback, uninstall, reboot, and orphan process/task/service check.

Any changed file with a missing/unverifiable success receipt is non-green. Any state whose durability cannot be reconstructed is `RECOVERY_REQUIRED`/unknown, never success.

## PowerShell/install implications

For the first physical acceptance package, prefer the smallest reversible distribution that allows standard-user execution and clean evidence capture. A portable/per-user package is a reasonable acceptance vehicle; MSIX versus MSI/WiX remains a later packaging decision after runtime/service/update constraints are measured.

PowerShell containment evaluation should prioritize:

- typed operations instead of arbitrary script text;
- absolute executable paths;
- controlled environment and disabled profiles;
- canonical path/reparse-point checks;
- parameter validation;
- process-tree evidence and timeout/reconciliation;
- least-privilege identity;
- optional Application Control / constrained language / JEA evaluation as layered hardening.

## Supply-chain implications

Before a first broadly distributed installer, evaluate signed/timestamped artifacts, pinned dependencies/lockfile, SBOM, release hashes, protected release workflow, and GitHub artifact attestations. Artifact attestations prove build provenance, not that the artifact is safe; verification policy remains separate.

## Primary sources from external research to retain

- Microsoft Learn: CreateFileW/CreateFileA sharing semantics
- Microsoft Learn: Locking and Unlocking Byte Ranges / LockFileEx
- Microsoft Learn: ReplaceFileW / Moving and Replacing Files
- Microsoft Learn: File Caching / FlushFileBuffers / write-through flags
- Microsoft Learn: PowerShell security features / execution policy / language modes / App Control
- Microsoft Learn: Task Scheduler security contexts / LocalService / LocalSystem / DPAPI
- Microsoft Learn: Windows Installer rollback / MSIX overview and containerization / MSIX signing
- Git project: lockfile API
- SQLite: atomic commit and locking documentation
- GitHub Docs: artifact attestations and SLSA relationship

Access date for owner-supplied research: 2026-09-18 AEST.

## Controlling next step

Do not jump directly from this research to a new lock design. Continue the existing PR #104 decision gate:

1. scan current AgentOS dependencies and runtime modules for an existing kernel-backed cross-platform ownership primitive;
2. test any candidate against the required continuous-lifetime invariant and existing SG-08 regressions;
3. if no existing primitive satisfies it, keep SG-08 BLOCKED/HOLD and record the exact gap;
4. independently continue Windows install/bootstrap/diagnostics/recovery/rollback/uninstall acceptance preparation;
5. require exact-head Ubuntu + Windows CI, then independent Green/security/PRS and physical Windows acceptance on the unchanged candidate before promotion.

No overall GREEN is supported by this research.
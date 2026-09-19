# ChatGPT Overseer — Family Safety Vertical Batch 004

Date: 2026-09-19
Repository: `darrinbaldwindev/AgentOS`
Base evidence head: `1b27dc449e39b5c0a7ad5439956e1bad068ea79b`
Implementation anchor: PR #135 exact head `e5d744ce0cc160ce12b6183aaf173b5c79206d9c`
Manus evidence: `docs/research/MANUS-FAMILY-SAFETY-BATCH-002-REPORT-2026-09-19.md`

## Objective

Execute one maximised, bounded Family Safety hardening slice without widening authority or creating a second evidence plane.

Primary target: remove false-safe behavior identified by Manus and independently confirmed against #135, then preserve the existing #133 evidence contract for later expansion.

## Execution doctrine

FRESH SCAN → RECONCILE → PRIORITISE → EXECUTE DEEPLY → VERIFY → RECORD → REPLENISH → HANDOFF

## Verified starting facts

- PR #135 is OPEN/DRAFT/UNMERGED at `e5d744ce0cc160ce12b6183aaf173b5c79206d9c`.
- #135 uses fixed read-only noninteractive PowerShell through an injected executor.
- Current firewall logic can return `VERIFIED` for a non-empty but incomplete profile set.
- Current Defender logic maps any false `RealTimeProtectionEnabled` or `AntivirusEnabled` field directly to `NEEDS_ATTENTION`, without provider/running-mode context.
- Manus Batch 002 report recommends fail-closed completeness and third-party/provider ambiguity handling before broadening the adapter.
- #133 remains the canonical evidence composition plane and `safeClaimPermitted` remains false.

## P0 implementation slice

### A. Firewall completeness hardening

Require exactly one valid observation for each expected Windows firewall profile:
- Domain
- Private
- Public

Any missing profile, duplicate profile, unknown profile, malformed name, malformed enabled field, or partial collection must map to `UNKNOWN` rather than `VERIFIED`.

Only a complete expected profile set may produce:
- `VERIFIED` when all three are enabled;
- `NEEDS_ATTENTION` when the complete set is present and one or more are explicitly disabled.

### B. Defender semantic hardening

Do not claim `NEEDS_ATTENTION` merely because one Defender boolean is false when the adapter does not yet carry authoritative third-party AV/provider/running-mode context.

For this slice:
- both booleans true → `VERIFIED` for the narrow Defender proposition;
- either boolean false → `UNKNOWN` with explicit provider/mode-context reason;
- malformed/missing fields → `UNKNOWN`.

This is intentionally conservative. It trades a simplistic warning for truthful uncertainty until provider-aware evidence is implemented.

### C. Adversarial regression tests

Add deterministic tests covering:
- complete all-enabled firewall set → VERIFIED;
- complete set with one disabled → NEEDS_ATTENTION;
- omitted profile → UNKNOWN;
- duplicate profile → UNKNOWN;
- unexpected profile → UNKNOWN;
- malformed profile name/state → UNKNOWN;
- Defender both enabled → VERIFIED;
- Defender disabled/passive-like boolean combination → UNKNOWN rather than false NEEDS_ATTENTION;
- command failure/malformed output → UNKNOWN;
- fixed read-only noninteractive command invariant preserved.

## Deferred next bounded slice

Do not add new Windows checks in this batch until the P0 false-safe fixes pass exact-head CI. After exact-head success, the next recommended checks remain:
- `windows-session-admin-membership` — current-session proposition only, stable SID semantics, UNKNOWN on ambiguity;
- `windows-rdp-configuration` — bounded RDP configuration indicator only, not a claim that remote access is impossible.

They must reuse #133 rather than create another summary/evidence plane.

## Hard boundaries

No merge, mark-ready, approval, rebase, deployment, credential/security-setting change, production write, unrestricted PowerShell, elevation/admin action, physical-host execution, parental-control activation, device remediation, publication, spend, outreach, Green/PRS bypass, or whole-device SAFE/GREEN claim.

## Acceptance criteria

1. Existing fixed-command/read-only invariants remain intact.
2. Incomplete firewall evidence cannot produce VERIFIED.
3. Defender ambiguity cannot produce a misleading NEEDS_ATTENTION without provider/mode context.
4. Focused Family Safety tests pass on the exact implementation head.
5. Pull-request-triggered AgentOS Tests pass on that same head before any stronger claim.
6. PR remains DRAFT/UNMERGED.
7. Handoff records exact head, workflow run ID/conclusion, residual blockers, and no false-GREEN claim.

## Status boundary

This batch can prove only bounded adapter/test behavior. It cannot establish whole-device safety, parental-control enforcement, physical Windows acceptance, Green/PRS certification, or release readiness.

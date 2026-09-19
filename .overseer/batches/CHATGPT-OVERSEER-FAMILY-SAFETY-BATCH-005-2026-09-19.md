# ChatGPT Overseer — Family Safety Vertical Batch 005

Date: 2026-09-19
Repository: `darrinbaldwindev/AgentOS`
Base head: `38f95189db2ff40f76265cc99dbf20ce68841a8c` (PR #138)

## Objective

Execute the next bounded Family Safety slice vertically from the exact CI-green Batch 004 head.

Primary goals:
1. Add a current-session effective administrator-token check.
2. Add a bounded Windows Remote Desktop configuration check.
3. Compose all Windows posture findings through the existing #133 Family Safety evidence contract.
4. Preserve fail-closed semantics, read-only execution, and `safeClaimPermitted: false`.

## Execution doctrine

FRESH SCAN → RECONCILE → PRIORITISE → EXECUTE DEEPLY → VERIFY → RECORD → REPLENISH → HANDOFF

## Starting evidence

- PR #138 exact head `38f95189db2ff40f76265cc99dbf20ce68841a8c` passed AgentOS Tests run `35446057419`.
- Firewall completeness and Defender ambiguity hardening are already present on that exact head.
- #133 remains the canonical evidence composition plane.
- Manus Batch 002 recommended current-session administrator separation and RDP configuration as the next bounded read-only checks.
- No Batch 003 Manus report has yet superseded this recommendation.

## P0 implementation slice

### A. Effective current-session admin token

Use a fixed, read-only PowerShell expression based on `WindowsPrincipal.IsInRole(WindowsBuiltInRole.Administrator)`.

Interpretation is deliberately narrow:
- `false` → `VERIFIED`: the executing session does not present an effective administrator token.
- `true` → `NEEDS_ATTENTION`: the executing session presents an effective administrator token.
- malformed, missing, command failure, or ambiguous output → `UNKNOWN`.

This does not enumerate all local administrators and does not establish family-role identity.

### B. RDP configuration indicator

Use fixed read-only queries for:
- `fDenyTSConnections`; and
- `TermService` status.

Interpretation is deliberately narrow:
- deny=true + service stopped → `VERIFIED` for the assessed RDP configuration proposition;
- deny=false + service running → `NEEDS_ATTENTION` for RDP configured enabled/running;
- contradictory/intermediate/partial/malformed states → `UNKNOWN`.

This is not proof that remote access is impossible or externally reachable. Firewall, listener, network boundary, third-party remote tools, Remote Assistance, and policy precedence remain out of scope.

### C. Evidence composition

Convert adapter findings into `createFamilySafetyFinding(...)` objects and summarize them only with `summarizeFamilySafetyCheck(...)`.

Required check IDs for this bounded Windows summary:
- `windows-firewall`
- `windows-defender`
- `windows-session-admin-token`
- `windows-rdp-configuration`

No parallel summary/evidence plane is permitted.

### D. Adversarial regression coverage

Add tests for:
- effective admin token false/true/malformed/failure;
- RDP denied+stopped, enabled+running, contradictory, malformed, failure;
- all fixed commands remain read-only, noninteractive, caller-independent;
- summary composition preserves exact required IDs;
- an UNKNOWN child finding keeps overall summary UNKNOWN;
- a NEEDS_ATTENTION finding produces parent action required;
- `safeClaimPermitted` remains false even when all four assessed checks verify.

## Hard boundaries

No merge, mark-ready, approval, rebase, deployment, credential/security-setting change, production write, unrestricted PowerShell, elevation/admin mutation, physical-host action, parental-control activation, remediation, publication, spend, outreach, Green/PRS bypass, whole-device SAFE claim, or overall GREEN claim.

## Acceptance criteria

1. All four checks use fixed read-only commands only.
2. New checks fail closed to UNKNOWN on malformed/partial/contradictory evidence.
3. No new authority, scheduler, persistence, receipt, or evidence plane is introduced.
4. Summary uses the #133 evidence contract and `safeClaimPermitted` remains false.
5. Focused tests and pull-request-triggered AgentOS Tests pass on the same exact head.
6. PR remains DRAFT/UNMERGED.
7. Durable handoff records exact head, workflow run ID, remaining physical-Windows gap, and no false-GREEN claim.

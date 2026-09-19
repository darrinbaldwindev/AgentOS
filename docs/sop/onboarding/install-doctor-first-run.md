# SOP-ONBOARD-001 — Install, Doctor and First Run

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
Documentation must not imply an installer, doctor check, provider connection, Windows worker, browser control, mutation readiness or production capability exists until the exact implementation proves it.

## Evidence map
For every onboarding step record: platform/version; prerequisite; install mechanism; files/services/processes created; permissions requested; network destinations; credentials requested; local data paths; expected command/UI; success evidence; failure evidence; rollback/uninstall path; exact implementation head/version; current status (`PROVEN`, `IMPLEMENTATION-ADVANCED`, `PRODUCT DIRECTION`, `UNKNOWN`, `BLOCKED`).

## First-run sequence
1. Identify supported platform/version from current evidence.
2. Install only through an evidenced mechanism.
3. Run bounded doctor checks for executable identity, workspace access, required runtime/dependencies, canonical config, provider/capability state and required local services.
4. Show failed/unknown checks explicitly; do not auto-convert them to success.
5. Create/connect credentials only through approved secret handling; capability != authority.
6. Establish the canonical Overseer entry point.
7. Run a non-destructive acceptance task first.
8. Present receipt/evidence and separate worker success from Green/PRS.
9. Do not enable mutation or unattended work merely because read-only onboarding passed.

## Doctor truth
A doctor check proves only what it actually observed. Boolean `installed:true`, PATH presence or a UI badge is weaker than path/version-backed executable identity where the capability contract requires that evidence.

## Recovery
Partial install must preserve enough evidence to identify created artifacts and offer bounded retry/rollback. Never delete user files or credentials as a generic cleanup step.

## User documentation gate
Public quick-start instructions require the exact commands/screens to be revalidated against a release candidate. Until then, this SOP is an internal evidence contract, not a claim that one-click installation or complete first-run automation ships.
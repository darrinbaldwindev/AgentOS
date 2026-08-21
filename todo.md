# Project TODO

- [x] Dashboard shell with dark blueprint-inspired visual identity
- [x] Provider health status cards for all pre-configured providers
- [x] Deterministic mock affiliate traffic and conversion analytics
- [x] Provider selector with capability, cost, privacy, free-tier, disclosure, and health metadata
- [x] Typed phase-two integration adapter interfaces and connection state machine
- [x] Error-recovery fallback engine for rate limits, quotas, offline providers, capability mismatch, permissions, timeouts, partial streams, artifact conflicts, and referral failures
- [x] Append-only recovery event log with prompt and secret exclusion
- [x] Strict attribution event union limited to model_switch and referral_click
- [x] Affiliate parameter isolation from project and thread data
- [x] Owner-gated admin actions with live routing disabled by default
- [x] Responsive and accessible dashboard navigation and empty/loading/error states
- [x] Vitest coverage for fallback transitions, attribution invariants, and deterministic metrics
- [x] Run typecheck, tests, build, and browser screenshot verification
- [x] Save a final checkpoint after all completed items are marked [x]

## Follow-up hardening

- [x] Add explicit provider cost and health metadata to the selector panel and tests
- [x] Define and use typed IntegrationAdapter and related interface drafts
- [x] Implement an executable mock fallback engine for all recovery scenarios
- [x] Add an append-only sanitized recovery log helper that prevents rewrites
- [x] Add explicit empty, loading, and error states plus accessibility checks
- [x] Extend Vitest coverage to deterministic traffic and conversion metrics

## Final hardening pass

- [x] Add Vitest coverage for provider selector cost and health metadata
- [x] Implement explicit empty/loading/error states for providers, affiliate telemetry, adapters, and recovery log
- [x] Add accessibility-focused checks for navigation, labels, live regions, and keyboard-reachable controls

## Checkpoint evidence follow-up

- [x] Apply explicit loading/empty/error handling to affiliate telemetry and recovery log sections
- [x] Replace the hardcoded ready state with a meaningful mock dataset-state model
- [x] Add meaningful rendered-dashboard accessibility verification for labels, live regions, navigation, and keyboard reachability
- [x] Save and record a real webdev checkpoint

## Final verification correction

- [x] Implement real mock dataset-state transitions with tests for loading, empty, error, and ready states
- [x] Add a rendered accessibility probe test for the dashboard navigation and controls
- [x] Create and record the actual project checkpoint

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

## Authenticated chat, persistence, and telemetry expansion

- [x] Read and apply the LLM integration guidance for authenticated model-switch chat
- [x] Extend the database schema for append-only recovery records and attribution records scoped to the authenticated owner
- [x] Generate and apply the database migration through the project migration workflow
- [x] Add protected tRPC procedures for chat execution, recovery-event persistence, attribution-event persistence, and telemetry reads
- [x] Build an authenticated model-switch chat surface using the existing provider contracts and disclosure-safe attribution behavior
- [x] Persist recovery and attribution events without prompts, secrets, project identifiers, or thread identifiers
- [x] Add interactive affiliate telemetry charts with accessible labels, tooltips, and responsive layouts
- [x] Add Vitest coverage for persistence helpers, protected procedures, chat model switching, attribution isolation, and chart data shaping
- [x] Verify the expanded dashboard with tests, production build, responsive screenshots, and accessibility checks
- [x] Save a checkpoint for the completed expansion

## Final correction pass

- [x] Add a protected telemetry read procedure and wire the affiliate chart to typed backend telemetry data
- [x] Add a real model selector and model-switch workflow to the authenticated chat UI
- [x] Add direct router-caller and persistence-helper tests for protected AgentOS procedures
- [x] Add chart data-shaping tests and rendered accessibility tests for the actual Home and Chat surfaces
- [x] Save a checkpoint after all correction items are complete

## Checkpoint evidence repair

- [x] Add direct persistence-helper tests for append/list behavior and safety fields
- [x] Add a rendered accessibility test for the actual Home page, including live regions, provider labels, telemetry range controls, and keyboard-reachable actions
- [x] Create a new checkpoint after the complete expansion and correction pass

## Final accessibility evidence

- [x] Assert actual Home select, button, live-region, and range-control elements in rendered markup
- [x] Create and record the post-expansion checkpoint

## Owner control plane RBAC and end-user chat

- [x] Define owner/admin versus authenticated end-user route and procedure boundaries
- [x] Add server-side RBAC middleware for admin and configured-owner authorization
- [x] Lock down owner dashboard routes, telemetry, recovery, attribution, and routing procedures
- [x] Add explicit unauthorized and forbidden states for owner-only surfaces
- [x] Create a separate end-user chat route and layout that does not expose owner telemetry or recovery controls
- [x] Add direct RBAC tests for owner, admin, ordinary user, and unauthenticated callers
- [x] Verify the protected owner dashboard and separate end-user chat responsively
- [x] Save a checkpoint after the RBAC and end-user chat work is complete

## Final RBAC evidence repair

- [x] Add a direct test proving a non-admin configured owner ID is allowed through owner-only procedures
- [x] Capture and review post-RBAC mobile screenshots for the owner dashboard, owner chat, and end-user chat
- [x] Save the RBAC checkpoint after all evidence items are complete

## Mobile screenshot review

- [x] Review settled mobile screenshots for the owner dashboard, owner chat, and end-user chat and record responsive findings
- [x] Fix any owner-chat mobile clipping or loading-state presentation issues found during review
- [x] Save the final RBAC checkpoint after the mobile review is complete

## Autonomous chat, telemetry export, and admin identity enhancement

- [x] Add end-user typing indicators with accessible live status
- [x] Add end-user message history view with clear current-session separation
- [x] Add date-range filtering to affiliate telemetry using typed backend data
- [x] Add governed CSV export for filtered affiliate telemetry
- [x] Add prominent admin/owner identity badge and visual treatment to the control plane
- [x] Add tests for typing state, message history, date filtering, CSV serialization, and admin identity rendering
- [x] Verify desktop/mobile accessibility and responsive behavior
- [ ] Save a checkpoint after all enhancement work is complete

## Final enhancement evidence repair

- [x] Add rendered tests for the actual admin/owner badge and both ready/typing end-user chat states
- [x] Capture and review settled post-enhancement desktop screenshots for the owner dashboard, owner chat, and end-user chat
- [x] Re-capture settled post-enhancement mobile screenshots if the loading-state frame persists
- [ ] Save the final enhancement checkpoint after all evidence items are complete

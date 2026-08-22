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
- [x] Save a checkpoint after all enhancement work is complete

## Final enhancement evidence repair

- [x] Add rendered tests for the actual admin/owner badge and both ready/typing end-user chat states
- [x] Capture and review settled post-enhancement desktop screenshots for the owner dashboard, owner chat, and end-user chat
- [x] Re-capture settled post-enhancement mobile screenshots if the loading-state frame persists
- [x] Save the final enhancement checkpoint after all evidence items are complete

## End-user chat and telemetry usability enhancement

- [x] Add safe markdown rendering for end-user assistant messages
- [x] Add copy-to-clipboard actions with accessible success/failure status
- [x] Add a New Conversation action that clears current-session history and pending state
- [x] Add telemetry summary cards for total clicks, signups, conversion rate, and active users
- [x] Add tests for markdown output, copy controls, reset behavior, and summary metrics
- [x] Verify responsive and accessible desktop/mobile rendering
- [x] Save a checkpoint after all usability enhancements are complete

## Final usability evidence repair

- [x] Add a user-visible and accessible copy failure status and test success/failure behavior
- [x] Isolate New Conversation from stale in-flight chat responses and reset pending state safely
- [x] Add a behavior test proving reset clears rendered history/input and ignores stale replies
- [x] Record final desktop/mobile review findings for markdown, copy, reset, and telemetry summary cards
- [x] Save the final usability checkpoint after all evidence items are complete

## Interactive behavior evidence repair

- [x] Add a component interaction test that simulates clipboard success and failure and asserts visible/live-region status changes
- [x] Add an end-user chat interaction test that triggers New Conversation, clears rendered history/input, and ignores a stale pending response
- [x] Save the final usability checkpoint after interactive evidence is complete

## Reusable skill formalization

- [x] Define the reusable AgentOS governed-dashboard workflow and trigger conditions
- [x] Initialize the agentos-governed-dashboard skill with skill-creator
- [x] Author concise imperative SKILL.md guidance for TODO-led development, RBAC, persistence, testing, evidence, and checkpointing
- [x] Add only reusable references or templates that materially improve repeat use
- [x] Validate the skill with quick_validate.py and revise any failures
- [x] Save the canonical skill deliverable in the project shared Files & Sources area
- [x] Deliver the validated skill package to the user

Progress note: Preserve strict owner-gated routing, no secrets in logs, append-only audit/persistence patterns, evidence-based verification, and recoverable checkpoint delivery while keeping the skill concise and progressively disclosed.

Source of truth: /home/ubuntu/skills/skill-creator/SKILL.md and the completed AgentOS dashboard workflow in this project.

Append-only history: new skill formalization requested by the user after the final dashboard usability checkpoint.

## Provider contracts and deterministic mock adapters

- [x] Define typed provider, model, agent, integration, execution, context, artifact, tool, credential, and attribution contracts
- [x] Define explicit connection and execution states for available, needs connection, limited, offline, permission denied, rate limited, degraded, timeout, streaming, and error outcomes
- [x] Implement deterministic local mock adapters with no network calls or external credentials
- [x] Add fixtures covering normal, limited, offline, permission-denied, rate-limited, degraded, timeout, partial-stream, and error states
- [x] Add direct tests for contract invariants, adapter transitions, capability fit, and attribution isolation
- [x] Run tests, typecheck, production build, and evidence review for the contract/mock-adapter phase
- [x] Record verification evidence in shared Files & Sources
- [x] Save a recoverable checkpoint for the contract/mock-adapter phase

## Governed local orchestration boundary

- [x] Define the deterministic catalog, health, route-resolution, and mock-execution API contracts
- [x] Enforce authenticated versus owner/admin boundaries for local orchestration procedures
- [x] Implement local catalog, health, route-resolution, and mock-execution procedures without external calls
- [x] Ensure route resolution is capability-first, consent-aware, and never activates affiliate routing
- [x] Add direct router tests for access control, deterministic responses, failure semantics, and attribution isolation
- [x] Run the full test suite, typecheck, production build, and record shared verification evidence
- [x] Save a recoverable checkpoint for the local orchestration phase

## Local orchestration consent evidence repair

- [x] Encode that granted and declined consent are visible in route resolution but never alter capability-first local routing while affiliate routing is disabled
- [x] Add direct tests covering both consent states and non-activation of attribution or affiliate routing
- [x] Rerun verification and update the shared orchestration evidence record

## Autonomous continuation after local orchestration

- [x] Reassess the current repository, shared records, and local-safe backlog candidates
- [x] Select and define the next highest-value deterministic implementation task before editing code

## Autonomous recovery event schema phase

- [x] Define append-only sanitized local recovery-event shapes for execution, model switch, fallback selection, provider status, consent, referral click, redirect failure, tool failure, and recovery action
- [x] Implement deterministic recovery-event mapping from local orchestration outcomes without persistence or external side effects
- [x] Add tests for event allowlisting, prompt/secret/context exclusion, event ordering, and failure mapping
- [x] Run the full test suite, typecheck, production build, and record shared verification evidence
- [x] Save a recoverable checkpoint for the autonomous recovery-event schema phase

## Autonomous owner health and recovery guidance UI

- [x] Inspect the existing owner control-plane components and local orchestration data before UI changes
- [x] Define accessible local-provider health and recovery guidance states without live-provider claims
- [x] Render owner-only deterministic provider health, retry timing, and recovery guidance from the local orchestration procedure
- [x] Add rendered and interaction tests for labels, loading/error states, and recovery guidance visibility
- [x] Review settled desktop and mobile views, run the full test suite, typecheck, and production build
- [x] Record shared verification evidence
- [x] Save a recoverable checkpoint for the owner health and recovery guidance UI

## Autonomous end-user local route preview

- [x] Inspect end-user chat selections and local route contracts before UI changes
- [x] Define an end-user-safe route preview that excludes owner telemetry, operational logs, credentials, affiliate controls, and live-provider claims
- [x] Render local mock route readiness and non-sensitive recovery guidance without changing chat execution routing
- [x] Add rendered and interaction tests for preview ready, limited, unavailable, and isolation states
- [x] Review settled desktop/mobile views, run the full test suite, typecheck, production build, and record evidence
- [x] Save a recoverable checkpoint for the end-user route preview phase

## Autonomous end-user catalog projection

- [x] Inspect current local catalog, adapter, and end-user selection contracts
- [x] Define a minimal authenticated end-user catalog projection excluding affiliate fields, operational logs, credentials, agents, integrations, and live-routing controls
- [x] Implement the filtered local catalog procedure without changing chat execution or provider activation
- [x] Add direct tests for authentication, stable catalog values, and excluded sensitive fields
- [x] Run full verification and record shared evidence
- [x] Save a recoverable checkpoint for the end-user catalog projection phase

## Autonomous end-user catalog consumption

- [x] Inspect selector model identifiers and filtered catalog compatibility
- [x] Define safe local catalog loading, fallback, selection-reset, and accessibility behavior without changing chat execution
- [x] Consume the filtered end-user catalog in provider and model selectors with a deterministic local fallback
- [x] Add rendered and interaction tests for catalog loading, fallback, and provider/model selection behavior
- [x] Review desktop/mobile behavior, run full verification, and record shared evidence
- [x] Save a recoverable checkpoint for the end-user catalog consumption phase

## End-user catalog model-selector completion

- [x] Consume filtered catalog model options in the end-user model selector while retaining deterministic fallback IDs and unchanged chat execution
- [x] Reset the selected model deterministically when a catalog-backed provider changes
- [x] Add rendered and interaction coverage for catalog-backed model options, fallback options, and provider-driven model reset
- [x] Rerun verification and update the shared catalog-consumption evidence record

## End-user catalog fallback model evidence repair

- [x] Verify deterministic fallback model options render when the filtered catalog is loading or unavailable
- [x] Rerun focused and full verification, then update the shared catalog-consumption evidence record

## Privacy-first persistent conversations and retention

- [x] Inspect current database schema, chat flow, persistence helpers, shared records, and relevant governance guidance
- [x] Define user ownership, retention period, deletion semantics, audit boundaries, and prohibited stored content
- [x] Add schema tables and migration for private conversations and messages with user-scoped ownership and retention metadata
- [x] Implement governed conversation create/list/read/append/delete procedures with no cross-user access and no owner-control-plane content
- [x] Integrate private conversation restoration and deletion controls into the end-user chat workspace
- [x] Add direct persistence, RBAC, retention, deletion, and rendered interaction tests
- [x] Run migration, full verification, responsive review, and record shared privacy evidence
- [x] Save a recoverable checkpoint for the persistent conversation and retention phase

## Autonomous post-retention privacy control

- [x] Inspect existing private-conversation privacy controls, tests, shared evidence, and task ledger
- [x] Select a concrete local privacy-control improvement before editing application code

## User-scoped clear-all private conversation control

- [x] Implement a user-scoped hard-delete-all private conversations helper and authenticated procedure with no owner override
- [x] Add a confirmation-gated end-user workspace control that clears only the caller’s saved history and starts a fresh local session
- [x] Add direct persistence, router, rendered, and interaction tests for clear-all isolation, cancellation, and completion
- [x] Run full verification, review desktop/mobile layouts, and record privacy evidence
- [x] Save a recoverable checkpoint for the clear-all private history control

## Clear-all private history failure hardening

- [x] Inspect existing destructive-action error handling and clear-all interaction coverage
- [x] Preserve saved history and provide accessible failure feedback when clear-all storage deletion fails
- [x] Add interaction coverage for failure, cancellation, and successful completion states
- [x] Run full verification and update shared privacy evidence
- [x] Save a recoverable checkpoint for the clear-all failure-hardening phase

## Direct saved-history deletion without restore

- [x] Inspect saved-history list, individual deletion behavior, and existing user-scoped router guarantees
- [x] Add confirmation-gated direct deletion for a selected saved conversation without loading its message content
- [x] Preserve active-session behavior and provide safe failure feedback when direct deletion is unavailable
- [x] Add router, rendered, and interaction tests for direct deletion, cancellation, failure, and isolation
- [x] Run full verification and record shared privacy evidence
- [x] Save a recoverable checkpoint for direct saved-history deletion without restore

## Private conversation restore-failure recovery

- [x] Inspect restore queries, retention-expiry behavior, and current unavailable-record handling
- [x] Return to a fresh local session with safe feedback when a selected conversation is unavailable or expired
- [x] Add rendered and interaction coverage for unavailable and storage-error restore outcomes without message exposure
- [x] Run full verification and record shared privacy evidence
- [x] Save a recoverable checkpoint for private conversation restore-failure recovery

## Active private-conversation deletion failure hardening

- [x] Inspect active-conversation deletion, confirmation, and storage-failure behavior
- [x] Preserve the active local session and give safe feedback if confirmed active deletion fails
- [x] Add interaction coverage for active deletion failure and successful retry boundaries
- [x] Run full verification and record shared privacy evidence
- [x] Save a recoverable checkpoint for active private-conversation deletion failure hardening

## Owner guidance interaction evidence repair

- [x] Add an owner-only local guidance refresh interaction and direct component interaction test
- [x] Rerun verification and update the shared owner guidance evidence record

## Task Discovery agent handoff design

- [x] Inspect the canonical AgentOS Autonomous task records and discovery inputs
- [x] Draft copy-ready Task Discovery agent instructions with governed append-only handoff rules
- [x] Explain the canonical file update process, required task schema, and execution boundaries

## Shared autonomous-agent log reconciliation

- [x] Inventory canonical shared and execution-copy backlog and progress-log locations
- [x] Compare log content and record synchronization gaps without overwriting historical entries
- [x] Define and record a safe append-only shared-log handoff procedure for Task Discovery and AgentOS Autonomous
- [x] Report the shared-log status, limits, and next coordination step

## First governed Task Discovery pass

- [x] Inspect canonical shared records, execution mirrors, and current project evidence read-only
- [x] Identify and validate one evidence-backed executor-ready task without implementing it
- [ ] Reconcile the discovered progress-log conflict after the project coordinator selects the authoritative history
- [x] Verify record synchronization state and capture the first Task Discovery log output

# AgentOS Autonomous Task Backlog

**Version:** 2026-08-21-A3-complete
**Operating mode:** Choice C with recommended limits
**Working copy:** `/home/ubuntu/agentos-autonomous-worktree/repo`
**Purpose:** Guide autonomous continuation when the user asks to continue or when there is safe work between instructions.

## Operating policy

AgentOS autonomous work may proceed on local documentation, schemas, mock adapters, prototype UI, dependency-free validation, test drafting, static analysis, and isolated worktree changes. Work must remain evidence-based and must preserve historical records.

Every task must begin with a short preflight: confirm the working path, inspect relevant records, identify the exact files to change, verify that no external credentials or services are required, and define a local validation step. Every task must end with a result classification of `COMPLETED`, `PARTIAL`, `BLOCKED`, or `FOLLOW-UP`.

**Role separation:** AgentOS Autonomous is the backlog executor. The current project coordinator may maintain, reprioritize, annotate, or correct this backlog and its append-only progress log. The executor must use the latest project-visible copy, must not erase another executor’s history, and must report any backlog change discovered during a task.

A task must stop immediately if it requires external credentials, live provider activation, affiliate-network calls, provider outreach, MCP activation, background scheduling, deployment, publication, monetization changes, architecture sign-off, or a claim of security, production, or release readiness. Those actions remain owner-gated.

## Priority 0 — Safe continuation tasks

### A0. Keep the autonomous backlog current

Review this file at the start of autonomous continuation. Mark completed work in a separate append-only progress report rather than rewriting history. Add newly discovered local tasks only when their scope, files, validation, and stop conditions are clear.

### A1. Keep the worktree integrity baseline current

Run read-only inventory, JSON parsing, file-type, symlink, permissions, and credential-marker checks against the isolated worktree. Compare baseline hashes for protected records. Do not modify the supplied archive.

### A2. Reconcile documentation drift

Compare the continuity index, coordination ledger, task briefs, role charters, research manifests, provider preload, capability matrix, and integration manifest. Produce a discrepancy report with exact paths. Do not silently rewrite historical records.

### A3. Expand local mock validation — COMPLETED

Extend the dependency-free dry-run harness for provider selection, context overflow, quota exhaustion, provider offline state, capability mismatch, permission denial, tool timeout, partial stream recovery, artifact conflict, and referral failure. The harness must not perform network calls or redirects.

**Completion evidence:** `agents/tools/dry_run_provider_selector.py` now exercises all listed scenarios. The executed run passed for normal switching, active streaming, explicit stop-and-switch, consent decline, consent-approved dry-run redirect isolation, context overflow, rate limits, provider offline, capability mismatch, permission denial, tool timeout, partial stream recovery, artifact conflict, and referral failure. No network call, redirect opening, or automatic monetized fallback occurred.

### A4. Add and review typed interface drafts

Create TypeScript interface drafts for provider records, model records, agent profiles, integration states, execution state, context state, artifacts, tool records, credential connections, and attribution state. Validate them structurally or with a local parser if available. Do not claim compilation without a frontend build tree.

## Priority 1 — Local frontend and backend provisions

### B1. Improve the sample fallback UI

Refine `agents/ui/prototype/agentos_fallback_sample.html` and `IntegrationFallbackManager.tsx` for accessibility, keyboard navigation, provider health labels, context overflow warnings, and explicit streaming recovery states. Keep the sample self-contained and offline.

### B2. Draft mock adapters

Create local mock adapters for `available`, `needs_connection`, `limited`, `offline`, `permission_denied`, `rate_limited`, `degraded`, and `error` integration states. Use deterministic fixtures and no external network calls.

### B3. Draft frontend test fixtures

Add fixtures for local models, free providers, affiliate-supported providers, non-affiliate integrations, unverified providers, expired programs, and provider health transitions. Ensure fixtures make affiliate status secondary to capability fit.

### B4. Refine the fallback API contract

Extend `agents/api/INTEGRATION_FALLBACK_API.md` with request/response examples for context overflow, stream interruption, tool failure, artifact conflict, idempotency, SSE reconnection, and error correlation. Do not implement live endpoints unless a real frontend/backend project is attached or initialized.

### B5. Add a local API mock specification

Create a local-only mock API or fixture contract for catalog, health, route resolution, model switching, consent, dry-run redirects, and recovery. It must return deterministic data and never contact providers.

### B6. Draft recovery event schemas

Define append-only local event shapes for execution, model switch, fallback selection, provider status, consent, referral click, redirect failure, tool failure, and recovery action. Exclude prompts, secrets, repository contents, and private artifact data from attribution events.

## Priority 2 — Research and catalog maintenance

### C1. Reconcile provider catalog evidence

Compare the provider preload against `Affiliate Chat.md`, the affiliate CSV, research briefs, official program evidence, and current verification states. Mark entries as verified, pending, expired, non-affiliate integration, or verify-before-activation. Do not activate routing.

### C2. Build a capability comparison matrix

Map available models and agents against streaming, tools, vision, JSON, audio, context size, local availability, privacy, cost, free-tier status, and required integrations. Use only repository evidence or clearly labeled assumptions.

### C3. Improve provider-health policy

Draft local health-state rules, last-checked timestamps, retry-after handling, stale-status labels, and fallback recommendations. Never infer availability from an absent health check.

### C4. Review affiliate disclosure and neutrality

Inspect provider cards, landing-page copy, referral flows, and routing rules for clear disclosure, opt-in consent, non-affiliate alternatives, neutral ranking, and no silent monetized fallback.

## Priority 3 — Documentation and product planning

### D1. Maintain the frontend provisions document

Keep `FRONTEND_PROVISIONS.md` aligned with capability and integration manifests. Add new UI states only when their recovery and permission behavior are defined.

### D2. Maintain the phase-two roadmap

Update the phase-two integration plan with sequencing, mock-first requirements, error states, accessibility, data minimization, and release gates. Keep live integrations owner-gated.

### D3. Prepare product and landing-page copy variants

Draft concise copy for the free suite, local-first mode, persistent project workspace, model switching, affiliate transparency, and provider-neutrality. Avoid claims of live availability or guaranteed free quotas.

### D4. Prepare presentation and review materials

Create or update internal reports, diagrams, or slides only from verified repository evidence. Distinguish original concept, current specification, prototype status, and runtime proof.

## Priority 4 — Deferred until prerequisites exist

### E1. Compile and run frontend tests

Blocked until a real frontend project with package manifest, React dependencies, test runner, and build configuration is attached or initialized.

### E2. Implement backend endpoints

Blocked until a real backend project and persistence/auth boundary are available. Begin with local mock endpoints before live provider adapters.

### E3. Add live provider connections

Blocked until the owner approves provider scope, credentials, privacy treatment, health checks, and failure handling for each integration.

### E4. Activate affiliate routing

Blocked until current official terms are verified, disclosure and consent are approved, provider-approved parameters are allowlisted, and the owner authorizes activation.

### E5. Create or activate specialist agents

Blocked until the owner approves a named role charter, bounded task brief, visible inputs, stop conditions, and evidence-review process.

### E6. Create background schedules

Blocked until the owner specifies cadence, task scope, expiration, delivery destination, and whether each run may create a fresh task. Never create an indefinite schedule from this backlog alone.

## Autonomous continuation algorithm

When asked to continue, select the highest-priority incomplete task whose prerequisites are satisfied. After A3, use this execution sequence: A4 typed interface drafts; B2 deterministic mock adapters; B3 frontend test fixtures; B5 local API mock specification; B6 recovery event schemas; B1 UI refinement; B4 API-contract refinement; then C-series catalog, capability, health, and disclosure reviews. Prefer local contracts and tests before UI polish or research expansion. Before executing, confirm that the task does not require owner-gated capabilities. After execution, validate locally, write a concise progress report, and attach changed artifacts.

When no safe task remains, report the blocker and identify the next owner decision instead of inventing work. Do not treat silence as approval for live integrations, credentials, background scheduling, deployment, or release claims.

## Execution strategy update

A3 is complete. The priority ordering now favors **contract-to-test-to-adapter** progression over broad feature expansion. Typed interfaces should come first because they stabilize the boundary between the provider catalog, integration manifest, prototype UI, mock adapters, and future backend. Deterministic mock adapters and fixtures should follow, then a local API mock and recovery event schemas. UI refinement and API prose refinement should follow those executable contracts. Live integrations and all owner-gated tasks remain deferred.

## Current recommended next task

The next recommended task is **A4: add and review typed interface drafts** for provider records, model records, agent profiles, integration states, execution state, context state, artifacts, tool records, credential connections, and attribution state. This task is local, deterministic, and directly enables the next B-series mock and test tasks.

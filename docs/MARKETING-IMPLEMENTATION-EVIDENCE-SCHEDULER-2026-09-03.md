# AgentOS — Marketing Implementation Evidence: Governed Wake Paths — 2026-09-03

**Owner:** Marketing Overseer  
**Status:** VERIFIED REPOSITORY EVIDENCE / EXECUTION CLAIMS BOUNDED  
**Scope:** Marketing evidence mapping only.

## Evidence inspected

The repository contains both a governed GitHub scheduled-wake test path and a persistent local wake implementation.

The GitHub path invokes `runGitHubWakeCycle` through `scripts/scheduled-wake-test.mjs`. The test constructs a governed task with issuer, target, required capability, authority grant, acceptance criteria and wake trace, then applies authority, lease and idempotency controls. The workflow requires a GREEN result before recording durable scheduler evidence.

The repository also now contains `runtime/local-wake.mjs`, which is bound to the existing governed worker registry and canonical boot/dispatch/authority/worker-contract/persistence primitives. The local wake path is explicitly fail-safe: it requires `DRY_RUN`, `autonomyEnabled === false`, `PRE_AUTHORIZED` consent, capability matching, and prohibition of production scope/credentials. It selects an enabled registered deterministic worker, runs one bounded local Project Overseer cycle, validates the response schema, records durable artifacts/events and reconciles a mission budget.

The package exposes `install:local`, `doctor:local`, `boot:local` and `wake:local` scripts, while the documented installer creates `~/.agentos/` or `AGENTOS_HOME` with runtime configuration and local state.

## What is verified

- A governed GitHub scheduled/manual wake test path is implemented.
- A persistent local wake implementation is present in the repository.
- The local wake implementation reuses canonical AgentOS governance primitives rather than introducing a separate runtime architecture.
- Local wake is bounded to safe DRY_RUN execution with autonomy disabled and production scope prohibited.
- Worker selection is capability-gated through the existing worker registry.
- Local response schema validation and durable persistence are implemented.
- Local mission budget reservation/reconciliation is implemented.
- Local installation, doctor, boot and wake entry points are implemented in package scripts.

## What is NOT yet verified

Repository implementation is not proof that the local runtime has actually been installed and executed on Darrin's host.

Not verified from repository inspection alone:

- physical local-host installation;
- successful execution of `npm run install:local` on the target host;
- successful `npm run doctor:local` result on the target host;
- successful unattended local wake execution on the target host;
- scheduler-driven invocation of the installed local runtime;
- production/provider execution;
- customer workflow execution;
- customer outcome improvement;
- adoption or willingness to pay.

## Marketing interpretation

**Updated verified capability signal:** AgentOS has repository implementation for both governed scheduled wake testing and a persistent, safe local Project Overseer wake cycle. This is materially stronger implementation evidence than the earlier scheduler-test-only picture.

However, the distinction between **IMPLEMENTED** and **EXECUTED/ASSURED ON A REAL HOST** must remain explicit. Marketing must not describe the local runtime as proven operational in production until host-level evidence exists.

## Mapping to proof sequence

| Proof field | Current evidence | State |
|---|---|---|
| Trigger | GitHub scheduled/manual workflow; local manual wake entry point | VERIFIED IMPLEMENTATION |
| Workers/models | Registered deterministic local worker; scheduler test worker | VERIFIED IMPLEMENTATION/TEST |
| Policy/authority | Capability + authority policy + consent checks | VERIFIED IMPLEMENTATION |
| Execution | GitHub wake test; local bounded wake cycle implementation | VERIFIED IMPLEMENTATION/TEST |
| Challenge/review | No customer workflow demonstration | UNKNOWN |
| Assurance | Response schema validation, assertions, durable artifacts/events, budget reconciliation | VERIFIED IMPLEMENTATION/TEST |
| Acceptance | Explicit response/test criteria | VERIFIED IMPLEMENTATION/TEST |
| Failure path | Fail-closed validation and exception path | VERIFIED IMPLEMENTATION |
| Customer baseline/result | None | UNKNOWN |

## Highest-value next marketing gate

The former gate was to identify whether a Project Overseer workflow existed. Repository evidence now shows a concrete local Project Overseer control-cycle implementation. The next gate is therefore **host-level execution evidence**: installation → doctor → boot → wake → returned response → durable state → verification.

This evidence should be obtained by the implementation/runtime authority, not inferred by Marketing Overseer from source code.

## Source evidence

- `runtime/local-wake.mjs`
- `scripts/install-local.mjs`
- `scripts/doctor-local.mjs`
- `scripts/boot-local.mjs`
- `.github/workflows/scheduler-roundtrip-test.yml`
- `scripts/scheduled-wake-test.mjs`
- `schemas/project-overseer-response-v1.json`
- existing AgentOS marketing proof and claim-guardrail documents

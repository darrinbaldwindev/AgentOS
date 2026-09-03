# AgentOS — Marketing Implementation Evidence: Governed Wake Paths — 2026-09-03

**Owner:** Marketing Overseer  
**Status:** VERIFIED REPOSITORY EVIDENCE / EXECUTION CLAIMS BOUNDED  
**Scope:** Marketing evidence mapping only.

## Evidence inspected

The repository contains a governed GitHub scheduled-wake test path, a persistent local wake implementation, and a Windows scheduler bridge intended to connect the host scheduler to the governed local wake path.

The GitHub path invokes `runGitHubWakeCycle` through `scripts/scheduled-wake-test.mjs`. The test constructs a governed task with issuer, target, required capability, authority grant, acceptance criteria and wake trace, then applies authority, lease and idempotency controls. The workflow requires a GREEN result before recording durable scheduler evidence.

The repository also contains `runtime/local-wake.mjs`, bound to the existing governed worker registry and canonical boot/dispatch/authority/worker-contract/persistence primitives. The local wake path is fail-safe: it requires `DRY_RUN`, `autonomyEnabled === false`, `PRE_AUTHORIZED` consent, capability matching, and prohibition of production scope/credentials. It selects an enabled registered deterministic worker, runs one bounded local Project Overseer cycle, validates the response schema, records durable artifacts/events and reconciles a mission budget.

New repository evidence defines a Windows scheduler bridge acceptance path: `Windows Task Scheduler -> scheduler-tick.mjs -> governed local-wake -> registered worker -> durable local evidence`. The documented bridge is disabled by default, performs one bounded wake per invocation, and requires an explicit first-test enablement. Acceptance requires a fresh `COMPLETED` scheduler record with unique task/wake trace identifiers, mission and worker provenance, timestamp and durable evidence, followed by exact reconciliation against persistent AgentOS state.

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
- A Windows scheduler registration/tick bridge and explicit acceptance procedure are documented in the repository.
- The scheduler acceptance contract requires persistent task/wake provenance and durable evidence rather than treating scheduler acknowledgement as proof.

## What is NOT yet verified

Repository implementation is not proof that the local runtime has actually been installed and executed on Darrin's host.

Not verified from repository inspection alone:

- physical local-host installation;
- successful execution of `npm run install:local` on the target host;
- successful `npm run doctor:local` result on the target host;
- successful unattended local wake execution on the target host;
- scheduler-driven invocation of the installed local runtime;
- a fresh accepted Windows scheduler round trip;
- production/provider execution;
- customer workflow execution;
- customer outcome improvement;
- adoption or willingness to pay.

## Marketing interpretation

**Updated verified capability signal:** AgentOS now has repository implementation for governed scheduled wake testing, a persistent safe local Project Overseer wake cycle, and a defined Windows scheduler bridge acceptance path. This strengthens the evidence for a credible host-runtime architecture, but it is still implementation evidence rather than proof of execution on a real host.

Marketing must keep **IMPLEMENTED** separate from **EXECUTED/ASSURED ON A REAL HOST**. The Windows bridge should not be marketed as operational or unattended until a fresh host-level round trip is captured and independently reconciled.

## Mapping to proof sequence

| Proof field | Current evidence | State |
|---|---|---|
| Trigger | GitHub scheduled/manual workflow; local wake entry point; Windows scheduler bridge | VERIFIED IMPLEMENTATION |
| Workers/models | Registered deterministic local worker; scheduler test worker | VERIFIED IMPLEMENTATION/TEST |
| Policy/authority | Capability + authority policy + consent checks | VERIFIED IMPLEMENTATION |
| Execution | GitHub wake test; local bounded wake implementation; Windows bridge implementation | VERIFIED IMPLEMENTATION/TEST |
| Challenge/review | No customer workflow demonstration | UNKNOWN |
| Assurance | Response schema validation, assertions, durable artifacts/events, budget reconciliation | VERIFIED IMPLEMENTATION/TEST |
| Acceptance | Explicit scheduler and response criteria | VERIFIED IMPLEMENTATION/TEST |
| Failure path | Fail-closed validation and exception path | VERIFIED IMPLEMENTATION |
| Customer baseline/result | None | UNKNOWN |

## Highest-value next marketing gate

The immediate marketing gate remains **host-level execution evidence**: install -> doctor -> boot -> register scheduler -> confirm disabled state -> explicitly enable for first test -> wait for one bounded wake -> inspect scheduler record -> reconcile task/trace/response against persistent AgentOS state.

This evidence should be obtained by the implementation/runtime authority, not inferred by Marketing Overseer from source code.

## Source evidence

- `runtime/local-wake.mjs`
- `scripts/install-local.mjs`
- `scripts/doctor-local.mjs`
- `scripts/boot-local.mjs`
- `scripts/install-windows-scheduler.ps1`
- `scripts/scheduler-tick.mjs`
- `docs/SCHEDULER_BRIDGE_ACCEPTANCE.md`
- `.github/workflows/scheduler-roundtrip-test.yml`
- `scripts/scheduled-wake-test.mjs`
- `schemas/project-overseer-response-v1.json`
- existing AgentOS marketing proof and claim-guardrail documents

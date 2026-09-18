# AgentOS Server — Worker and Host Identity Map

Status: DRAFT / evidence-controlled
Workstream: S-SRV-04
Server lineage: AgentOS PR #119
Dependency lineage scanned: AgentOS PR #104 head `607f2683b7d3b234fc6ffa70e2a7d42e31499c3a`

## Purpose

Bind the Server worker/host identity design to exact existing AgentOS primitives and make explicit what those primitives do not prove.

## Existing host identity primitive — REUSE

`runtime/remote-host-identity.mjs` provides a persistent opaque local host identity per AgentOS state root.

Verified characteristics:
- schema version 1;
- persistent `host_id` plus creation time;
- creates parent directory as needed;
- exclusive temporary file creation;
- attempts atomic first-create through hard link semantics;
- concurrent first-start collision resolves by loading the already-created identity;
- state is reused across scheduler/process restarts.

The source explicitly states that host identity does **not** authenticate a remote caller and does **not** grant execution authority.

Server implication: reuse this local host identity where its storage/runtime assumptions fit. Do not create another host identity namespace merely because Server adds a network boundary.

## Existing worker contract — REUSE / ADAPT

`src/workers/worker-contract.mjs` requires:
- worker `id`;
- capability array;
- `execute(task)` function.

Execution returns worker ID, success/error and latency.

Server implication: add observational evidence around this contract instead of redefining what a worker is.

## Existing runtime surface — REUSE evidence

The active #104 runtime tree already contains:
- `runtime/agent-health.mjs`;
- `runtime/agent-capability.mjs`;
- `runtime/remote-host-identity.mjs`;
- `runtime/remote-pickup-eligibility.mjs`;
- `runtime/windows-worker-host-probe.mjs`;
- `runtime/windows-worker-default-host-probe.mjs`;
- `runtime/windows-powershell-local-worker.mjs`;
- `runtime/windows-powershell-governed-runtime.mjs`;
- `runtime/windows-powershell-physical-acceptance.mjs`.

This is strong evidence that Server should project existing host/worker/capability/health evidence rather than introduce a new worker registry.

## Required evidence dimensions

A Server-visible worker projection should keep these identities distinct:

1. `host_id` — persistent identity for the AgentOS host/state root;
2. worker ID — execution endpoint identity under existing worker semantics;
3. runtime/build identity — exact software/code candidate, when canonical evidence exists;
4. capability evidence — what bounded operations the runtime can perform;
5. health observation — whether the endpoint appears available at a specific observation;
6. authority evidence — whether the requested action is allowed;
7. mission/task/wake correlation — which canonical work unit is being handled;
8. execution result — what happened;
9. independent verification/Green;
10. security assurance;
11. PRS assurance.

No item may be inferred from another merely because their values are present in one record.

## Health semantics

Health is observational only. A healthy worker may still be:
- unauthorized for the actor;
- unauthorized for the project;
- missing required capability;
- wrong build/version;
- outside allowed environment;
- stale by the time scheduling occurs;
- ineligible due to policy/budget/consent/risk;
- blocked by security or assurance gates.

Therefore `healthy=true` can never be used as authority, pickup eligibility, completion truth, Green or PRS.

## Host / tenant boundary

The existing `host_id` identifies a host state root, not an organization membership or tenant authorization.

For a commercial Server deployment:
- tenant/org access must be checked independently;
- a host serving multiple approved users does not make them mutually authorized;
- a worker claiming an organization/project in a payload must not be trusted solely from that claim;
- Server audit projection should bind host/worker to the actor/project evidence for each request without changing canonical authority.

## Required negative vectors

| Case | Required disposition |
|---|---|
| missing host identity | unavailable/BLOCKED |
| malformed host identity schema | BLOCKED |
| corrupt creation timestamp | BLOCKED |
| two first-start processes race | exactly one durable host identity |
| host identity changes unexpectedly for same state root | CONFLICT/BLOCKED |
| worker ID missing | ineligible |
| capability list missing/malformed | ineligible |
| requested capability absent | ineligible/deny through canonical path |
| capability self-asserted by untrusted remote caller | ignore/deny |
| stale health observation | unavailable/UNKNOWN |
| wrong runtime/build identity | BLOCKED for candidate acceptance |
| duplicate worker identity with conflicting host | CONFLICT |
| worker claims another organization/project | deny unless canonical scope independently permits |
| healthy worker but no authority grant | DENY |
| worker success but receipt/verification absent | not completed/not Green |
| physical Windows evidence absent | physical acceptance NOT CLAIMED |

## Server worker projection contract

A read-only Server projection may expose only source-backed fields such as:
- canonical host ID;
- canonical worker ID;
- capability identifiers;
- runtime/build evidence reference where available;
- last health observation timestamp/source;
- availability disposition;
- exact mission/task/wake correlation for active work where canonical state provides it.

Projection must not expose secrets, raw credentials, unrestricted command text or cross-tenant mission content.

Projection storage, if cached, is non-authoritative. Loss or staleness of the projection must fail closed or force a canonical refresh; it cannot be used to resurrect revoked capability/authority.

## Maturity

Existing host identity primitive: IMPLEMENTED on active #104 lineage; production promotion not inferred.
Existing worker/runtime primitives: IMPLEMENTED on active lineage, with capability-specific verification status controlled elsewhere.
Server worker/host projection: DESIGNED.
Cross-tenant worker routing: NOT VERIFIED.
Physical Windows acceptance: NOT CLAIMED.
Overall Server GREEN: NO.
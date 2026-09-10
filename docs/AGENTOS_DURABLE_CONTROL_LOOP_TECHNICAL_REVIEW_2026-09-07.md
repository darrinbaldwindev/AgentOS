# AgentOS: From a Proven Windows Heartbeat to a Safe, Durable Multi-Agent Control Loop

**Author:** Manus AI  
**Date:** 2026-09-07  
**Scope:** Technical design review only. This document does **not** authorize, configure, or recommend enabling production autonomy.

## Executive Recommendation

The proven chain—**Windows Task Scheduler → `scheduler-tick.mjs` → governed local wake → deterministic worker → durable evidence**—is a valuable physical-acceptance baseline. It proves that a local scheduled wake can invoke a deterministic process and persist evidence. It does **not** yet prove durable orchestration, duplicate-safe side effects, independent verification, recovery semantics, or production readiness.

The recommended next architecture is a **hybrid, durable control loop**. Retain the five-minute Windows task, but narrow its responsibility to a short, idempotent **wake-and-reconcile ingress**. The scheduler must not own mission state, run the full multi-agent chain, or infer correctness from its own task history. A durable mission ledger and transactional outbox should instead own all state transitions, deadlines, leases, evidence references, budgets, and approval gates. Microsoft documents that a missed repeating task configured to start when available is queued with a default ten-minute delay; therefore, a five-minute scheduler trigger cannot be treated as a five-minute post-sleep or post-reboot recovery guarantee.[1]

Event notifications should start eligible work promptly, while the five-minute heartbeat reconciles missed events, expired leases, delayed timers, and orphaned in-progress work. A separate **30-minute audit/reconciliation sweep** may be useful for integrity reporting and human-visible health checks, but should not be the ordinary timing mechanism for six serial stages. Agent stages should advance after a **durable event and policy check**, not because a fixed clock interval has elapsed. This design combines event-driven latency with periodic recovery and is explicitly resilient to duplicate delivery and interrupted execution.[2] [3]

> **Safety position:** Keep `DRY_RUN=true` and production autonomy disabled. The initial control loop may autonomously *observe, reserve, execute in an isolated non-production environment, verify, and record evidence*. It must place any action that is external, privileged, irreversible, production-affecting, cost-increasing, or schedule-changing into `AWAITING_HUMAN_APPROVAL`.

| Recommendation | Rationale | Initial operating stance |
|---|---|---|
| Treat the Windows task as an ingress/reconciler, not an orchestrator | Scheduler overlap and missed-run semantics are not a durable workflow engine.[1] [4] | Five-minute trigger remains; it performs no full mission execution. |
| Store a durable state machine plus append-only event/evidence log | Durable orchestration checkpoints and replays from persisted history after recycle or VM reboot.[2] | Build and test locally with synthetic missions. |
| Use event-driven handoffs plus scheduled reconciliation | Events reduce ordinary latency; scheduled scans repair missed signals and expired ownership. | Five-minute reconciliation; optional 30-minute integrity sweep. |
| Model six responsibilities as three durable gates | It preserves role separation without imposing a 30-minute serial conveyor. | A/B/C gates contain six named role transitions. |
| Enforce at-least-once delivery with idempotency, not a claim of exactly once | Duplicate messages and retries occur; idempotency tokens make repeated requests safe.[5] | Every mutating command includes a persistent idempotency key. |
| Retain human approval for material actions | NIST AI RMF is a risk-management framework, not evidence that an autonomous action is safe.[6] | All external and privileged actions stop for approval. |

## Architecture: Recommended Durable Hybrid Loop

### Text Architecture Diagram

```text
                    ┌────────────────────────────────────────────┐
                    │ Windows Task Scheduler (every 5 minutes)   │
                    │ - StartWhenAvailable: recovery assist      │
                    │ - short execution limit                    │
                    └──────────────────┬─────────────────────────┘
                                       │ idempotent wake/reconcile only
                                       v
┌──────────────────────────────────────────────────────────────────────────────┐
│ scheduler-tick.mjs                                                           │
│  1. obtains single reconciler lease; 2. writes TickObserved;                 │
│  3. scans due/expired/orphaned missions; 4. releases lease; exits.           │
└──────────────────┬───────────────────────────────────────────────────────────┘
                   │ transactional state transition + outbox
                   v
┌──────────────────────────────────────────────────────────────────────────────┐
│ Durable Mission Ledger / PRS                                                  │
│  Mission state + version + fencing token + deadlines + policy snapshot        │
│  Append-only event/evidence index + transactional outbox + approval records   │
└───────┬───────────────────────────────┬───────────────────────────────┬──────┘
        │ immediate event               │ five-minute reconciliation     │ 30-minute audit
        v                               v                                v
┌────────────────┐              ┌──────────────────┐            ┌──────────────┐
│ Overseer       │              │ Project Overseer │            │ Health/Audit │
│ policy/claim   │──mission────>│ scope, lease,    │            │ report only  │
│ budget reserve │              │ dispatch         │            └──────────────┘
└────────────────┘              └────────┬─────────┘
                                          │ idempotent command
                                          v
                               ┌──────────────────────┐
                               │ Worker               │
                               │ isolated, least-priv │
                               │ heartbeats/evidence  │
                               └────────┬─────────────┘
                                        │ result pointer + digest
                                        v
                              ┌─────────────────────────┐
                              │ Project Overseer Verify │
                              │ scope/evidence/contract │
                              └────────┬────────────────┘
                                       │ verified proposal only
                                       v
                              ┌─────────────────────────┐
                              │ Green Agent             │
                              │ independent policy gate │
                              └────────┬────────────────┘
                                       │ signed verdict; never executes
                                       v
                  ┌─────────────────────────────────────────────────┐
                  │ Overseer / PRS commit                             │
                  │ accept only current fence + stage/version;        │
                  │ record verdict, approval requirement, evidence    │
                  └─────────────────────────────────────────────────┘

Human approval service ───────────────> AWAITING_HUMAN_APPROVAL ────────────────┘
```

The diagram separates **liveness** from **authority**. The scheduler contributes liveness by attempting a local wake. The durable ledger decides whether any mission can transition. The controller authorizes only narrow, policy-compliant commands; the worker performs scoped work; the verifier evaluates the output; the Green Agent gives an independent policy verdict; and PRS commits the evidence-backed final state. No upstream stage should be able to mutate a later stage’s conclusion directly.

Microsoft distinguishes four scheduler multiple-instance policies: parallel, queue, ignore new, and stop existing.[4] For this design, the task process should remain short and use an **application-level reconciler lease**. `IgnoreNew` can be acceptable only if the task merely attempts to acquire that lease and a watchdog detects an overlong holder. `Queue` is unsuitable for heartbeat invocations because stale wake-ups may accumulate. Do not use `StopExisting`, which can terminate an in-flight ledger transaction. Set the scheduler’s execution limit to a short, intentional bound; Microsoft’s default task limit is 72 hours, a dangerous failure mode for a nominally tiny heartbeat.[7]

## Role Model and Durable Gates

The six named responsibilities are important, but they do not require six clock-separated stages. They are best represented as **three durable gates**, each with one or more recorded role transitions.

| Durable gate | Named responsibilities | Entry condition | Exit condition | Prohibited outcome |
|---|---|---|---|---|
| **A — Admit and assign** | Overseer → Project Overseer | Mission is requested, deduplicated, policy-scoped, and has a budget reservation. | Project lease is committed and a worker command is placed in the outbox. | Dispatch without a policy snapshot, budget reservation, or idempotency key. |
| **B — Execute and verify** | Worker → Project Overseer verification | Worker has a current lease, task contract, and correlation identifiers. | Evidence digest/result pointer passes deterministic and project-scope verification. | Accepting a worker’s self-attestation as verification. |
| **C — Independently gate and commit** | Green Agent → Overseer/PRS | Verified proposal and immutable evidence references are available. | Green verdict and, where required, human approval are durably recorded before terminal state. | Green Agent executing the proposed action or PRS auto-converting a recommendation into permission. |

### Why Not a 6-Stage, 30-Minute Conveyor?

A six-stage 30-minute fixed cycle is simpler to visualize but makes normal work wait for clocks, conflates recovery with progression, and raises the chance of processing stale work. For example, a worker that finishes at minute two should normally trigger verification immediately; it should not wait until minute ten or fifteen merely to preserve a cadence. Durable orchestrators can checkpoint asynchronous boundaries, persist history, and replay after a process or VM restart, which supports state-driven progression rather than elapsed-time progression.[2] [3]

| Alternative | Latency | Recovery behavior | Operational complexity | Safety/control quality | Recommendation |
|---|---:|---|---|---|---|
| **Every stage every 5 minutes** | Moderate to poor; often up to several intervals | Repeated scans can recover work, but repeated stage runners amplify duplicates. | Low initially; high once overlap and staleness are addressed. | Weak unless every stage has leases and idempotency. | Do not use as the primary design. |
| **Event-driven only** | Best during normal operation | Vulnerable to missed events, unavailable event brokers, or local sleep without independent reconciliation. | Moderate. | Good only with durable outbox/inbox and replay. | Insufficient alone. |
| **6-stage cycle every 30 minutes** | Poor for short work and urgent recovery | Can reconcile eventually, but creates broad stale windows. | Superficially low; idle delay and backlog handling grow. | Better than ad hoc polling but weak as a control loop. | Use only as a health/audit sweep, not execution cadence. |
| **Hybrid: events + five-minute wake/reconcile + 30-minute audit** | Prompt when events work; bounded recovery when they do not | Reconciles due work, expired leases, and missed signals; audit detects drift. | Moderate and explicit. | Strong when combined with version checks, fences, and approval gates. | **Recommended.** |

The Windows scheduler’s `StartWhenAvailable` setting is useful but must be treated as a recovery aid rather than a service-level guarantee: it is false by default, applies to time-based tasks with suitable repetition/end settings, and delayed tasks are queued with a documented default delay of ten minutes.[1] `WakeToRun` is also a configurable scheduler capability, but should be validated on the actual host. On mobile devices, start-on-battery and stop-on-battery restrictions default to true, so power-state behavior needs deliberate acceptance testing rather than assumption.[8] [9] [10]

## Durable State, Mission Correlation, and Transition Rules

A mission needs more than a status string. It needs a durable identity, versioning, authority, policy, and evidence model that lets a future reconciler decide safely what to do after any interruption.

| Record | Minimum durable fields | Rule |
|---|---|---|
| `mission` | `mission_id`, `project_id`, `generation`, `state`, `state_version`, `next_action_at`, `policy_snapshot_id`, `approval_requirement`, `created_at` | `state_version` increases on every accepted transition. Never overwrite historical state. |
| `lease` | `mission_id`, `stage`, `owner_id`, `lease_expires_at`, `fencing_token`, `heartbeat_at` | A new owner receives a strictly higher fencing token. Expiration permits recovery but not a stale owner’s write. |
| `attempt` | `mission_id`, `stage`, `attempt_no`, `command_id`, `idempotency_key`, `started_at`, `deadline_at`, `outcome_class` | One immutable attempt record per execution request. |
| `event` | `event_id`, `mission_id`, `sequence`, `type`, `actor`, `state_version`, `fencing_token`, `occurred_at`, `payload_digest` | Append-only; payloads are references/digests, not unbounded raw artifacts. |
| `evidence` | `evidence_id`, `mission_id`, `producer`, `content_digest`, `storage_uri`, `created_at`, `retention_class` | Content-address or hash evidence. Do not permit workers to rewrite verifier or Green evidence. |
| `outbox` / `inbox` | `command_id`, `destination`, `idempotency_key`, `payload_digest`, `published_at`; received keys | Write outbox atomically with transition; receiver deduplicates via inbox/key. |
| `budget_reservation` | `mission_id`, `budget_class`, `limit`, `reserved`, `consumed`, `expires_at` | Reservations precede dispatch; consumption is reconciled from attributable usage. |
| `approval` | `approval_id`, `mission_id`, `scope_digest`, `decision`, `approver`, `expires_at`, `revoked_at` | Approval is bound to mission generation and proposed action digest, not a broad open-ended permission. |

The transition primitive should be a **single conditional commit**: validate `mission_id`, expected state, expected `state_version`, active fencing token, policy snapshot, budget, and approval condition; atomically update the mission; append the event; insert the outbox command; and then commit. A publisher sends committed outbox messages later. This avoids the dual-write failure in which a state update succeeds but dispatch does not, or dispatch succeeds but its state record is absent. It also makes a reconciliation tick safe: it may rediscover work but cannot create a second valid transition.

All cross-stage messages should carry one stable `mission_id`, a new `attempt_id`, `generation`, `state_version`, `fencing_token`, `idempotency_key`, and compatible tracing context. OpenTelemetry documents that context propagation correlates traces, metrics, and logs across process and network boundaries; untrusted incoming context should be sanitized and baggage must not contain credentials or personal data.[11] A human-readable correlation string is helpful for incident review, but authority must derive from the durable state version and token—not from timestamps or labels.

AWS advises use of idempotency tokens and durable token/state tracking because a message or request can be delivered more than once. It also specifically warns against using timestamps as idempotency keys because of clock skew.[5] Accordingly, AgentOS should promise **at-least-once delivery with idempotent effects**, not “exactly-once agent execution.”

### Stale Checkpoint Handling

A checkpoint/result is **stale** when its mission generation, expected state, version, attempt, lease token, evidence digest, policy snapshot, or approval scope no longer matches the ledger. The PRS transition endpoint must reject it with `STALE_RESULT`, append a rejected-event record, and preserve the artifact for diagnosis. It must not overwrite newer state, consume a new budget reservation, or automatically resume the old attempt.

| Situation | Required handling |
|---|---|
| Worker completes after its lease was replaced | Reject result because its fencing token is older; preserve evidence; current Project Overseer reconciles. |
| Duplicate scheduler tick claims the same mission | Conditional state update lets only one claimant win; the loser records `claim_not_acquired` and exits. |
| Worker crashes after external side effect but before acknowledgement | Retry with the identical idempotency key; receiver returns the original outcome rather than repeating it. |
| Code/policy changes while a mission is in flight | Keep the recorded policy/version for that generation; only a governed migration or new generation may apply changed semantics. |
| Green verdict refers to a previous verified proposal digest | Reject as stale; require a new independently generated verdict for the current digest. |

## Retry, Timeout, Concurrency, and Budget Policy

A retry must be a **state transition with a bounded policy**, not a timer loop inside a worker. AWS’s analysis of exponential backoff shows that adding jitter reduces clustered retries and client work under contention.[12] Use full-jitter capped exponential backoff for transient infrastructure failures, while treating deterministic validation failures, policy denials, malformed inputs, and approval absence as non-retryable.

| Control | Proposed conservative initial policy for test environments | Failure behavior |
|---|---|---|
| Scheduler tick timeout | 90 seconds maximum; its only work is lease, durable scan, and outbox publish attempt. | Emit `TICK_TIMEOUT`; next tick reconciles. Do not let the scheduler kill a running worker. |
| Reconciler ownership | One active global reconciler lease; short TTL with heartbeat/renewal. | A later tick may take ownership only after expiry and fencing-token increment. |
| Worker concurrency | Start with **one active worker globally**; prove isolation, then raise to one worker per project plus a small global cap only after acceptance tests. | Queue eligible missions; do not use unconstrained parallelism. |
| Worker timeout | Policy-class-specific wall-clock deadline, plus progress heartbeat. Use no universal “long task” limit. | On missed heartbeat/deadline: lease expires, attempt is timed out, then classification decides retry or human hold. |
| Retry budget | At most four transient attempts per stage per mission, using capped exponential backoff with full jitter. | Exhaustion enters `REQUIRES_REVIEW` with full attempt evidence. |
| Circuit breaker | Per project and per dependency: halt new dispatch after repeated transient failures or abnormal timeout rate. | `PROJECT_PAUSED`; continue observation/reconciliation only. |
| Cost/time budget | Reserve before worker dispatch; enforce per mission, per project, and global ceilings for elapsed time, model tokens, tool calls, external API calls, and spend. | At 80% emit warning; at 100% stop dispatch and enter `BUDGET_HOLD`. |
| Scheduler execution limit | Explicit short limit for tick process, rather than the Windows default of 72 hours.[7] | Task termination never changes mission state; reconciliation decides recovery. |

The numerical values above are deliberately **test-environment starting points**, not production operating limits. The owner must approve actual capacities and budget ceilings after observing resource consumption, evidence completeness, failure rates, and human-review burden. Importantly, `BUDGET_HOLD`, `REQUIRES_REVIEW`, and `AWAITING_HUMAN_APPROVAL` must be durable terminal-or-paused states for the current generation, not silent retry triggers.

## Human Approval and Independence Boundaries

The chain is safe only when no individual actor can both propose, approve, execute, verify, and commit a material result. The Green Agent must be an independent **policy evaluator**, not a second worker or an execution proxy. PRS must be the durable adjudication record, not an agent that turns advisory text into a live action.

| Boundary | Autonomous in the proposed non-production loop | Human approval required | Independence requirement |
|---|---|---|---|
| Observe, classify, plan, and write internal evidence | Yes, within read-only/isolated scope | Not ordinarily | Worker has least privilege; no production credentials. |
| Execute a local deterministic test worker | Yes, only with `DRY_RUN` and isolated fixture inputs | Not ordinarily | Result must be separately verified. |
| Change repository, deployment, production data, schedule, credentials, connector, policy, or retention | No | **Always** | Approval binds exact action digest and expires. |
| Spend money, invoke paid provider above approved cap, or broaden authority | No | **Always** | Budget service cannot be bypassed by a worker. |
| Verify worker evidence | Yes | Human required if verification is ambiguous or safety-critical | Verifier identity/process is separate from worker; it reads immutable result references. |
| Green verdict | Yes, advisory/policy verdict only | Human required for any material action it would permit | Separate identity, credential, model/process path, and write-only verdict channel. |
| Final PRS state commit | Yes, only for non-action states or after approval | Required for material action state | PRS validates current version/fence; does not execute tools. |

NIST’s AI RMF is intended to help organizations incorporate trustworthiness considerations into AI system design, development, use, and evaluation.[6] Applying its Govern–Map–Measure–Manage structure here means the Overseer governs policy and authority; the Project Overseer maps task scope and dependencies; verification and Green assess measurable evidence; and PRS manages the durable decision record. This is a governance model, not a reason to relax approval gates.

For meaningful Green/PRS independence, use separate workload identities, separate least-privilege permissions, separate code ownership/review paths where feasible, and a unidirectional submission interface. Green may read a frozen evidence bundle and write `{verdict, reasons, evidence_digests, policy_snapshot_id, signature}`. It may not invoke worker tools, alter worker artifacts, issue deployment commands, modify budgets, or write the final mission state. PRS should accept a Green verdict only if its identity, mission generation, verified-proposal digest, policy snapshot, and expiration are valid.

## Recovery Semantics

Recovery should be deterministic and boring: after a sleep, reboot, process crash, or network loss, a new tick does not “resume whatever seems likely.” It reads durable state and performs explicit reconciliation.

| Disruption | Required recovery sequence | Durable evidence of success |
|---|---|---|
| Machine sleep or reboot | Scheduled task eventually invokes the reconciler; reconciler scans due timers, expired leases, unpublished outbox messages, and stale in-progress attempts. | `TickObserved`, lease acquisition/decline, and reconciliation summary events. |
| Tick process crash | No mission is considered claimed unless conditional lease/transition committed. Next tick reacquires or observes existing lease. | Absence of a committed claim is proof that no dispatch is due from that tick. |
| Worker process crash | Project Overseer detects missed heartbeat or deadline; it does not accept partial in-memory status. | Timed-out attempt record and evidence pointer; new attempt uses same idempotency scope where side effects are possible. |
| Network loss during dispatch | Transaction commits mission transition plus outbox; publisher retries delivery after reconnection. | Exactly one command record with a persistent idempotency key. |
| Network partition with a zombie worker | Lease expires; replacement gets higher fencing token. PRS rejects late zombie result. | Rejection event records old token and current token. |
| Event broker outage or missed event | Five-minute reconciler finds `next_action_at <= now`, expired leases, and unpublished outbox rows. | Reconciliation scan report identifies discovered work. |
| Clock disagreement | Order transitions using per-mission `state_version`/fencing, not client wall-clock order. Store times for observability only. | Conditional commit shows the accepted predecessor version. |
| Scheduler overlap | Application lease and conditional claims make a duplicate tick harmless. | One winner, explicit no-op/decline events for others. |
| Power/battery restriction | Treat the missed interval as a recovery condition; do not silently modify power policy. Microsoft documents restrictive battery defaults.[9] [10] | Power-state/missed-tick alert plus subsequent reconciliation evidence. |

## Failure Modes and Required Responses

| Failure mode | Leading indicator | Unsafe anti-pattern | Required response |
|---|---|---|---|
| Duplicate tick or duplicated event | Two claims/commands share a mission | Launching two workers and trusting timestamps | Conditional claim, lease/fencing, inbox deduplication, and idempotency keys. |
| Hung tick | Scheduler task remains running beyond limit | Queuing every subsequent heartbeat | Kill only the tick process after its short limit; next tick reconciles from ledger. |
| Hung worker | No heartbeat before deadline | Letting scheduler overlap replace it silently | Mark attempt timed out, expire lease, classify retry, preserve evidence. |
| Stale worker completion | Older generation/version/token | Accepting “latest arrival wins” | Reject stale result; append diagnostic event. |
| Partial dual write | State change without message, or inverse | Direct state update then best-effort publish | Atomic transition plus outbox; publisher retries. |
| Retry storm | Growing retries, dependency errors, budget burn | Immediate retries from every agent | Jittered bounded retry, token/circuit limit, project pause. |
| Evidence tampering | Digest mismatch or unexpected actor | Worker writes verifier/Green result | Immutable evidence references, producer-specific write permissions, digest verification. |
| Green collusion / non-independence | Same identity or same mutable workspace | Treat Green’s text as an approval | Separate identities/permissions and a constrained verdict contract. |
| Budget runaway | Rapid token/tool/API consumption | Letting the worker self-report costs after completion | Pre-dispatch reservation, metered gateway, hard cap, `BUDGET_HOLD`. |
| Human approval bypass | Action command lacks valid bound approval | “Approval once” flag on mission | Bind approval to generation and action digest; verify at commit and execution boundary. |
| Sleep/reboot blind spot | Missed heartbeat / late task start | Interpreting no scheduler run as no work | Reconcile all due state after every wake. |

## Acceptance Test Plan

The following tests should be performed in a **non-production environment**, against fixture repositories/data and mock or deny-by-default external connectors. Passing this plan proves bounded behavior under tested conditions; it is **not** proof of production, security, or release readiness.

| Test | Injection / procedure | Pass criterion | Evidence required |
|---|---|---|---|
| Baseline physical acceptance regression | Run existing five-minute scheduler path with `DRY_RUN=true` and autonomy disabled. | Same deterministic evidence remains present; no external side effect occurs. | Task event history, tick log, mission/event records. |
| Duplicate tick | Trigger two ticks concurrently and repeat during an active reconciliation. | At most one reconciler lease and one valid dispatch command per mission. | Lease tokens, conditional-write results, outbox/inbox rows. |
| Tick crash at every durable boundary | Terminate tick before lease, after lease, after transition, and after outbox commit. | Next tick recovers without lost or duplicate mission transition. | Event sequence and final mission state for each cut point. |
| Worker crash and restart | Kill worker before action, after idempotent action, and before acknowledgement. | No duplicate side effect; correct retry/hold state and preserved evidence. | Attempt records, idempotency receiver log, evidence digests. |
| Sleep and reboot | Sleep/hibernate and reboot the target host around a due tick; measure task start and reconciliation. | System records delayed wake and reconciles all due missions once; no assertion that recovery is within five minutes. | OS/task operational events, `TickObserved`, reconciliation report. |
| Network loss | Block controller-to-worker and publisher-to-broker paths during dispatch/result delivery. | Outbox retries after restoration; duplicate delivery is harmless; no stale result accepted. | Outbox state, inbox dedup record, transition history. |
| Stale checkpoint | Let attempt A lose its lease, start B, then submit A’s completion. | A is rejected as `STALE_RESULT`; B/current state is unchanged. | Fence/version comparison and rejection event. |
| Timeout and retry | Suppress worker heartbeats; force transient and deterministic errors. | Transient errors retry within cap/jitter policy; deterministic errors do not retry; exhaustion holds for review. | Attempt timeline, failure classification, retry-count evidence. |
| Concurrency/bulkhead | Submit more missions than global and per-project limits. | Limits are enforced, queued work stays durable, and one project cannot starve another. | Queue depth, permits, per-project metrics. |
| Budget exhaustion | Use fixtures that consume declared token/tool/API budget. | Warning before cap; hard cap produces `BUDGET_HOLD`; no subsequent dispatch. | Reservation/consumption ledger and denied command. |
| Approval boundary | Request a mocked production/deployment/credential/schedule change without approval, then with mismatched/expired approval. | All are denied; only an exact, valid approval can move a proposal to an action-ready state, never execute it automatically. | Approval validation event and denial records. |
| Green/PRS independence | Attempt a Green verdict from wrong identity, wrong digest, or expired policy snapshot. | PRS rejects the verdict; mission remains held/reviewable. | Identity verification and rejection event. |
| Correlation and auditability | Trace a mission across all six responsibilities after injected fault. | One mission correlation ID and trace context tie together logs, metrics, events, attempts, verdict, and evidence. | Trace view plus durable event/evidence index. |
| Scheduler configuration review | Inspect task XML/settings and task operational history. | Repetition, missed-run behavior, multiple-instance policy, short execution limit, wake/power decisions, and noninteractive identity match the approved test spec. | Exported task definition and configuration checklist. |

Acceptance should be **gated**, not averaged. A single unbounded external action, accepted stale completion, duplicate non-idempotent side effect, missing audit trail, or approval bypass is a hard failure. Observe at least several uninterrupted days of fixture-only operation plus repeated fault injections before considering any broader test scope.

## Specific Implementation Recommendations

### 1. Preserve the proven scheduler path and shrink its responsibility

Keep `scheduler-tick.mjs`, but make it a short command with the conceptual sequence `acquire-reconciler-lease → record-tick → reconcile-due-state → publish-committed-outbox → record-summary → exit`. It must not call a general-purpose agent directly, keep mission context in memory between ticks, or itself decide that a worker output is safe. Set its Windows execution limit intentionally short rather than inheriting the 72-hour default.[7]

### 2. Add a local durable mission ledger before adding agent autonomy

Implement a durable store containing the records in the state table above. In a local-first prototype, an ACID database with transactions, unique constraints, and append-only event rows is more important than a sophisticated agent framework. Add a transactional outbox/inbox pattern before introducing a queue or event bus. The immediate goal is repeatable, inspectable transitions—not throughput.

### 3. Define explicit state and transition contracts

Use states such as `REQUESTED`, `POLICY_SCOPED`, `BUDGET_RESERVED`, `PROJECT_CLAIMED`, `WORK_DISPATCHED`, `WORKING`, `WORKER_RESULT_RECORDED`, `PROJECT_VERIFIED`, `GREEN_REVIEW`, `AWAITING_HUMAN_APPROVAL`, `COMPLETED_DRY_RUN`, `REQUIRES_REVIEW`, `BUDGET_HOLD`, `PROJECT_PAUSED`, and `CANCELLED`. Every transition must name its allowed predecessor, expected version, actor type, required evidence, idempotency key, fence requirement, and whether human approval is mandatory.

### 4. Implement leases and version/fence validation at the PRS write boundary

Use a database conditional update or compare-and-swap on `(mission_id, state_version, fencing_token)`. Each re-claim issues a strictly higher fence. The PRS must reject all results whose expected version/fence does not match current durable state. This is the principal defense against sleep/reboot recovery races and zombie workers.

### 5. Separate commands from evidence

Pass small immutable command envelopes and content digests through the orchestration layer. Store large artifacts in controlled storage and reference them by digest/URI. Make the Project Overseer verifier and Green Agent consume a frozen evidence bundle; neither should rely on mutable worker directories or live conversation context as authority.

### 6. Use events for work and timers for repair

Publish a durable event/outbox command when a prior transition commits. Also calculate `next_action_at` for each in-progress mission. The five-minute reconcile tick scans for due work, expired leases, timed-out attempts, unpublished outbox rows, and approval expirations. Reserve the 30-minute process for integrity metrics, stalled-mission review, and alert generation—not normal stage sequencing.

### 7. Enforce a policy engine and budget service before dispatch

The Overseer should obtain a signed or versioned policy snapshot and a budget reservation before it emits a worker command. The Worker receives only the scope it needs. A metering boundary, rather than worker self-reporting alone, records time, model/token, tool, API, and spend consumption. A zero or absent authorization means no action, not an implied default.

### 8. Make verification and Green independently constrained

Use separate identities and a narrow evidence contract. Project Overseer verification validates deterministic task contract and scope. Green evaluates policy/safety against the frozen verified proposal and emits an advisory verdict. PRS validates the verdict and records state. Neither the Project Overseer verifier nor Green may execute a production-facing action.

### 9. Instrument for reconstruction, not only alerts

Emit structured events for `mission_id`, `project_id`, `generation`, `state_version`, `stage`, `attempt_id`, `fencing_token`, `idempotency_key`, `policy_snapshot_id`, `budget_reservation_id`, `approval_id`, and trace context. OpenTelemetry’s context model is suited to carrying causal trace information across process boundaries, but sensitive values must never be placed in propagating baggage.[11]

### 10. Stage the implementation with explicit stop conditions

| Phase | Deliverable | Stop condition |
|---|---|---|
| **0 — Preserve baseline** | Exported scheduler configuration and existing physical acceptance evidence. | Any deviation from `DRY_RUN` or autonomy-disabled mode. |
| **1 — Durable control plane** | Mission ledger, event log, conditional transitions, outbox/inbox, reconciliation-only tick. | Duplicate or stale transition accepted in tests. |
| **2 — Isolated worker loop** | One globally concurrent fixture-only worker with lease, heartbeat, timeout, and evidence digest. | Any external/production side effect or missing idempotency proof. |
| **3 — Independent verification/gating** | Separate verifier, Green verdict contract, PRS validation, approval holds, budget holds. | Shared identity/authority or a verdict that bypasses a human gate. |
| **4 — Resilience acceptance** | Full fault-injection suite and several days of fixture-only observation. | Any hard acceptance failure or incomplete evidence. |
| **5 — Owner decision only** | Evidence package describing demonstrated limits and remaining risks. | Do not enable production autonomy as a consequence of this report. |

## Decision Summary

The correct evolution is **not** “run more agent stages every five minutes” and **not** “wait thirty minutes between six stages.” It is to make the proven Windows heartbeat a reliable source of reconciliation opportunities, while moving authority, state, progress, retry, budget, evidence, and approvals into an explicit durable control plane. The architecture should advance mission stages on committed events, recover with periodic scans, and treat every repeat execution as normal rather than exceptional.

This approach provides a controlled path from physical acceptance to durable multi-agent orchestration without conflating local scheduler success with autonomous production readiness. The recommended next engineering milestone is a fixture-only ledger/outbox/reconciler prototype that proves duplicate-safe recovery, stale-result rejection, and approval/budget holds under fault injection—while `DRY_RUN` remains enabled and production autonomy remains disabled.

## References

[1]: https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-startwhenavailable "Microsoft Learn — TaskSettings.StartWhenAvailable property"
[2]: https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-orchestrations "Microsoft Learn — Durable orchestrations"
[3]: https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview "Microsoft Learn — Durable Functions overview"
[4]: https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-multipleinstances "Microsoft Learn — TaskSettings.MultipleInstances property"
[5]: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html "AWS Well-Architected — Make mutating operations idempotent"
[6]: https://www.nist.gov/itl/ai-risk-management-framework "NIST — AI Risk Management Framework"
[7]: https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-executiontimelimit "Microsoft Learn — TaskSettings.ExecutionTimeLimit property"
[8]: https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-waketorun "Microsoft Learn — TaskSettings.WakeToRun property"
[9]: https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-disallowstartifonbatteries "Microsoft Learn — TaskSettings.DisallowStartIfOnBatteries property"
[10]: https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-stopifgoingonbatteries "Microsoft Learn — TaskSettings.StopIfGoingOnBatteries property"
[11]: https://opentelemetry.io/docs/concepts/context-propagation/ "OpenTelemetry — Context propagation"
[12]: https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/ "AWS Architecture Blog — Exponential Backoff and Jitter"

*All sources were accessed on 2026-09-07. The recommendations are design guidance based on the stated context and public sources. They are not proof of runtime, security, production, or release readiness.*

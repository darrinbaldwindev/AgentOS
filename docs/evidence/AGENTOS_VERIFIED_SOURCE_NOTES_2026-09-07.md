# Verified Source Notes — AgentOS Control-Loop Review

## Windows Task Scheduler

Microsoft documents explicit multiple-instance policies: parallel, queue, ignore new, and stop existing. The documentation does not identify a universally safe default. For a five-minute trigger that invokes only a short enqueue/reconcile transaction, `IgnoreNew` is appropriate when a distributed lease prevents concurrent dispatch; a hung tick must still be detected separately. `Queue` is not recommended for a heartbeat because it can accumulate stale ticks.

Microsoft also documents a default 72-hour execution limit and supports `PT0S` / `Nothing` for no limit. The proposed heartbeat should be designed to finish quickly, with a much smaller explicit limit, rather than granting an unbounded scheduled process.

## Durable Orchestration

Microsoft Durable Functions documentation states that it manages state, checkpoints, retries, and recovery for long-running stateful workflows. Durable orchestration documentation describes append-only event history, checkpointing around asynchronous boundaries, replay from history after recycle or VM reboot, durable timers, external events, and the requirement that orchestration code be deterministic. It also notes non-transactional coordination between Azure Storage tables and queues, favoring a transactional-outbox or stronger-consistency design where applicable.

These sources support using the Windows scheduled task only as a wake/reconciliation ingress. The authoritative mission state and all agent-stage transitions should live in a durable store/outbox, not in task history, process memory, or a scheduler run.

## Verified primary references

1. Microsoft Learn, TaskSettings.MultipleInstances property — https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-multipleinstances
2. Microsoft Learn, TaskSettings.ExecutionTimeLimit property — https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-executiontimelimit
3. Microsoft Learn, Durable Functions overview — https://learn.microsoft.com/en-us/azure/durable-task/durable-functions/durable-functions-overview
4. Microsoft Learn, Durable orchestrations — https://learn.microsoft.com/en-us/azure/durable-task/common/durable-task-orchestrations

*Accessed 2026-09-07. These notes record source findings; they do not authorize production autonomy or any change to the existing environment.*

## Idempotency, retries, governance, and observability

AWS Well-Architected states that duplicate delivery and retries are normal in distributed systems, and recommends idempotency tokens plus persistent token/state records with suitable concurrency control. It specifically cautions against timestamps as idempotency keys because of clock skew. This supports an at-least-once, idempotent AgentOS design instead of a claim of exactly-once agent execution.

AWS's architecture analysis finds that capped exponential backoff without jitter leaves clustered contention; jitter spreads retries and reduces client work/load. Retries therefore need a bounded, jittered policy in the durable controller, not repeated immediate scheduler invocations.

NIST describes AI RMF as a voluntary framework for incorporating trustworthiness considerations into design, development, use, and evaluation. Its Govern–Map–Measure–Manage functions are a useful governance structure, but they do not prove any individual automation is safe. Human approval must remain required for material or irreversible actions.

OpenTelemetry documents that context propagation carries trace and span identifiers across process and network boundaries, correlating traces, logs, and metrics. This supports propagating a mission correlation ID (and a compatible trace context) through every AgentOS stage; incoming context from untrusted sources should be sanitized, and no secrets or PII should be placed in baggage.

## Additional verified primary references

5. AWS Well-Architected, REL04-BP04 Make mutating operations idempotent — https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_prevent_interaction_failure_idempotent.html
6. AWS Architecture Blog, Exponential Backoff and Jitter — https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
7. NIST, AI Risk Management Framework — https://www.nist.gov/itl/ai-risk-management-framework
8. OpenTelemetry, Context propagation — https://opentelemetry.io/docs/concepts/context-propagation/

*Accessed 2026-09-07. These notes record source findings; they do not authorize production autonomy or any change to the existing environment.*

## Scheduler recovery constraints

Microsoft documents that `StartWhenAvailable` is false by default. When true, a missed time-based task with an end boundary or infinite repetition may start later, but it is queued and the default delay is 10 minutes. This confirms that the five-minute trigger cannot itself provide a five-minute post-sleep/reboot recovery SLO; recovery must be modeled as a reconciliation run and measured on the target image.

Microsoft documents `WakeToRun`, but the system should treat waking as a best-effort operational setting requiring environment validation, not as a durable-state guarantee. On mobile hosts, both `DisallowStartIfOnBatteries` and `StopIfGoingOnBatteries` default to true, so a laptop may not start or may stop the heartbeat on battery unless policy deliberately changes those settings. The safest initial policy is to retain conservative power behavior and record a delayed/reconciliation state rather than silently changing power settings.

## Additional verified Windows references

9. Microsoft Learn, TaskSettings.StartWhenAvailable property — https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-startwhenavailable
10. Microsoft Learn, TaskSettings.WakeToRun property — https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-waketorun
11. Microsoft Learn, TaskSettings.DisallowStartIfOnBatteries property — https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-disallowstartifonbatteries
12. Microsoft Learn, TaskSettings.StopIfGoingOnBatteries property — https://learn.microsoft.com/en-us/windows/win32/taskschd/tasksettings-stopifgoingonbatteries

*Accessed 2026-09-07. These notes record source findings; they do not authorize production autonomy or any change to the existing environment.*

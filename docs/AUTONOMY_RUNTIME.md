# Autonomy Runtime Contract

## Purpose

Define the minimum runtime needed to progress authorised dispatch work without a human repeatedly issuing `continue`.

## Poll cycle

A trusted runtime should:

1. load queued dispatch tasks;
2. filter to its registered receiver identity;
3. validate task structure;
4. validate issuer trust and granted capabilities;
5. claim one eligible task atomically through the persistence layer;
6. execute only within the task's authority;
7. persist every lifecycle transition;
8. persist evidence on completion;
9. escalate failures or authority conflicts;
10. repeat while work remains and runtime policy permits.

## Safety requirements

- Read-only discovery must not be treated as permission to write.
- A task cannot grant its own authority.
- Claims must be idempotent/atomic at the persistence boundary.
- Execution must have a bounded timeout/resource policy.
- Failures must become durable state.
- The runtime must stop when authority is insufficient.
- Human approval remains mandatory for configured high-impact operations.

## Scheduling

The runtime may initially be invoked manually or by CI. A later scheduler can invoke the same runtime on a cadence. An event-driven controller can eventually invoke it when dispatch state changes.

The dispatch semantics must remain independent of the scheduler.

## A2 readiness

A runtime is A2-ready when a completed task can produce a next authorised task and the runtime can consume that task in the same execution session without requiring a human `continue` command.

## A3 readiness

A runtime is A3-ready when an authorised scheduler can invoke the poll cycle independently of a user conversation and safely recover from interrupted work.

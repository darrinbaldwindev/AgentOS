# AgentOS Basic Chat — Vertical Slice

## Purpose

Define the smallest user-facing vertical slice that connects the AgentOS Basic chat experience to the existing governed task pipeline without creating a competing runtime or persistence system.

## Target flow

```text
Basic Chat UI
  -> loopback HTTP send adapter (minimal local shell)
  -> existing session/task pipeline
  -> governed mission/task execution
  -> deterministic/local worker in v1
  -> persisted mission/run/evidence state
  -> response returned to UI
```

## Scope

- One large chat workspace.
- Message input and send action.
- User and AgentOS response rendering.
- Loading/error state.
- One active thread/mission context at a time for the first slice.
- Reuse the canonical AgentOS mission/task/run/event/artifact persistence contract.
- Keep local v1 DRY_RUN and `autonomyEnabled: false`.
- Scheduler remains disabled by default.
- No provider credentials are required for the first deterministic local slice.

## Non-goals

- Full dashboard/navigation implementation.
- Multi-provider routing UI.
- Mobile UI.
- Production autonomy.
- New persistence architecture.
- Marketplace/referral UI.
- Unattended scheduling.

## Acceptance contract

A Basic Chat vertical slice is complete only when a clean local runtime can:

1. Open the Basic chat surface.
2. Accept a user message.
3. Correlate the message to an AgentOS mission/task.
4. Execute through the existing governed pipeline.
5. Return a bounded response to the chat surface.
6. Persist the mission/task/run lineage using the canonical persistence system.
7. Survive a restart and recover the conversation/mission context required by the slice.
8. Remain DRY_RUN with autonomy disabled throughout.
9. Produce deterministic tests and fresh acceptance evidence.

## Implementation rule

The UI is an adapter to AgentOS control-plane/runtime contracts. It must not become a second source of truth for missions, tasks, permissions, evidence, or durable state.

## Local implementation

Run `npm run chat:local` and open `http://127.0.0.1:4317`.
The browser shell uses the existing installer/persistence contracts in a dedicated
`.basic-chat` development home. It does not attach to the physical scheduler home.
See [local acceptance evidence](BASIC_CHAT_LOCAL_EVIDENCE.md) for the verified flow,
restart behavior, bounded pause/stop semantics, safety boundaries and registry assessment.

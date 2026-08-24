# AgentOS Boot Sequence

The first runnable AgentOS path is deliberately Overseer-first.

```text
START
  -> durable persistence
  -> continuity check
  -> bootstrap/restore Overseer
  -> capability probe
  -> enumerate available models
  -> activate Overseer
  -> record boot event
  -> ONLINE
```

## Failure policy

- Continuity failure: do not activate autonomous execution.
- Overseer capability failure: do not activate autonomous execution.
- No available worker models: Overseer may remain a valid system agent, but task execution is unavailable.
- Existing Overseer: restore it rather than creating a duplicate.

The model registry only reports currently available models. It does not choose the model; the Overseer routing policy performs selection based on task requirements, availability, access and suitability.

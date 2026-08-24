# Persistence Migration

AgentOS has one canonical persistence vocabulary: `get`, `list`, `create`, and `update`.

Legacy runtime components must use an adapter/bridge rather than maintaining a second persistence abstraction.

## Rule

`AgentRuntime` and Overseer must ultimately depend on the same persistence contract. Provider adapters, model routing and UI layers must not create independent sources of durable mission state.

## Migration strategy

1. Keep existing runtime semantics for runs/events/artifacts.
2. Introduce the canonical persistence bridge.
3. Adapt legacy stores behind the bridge.
4. Move runtime constructors to accept the canonical interface.
5. Remove direct dependency on the legacy store vocabulary after migration.
6. Add an integration test proving boot -> Overseer -> task -> execution -> event persistence uses one store.

This is deliberately incremental to avoid a rewrite while eliminating competing sources of truth.

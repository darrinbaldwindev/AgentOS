# Runtime Migration Status

## Completed

- `AgentRuntime` now accepts the canonical `persistence` dependency instead of the legacy `store` name.
- Run, event and artifact writes use the canonical asynchronous persistence contract.
- Provider execution remains isolated behind the provider adapter boundary.
- Overseer bootstrap already uses the same persistence vocabulary.

## Remaining

- Migrate any remaining legacy constructors/callers from `store` to `persistence`.
- Add a runnable integration test covering boot, Overseer activation, routing, provider execution and persisted events/artifacts.
- Add a concrete durable adapter suitable for the desktop/local-first runtime.

## Architectural invariant

There must be one canonical durable mission state. Legacy storage may remain temporarily behind adapters, but new domain code must depend on the persistence contract rather than creating another store abstraction.

# AgentOS Local Installation

Status: IMPLEMENTATION BASELINE

AgentOS is designed to become a local PC execution environment. This bootstrap provides the first dependency-free installation path while the desktop shell and provider connectors continue to mature.

## Requirements

- Node.js 22 or newer.
- A writable user home directory.
- No GitHub credentials are required for the bootstrap itself.

## Install

From a checked-out AgentOS repository:

```bash
npm run install:local
```

The installer creates `~/.agentos/` (or the directory named by `AGENTOS_HOME`) with:

- `config.json` — safe default runtime configuration;
- `state/agentos.json` — local durable state seed;
- `workspaces/` — controlled workspace root.

The initial mode is `DRY_RUN` and `autonomyEnabled` is `false`. Installation must never silently grant production credentials or autonomous authority.

## Verify

Run:

```bash
npm test
```

The installer tests verify Node-version gating, idempotent installation, durable state creation and the safe default autonomy boundary.

## Next installation stages

1. Local scheduler/controller process.
2. Real workspace synchronization and dirty-worktree protection.
3. Boot → Overseer activation → routing → worker → evidence integration test.
4. Restart/crash recovery test using the local durable state.
5. Desktop/CLI shell packaging for a supported PC.
6. Explicit owner-controlled transition from DRY_RUN to SUPERVISED and, only after acceptance evidence, AUTONOMOUS.

GitHub remains the canonical shared repository surface. The local installation becomes the primary execution surface, allowing GitHub scheduled workflows to remain a compatibility, CI and recovery mechanism rather than the timing authority.

# AgentOS Local/GitHub Synchronisation Policy

AgentOS uses the local workspace as the preferred active working surface when trustworthy read/write access exists. GitHub is the portable synchronization and recovery surface.

## Classes

| Class | Default | Meaning |
|---|---|---|
| source | sync | Source code and tests may synchronize. |
| continuity | sync | Checkpoints, continuity protocol and change-log records synchronize. |
| configuration | review | Configuration may synchronize only after review. |
| runtime | local-only | Ephemeral local runtime state does not synchronize by default. |
| secret | never-sync | Credentials, secrets and environment secret material must never synchronize. |

## Drift

A local/remote manifest comparison must identify local-only, remote-only and modified paths. Modified paths require review before automated reconciliation.

AgentOS must not blindly overwrite local changes with GitHub state, nor push local changes over remote changes, when both sides differ.

## Recovery

When a local workspace is unavailable, an eligible GitHub-capable agent may reconstruct the project from the repository plus continuity records. When both local and remote state are available but divergent, Overseer should surface the divergence before autonomous reconciliation.

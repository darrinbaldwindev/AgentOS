# Remote Local-Worker Bridge Status

Issue: #90
PR: #91

## Implemented in this branch

- Fail-closed remote request admission contract.
- Remote content cannot self-grant authority, consent, capabilities, autonomy, or budget overrides.
- Authenticated ActorContext is required before admission.
- Server-side project and capability allowlists.
- Production/live intent rejection.
- Stale/future request rejection.
- Candidate remains `AWAITING_AUTHORITY` until existing AgentOS authority/policy admits it.
- Durable single-host delivery claim using exclusive file creation.
- Concurrent duplicate delivery suppression.
- Cross-process-shaped duplicate recognition on the same host filesystem.
- Correlated execution receipt contract requiring mission/task/wake/host/worker/budget/code identity.
- `COMPLETED` requires evidence.
- Fail-closed stale claim recovery assessment: stale claims become `RECOVERY_REQUIRED`; automatic lock stealing remains prohibited.

## Still not proven

- Authenticated remote transport/provider.
- Durable admitted-task pickup wired into the existing scheduler/local-wake path.
- Persistent host identity lifecycle.
- Correlated recovery resolution after a crashed claimant.
- Result persistence failure injection through the full bridge path.
- Physical Windows acceptance with the owner on mobile and not touching the laptop.
- Independent Green/PRS assurance for the completed bridge.

## Physical acceptance remains the completion gate

AgentOS may not claim remote laptop execution until a bounded read-only DRY_RUN request is submitted remotely, picked up by the always-on Windows host without interactive input, executed exactly once through the governed worker path, returned with exact correlated evidence, and independently reconciled.

No direct remote shell, inbound convenience port, production credentials, production writes, production autonomy, or assurance self-certification are introduced by this branch.

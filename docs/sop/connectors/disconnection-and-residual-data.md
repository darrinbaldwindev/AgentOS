# SOP-CONNECTOR-001 — Connector Disconnection and Residual Data

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
Disconnecting/revoking a connector stops future AgentOS access only to the extent proven by the connector/authentication mechanism. It does not automatically delete data already copied into AgentOS, logs, indexes, backups or the provider's own systems.

## Disconnect UX
Before confirmation state connector/account identity, scopes being revoked, effect on scheduled/running work, locally retained data/indexes, provider-side data status, credentials/tokens affected, pending writes/actions and any separate deletion steps.

## Procedure
1. Identify exact connector/account and canonical credential reference.
2. Stop future admission requiring that connector.
3. Revoke/disconnect through the supported mechanism when authorised.
4. Verify revocation result where possible.
5. Identify cached/copied/local/indexed data and apply retention/deletion policy.
6. Identify running tasks separately; revocation != proof they stopped.
7. Record residual provider-side data as provider-controlled unless deletion is separately evidenced.
8. Persist disconnection receipt without secret material.

## Truth rules
- UI `Disconnected` != provider deletion;
- token removal != deletion of copied content;
- connector revocation != cancellation of external subscriptions;
- local cache deletion != provider deletion;
- account deletion at provider != proven AgentOS local deletion.

If any residual-data status is UNKNOWN, show it as UNKNOWN and give the bounded next action rather than promising deletion.
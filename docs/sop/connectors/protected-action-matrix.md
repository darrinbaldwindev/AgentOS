# Connector / App Protected-Action Matrix

**Document ID:** SOP-CONNECTOR-002
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Principle
Connection, authentication and API capability do not grant action authority.

| Action class | Default treatment |
|---|---|
| Read/search | bounded by mission scope, data classification and provider permissions |
| Create draft/local proposal | may be allowed when explicitly scoped; no external effect implied |
| Send/publish/contact | protected external communication; explicit authority required |
| Update/delete/archive | protected mutation; exact target/scope and recovery consequences required |
| Purchase/pay/subscribe | protected financial action; explicit owner authority required |
| Credential/permission/security change | protected security action; explicit authority required |
| Deploy/production mutation | protected production action; explicit authority required |
| Contract/terms acceptance | protected legal/commercial action; explicit authorised human decision required |

## Runtime checks
Every mutating call should bind canonical mission/task/actor, connector/account, exact target, requested action, approval/authority source, precondition evidence, idempotency/replay control and result evidence.

Retries must not repeat non-idempotent side effects merely because a result receipt was lost.

## UX
Simple, Essentials and Tech Head may expose different detail, but the underlying permission decision and protected-action classification must be identical.

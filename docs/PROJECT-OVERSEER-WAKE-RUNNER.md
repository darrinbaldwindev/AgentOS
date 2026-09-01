# Project Overseer Wake Runner

The scheduled workflow is the first runtime trigger for the Project Overseer wake path.

## Safety boundary

- The workflow is read-only (`contents: read`).
- It does not receive write credentials.
- It runs deterministic wake/response tests only.
- It uses a concurrency group so overlapping scheduled runs are not cancelled.
- The runtime timeout bounds execution.
- Actual repository mutations remain behind separately authorised execution paths.

## Current status

This proves that GitHub Actions can periodically invoke the AgentOS wake verification suite. It does **not** yet prove that the workflow is reading and executing real portfolio tasks. Production task execution requires a separately authorised write-capable runner and commit-scoped evidence.

## Promotion gate

Do not add write permissions or external-provider execution until the deterministic suite is green and the required authority, lease/idempotency, audit, rollback and independent assurance controls are present.

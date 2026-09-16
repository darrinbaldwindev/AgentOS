# AgentOS Doctor Evidence Contract

**Document ID:** SOP-ONBOARD-002
**Status:** PRODUCT-DIRECTION / IMPLEMENTATION-DEPENDENT

## User question
Doctor should answer from evidence: **What is configured? What is verified working? What is degraded/blocked? What needs the user?**

## Diagnostic domains
- AgentOS version/runtime/platform;
- canonical authority/governance availability;
- worker/local-wake/scheduler connectivity without duplicating them;
- project-root/path capability;
- provider/model connectivity and eligible routing;
- connector/app configuration;
- persistence/receipt/recovery health;
- Green/PRS availability/status boundaries;
- budget/cost configuration;
- privacy/data-routing configuration;
- pending approvals/user actions.

## Status vocabulary
`PASS_FOR_SCOPE`, `DEGRADED`, `BLOCKED`, `USER_ACTION_REQUIRED`, `UNKNOWN`, `NOT_CONFIGURED`, `NOT_APPLICABLE`.

## Rules
Doctor is diagnostic only. It cannot grant authority, repair by performing protected actions without approval, certify legal compliance, mark Green/PRS, or convert a successful connectivity check into end-to-end readiness.

Each result should include evidence source/time/version and a bounded next action. Sensitive values must be redacted.

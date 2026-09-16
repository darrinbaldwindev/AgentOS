# SOP-COST-001 — Budget and Cost Control

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
A mission budget is an execution constraint, not spending authority. Technical access to a paid model/API/marketplace/provider does not authorise new spend.

## Budget envelope
Bind mission/task, owner, currency, hard maximum, period, provider/model/tool classes, per-action ceiling where needed, reservation semantics, actual-cost source, alert thresholds, circuit breaker, approval requirement, expiry and reconciliation destination.

## Admission
Before a chargeable action verify authority, approval where required, remaining budget, provider/capability eligibility and current cost estimate. UNKNOWN material cost that could breach the envelope fails closed or requires explicit approval.

## Reservation/reconciliation
Reserve before attempted chargeable execution when supported. Reconcile attempted/actual cost after execution, including failed attempts that incur charges. Never erase spend because the mission failed.

## Circuit breaker
On exhausted budget, inconsistent accounting, unexpected provider price, runaway retry/replay, duplicate reservation or missing cost evidence: stop further chargeable admission and surface the exact blocker. Do not switch silently to another paid provider to bypass the limit.

## Routing
AgentOS may optimize quality/cost/speed across eligible providers, but routing cannot cross data/authority/capability boundaries or convert an optional AI subscription into permission for unrelated commercial spending.

## Product boundary
Free/Standard/Advanced/AI Plus/Business pricing direction does not prove runtime entitlements, provider quotas, billing implementation or customer spend authority. Documentation must keep those separate until implemented and evidenced.
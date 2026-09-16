# Provider Outage, Fallback and Cost-Routing SOP

**Document ID:** SOP-PROVIDER-002
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Purpose
Keep provider/model fallback truthful, bounded and governed when a provider is unavailable, degraded, rate-limited or unexpectedly expensive.

## Rules
- A configured fallback is capability, not permission to use it.
- Re-check mission authority, data classification, provider eligibility, budget and user approval before routing.
- Never move data from a local/private path to a cloud provider merely to preserve availability.
- Never silently cross a user-set spend ceiling, provider restriction or data boundary.
- If fallback changes material privacy, capability, latency, quality or cost characteristics, expose that fact to the user when relevant.
- A cheaper model may be selected only inside existing quality/governance requirements; cost optimisation cannot bypass acceptance criteria.
- Provider failure must not be reported as mission failure if a governed fallback is still legitimately available; conversely, fallback availability must not be reported as successful execution.

## Evidence
Record original provider/model, failure/degradation class, fallback candidate, authority/budget/data checks, selected route, cost evidence where available and final execution/result correlation.

## Fail closed
Hold when provider eligibility, data handling, authority, approval or budget is UNKNOWN or conflicting.

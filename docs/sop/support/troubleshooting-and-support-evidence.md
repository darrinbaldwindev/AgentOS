# SOP-SUPPORT-001 — Troubleshooting and Support Evidence

Status: DRAFT / IMPLEMENTATION-DEPENDENT

## Rule
Support explains and diagnoses observed state; it must not manufacture authority, mutate production, expose secrets or convert a hypothesis into a confirmed cause.

## Support packet
Record issue ID, user-reported symptom, environment/version/exact head where available, timestamps, relevant mission/task/receipt IDs, reproduction status, logs/evidence references, data sensitivity, attempted steps, observed result, classification (VERIFIED FACT / REASONABLE INFERENCE / UNKNOWN), escalation owner and next safe action.

## Procedure
1. Preserve the user's symptom separately from diagnostic conclusions.
2. Gather the minimum necessary evidence; redact credentials/PII.
3. Reproduce only in a bounded environment when safe.
4. Separate configuration, provider, network, authority, capability, scheduler, worker, receipt, Green/PRS and product defects.
5. Do not advise bypassing governance to make a symptom disappear.
6. Mark destructive fixes, credential changes, production writes, billing changes and external contacts as protected actions.
7. After a fix candidate, verify the original symptom and regression scope on the exact version.
8. Record unresolved uncertainty and escalation rather than declaring solved.

A closed support ticket proves workflow closure only; it does not prove root cause, product-wide remediation or independent assurance.
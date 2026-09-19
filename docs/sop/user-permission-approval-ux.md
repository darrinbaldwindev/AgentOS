# SOP-USER-002 — Permission and Approval UX Truth Contract

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
Simple, Essentials and Tech Head change presentation density, not authority. The same action against the same current state must resolve to the same permission/approval outcome regardless of mode.

## Before approval
Show the action in user language, target, meaningful side effects, external recipient/destination if any, production/non-production context, cost/spend where material, data leaving the device where material, and whether approval is one-shot/bounded/expiring.

## States
Use distinct states for `permission required`, `approval requested`, `approved`, `denied`, `expired`, `revoked`, `execution started`, `stop requested`, `execution stopped`, `verification pending`, `verified`, `Green pending/passed/failed`, and `PRS pending/passed/failed` where applicable.

Never render approval as completed work. Never render Stop requested as Execution stopped. Never render worker success as Green/PRS.

## Mode behavior
- Simple: plain-language decision, consequences and safest essential evidence.
- Essentials: adds scope, approval/receipt state and key verification.
- Tech Head: adds IDs, exact target/head, policy/authority source, correlation and detailed evidence.

All modes retain access to required detail and the same stop/revoke path.

## Dark-pattern prohibition
Do not preselect materially risky approval, disguise denial, use urgency/scarcity to push permission, bundle unrelated consent, or make decline materially harder without necessity.

## Changed conditions
If target, head, recipient, cost, data scope, action or risk materially changes after approval display, require revalidation rather than silently executing the changed action.
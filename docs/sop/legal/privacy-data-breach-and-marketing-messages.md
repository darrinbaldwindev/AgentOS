# SOP-LEGAL-002 — Privacy, Data Breach and Commercial Messaging Baseline (Australia)

**Status:** LEGAL REVIEW REQUIRED / IMPLEMENTATION-DEPENDENT  
**Owner:** SOP Overseer  
**Jurisdiction:** Australia  
**Last researched:** 2026-09-15

## Purpose

Provide one fail-closed operational baseline for determining whether privacy, data-breach and commercial-electronic-message obligations apply before personal information processing or marketing automation is enabled.

## A. Privacy applicability gate

1. Identify the legal entity/controller and Australian operating facts.
2. Determine whether the Privacy Act covers the entity. Do not assume the general turnover threshold is the only test; statutory exceptions can cover smaller organisations.
3. Record `APP_ENTITY = YES / NO / UNKNOWN` with evidence and date.
4. If UNKNOWN and personal information processing is material, do not claim APP compliance or publish an APP policy as legally approved without review.

If APP_ENTITY = YES:

- maintain a clearly expressed and up-to-date APP Privacy Policy;
- include APP 1 required information about collection/holding, purposes, access/correction, complaints and likely overseas disclosure/countries where practicable;
- distinguish the APP Privacy Policy from APP 5 collection notification;
- implement practices/procedures/systems supporting APP compliance;
- review material data flows, processors/providers, retention, security and overseas disclosures against actual behaviour.

## B. 10 December 2026 automated-decision gate

Before 2026-12-10, inventory any arrangement where a computer program uses personal information to make a decision that could reasonably be expected to significantly affect an individual's rights or interests.

For an APP entity, applicable arrangements trigger additional APP Privacy Policy information requirements from 2026-12-10. AgentOS must not wait until publication day to discover this data flow.

Record:

- decision/use case;
- personal information categories;
- program/model/provider role;
- significance assessment;
- human review/appeal where applicable;
- privacy-policy impact;
- legal-review status.

## C. Data breach procedure

For suspected personal-information breach:

1. CONTAIN — stop/limit further compromise without destroying evidence.
2. ASSESS — establish facts, affected information/people, access/disclosure/loss, likely harm and remedial actions.
3. NOTIFY — where NDB or another applicable law requires notification, follow the authorised regulator/individual notification process.
4. REVIEW — preserve incident evidence, root cause, remediation and prevention actions.

Maintain a written response plan, clear escalation roles, contact paths and exercises appropriate to the risk. A technical incident receipt is not a legal NDB determination.

## D. Commercial email/SMS gate

Before sending a covered commercial electronic message:

1. record the consent/legal sending basis and evidence;
2. identify the sender accurately and provide required contact information;
3. provide a clear functional unsubscribe method;
4. ensure unsubscribe remains functional for the required period;
5. action unsubscribe within the statutory timeframe;
6. suppress future covered messages after effective unsubscribe unless a lawful exception applies;
7. retain evidence of consent, message version, send event and unsubscribe handling.

Australian ACMA guidance states that covered commercial messages require compliant sender identification and unsubscribe controls; unsubscribe requests must be honoured within 5 working days and the facility must remain functional for at least 30 days after sending.

## Automation controls

An Overseer/worker/marketing agent MUST NOT infer consent from possession of an address, purchase history, a scraped contact, or another worker's unsupported statement. UNKNOWN consent fails closed for covered marketing sends.

A scheduler or Autonomy Hours setting does not create authority to send communications. Content360 or another distribution system is downstream of approved content, claims, audience, consent and publication authority.

## Evidence and review

Every legal determination records:

- entity;
- jurisdiction;
- applicability classification;
- primary/regulator source;
- retrieval date;
- product/data-flow facts relied upon;
- unresolved facts;
- reviewer/status;
- next review trigger/date.

Material product/data-flow changes invalidate stale applicability assumptions.

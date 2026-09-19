# AgentOS Family Safety + Split View Contract

**Owner direction:** 2026-09-19  
**Status:** ACTIVE PRODUCT DIRECTION — DESIGN/ARCHITECTURE ONLY  
**Canonical issue:** #130  
**Related UI issue:** #21

## Purpose

AgentOS should be safe and understandable enough for families while preserving the same canonical governance, evidence and authority model used by every other AgentOS profile.

AgentOS should also make **Split View** a signature interaction model:

> **Talk on one side. See the work happen on the other.**

This document defines product and architecture requirements. It does **not** grant production authority, deployment permission, Green/PRS PASS, parental-control certification, endpoint-security certification, or permission to modify a device without explicit governed authority.

## Relationship to the product-surface contract

This work strengthens existing canonical pillars rather than adding a second product hierarchy:

- **Chat & Projects** — family conversations, schoolwork, projects and local history.
- **Connections** — browser/apps/services available to a profile.
- **Control & Cost** — parent policy, approvals, spend and capability restrictions.
- **Evidence & Recovery** — safety-check results, blocked actions, parent-attention events and recovery.

Split View is a cross-cutting presentation pattern over these pillars, not a new source of truth.

Simple / Essentials / Tech Head remain presentation views over the same underlying state. Profile type and complexity view are orthogonal.

## Family profile model

Initial profile roles:

- **Parent / Guardian**
- **Teen**
- **Child**
- **Guest**

Age may select a conservative starting template, but **age alone must never be the authority source**. Effective capability is derived from durable parent/guardian policy plus canonical AgentOS authority and permissions.

### Required separation

Profile boundaries must isolate at minimum:

- memory and chat history;
- local files and project access;
- browser/session state;
- credentials and connected accounts;
- app/tool permissions;
- spend/budget authority;
- external communication authority;
- automation authority;
- sensitive settings and recovery paths.

Switching profile, UI mode, browser surface, app surface or widget must never increase authority.

## Parent policy

Parent policy should be capability-oriented and plain-language. Candidate controls include:

- approved sites/categories;
- approved apps/tools;
- school/study-only mode;
- quiet hours / bedtime;
- no purchases or explicit spend ceiling;
- ask before install/update;
- ask before account creation;
- ask before external messaging/contact;
- block high-risk computer actions;
- restrict AI/model/tool classes;
- approved project/file locations;
- require parent approval for permission changes.

A child prompt, model output, browser page, app UI or local file must never be able to synthesize parent approval.

Sensitive parent-policy changes require parent authentication or a stronger approved step-up mechanism.

## Parent Assurance surface

Parents should receive concise safety evidence, not a surveillance dashboard.

The surface should answer:

1. What is this profile allowed to do?
2. What did AgentOS block?
3. What is waiting for parent approval?
4. Did any safety or permission setting change?
5. What device-security checks passed, failed, or could not be verified?
6. What action, if any, should the parent take?

Avoid indiscriminate logging of the child's private content. Prefer policy events, safety findings, approvals and evidence receipts.

## Family Safety Check

AgentOS should provide a read-only safety assessment during setup and on demand.

Potential Windows/device checks include:

- OS update posture;
- firewall state;
- endpoint/antivirus protection state;
- local administrator/account separation;
- screen-lock/session protections;
- risky startup or persistence items;
- exposed remote-access software;
- unsafe local sharing/permissions;
- browser security configuration;
- suspicious/high-risk browser extensions;
- OS/vendor parental-control configuration gaps;
- AgentOS install/config integrity.

### Evidence states

Each check must report one of the canonical evidence-oriented outcomes, for example:

- **VERIFIED** — the stated condition was actually checked with current evidence;
- **NEEDS_ATTENTION** — verified condition requires review;
- **BLOCKED** — AgentOS could not perform the required inspection due to authority/environment constraints;
- **UNKNOWN** — evidence is absent, stale or unsupported.

No overall "safe" result may be synthesized if required checks are UNKNOWN or BLOCKED.

AgentOS should not claim to replace Windows security, endpoint protection, browser security products or OS/vendor parental controls.

### Remediation boundary

Discovery/inspection and remediation are separate phases.

The Safety Check may inspect within approved read-only authority. Any repair that changes the machine must pass through existing governed execution, approvals, receipts and assurance.

No new unrestricted PowerShell, admin/elevation bypass, autonomous security remediation or family-specific mutation plane is permitted.

## Split View

Split View is the signature AgentOS workspace pattern.

### Core layout

- **Conversation pane:** Chat / Overseer / project conversation.
- **Working pane:** contextual surface selected by the task and user.

Working-pane surfaces may include:

- governed browser;
- app view;
- document/file;
- widgets;
- dashboard;
- project/jobs view;
- calendar;
- reference/media view;
- worker activity;
- receipts/evidence/recovery view.

### Natural interaction examples

- "Open this beside me."
- "Research on the right."
- "Keep the assignment open while we work through it."
- "Show Mum what changed."
- "Put the browser next to the chat."
- "Show the worker evidence beside the result."

### Safety rule

Rendering a surface never grants authority. Every browser/app/widget/worker action remains subject to the same canonical profile policy, AgentOS permissions, approval state, Green/PRS gates and receipt requirements that would apply without Split View.

## Complexity views

### Simple

- large conversation pane;
- clear live working pane;
- minimal controls;
- plain-language parent/child affordances;
- approvals surfaced only when necessary.

### Essentials

- additional useful widgets;
- projects/jobs context;
- concise parent/safety/status views;
- standard approvals and recovery.

### Tech Head

- detailed policy/effective permissions;
- worker/provider routing;
- receipts/correlation/evidence;
- security findings;
- Green/PRS/recovery detail.

A Child profile using Tech Head still has Child authority. A Parent using Simple still retains Parent authority. Presentation never changes capability.

## Local-first and history requirements

Family safety must not require cloud availability to fail closed where local policy is sufficient.

Future local Chat Vault/history support must:

- partition/index history by governed profile;
- prevent cross-profile retrieval by default;
- keep raw family chat history local unless explicitly exported;
- never auto-commit private child/family chat transcripts to GitHub;
- permit project-level extraction of durable decisions without exposing the full raw conversation.

## Threat model / adversarial acceptance

Before family-safety capability can make production claims, tests must cover at least:

1. child attempts to approve their own restricted action;
2. child attempts to switch profile or UI mode to gain capability;
3. stale/missing parent policy;
4. forged parent-policy evidence;
5. restart/crash during profile switch;
6. browser/app/widget action bypassing profile policy;
7. cross-profile credential/session leakage;
8. cross-profile local-memory/file leakage;
9. offline policy enforcement;
10. stale Safety Check evidence displayed as current;
11. unsupported device check falsely displayed as passed;
12. remediation attempt without authority;
13. parent approval replay;
14. child-controlled content attempting to alter policy;
15. extension/site/app attempting to escape governed Split View actions.

## First implementation slices

The preferred order is:

1. **Profile + effective-policy schema** — data contract only; no UI-local authority.
2. **Read-only policy evaluator** — fail closed, deterministic, independently testable.
3. **Cross-profile isolation fixtures** — memory/files/credentials/browser-session negatives.
4. **Safety Check read-only evidence schema** — findings and freshness before remediation.
5. **Split View shell** — canonical-state projection only; no additional action authority.
6. **Parent Assurance projection** — derived from policy/evidence/receipts, not raw surveillance.
7. **Governed remediation adapters** — only after existing execution/approval pathways can carry them safely.

## Non-goals

- covert child monitoring;
- keylogging;
- continuous screen capture for parents;
- family-specific scheduler, ledger, authority or receipt plane;
- automatic elevation/admin access;
- unverified "device safe" scoring;
- bypassing Windows/vendor parental controls;
- production activation from product documentation alone.

## Product identity

Working positioning:

> **AgentOS — AI the whole family can use safely.**
>
> **Talk on one side. See it work on the other.**

The product promise must be backed by visible governance and evidence, not by hiding complexity or asserting safety without proof.
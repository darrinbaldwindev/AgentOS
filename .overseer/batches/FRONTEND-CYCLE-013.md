# AgentOS Frontend Overseer — Cycle 013

**Date:** 2026-09-15 Australia/Brisbane  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Status:** ACTIVE / AMBER

## Owner direction consumed

The three recent product mockups — Simple, Essentials and Tech Head — are now treated as the canonical frontend direction, with one crucial architecture rule: they are disclosure/presentation modes over one AgentOS truth and capability model, not three products and not three authority levels.

Switching view must never grant permissions, start/stop work, alter authority, bypass Jack, change Green/PRS requirements, change execution mode, change autonomy, or manufacture capability/readiness.

## Fresh reconciliation

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- #104: `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`; mutation remains SG-08 BLOCKED.
- #110 before Cycle 013: `cc3c19738b1559ea647abf7168fe3c754738749f`.
- #111 before Cycle 013: `2bd30bc456fdd1f564d0c938b21ed17de001888e`.
- #112: `d1645450a06d00c49a7a78f176e97b44b9eaa225`.

## Cycle 013 implementation

A first bounded three-mode shell contract was implemented directly on the existing Basic Chat UI rather than creating a parallel frontend application.

### View switcher

Basic Chat now exposes an accessible radio-group choice:

- Simple
- Essentials — default
- Tech Head

The UI explicitly states:

> View changes detail only. It does not change permissions, running work, safety checks, or AgentOS capabilities.

The mode selection is browser-local presentation state only. It does not call `/api/send`, `/api/control`, a new endpoint, persistence, authority, scheduler, worker or readiness source.

### Disclosure behavior

Current bounded behavior deliberately changes only density:

- Simple hides technical disclosure blocks and the detailed evidence definition list while retaining the conversation, status, job controls, evidence summary and composer.
- Essentials preserves the current bounded Basic Chat presentation and is the default.
- Tech Head retains all current disclosures and allows a wider content surface.

This is not yet the full mockup shell. Projects, Inbox, Jobs, Palette, Connectors, Research, analytics, system-health widgets, character cards and upgrade surfaces must be added only when their canonical backing contracts are available. No fake navigation/status widgets were introduced.

### Accessibility and regression guards

Static tests now require all three mode controls, the explicit presentation-only disclaimer, keyboard focus visibility, mobile stacking and the absence of view-mode network/API behavior.

Final #111 exact head: `46ac1c0ccab9262b2df1f64400a8686aea667500`.

AgentOS Tests #1294 (`34930109294`) completed SUCCESS: general suite, npm audit and Windows Basic Chat lifecycle all passed.

## Mockup-to-runtime rule

The mockups are product direction, not evidence that every widget exists. Future implementation must follow this order:

1. preserve the large chat/composer in every mode;
2. build one shared shell/navigation model;
3. expose a widget only from canonical read-only state;
4. expose an action only when canonical mutation/authority semantics exist;
5. Simple translates and hides complexity; it does not weaken governance;
6. Tech Head reveals more evidence/diagnostics; it does not gain hidden authority;
7. all modes see the same job, permission, evidence and assurance truth.

## Current blocked mockup surfaces

- project-file mutation: SG-08 BLOCKED;
- Jack interactive Allow/Revoke/Always Allow: durable lifetime/expiry/revoke semantics not evidenced;
- Henry/PRS PASS: independent assurance source not wired to Basic Chat;
- recovery status: contract-only, no live producer/read projection;
- physical Windows readiness: must use canonical exact-head evidence;
- system-health claims: require fresh canonical host/scheduler/worker evidence;
- full Projects/Inbox/Jobs/Connectors/Research surfaces: product direction, not yet established as this branch's canonical data contracts;
- commercial upgrade controls: pricing direction exists, checkout/entitlement implementation not proven;
- physical browser/mobile acceptance: not proven.

## Governance

No merge, approval, ready transition, rebase, deploy, credential change, production write, autonomy, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

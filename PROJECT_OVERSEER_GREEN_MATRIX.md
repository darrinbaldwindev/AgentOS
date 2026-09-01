# AgentOS — Project Overseer GREEN Matrix

**Updated:** 2026-09-01

## Control objective
Maintain one durable communication and verification chain between the portfolio Head Overseer, AgentOS Project Overseer, each Project Overseer, authorised workers, and the canonical project logs.

## Required chain

`CHATGPT Head Overseer → Project Overseer → authorised worker → evidence → independent verification → project log → Head Overseer`

## Portfolio registry

| Project | Repository | Communication endpoint | Current evidence state |
|---|---|---|---|
| AgentOS | `darrinbaldwindev/AgentOS` | AgentOS control plane / dispatch | GREEN on deterministic test suite; CORE-006 promotion PR open |
| GlobalShopCo | `darrinbaldwindev/GlobalShopCo` | Project Overseer coordination issue | GREEN communication bridge established; commercial work remains milestone-gated |
| GlobalShopCo-Headless | `darrinbaldwindev/GlobalShopCo-Headless` | Project Overseer coordination issue | GREEN communication bridge established; M3 remains implementation-gated |
| GhostKitchen | `darrinbaldwindev/GhostKitchen` | Project Overseer coordination issue | Bridge required/being established; no unsupported completion claim |
| MyPrimeDelivery | `darrinbaldwindev/MyPrimeDelivery` | Project Overseer coordination issue #1 | GREEN communication endpoint established; repository currently has no open issues |
| GemVerse | `darrinbaldwindev/GemVerse` | Project Overseer coordination issue #2 | GREEN communication endpoint established |
| PRS | `darrinbaldwindev/PRS` | Issue #9 / canonical PRS log | Active v0.1 assurance task; independent verifier boundary preserved |

## GREEN definition

A project is not GREEN merely because a communication issue exists. GREEN requires:

1. current repository state has been inspected;
2. delegated work has a durable task identity;
3. authority/scope is explicit;
4. execution is evidenced or explicitly blocked;
5. completion is independently verified where execution occurs;
6. the result is durably recorded;
7. the next authorised action is identifiable;
8. no owner-only boundary is silently bypassed.

## AgentOS infrastructure status

- Canonical machine state remains `.agentos/state`.
- Canonical dispatch authority remains `.agentos/dispatch`.
- Agent registry identifies `chatgpt:head-overseer` → `agentos:overseer` → delegated workers.
- Manus remains unavailable until an active connection/subscription is independently confirmed.
- Gemini is available as a delegated worker but is not treated as an independent completion authority.
- Latest repaired AgentOS test run: **173/173 passing** on CORE-006 branch.
- GlobalShopCo deterministic worker fixture: independently observed `claimed → working → verification → completed`.

## Owner boundary

This matrix never authorises production deployment, credentials, provider activation, payment/financial commitments, permission grants, or protected scheduler changes. Such conditions remain explicit owner gates.

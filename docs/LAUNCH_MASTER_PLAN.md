# AgentOS Launch Master Plan

**Status:** ACTIVE — control plan
**Date:** 2026-09-01

## Launch principle

AgentOS launches when evidence satisfies the gates, not because a calendar date says it is ready.

## Master sequence

| Phase | Target | Work | How / acceptance gate | Owner | Status |
|---|---|---|---|---|---|
| 0 | Now–W1 | IP protection | Patent/IP review of Mission 033; classify patent candidates, trade secrets, copyright and trademarks; no premature public disclosure | Owner + IP counsel | **OPEN** |
| 1 | W1 | Archive/control plane | Canonical Gemini mission index; continuous mission/report integrity; no fabricated history | Overseer + Green Agent | **PARTIAL** |
| 2 | W1–W3 | AgentOS core | Policy → capability → authority → budget → bounded dispatch → worker → checkpoint → verification; deterministic end-to-end proof | AgentOS + PRS | **IN PROGRESS** |
| 3 | W1–W2 | PRS v0.1 | Independent evaluator verification; GREEN only after independent evidence | PRS | **IN PROGRESS** |
| 4 | W2–W4 | Green Agent | Reporting watches, durable findings, escalation/acknowledgement/resolution tests | Green Agent | **IN PROGRESS** |
| 5 | W3–W5 | Security | Threat model, dependency/secret scanning, independent security review | Security | **NEW / NOT STARTED** |
| 6 | W4–W6 | Product packaging | Core/SDK/middleware boundaries, developer experience, Open Core decision | Product + Engineering | **NOT STARTED** |
| 7 | W5–W8 | Governance Middleware | Extract reusable control-plane APIs; prove an external/non-AgentOS integration | Engineering | **NOT STARTED** |
| 8 | W5–W7 | Commercial | Pricing, unit economics, licensing, support model | Commercial | **NOT STARTED** |
| 9 | W6–W10 | Partnerships | Score 5–10 strategic targets; controlled partner disclosure; design-partner pilots | Business | **NOT STARTED** |
| 10 | W8–W12 | Pilot | 2–5 bounded real-world use cases; measure reliability, violations, escalations and cost | Product + Overseer | **NOT STARTED** |
| 11 | W10–W14 | Enterprise readiness | Legal, privacy, security docs, compliance roadmap, SLA/support, incident response | Legal + Security + Ops | **NOT STARTED** |
| 12 | W13–W16 | Launch readiness | Independent audit and final GREEN gate; no unresolved critical findings | Independent reviewers | **NOT STARTED** |
| 13 | ~W16 | Launch | Public/controlled release only after all required gates pass | Owner + AgentOS | **NOT STARTED** |
| 14 | Continuous | Post-launch | Green Agent monitoring, security/IP monitoring, verified roadmap feedback | Green Agent + Overseer | **DESIGNATED** |

## Launch gates

1. IP reviewed/protected appropriately.
2. AgentOS P0 governed execution slice independently evidenced.
3. PRS v0.1 independently verified.
4. Green Agent continuous monitoring and escalation loop proven.
5. Security review passed.
6. Reusable governance middleware vertical slice proven.
7. Commercial/legal model ready.
8. Design-partner/pilot evidence obtained where required.
9. Independent launch review passed.

## Required work-item fields

Every launch item must track: **WHAT, HOW, EVIDENCE, GATE, OWNER, STATUS, BLOCKER, NEXT ACTION**.

## Security workstream

Security is now a first-class launch workstream. See `docs/AGENTOS_SECURITY_CONTROL_PLANE.md`. Scope includes identity, authentication, capability authorization, authority/delegation, policy integrity, sandboxing, data/tenant isolation, secrets, prompt-injection boundaries, supply chain, runtime monitoring, audit integrity, Green Agent protection, PRS independence, recovery/quarantine, partner/API security and provider/model isolation. Agent security levels A0–A4 must be governed by policy; agents cannot grant themselves authority.

## IP strategy

Before broad partner disclosure, assess Mission 033 and the AgentOS governance architecture for patentable inventions, trade secrets, copyright and trademarks. Public documentation must not disclose potentially protectable inventions before appropriate professional review.

## Open Core strategy

Evaluate a split between public SDK/integration/developer components and proprietary governance/control-plane capabilities. Final boundaries require IP and commercial review.

## Partnership strategy

Prioritise partners that add one or more of: distribution, cloud/execution infrastructure, identity/security, enterprise integration, AI-agent ecosystem access, credibility, or design-partner validation. Keep AgentOS provider/model agnostic and avoid strategic dependency on any single AI provider.

## Assurance model

AgentOS governs execution. Green Agent independently monitors control/reporting integrity and escalates. PRS independently assures project/system reliability. No layer may certify its own implementation without the required independent evidence.

## Current status

This plan is a launch control baseline, not a claim that the launch gates have passed. Current major gates remain in implementation/verification.

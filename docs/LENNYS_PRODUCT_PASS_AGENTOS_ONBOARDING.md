# Lenny's Product Pass → AgentOS Onboarding Program

Status: PLANNED / ONBOARDING BASELINE
Date: 2026-08-30

## Objective

Use the Lenny's Product Pass as a capability-acquisition base for AgentOS. Integrations must be provider/interface agnostic: AgentOS should route work by capability and available interface, not hard-code itself to one vendor.

## Initial 12 priority packages

| # | Program | Proposed AgentOS role | Priority | Activation status |
|---|---|---|---|---|
| 1 | n8n | Workflow/orchestration worker | P0 | Not claimed/activated |
| 2 | Cursor | Coding/repository worker | P0 | Not claimed/activated |
| 3 | Manus | General execution agent | P0 | Not claimed/activated |
| 4 | Google AI Pro / Gemini | Research/intelligence worker | P0 | Not claimed/activated |
| 5 | Factory | Software-development worker | P0 | Not claimed/activated |
| 6 | Gumloop | Cross-app automation worker | P1 | Not claimed/activated |
| 7 | Supabase | Persistence/backend capability | P1 | Not claimed/activated |
| 8 | Replit | Build/deployment worker | P1 | Not claimed/activated |
| 9 | Linear | Project/task management surface | P1 | Not claimed/activated |
| 10 | Notion | Knowledge/workspace layer | P1 | Not claimed/activated |
| 11 | Warp | Agentic development/terminal worker | P1 | Not claimed/activated |
| 12 | Jam | Bug/evidence capture worker | P1 | Not claimed/activated |

## Welcome-package contract

Each program should receive an onboarding package containing:

- confirmed Product Pass offer information
- purpose and useful AgentOS capability
- interface/access method (API, local runtime, CLI, browser, desktop app, MCP/tool, etc.)
- account and activation requirements
- required permissions
- security considerations
- proposed AgentOS adapter/worker
- initial safe test task
- evidence requirements
- verification criteria
- logging/checkpoint requirements
- fallback if the product cannot be automated

## Operating rule

Do not claim an offer has been claimed, activated, connected or tested until evidence exists. Product Pass availability, claim limits, eligibility and terms can change and must be checked at activation time.

## Integration architecture

AgentOS Overseer → Capability Router → Interface Worker → Product/Provider → Evidence → Verification → AgentOS state/log.

The scheduler/controller remains deterministic. LLMs advise on routing and prioritisation; they do not silently grant authority.

## Acquisition order

Start with the highest-value infrastructure/execution capabilities: n8n, Cursor, Manus, Google AI Pro/Gemini and Factory. Then add cross-app automation, persistence, build/deployment, project management, knowledge, terminal and evidence tooling.

## Acceptance criteria for the first 12

A package is READY only when its onboarding information is documented and the activation/test path is defined. It becomes ACTIVE only after the offer is actually claimed/connected. It becomes VERIFIED only after a real task produces evidence and passes the relevant verification criteria.

## Current note

This file records the AgentOS onboarding plan. It does not represent activation of any Lenny's Product Pass offer.

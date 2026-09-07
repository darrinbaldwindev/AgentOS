# AgentOS Dynamic Free Capability Registry — Specification

**Date:** 2026-09-07  
**Status:** RECOMMENDATION / DESIGN CONTRACT / NOT ACTIVATION AUTHORITY

## Purpose

Extend the existing AgentOS provider/model catalog with a maintained evidence layer for free, free-tier, local, open-source, worker and AI-adjacent capabilities without creating a second provider registry.

This specification reuses:

- `contracts/agentos-core-types.ts` for canonical provider/model/tool records;
- `catalog/capability_comparison_matrix.json` for capability comparison semantics;
- `catalog/provider_catalog_reconciliation.json` for historical provider/program evidence;
- existing provider-health and fallback policy for availability/degradation handling.

The free capability registry is therefore an **evidence + entitlement + freshness extension** over existing canonical records, not a parallel authority system.

## Core principles

1. **Capability first.** Rank suitability before commercial metadata.
2. **Free is dynamic.** Free allowances, models and terms can disappear or change; no long-term product rule should hard-code current provider quotas.
3. **Consumer free != callable free.** A consumer web/app allowance is not programmatic capacity unless an official integration path permits it.
4. **Open source != free hosted compute.** Local/open software still consumes user or infrastructure compute.
5. **Open weights != unrestricted commercial use.** Licence and commercial-use evidence remain explicit.
6. **Affiliate neutrality.** Referral/affiliate economics never influence capability selection.
7. **No activation by catalog entry alone.** Provider credentials, routing, writes and paid usage remain separately governed.
8. **Unknown remains unknown.** Missing evidence is never silently converted to `false`, `free`, `commercially permitted` or `safe`.
9. **Replaceability is strategic.** Free capabilities should be grouped by task capability so providers/models can be swapped without changing the user-facing product.
10. **Australia matters.** Availability and regional restrictions must be recorded for the initial market.

## Access classification

Every candidate receives one access class:

- **A — free_programmatic:** official API/MCP/programmatic interface with recurring free allowance.
- **B — local_open:** runs locally/private infrastructure without per-call provider inference charge.
- **C — consumer_free:** free for a human through an app/site; not automatically AgentOS-callable.
- **D — free_worker:** free/open agent/worker that AgentOS can legitimately delegate to.
- **E — free_adjacent:** search, database, automation, browser, observability, storage, sandbox or other useful adjacent capability.
- **F — trial_promotional:** one-time/temporary credit or evaluation access; never counted as durable Free-tier capacity.
- **G — paid_strategic:** no durable free allowance but strategically useful enough to retain as a provider candidate.

## Extension record

The following metadata should be associated with canonical `ProviderRecord`, `ModelRecord` or `ToolRecord` identifiers rather than replacing those records.

```text
CapabilityEvidenceRecord
  canonicalId
  canonicalKind                provider | model | tool | worker | infrastructure
  accessClass                  A | B | C | D | E | F | G
  capabilityTags[]
  freeStatus                   yes | no | trial | unknown | dynamic
  recurringFree                true | false | unknown
  freeAllowance
    value
    unit
    resetPeriod
    dynamic
  creditCardRequired           true | false | unknown
  australia
    available
    apiAvailable
    restrictions[]
  integration
    api
    mcp
    rest
    openAiCompatible
    anthropicCompatible
    localServer
    cli
    oauth
  licence
    name
    url
    commercialUse              permitted | restricted | evaluation_only | unknown
    redistribution             permitted | restricted | unknown
    attributionRequired        true | false | unknown
  dataPolicy
    retention                  known value | unknown
    trainingOnInputs           yes | no | opt_out | unknown
    region                     known value | unknown
  modalities[]                 text | image | audio | video | documents | embeddings | search | code | tools
  technical
    contextWindow
    maxOutput
    tools
    structuredOutput
    vision
    audio
    embeddings
    search
    coding
  freeEconomics
    durabilityScore
    quotaUsefulnessScore
    localComputeRequired
  health
    lastVerifiedAt
    sourceFreshnessDays
    currentEvidenceStatus      current | stale | expired | unknown
    officialSources[]
  agentOs
    roleTags[]                 planning | execution | governance | assurance | research | coding | browser | memory | media | infrastructure
    suggestedTier[]            free | 29 | 99 | subscription
    activationPosture          do_not_activate | candidate | owner_review_required | eligible_if_connected
    integrationScore           0..100
    risk                       low | medium | high | unknown
    fallbackGroup
  notes
```

## Scoring model

Use the current working 100-point research score:

- Capability: 20
- Integration quality: 20
- Free economics: 15
- Reliability: 10
- Commercial suitability: 10
- Privacy/control: 10
- Replaceability: 5
- Maintenance/activity: 5
- Strategic differentiation: 5

Bands:

- **90–100:** P0 / integrate early candidate
- **75–89:** P1 / strong candidate
- **60–74:** P2 / useful
- **40–59:** watch
- **0–39:** avoid / low value

A high score still does **not** authorize activation.

## Capability groups

User-facing tiers should be built around outcome groups rather than model inventory.

Suggested groups:

- **Think:** reasoning, planning, classification, analysis
- **Create:** writing, editing, translation, media
- **Find:** search, crawl, retrieval, comparison
- **Understand:** documents, OCR, tables, images, audio
- **Build:** coding, debugging, data work
- **Do:** browser, email, files, calendar, business systems
- **Remember:** context, embeddings, vector/RAG, project memory
- **Assure:** evidence, evaluation, tracing, verification
- **Protect:** policy, secrets, PII, guardrails, permissions

Every capability should declare a `fallbackGroup` so AgentOS can replace one supplier with another without changing the user's job model.

## Commercial tier relationship

The registry should support entitlement without making plugin count the headline product promise.

### Free

- small, genuinely useful capability envelope;
- free/local resources preferred where suitable;
- conservative limits and mostly interactive usage;
- consumer-free apps may be catalogued but not counted as callable capacity.

### $29/year

- larger capability envelope;
- more specialist free/open workers;
- more multi-step work, context and scheduled delegation;
- greater access to paid/included intelligence where authorised.

### $99/year

- broadest practical capability envelope;
- higher capacity and concurrency;
- more recurring/autonomous work;
- advanced routing, recovery and assurance;
- more integrations and larger permitted resource budgets.

### Additional subscriptions / BYO AI

- premium/specialist providers;
- higher quotas;
- business/team services;
- advanced or high-scale capability.

## Dynamic verification rules

A capability must be revalidated when any of these change:

- provider pricing/free allowance;
- model list or model ID;
- rate limits;
- API/MCP availability;
- commercial-use terms;
- privacy/training policy;
- regional/Australian availability;
- licence;
- provider health/deprecation;
- integration compatibility.

Suggested freshness policy:

- volatile free-tier/API data: verify at least every 7–30 days depending on provider volatility;
- licence/commercial status: verify on detected licence/version/terms change;
- runtime health: use live health observations where connected;
- historical project evidence must never be promoted to `current` merely because it exists locally.

If current verification expires, downgrade activation posture automatically rather than silently preserving eligibility.

## Router relationship

Desired flow:

**User intent → required capability → policy/authority → entitlement → privacy → budget → healthy candidates → capability score → routing decision → execution → evidence → Henry assurance**

Commercial metadata is excluded from routing score except legitimate user cost/budget constraints.

## Free allowance handling

Never encode product logic such as `Provider X gives 10,000 units/day` as a permanent rule.

Store the current evidence as dynamic metadata and route against an abstract resource envelope:

- allowance remaining
- reset time if known
- provider health
- per-task estimated resource need
- quality floor
- user preference
- fallback options

The registry should support `DYNAMIC — QUERY REGISTRY` where a provider exposes changing limits/model lists.

## Night Shift / Autonomy Hours relationship

The registry can make scheduled work cheaper and more resilient by identifying capabilities suitable for unattended work, including:

- local inference;
- local OCR/document parsing;
- local embeddings/search;
- batch data processing;
- deterministic browser automation;
- recurring free API allowances where provider terms permit.

Night Shift must not bypass entitlement, authority, budget or provider terms. A temporal window only changes when eligible work may run.

## First integration research queue

Based on current independent research, the first external candidates to verify against this schema should include:

### Intelligence / inference

- Gemini Developer API
- OpenRouter Free Router
- Groq
- Cloudflare Workers AI
- Mistral developer/free access
- NVIDIA NIM development access
- Ollama
- LocalAI
- llama.cpp
- vLLM

### Research / retrieval

- Tavily
- Firecrawl
- Exa
- Jina Reader/Search
- Brave Search API
- SearXNG

### Execution / integration

- Playwright
- Composio
- Activepieces
- n8n
- Node-RED

### Coding workers

- OpenHands
- Cline
- Aider
- Qwen Code

### Memory / data

- SQLite
- DuckDB
- PostgreSQL/pgvector
- Qdrant
- Supabase

### Assurance / observability

- Langfuse
- OpenTelemetry
- promptfoo / evaluation candidates

This list is a **research queue**, not an activation list.

## Required next evidence

For each P0/P1 candidate, capture from official sources:

1. exact current free/paid status;
2. recurring allowance and reset semantics;
3. API/MCP/local interface;
4. Australia availability;
5. commercial-use/redistribution limits;
6. data retention/training policy;
7. current model/service IDs;
8. capability evidence;
9. provider health/deprecation status;
10. AgentOS integration score and fallback group.

## Safety and governance

This registry must never contain:

- plaintext API keys/tokens/passwords;
- personal account identifiers;
- secret referral codes;
- unredacted credential material;
- authority grants inferred from catalog presence.

Activation remains subject to canonical credentials, permission, budget, policy and consent systems.

## Outcome

The strategic objective is not to advertise "hundreds of free plugins."

It is to let AgentOS maintain a replaceable pool of trustworthy capabilities so the user can simply say what they want done while AgentOS makes appropriate use of free, local, paid and user-connected resources within their authority and budget.

**One platform. Every AI. Make the most of AI.**

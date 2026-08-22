# AgentOS Capability Comparison Matrix

**Status:** Local evidence matrix for backlog task C2. The matrix uses only the synthetic B3 frontend fixtures and the A4 core type definitions. It does not claim live provider availability, current pricing, quotas, audio support, privacy certification, or production readiness.

## Evidence and scoring policy

The structured matrix is stored in [`capability_comparison_matrix.json`](./capability_comparison_matrix.json). A value of `unknown` means the supplied project evidence does not establish that property. Unknown is not equivalent to `false`, and no capability is inferred from a provider name, affiliate status, marketing label, or archived external URL.

Capability fit is considered before health and activation state. Affiliate metadata may be displayed for disclosure purposes, but it is **not a ranking input**. The local fixtures deliberately include an affiliate-supported and a neutral provider with equivalent capabilities so this neutrality rule can be tested.

## Model matrix

| Model | Streaming | Tools | Vision | JSON | Audio | Context window | Local availability | Privacy evidence | Cost evidence | Free tier | Required integration | Active |
|---|---:|---:|---:|---:|---|---:|---:|---|---|---:|---|---:|
| Local Coder 13B | Yes | Yes | No | Yes | Unknown | 32,768 | Yes | Local fixture only | Unknown | Yes | `fixture-provider-local` | Yes |
| Free Vision 8B | Yes | Yes | Yes | Yes | Unknown | 16,384 | No | Unknown | Unknown | Yes | `fixture-provider-free` | Yes |
| Credit Generalist 30B | Yes | Yes | Yes | Yes | Unknown | 64,000 | No | Unknown | Unknown | No | `fixture-provider-affiliate` | Yes |
| Neutral Generalist 30B | Yes | Yes | Yes | Yes | Unknown | 64,000 | No | Unknown | Unknown | No | `fixture-provider-neutral` | Yes |
| Unverified Basic 7B | Yes | No | No | No | Unknown | 8,192 | No | Unknown | Unknown | No | `fixture-provider-unverified` | No |
| Expired Vision 12B | No | No | Yes | No | Unknown | 12,288 | No | Unknown | Unknown | No | `fixture-provider-expired` | No |

The model rows are capability and state fixtures rather than live model catalog entries. Their provider health transitions are defined separately in `fixtures/frontend-provider-fixtures.mjs`, including available, rate-limited, degraded, offline, needs-connection, permission-denied, limited, and error states.

## Interpretation

The **Local Coder 13B** is the only row with explicit local availability and local-fixture privacy evidence. The **Free Vision 8B** is the only row that combines a recorded free-tier flag with vision support, but cost details beyond that flag and privacy characteristics remain unknown. The **Credit Generalist 30B** and **Neutral Generalist 30B** have equal capability and context fields in the supplied fixtures; affiliate metadata must not break their tie.

The inactive unverified and expired rows remain useful for UI and recovery testing but must not be presented as active selections. Their inactive state is not evidence that the corresponding real-world provider or program is expired; it is only the state encoded by the synthetic fixture.

## Agent coverage

The A4 contract defines `AgentProfile` and its planner, executor, and verifier model bindings, but the supplied project snapshot contains no concrete agent-profile fixture with capability declarations. Agent-level capability, streaming, audio, privacy, cost, free-tier, and integration values therefore remain **unknown** rather than being copied from model rows.

## Required evidence before promotion

Before a future implementation promotes any row into a live catalog or route selector, it must independently establish current model capabilities, provider health, context limits, pricing, free-tier eligibility, privacy treatment, required credential or integration state, and user-facing disclosure. Any current official evidence must be dated and linked in a separate owner-approved catalog update. This matrix alone authorizes none of those actions.

## Project-local sources

1. [`fixtures/frontend-provider-fixtures.mjs`](../fixtures/frontend-provider-fixtures.mjs), synthetic provider/model capabilities and health transitions.
2. [`contracts/agentos-core-types.ts`](../contracts/agentos-core-types.ts), typed provider, model, agent, integration, context, and credential boundaries.
3. [`catalog/provider_catalog_reconciliation.json`](./provider_catalog_reconciliation.json), local evidence-status classifications and no-activation policy.

# Historical Capability Comparison Matrix — GitHub Reference

**Imported from:** `darrinbaldwindev/AgentOS`, `catalog/CAPABILITY_COMPARISON_MATRIX.md`, accessed on 2026-08-22.  
**Source revision:** `a4eef3b` (repository head at inspection).  
**Status:** Historical planning reference only; not runtime configuration.

## Why this artifact was retained

The historical matrix documents a capability-first, evidence-limited comparison method. It explicitly treats unknown as unknown, keeps affiliate metadata out of capability ranking, and prohibits promotion of synthetic fixtures into live provider facts. Those principles align with the active dashboard’s local mock catalog and its governance constraints.

## Historical fixture matrix

| Model fixture          | Streaming | Tools | Vision | JSON | Context window | Local availability | Free tier | Active |
| ---------------------- | --------: | ----: | -----: | ---: | -------------: | -----------------: | --------: | -----: |
| Local Coder 13B        |       Yes |   Yes |     No |  Yes |         32,768 |                Yes |       Yes |    Yes |
| Free Vision 8B         |       Yes |   Yes |    Yes |  Yes |         16,384 |                 No |       Yes |    Yes |
| Credit Generalist 30B  |       Yes |   Yes |    Yes |  Yes |         64,000 |                 No |        No |    Yes |
| Neutral Generalist 30B |       Yes |   Yes |    Yes |  Yes |         64,000 |                 No |        No |    Yes |
| Unverified Basic 7B    |       Yes |    No |     No |   No |          8,192 |                 No |        No |     No |
| Expired Vision 12B     |        No |    No |    Yes |   No |         12,288 |                 No |        No |     No |

## Active-project interpretation

The active dashboard does **not** reuse these model names, context limits, provider states, pricing, privacy claims, or activation states as current data. It instead renders a capability comparison from its own deterministic local catalog (`shared/agentosMockFixtures.ts`) through the owner-gated `agentos.orchestration.catalog` procedure.

The imported reference supplies only the comparison method: display local fixture facts, make uncertainty explicit, keep capability fit ahead of affiliate metadata, and never imply live provider availability. It authorizes no provider call, credential use, affiliate activation, routing change, pricing claim, or external integration.

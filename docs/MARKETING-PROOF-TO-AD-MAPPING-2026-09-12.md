# AgentOS Proof-to-Ad Mapping — 2026-09-12

**Status:** MARKETING CLAIM CONTROL
**Purpose:** Define exactly what evidence is required before stronger marketing language can be used.

## Rule

Marketing strength must rise only with evidence strength.

No campaign may convert a product direction, mockup, local fixture or worker self-report into a stronger public capability claim.

## Evidence levels

### Level 0 — Concept
Permitted language:
- designed to
- intended to
- planned
- concept
- under test

### Level 1 — Deterministic implementation evidence
Permitted language:
- implemented in a bounded test environment
- demonstrated in controlled tests

Not permitted:
- works for customers generally
- works on all supported machines
- saves time/money

### Level 2 — Independent assurance
Requires exact-head evidence plus independent Green/PRS or equivalent challenge for the claimed scope.

Permitted language:
- independently verified for the bounded tested scenario

### Level 3 — Physical/user acceptance
Requires representative real-machine/user execution evidence.

Permitted language:
- demonstrated on supported real hardware/workflow, scoped to tested conditions

### Level 4 — Repeated benchmark/customer evidence
Requires multiple repeatable runs and measured outcome data.

Permitted language may include measured rates, time saved, cost avoided or success percentages when methodology is disclosed and sample size is sufficient.

## Claim map

| Marketing claim | Current default language | Required stronger evidence |
| --- | --- | --- |
| Make the most of free AI | Product direction; safe | Capability registry + routing evidence |
| Runs effectively using free AI alone | **Do not claim broadly yet** | Free-AI benchmark promotion gate |
| Free AI can complete real AgentOS jobs | Under test | Successful benchmark task evidence |
| Free first, paid when useful | Product policy | Router/provider implementation evidence |
| Local AI support | Designed/roadmap unless implemented | Ollama/local adapter + real-machine acceptance |
| Uses Ollama | Do not claim implemented yet | Exact implementation + acceptance evidence |
| Uses Libra | Optional candidate only | Licence approval + bounded adapter evidence |
| Saves money | Designed to reduce unnecessary AI spend | Repeated measured comparison against defined baseline |
| Saves time | Built to save time | Repeated measured task-time comparison |
| $99 pays for itself | **Do not claim** | Strong customer/economic evidence; likely still contextual |
| Less than $2/week | Allowed arithmetic for $99/year | Pricing remains $99/year |
| Night Shift | Concept / designed capability | Runtime scheduling + checkpoint + approval + recovery + real acceptance |
| Works while you sleep | Concept only | Verified unattended workflow evidence |
| Morning Brief | Concept/design | Implemented evidence schema + accepted runtime output |
| Windows laptop worker | Bounded governed work under development | Physical Windows acceptance for exact claimed operations |
| Remote physical execution | **Do not claim** | Authenticated remote transport + physical acceptance |
| Jack checks permissions | Product architecture / bounded implementation where evidenced | End-to-end governed execution proof for specific action |
| Henry verifies results | Product role / bounded assurance concept | Specific verification implementation for advertised workflow |
| Provider-neutral | Architectural principle | Multiple interchangeable provider/worker integrations demonstrated |
| One platform. Every AI. | Brand aspiration; potentially over-broad literally | Always pair with qualifier such as supported/free/local/paid AI |

## Free-AI benchmark to campaign upgrade

If promotion gate passes:

Before:
> AgentOS is designed to make effective use of free AI.

After bounded benchmark:
> In our controlled benchmark, AgentOS completed X of 12 representative jobs using only eligible free/local AI resources.

Do not convert this into:
> AgentOS can do everything using free AI.

## Time-savings upgrade

Required measurement:
1. Define manual baseline.
2. Measure user-active minutes, not only elapsed runtime.
3. Repeat across representative tasks.
4. Disclose sample/method.
5. Separate automation wait time from actual user time saved.

Possible verified ad:
> Across our test set, AgentOS reduced active user handling time by X% for Y workflows.

## AI-spend savings upgrade

Required measurement:
1. Define baseline routing/provider choice.
2. Record actual paid usage avoided.
3. Include free/local compute assumptions.
4. Repeat over representative workloads.
5. Do not count hypothetical subscription cancellation unless customer actually cancels it.

Possible verified ad:
> In our benchmark, free/local-first routing reduced paid AI usage by X% compared with the defined paid-first baseline.

## Night Shift upgrade

Only promote from concept to live feature when all are evidenced:
- explicit scheduling/time window
- authority remains independent from timing
- durable queue/checkpoint
- approval parking
- safe branch continuation where supported
- recovery from interruption
- budget enforcement
- exact mission/task correlation
- Henry/evidence summary
- independent assurance
- physical/user acceptance

## Windows-worker upgrade

Do not advertise general computer control from bounded PowerShell operations.

Claims must name scope when relevant, for example:
> AgentOS has been demonstrated performing bounded governed repository status, diff, test and audit operations on Windows.

Broader claims require broader acceptance.

## Social media policy

Short-form posts may simplify wording but may not strengthen the underlying claim.

A headline may say:
> Make more of free AI.

The caption/landing page must preserve the evidence boundary.

## Competitive comparisons

Any table comparing AgentOS to competitors must distinguish:
- current implemented capability
- planned/design capability
- competitor current capability

Never use a green checkmark for an AgentOS capability that is only planned.

## Owner/marketing review rule

When a major evidence gate passes, update:
1. `MARKETING-CLAIMS-REGISTER-2026-09-12.md`
2. this proof-to-ad map
3. relevant sales page copy
4. affected Content360 posts/ad variants
5. competitor comparison tables

This prevents stale conservative copy after proof exists and prevents premature aggressive copy before proof exists.

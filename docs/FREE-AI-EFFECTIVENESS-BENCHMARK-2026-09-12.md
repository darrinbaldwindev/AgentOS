# AgentOS Free-AI Effectiveness Benchmark — 2026-09-12

**Status:** VALIDATION PLAN / EVIDENCE REQUIRED

## Objective

Test the product hypothesis:

> **AgentOS can run effectively using free AI alone.**

The benchmark must distinguish marketing aspiration from measured evidence. It is not passed by a successful demo or worker self-report.

## Test modes

Run every benchmark job in at least these modes where available:

1. **Free-only cloud AI** — only providers/models with legitimate free/included capacity.
2. **Local-only AI** — local inference only where suitable and implemented.
3. **Free-first hybrid** — free/local first; no paid escalation allowed for the benchmark.
4. **Paid reference** — optional comparison run using an authorised stronger paid model to establish a quality/time reference.

Provider terms, rate limits and commercial-use restrictions remain authoritative. No quota abuse or consumer-UI automation to evade provider payment is permitted.

## Representative jobs

Use real, repeatable tasks spanning mainstream AgentOS value:

| # | Job | Success evidence |
| --- | --- | --- |
| 1 | Summarise a long document | faithful summary, key points retained, no material fabrication |
| 2 | Compare three products/options | correct comparison dimensions, explicit unknowns, source/evidence trace where applicable |
| 3 | Draft a professional email | usable draft matching requested purpose/tone |
| 4 | Turn notes into a structured report | coherent structure, no missing required sections, evidence preserved |
| 5 | Plan a week of tasks | constraints honoured, priorities coherent, actionable schedule |
| 6 | Research a bounded topic | source quality, factual accuracy, uncertainty marked |
| 7 | Classify/organise a small document set | deterministic/consistent grouping, no destructive action |
| 8 | Produce a social-media campaign package | channel-specific usable outputs, claim guardrails respected |
| 9 | Create a study/learning plan | realistic sequence, requested constraints met |
| 10 | Analyse a small table/dataset | correct calculations/interpretation, no invented data |
| 11 | Multi-step job: research -> compare -> recommendation | intermediate evidence retained, final recommendation follows evidence |
| 12 | Multi-agent role flow: plan -> execute -> assure | Willow/Isla/Jack/Henry responsibilities reflected without bypassing authority |

Add future jobs only if they are representative of real customer use, not chosen because free models are unusually strong at them.

## Measures

### Quality
- task success/failure;
- factual correctness;
- completeness;
- instruction adherence;
- source/evidence quality where applicable;
- hallucination/material-error count;
- Henry/independent assurance disposition.

### Cost
- paid AI spend: must equal zero for free-only/free-first benchmark runs;
- included/free allowance consumed;
- local compute/runtime where measurable;
- any external paid tool use must be excluded or explicitly disclosed.

### Time
- wall-clock completion time;
- user active time required;
- number of user interventions;
- retries/fallbacks;
- blocked jobs.

### Reliability
- first-pass completion rate;
- retry rate;
- provider/rate-limit failures;
- context truncation or capacity failures;
- graceful fallback success;
- evidence/receipt completeness.

## Effectiveness definition

Do **not** define effectiveness as "free model produced any answer."

A benchmark job is effective only if:

1. the requested outcome is materially usable;
2. important constraints are followed;
3. no critical unsupported claim/error remains;
4. required evidence/assurance completes;
5. the job completes without paid-model escalation;
6. user intervention remains reasonable for the task class.

## Initial acceptance bands

These are validation targets, not marketing claims.

- **Strong:** >= 80% of representative jobs materially usable without paid AI, with no critical safety/evidence failures.
- **Promising:** 60–79% materially usable; marketing should remain "designed to work effectively with free AI" and disclose limitations internally.
- **Weak:** < 60%; do not use strong free-AI effectiveness messaging until routing/provider/task strategy improves.

A single aggregate score is insufficient. Publish internal breakdown by task class so weak areas are visible.

## Paid-reference comparison

Where a paid reference run is used, compare:

- material quality difference;
- completion time difference;
- user-intervention difference;
- cost difference;
- whether the paid improvement changes the practical outcome.

Do not treat the paid result as automatically superior because it used a premium model.

## Routing evidence

For each job record:

- task ID;
- provider/model/workertype used;
- free/local classification;
- availability/limit state;
- routing reason summary;
- fallbacks attempted;
- paid escalation prevented/unused;
- runtime;
- outcome;
- assurance result;
- errors/unknowns.

Do not expose private chain-of-thought. Record decision summaries and observable evidence only.

## Marketing promotion rule

The claim may progress as follows:

### Before benchmark

> **AgentOS is designed to make effective use of free AI.**

### After promising evidence

> **AgentOS can complete many everyday jobs using free AI alone.**

Only use if the tested task set and limitations are disclosed internally and representative.

### After strong, repeatable evidence

> **AgentOS can run effectively using free AI alone for many everyday tasks.**

Avoid universal wording such as "all tasks" or "never need paid AI."

## Operator savings follow-on

After free-AI effectiveness is established, run an Operator value benchmark comparing:

- manual AI-tool/model selection versus AgentOS routing;
- premium-first versus free-first policy;
- user active time;
- paid AI use;
- successful task completion.

This evidence can support stronger wording around time saved and unnecessary AI spend avoided.

## Governance

No live credentials, purchases, production writes, uncontrolled autonomy or provider-terms violations are authorised by this benchmark. Use test/fixture/bounded environments until the relevant execution capabilities are independently accepted.

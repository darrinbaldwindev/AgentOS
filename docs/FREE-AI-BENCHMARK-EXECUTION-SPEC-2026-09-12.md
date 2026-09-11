# AgentOS Free-AI Benchmark — Execution Specification — 2026-09-12

**Status:** IMPLEMENTATION/EXECUTION HANDOFF — NO CLAIM OF RESULTS
**Depends on:** `docs/FREE-AI-EFFECTIVENESS-BENCHMARK-2026-09-12.md`

## Objective

Provide a reproducible, evidence-backed test of the marketing hypothesis:

> AgentOS can remain genuinely useful when constrained to free/included/local AI resources.

This specification does not pre-approve any provider use, credential changes, paid escalation, production autonomy, or bypass of existing AgentOS governance.

## Core rule

Every benchmark run must be conducted with a routing policy equivalent to:

**free/included/local only; no paid escalation.**

If a task cannot complete under that policy, record the failure honestly. Do not silently substitute paid capacity.

## Required task set

Minimum 12 tasks, covering:

1. summarise a supplied long document;
2. compare three options from supplied/current evidence;
3. produce a structured research brief;
4. create a one-week personal plan;
5. turn rough notes into a polished report;
6. classify a small dataset or list;
7. extract action items and priorities;
8. draft a social campaign from a product brief;
9. create a product comparison table;
10. plan a multi-step project;
11. revise an existing document from feedback;
12. execute one bounded multi-step AgentOS workflow using more than one eligible free/local capability where supported.

Tasks should use non-sensitive, non-production fixtures wherever possible.

## Evidence captured per task

Required:

- benchmark task ID;
- mission/run/task correlation IDs where the runtime supports them;
- exact AgentOS code identity;
- exact worker/provider/model identity where exposed;
- whether resource was free, included, promotional or local;
- any quota/capacity state visible at execution time;
- start/end timestamps;
- number of attempts/retries;
- output artifact;
- verification result;
- Henry/Green/PRS state where applicable;
- paid spend = zero confirmation for the run;
- failure/blocker reason if incomplete.

## Scoring

Score each task across five dimensions, 0–5:

- **Task completion** — did it actually complete the requested job?
- **Quality** — is the result useful without major repair?
- **Accuracy/evidence** — are factual claims grounded where required?
- **Efficiency** — did routing avoid excessive attempts/handoffs?
- **Usability** — would a normal user reasonably accept the result?

Maximum 25 points per task.

Suggested interpretation for analysis only:

- 22–25: strong
- 18–21: useful
- 14–17: useful with material correction
- below 14: not effective for this task

Do not convert these bands into marketing claims until the benchmark is actually run and reviewed.

## Pass criteria for the marketing hypothesis

The phrase **“AgentOS can run effectively using free AI”** should not graduate to a broad public VERIFIED claim unless all of the following are met:

1. at least 12 representative tasks executed;
2. at least 9/12 complete successfully under free/included/local-only routing;
3. median score is at least 18/25;
4. no paid model/API spend is used in qualifying runs;
5. failures are retained in the published internal evidence rather than discarded;
6. at least one multi-step task completes under governance with durable evidence;
7. independent review confirms results are not based only on worker self-report;
8. provider terms permit the tested usage pattern.

Even after passing, public copy should remain scoped, e.g.:

> “In our benchmark, AgentOS completed 9 of 12 representative tasks using only free/included/local AI.”

Prefer measured numbers over universal language.

## Comparison mode

A later second phase may compare:

- free/included/local-only;
- free-first with paid escalation;
- paid-preferred.

Measure differences in:

- completion rate;
- quality score;
- elapsed time;
- retries;
- paid spend;
- user intervention.

This comparison is the strongest future evidence for the commercial promise that Operator can help balance time and AI spend.

## Failure conditions to test explicitly

Include at least:

- free provider quota exhausted;
- provider unavailable;
- local model unavailable;
- task exceeds context/size limit;
- free worker returns low-quality output;
- conflicting provider results;
- result write failure;
- verification failure;
- no eligible free worker exists;
- a paid worker is available but policy forbids escalation.

Correct behaviour is to fail closed, report the blocker and preserve evidence—not to violate the selected policy.

## Marketing handoff format

After execution, produce a benchmark summary containing:

- tasks attempted;
- tasks completed;
- score distribution;
- free/local providers actually used;
- zero-paid-spend evidence;
- representative successes;
- representative failures;
- limitations;
- exact claims now supportable;
- claims still unsupported.

## Governance

No benchmark authorisation implies:

- production writes;
- purchases;
- credential changes;
- provider ToS circumvention;
- automated account creation;
- quota evasion;
- unrestricted browser or shell use;
- deployment or merge authority.

The benchmark must use the existing AgentOS authority, worker, evidence and assurance boundaries.

## Success condition

The result should answer a simple commercial question with evidence:

> How much useful work can AgentOS reliably get done when the user chooses not to spend money on additional AI usage?

Until the benchmark is executed, the answer remains a hypothesis rather than a verified marketing claim.

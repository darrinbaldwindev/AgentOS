# AGENTOS INTEGRATION GAP REPORT

Mission: `AGENTOS-INTEGRATION-GAP-001`
Reference: Issue #89 — Canonical AgentOS integration architecture and subscription roadmap — 2026-09-09
Scan date: 2026-09-10
Canonical base: `main` @ `e20ecf3bb9c03d1166397af8c204ccb07289d3f3`
Governance: inspection/logging only; no merge, approval, ready transition, rebase, deployment, credential change, production write, or autonomy activation.

## Final classification

`P0-FOUNDATION-PARTIAL`

## Canonical state

- Current canonical branch: `main`.
- Main HEAD at scan: `e20ecf3bb9c03d1166397af8c204ccb07289d3f3`.
- Main has active scheduled workflow evidence, including Project Overseer Wake and Scheduler Roundtrip runs on this exact SHA, but the connector did not expose a dedicated `AgentOS Tests` run associated with this main commit through commit-run lookup.
- Canonical test command from `package.json`: `npm test` -> `node --test tests/**/*.test.mjs`.
- Local execution was unavailable in the scanning environment, so no new local test result is claimed.
- Numerous architecture-relevant changes remain draft and unmerged. Important examples include #29 provider adapter contract, #30 Capability Passport, #71 scheduler hardening, #74/#82 Green hard gate, #76 mission ledger, #87 V1 RC, #88 integration health, #91 remote/local bridge, #95 authority strictness, and #101 host status receipt. Draft evidence is not treated as current-main implementation.

## P0 core

| Capability | State | Evidence | Main gap |
|---|---|---|---|
| ActorContext | PARTIAL | `src/dispatch/canonical-context.mjs` validates mission/decision canonical context but does not implement the frozen ActorContext envelope | identity/actor, authority, consent, risk, budget and adapter invocation are not unified in one propagated context |
| CapabilityPassport / policy | PARTIAL | `runtime/agent-capability.mjs`, `runtime/tool-policy.mjs`, runtime shell; Capability Passport itself remains draft #30 | fragmented capability models; no canonical Passport on main; no end-to-end mapping from discovered integration capability to authority |
| Consent / approval | PARTIAL | local wake has a narrow `PRE_AUTHORIZED` string check; telemetry consent exists; human gate exists elsewhere | no generic execution consent/approval gateway before every side-effecting adapter call |
| Scheduler | EXISTING, HARDENING PARTIAL | `src/dispatch/scheduler.mjs`, scheduled workflows, local wake/scheduler scripts | stronger safe-default/concurrency/physical acceptance work remains draft (#71/#92 and descendants) |
| Durable persistence | PARTIAL | local JSON atomic-replace persistence, dispatch safe-write/versioning/GitHub persistence modules | multi-writer and crash/power-loss guarantees are not globally proven on main; stronger bridge persistence is draft |
| Baseline PRS | PARTIAL | PRS governance/assurance documents and handoff expectations exist | no canonical executable PRS runtime module in current main call path |
| Baseline Green Agent | PARTIAL | `runtime/green-agent.mjs` provides read-only evidence challenge and finding/rescan lifecycle | current main local wake can still persist COMPLETED from worker success without mandatory Green PASS; hard-gate repairs are draft #74/#82/#84 |
| Governed local filesystem | MISSING as general capability | local persistence reads/writes AgentOS-owned state | no general path-constrained filesystem adapter routed through frozen ActorContext/authority/consent/approval/receipt/verification chain |
| Governed shell/process | MISSING as general capability | secure tool executor is a policy wrapper | no canonical subprocess/process adapter found on main; shell eligibility is not shell execution |
| Browser/web research | MISSING | no runtime implementation found by tree/code search | add only after governance envelope is canonical |
| MCP Host | MISSING | historical/docs references only | no stdio or Streamable HTTP MCP client/host implementation; no `tools/list` -> candidate descriptor -> governed execution path |

## Critical false-green findings

1. `runtime/local-wake.mjs` supplies `bootAgentOS` with an inline capability probe returning `{ evaluation: { eligible: true } }`; boot trusts `evaluation.eligible`. This is bounded DRY_RUN fixture behavior, not physical capability verification.
2. Current-main local wake moves the canonical runner through completion from worker evidence and writes a `COMPLETED` response without mandatory Green PASS. The correction exists only in draft Green-gate PR lineage.
3. `src/dispatch/runner.mjs` calls injected `execute(current)`, then transitions to verification/completion; it does not itself invoke consent, risk/budget, approval, receipt verification, Green, or PRS. Those guarantees depend on the caller.
4. `runtime/secure-tool-executor.mjs` only checks a tool allow-list before registry execution. It is not the frozen end-to-end authority/consent/risk/approval gateway.
5. `src/telemetry/consent.mjs` is telemetry consent, not action consent.
6. `src/dispatch/github-transport.mjs` is an injected `getFile/putFile/appendFile` transport contract. It does not implement GitHub App authentication or prove production connectivity.
7. Provider-neutral adapter/registry/executor primitives exist, but no concrete OpenAI/Gemini/Anthropic/Ollama adapters were found on main. A registry entry/contract must not be reported as a live provider integration.
8. Two runtime-shell concepts remain (`runtime/runtime-shell.mjs` and `runtime/shell-contract.mjs`) with different construction APIs; this is a misalignment risk until reconciled.
9. The core type declarations explicitly describe themselves as drafts and must not be treated as runnable integrations or credential infrastructure.
10. MCP, OAuth/Google Workspace, browser automation, and the named P1 external service adapters were not found as current-main runtime implementations.

## Adapter families

| Family | State | Existing contract | Main gap |
|---|---|---|---|
| IntelligenceProvider | PARTIAL | provider adapter, registry, executor, model routing/registry | no concrete P0 provider adapters, streaming/cost/auth lifecycle not end-to-end |
| ExternalAgent | PARTIAL | worker contract/registry/router; deterministic Skill Agent; Overseer.sh worker adapter | no canonical asynchronous delegate lifecycle with input-required/continue + durable receipt/verification |
| LocalRuntime | MISALIGNED | local wake, persistence, scheduler, runtime shell, secure tool executor | two shell contracts; fixture eligibility bypass; no general governed FS/process/browser adapters |
| Repository | PARTIAL | GitHub transport/store/persistence/wake abstractions | no production GitHub App auth/capability grant layer; tests/runtime are not physical proof |
| Workspace | MISSING | generic workspace concepts/types only | no Google Workspace implementation |
| Communication | MISSING | none found for external messaging | no email/chat communication adapter family |
| MCPHost | MISSING | documentation references only | no stdio/Streamable HTTP implementation |
| AutomationBridge | PARTIAL | internal scheduler/wake architecture can host a bridge | no generic external automation adapter such as n8n |
| Commerce | MISSING | no runtime adapter found | no Shopify/commerce adapter |
| Deployment | MISSING | no canonical runtime adapter found | no deployment adapter boundary |
| Data | MISSING as external adapter family | internal persistence exists | no external data integration abstraction with governed query/mutate capabilities |
| SearchResearch | MISSING | no runtime adapter found | no governed browser/search/research capability |

## P0 integrations

| Integration | State | Mechanism on main | Governance wiring | Main gap |
|---|---|---|---|---|
| OpenAI | NOT PRESENT | provider-neutral contracts only | none physically wired | concrete adapter/auth/usage/receipt/retry tests |
| Gemini | NOT PRESENT | provider-neutral contracts only | none physically wired | same |
| Anthropic | NOT PRESENT | provider-neutral contracts only | none physically wired | same |
| Ollama | NOT PRESENT | local-provider-capable type intent only | none physically wired | local discovery/execution/health/capability mapping |
| GitHub | PARTIAL ADAPTER | injected contents-style read/write/append abstractions plus dispatch persistence/wake | authority exists in dispatch but GitHub adapter is not proven through the full frozen chain | GitHub App auth, least-privilege capability mapping, approvals, receipts, retries/idempotency, physical proof |
| Google Workspace | NOT PRESENT | none found | none | shared OAuth foundation plus granular AgentOS Gmail/Calendar/Drive/Docs/Sheets/Contacts capability boundaries |

## MCP

No real current-main MCP Host/client implementation was found. Historical documentation mentions MCP, but no stdio or Streamable HTTP transport and no governed `tools/list` discovery/execution chain were identified. Classification: `MISSING`.

## Provider architecture

Current main has a useful provider-neutral base: adapter (`listAvailable`, `execute`), minimal registry, executor, model registry/routing, recovery/handoff primitives. It is sufficient to avoid creating another provider router. Gaps include concrete providers, normalized lifecycle/health on main, streaming surface, usage/cost metering tied to executions, credential retrieval, and local-provider discovery. Draft #29 must be reconciled rather than duplicated.

## External agent architecture

The existing worker registry/worker contract should be extended rather than replaced. It already provides provider-neutral workers and strict capability matching. Manus-like asynchronous work needs a lifecycle extension (create/running/input-required/continue/completed|failed) with existing dispatch identity, durable persistence, receipts and Green/PRS verification. Do not create a parallel worker system.

## GitHub

Current main implements an injected contents-oriented transport with optimistic version checking. The transport itself contains no GitHub App/OAuth/PAT credential mechanism. The production target should therefore add GitHub App authentication behind this existing transport boundary, with least privilege and granular AgentOS capabilities; possession of the app credential must not imply authority.

## Google Workspace

No Gmail/Calendar/Drive/Docs/Sheets/Contacts implementation or OAuth runtime was found on main. Shared Google OAuth should be introduced once, while AgentOS authority remains granular (`email.read`, `email.send`, `calendar.read`, `calendar.write`, `storage.read`, `storage.write`, `document.read`, `document.write`, etc.). Broad OAuth scopes are connectivity, not AgentOS authority.

## Local runtime

AgentOS has meaningful local-runtime foundations: safe DRY_RUN wake, durable local state, budget reservation, worker capability matching and dispatch. It is not yet a general governed local-computer runtime. Generic filesystem/process/browser execution adapters and a unified frozen governance envelope are absent. Existing local wake also exposes the two most important main-head false-green conditions noted above: synthetic capability eligibility and completion without mandatory Green PASS.

## Commercial boundary

The architecture can accommodate Free/$39/$99 capability limits without making safety tier-dependent. Existing budgets, model routing, worker registry and entitlement documentation provide extension points. Commercial controls should be enforced separately from invariant identity, authority, consent, audit, verification and fail-closed behavior. Do not use a paid tier to bypass any safety gate.

## P1 readiness

The current architecture can accommodate Manus and Grok by extending the existing worker/provider abstractions; OpenRouter by implementing the existing IntelligenceProvider contract; Microsoft Graph and Slack through new Communication/Workspace adapters; Vercel through Deployment; Supabase through Data; Shopify through Commerce; n8n through AutomationBridge. None should require a new scheduler, worker runtime, provider router, authority engine, or persistence layer. No named P1 adapter was found as a concrete current-main implementation in this scan.

## Dependency-ordered implementation plan

0. Reconcile foundational names/contracts: map existing canonical context, capability models, authority, telemetry consent/human gate, budget and policy primitives onto the Issue #89 frozen execution envelope without adding duplicate engines. Acceptance: one contract map + deterministic negative tests proving no caller can convert discovery into authority.
1. Close the existing local governed-execution bypasses: real capability probe at execution boundary; require pre-execution authority/consent/policy/budget/approval as applicable; require post-execution durable receipt + verification + Green before final completion. Reuse current dispatch/worker/persistence/Green primitives and reconcile the relevant draft lineage. Acceptance: execution callback not called on any failed precondition; no COMPLETED state before verified Green; crash/result-write cases remain incomplete/recoverable.
2. Promote/reconcile CapabilityPassport and provider lifecycle work from existing drafts (#30/#29) onto current-main architecture, not as parallel systems. Acceptance: discovery produces candidate capabilities only; authority remains separate; expiry/health fail closed.
3. Implement one concrete provider adapter against the canonical provider abstraction, with fake-server deterministic tests first and owner-gated credential/physical proof separately. Acceptance: auth failure, rate limit, retry/idempotency, usage receipt and provider outage behave deterministically.
4. Implement GitHub App connectivity behind the existing Repository transport. Acceptance: least-privilege read/write capability separation, optimistic-write conflict test, denied-authority test, authenticated physical read proof before write proof.
5. Add shared Google OAuth connectivity plus separate granular AgentOS Workspace/Communication capabilities. Acceptance: OAuth token possession alone cannot authorize send/write; read/write capabilities independently testable.
6. Add MCP Host using stdio first, Streamable HTTP second; map `tools/list` only to candidate capability descriptors. Acceptance: discovered MCP tool cannot execute without full AgentOS governance envelope; legacy SSE only as compatibility need.
7. Add governed filesystem/process/browser adapters to LocalRuntime/SearchResearch, each behind the same envelope and receipt/verification path. Acceptance: path constraints, subprocess allow/deny, browser side-effect approval and durable receipts.
8. Extend existing worker contract for asynchronous ExternalAgent lifecycle (Manus-class) with durable continuation/input-required states. Acceptance: restart-safe lifecycle, exact task correlation and independent verification.
9. Add P1 service adapters only after their family contracts and P0 gates are proven.

## Tests / runtime evidence boundary

- Canonical command: `npm test` (`node --test tests/**/*.test.mjs`).
- New local execution during this scan: unavailable; no exit code/pass/fail/skip count is claimed.
- Exact-main scheduled CI evidence exists for Project Overseer Wake and Scheduler Roundtrip on `e20ecf3...`; this is not equivalent to an exact-main full `AgentOS Tests` result.
- Commit-associated pull-request-run lookup returned no runs for `e20ecf3...`; therefore the scan does not declare the main full suite GREEN.
- Draft PR test claims remain evidence for their exact draft heads only and are not inherited by main.

## Next smallest safe implementation mission

`AGENTOS-P0-GOVERNED-EXECUTION-001`

Reconcile the existing canonical-context/authority/capability/policy/budget/human-gate primitives into one pre-execution contract on the existing local DRY_RUN path, replace synthetic eligibility with the canonical shell/capability evaluation, and add deterministic tests proving execution is never invoked when identity/authority/consent/capability/policy/budget/approval prerequisites fail. Preserve existing scheduler, dispatch, worker registry, persistence, Green and PRS boundaries. Do not add any live provider, credential, production write, deployment, merge, or autonomy activation.

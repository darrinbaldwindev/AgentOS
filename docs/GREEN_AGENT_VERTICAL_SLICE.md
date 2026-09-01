# Green Agent Vertical Slice

## Scope

This dependency-light slice proves the assurance path `portfolio scan -> evidence-backed Green Report -> ranked finding -> AgentOS task handoff -> independent post-work rescan`. It does not activate production providers, mutate repositories, or replace the independent Project Reliability & Assurance (PRS) boundary.

## Contract

`runtime/green-agent.mjs` accepts a deterministic scan function, an existing persistence adapter, an AgentOS task-creation adapter, and an independent rescan adapter. Every finding must carry a scan identifier, project, state, severity, confidence, non-empty evidence references, root cause, recommendation, expected benefit, action risk, required authority, and an explicit `auto_taskable` flag.

Reports are ranked by severity, confidence, and state. Green Agent findings are correlated by project and finding identifier. A re-observation creates a new current artifact and marks the prior artifact superseded; historical findings remain preserved. Duplicate observations therefore do not overwrite failures or make the portfolio appear green.

Task handoffs grant no execution capabilities by default and set `execution_authority: false`. A handoff requires result evidence and an independent post-work rescan before a finding can close. The Green Agent cannot self-confirm closure: unverified worker evidence is rejected, and the rescan must independently provide verified evidence. If the finding remains present, the finding is reopened rather than falsely closed.

The PRS role is recorded as an independent-assurance boundary. This slice consumes evidence and publishes recommendations but does not implement a second assurance evaluator.

## Tests

Focused command:

```sh
node --test tests/green-agent.test.mjs tests/overseer-auditor.test.mjs tests/overseer-decision-loop.test.mjs tests/dispatch.test.mjs
```

Result: **11 passed, 0 failed**.

Full command:

```sh
npm test
```

Result: **177 passed, 0 failed**.

The full suite covers dispatch, authority, scheduler supervision, evidence, verification, recovery, worker routing, Overseer decision flows, and the Green Agent slice.

## Boundary

This is deterministic local proof only. No production scan, external provider invocation, GPTChat transport, permission change, credential change, protected schedule change, Shopify/WordPress action, or remote AgentOS code push is implied.

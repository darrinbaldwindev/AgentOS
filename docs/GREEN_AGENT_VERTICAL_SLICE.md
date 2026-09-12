# Green Agent Vertical Slice

## Scope

This dependency-light slice proves the assurance path `portfolio scan -> evidence-backed Green Report -> ranked finding -> AgentOS task handoff -> worker completion claim -> independent Green completion gate -> independent post-work rescan -> PRS handoff`. It does not activate production providers, mutate repositories, or replace the independent Project Reliability & Assurance (PRS) boundary.

## Contract

`runtime/green-agent.mjs` accepts a deterministic scan function, an existing persistence adapter, an AgentOS task-creation adapter, and an independent rescan adapter. Every finding must carry a scan identifier, project, state, severity, confidence, non-empty evidence references, root cause, recommendation, expected benefit, action risk, required authority, and an explicit `auto_taskable` flag.

Reports are ranked by severity, confidence, and state. Green Agent findings are correlated by project and finding identifier. A re-observation creates a new current artifact and marks the prior artifact superseded; historical findings remain preserved. Duplicate observations therefore do not overwrite failures or make the portfolio appear green.

Task handoffs grant no execution capabilities by default and set `execution_authority: false`. A worker saying `complete` or `completed` is only a claim and never advances the task by itself.

Before a task can advance to PRS, `evaluateTaskCompletion()` independently verifies all of the following:

- the worker result belongs to the assigned task;
- every acceptance criterion has independently verified evidence;
- implementation evidence is verified;
- relevant test evidence is verified;
- authorization/scope compliance is verified and no unauthorized changes are present;
- no unapproved side effects are present; and
- no unresolved completion gaps remain.

Any failed check returns `disposition: fail`, keeps `task_status: incomplete`, sets `remediation_required: true`, and blocks `advance_to_prs`. Only a complete evidence set returns `disposition: pass` and `task_status: green_verified_complete`. Even a Green PASS remains observation-only and sets `production_promotion_allowed: false`.

A handoff still requires result evidence and an independent post-work rescan before a finding can close. The Green Agent cannot self-confirm closure: unverified worker evidence is rejected, and the rescan must independently provide verified evidence. If the finding remains present, the finding is reopened rather than falsely closed.

The PRS role remains an independent-assurance boundary. Green verifies task completion; PRS independently evaluates assurance/evidence after Green PASS. Neither worker claims nor Green observations authorize production promotion.

## Tests

Focused command:

```sh
node --test tests/green-agent.test.mjs tests/overseer-auditor.test.mjs tests/overseer-decision-loop.test.mjs tests/dispatch.test.mjs
```

The Green Agent suite includes explicit checks that incomplete acceptance evidence, wrong task identity, unauthorized changes, unapproved side effects, and unresolved gaps all block completion, while a fully independently verified task may advance to PRS.

Full command:

```sh
npm test
```

CI/runtime test results must be taken from the exact commit under review; this document does not claim a passing result until that evidence exists.

## Boundary

This is deterministic local proof only. No production scan, external provider invocation, GPTChat transport, permission change, credential change, protected schedule change, Shopify/WordPress action, or remote AgentOS code push is implied.

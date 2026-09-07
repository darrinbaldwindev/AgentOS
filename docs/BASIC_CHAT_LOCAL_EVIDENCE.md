# Basic Chat local acceptance — 2026-09-07

## Starting checkpoint

Repository: darrinbaldwindev/AgentOS. Branch: agent/overseer/basic-chat-vertical-slice.
Clean initial HEAD: f8b1bfe5db9fc96b33a4b92574434e682f387af6.
The previously pending push CI run, AgentOS Tests #425, completed successfully:
https://github.com/darrinbaldwindev/AgentOS/actions/runs/34080519239
GitHub returned completion at 2026-09-07T03:42:11Z. These are baseline CI results, not CI results for the local changes.

## Implemented slice

Run `npm run chat:local` from the repository, then open http://127.0.0.1:4317.
The command installs a dedicated development home at `.basic-chat` using the existing installer and canonical local persistence format. It never selects the physical scheduler home, even when AGENTOS_HOME is set. No scheduled task is installed or changed.

Flow: local browser -> Basic Chat adapter -> task pipeline -> local session facade -> existing wakeLocal -> canonical dispatch runner -> registered deterministic worker -> canonical artifacts/events and budget reconciliation -> persisted chat response.

One thread (`basic:default`) keeps a stable mission ID, with separate run/task/wake IDs for each turn. The same persistence instance is passed through chat and wake; no browser storage or second mission database is introduced. The existing SQLite ledger remains budget-only. Wake responses now carry the mission ID instead of incorrectly copying the task ID. Dispatch is restricted to the newly created task, so an unrelated queued task cannot answer a chat turn.

The input is capped at 4,000 characters. The reply is fixed and bounded; this is a deterministic control-cycle check, not general model intelligence or execution of arbitrary natural-language requests.

Pause and stop persist chat admission state, block subsequent sends, and preserve history. An already admitted bounded turn finishes first. Resume is explicit. These controls do not claim mid-worker cancellation. The service serializes state operations and rejects a second chat host for the same home. An unclean process termination leaves a fail-closed `basic-chat.lock`; recovery requires confirming the former host is gone before removing that lock. This slice is not a general multi-process persistence writer and must not share a home with a scheduler or other writer.

The HTTP server binds only to 127.0.0.1, checks Host and Origin, accepts JSON writes only from its own origin, uses a content security policy, and renders messages as text. DRY_RUN and disabled autonomy are checked at startup and by the reused wake path before execution. No provider credential loading, outbound connector calls, GitHub writes, or production writes are wired into the chat runtime.

## Concrete acceptance evidence

Windows local runtime: Node v26.8.1.
Focused suite: 15 tests passed, 0 failed (adapter, HTTP integration, local wake, local persistence, budget file selection).
Full `npm test`: 269 tests passed, 0 failed, 0 skipped; duration 10,176 ms.
`git diff --check`: passed. Dependency audit (`npm audit --audit-level=high --omit=dev`): 0 vulnerabilities.

Browser acceptance at 2026-09-07T04:21:11Z:
- Typed: `Record this acceptance message and perform one safe local check.`
- Clicked Send; both messages appeared, with `Chat ready · Mission completed`.
- Clicked Pause; Send became disabled.
- Reloaded; paused status, both messages and mission/run lineage remained.
- Clicked Stop; status became stopped and Send stayed disabled.
- Clicked Resume; status became ready and Send became enabled.
- Visually inspected the rendered chat screen.

Persisted acceptance identifiers:
- Thread: basic:default
- Mission: mission:basic:default
- Run: run:4250c473-a63e-4f47-aa6e-734e7004461d
- Task: local-wake-2bc493fa-0085-4ac2-9acb-3262fdf89644
- Response artifact: response:local-wake-2bc493fa-0085-4ac2-9acb-3262fdf89644
- Wake trace: d3b7beb3-288f-4052-9cf3-53d1f87a9c08

Automated HTTP tests additionally prove full service close/reopen continuity, task/mission/run/response identity agreement, registered worker evidence, reconciled budget, pause/stop enforcement after restart, explicit resume, invalid input rejection, cross-origin rejection, failure without fabricated assistant completion, unsafe configuration rejection, exclusive host rejection, and concurrent-turn persistence.

## Connected capabilities: planned registry entries only

The available assistant tool inventory exposes the following tools; none were invoked for this implementation:

| Capability | Observed interface | AgentOS disposition |
|---|---|---|
| AgentMail | Inboxes, threads, drafts, send/reply, attachments | Candidate; planned communication adapter; disabled |
| Agent Ready | Start site scan, retrieve scan | Candidate; planned readiness worker; disabled |
| Tavily AI | Search, extract, crawl, map, research | Candidate; planned research worker; disabled |
| Manus | Initiate research, slides, website, video, mobile app | Existing candidate updated; planned specialist worker; disabled |

The existing ecosystem opportunity registry contains these records with `status: candidate`, planned activation and `agentosEnabled: false`. Connected assistant tools are not proof of runtime API access, validated entitlements, credential ownership or authority to act. Before any future activation, use the existing capability, entitlement, budget and governance contracts and verify cancellation, result provenance and permissible side effects. No account identifiers or credentials were copied into the registry. No credits were consumed.

## Scope boundary

The physical Windows five-minute scheduler acceptance remains the owner's supplied GREEN checkpoint; it was not rerun or modified. This work verifies the local development chat slice only. No merge, approval, ready-for-review change, rebase or production action was performed. At the initial acceptance checkpoint these were local working-tree changes; no new remote CI result was claimed.


## Pre-commit review — 2026-09-07

Owner authorized review, commit, push and fresh CI on the exact branch head, keeping the work draft and unmerged.
Reviewed the runtime changes, HTTP boundary, browser rendering, tests, registry and evidence. Fixed two findings before commit: control actions now use an explicit string allowlist (rejecting inherited object keys and non-string values), and HTTP input uses streaming UTF-8 decoding so split multibyte characters remain intact. Added a regression test for each.

Fresh local validation after fixes: 271 tests passed, 0 failed, 0 skipped; npm dependency audit found 0 vulnerabilities. The focused HTTP integration suite passed all 7 tests. Fetch confirmed the remote branch still matched baseline f8b1bfe5db9fc96b33a4b92574434e682f387af6 before commit. No rebase or merge was needed. DRY_RUN, disabled autonomy, local-only execution and disabled external capability entries remain intact. Exact pushed-head CI results are reported separately after publication to avoid treating these local results as remote CI evidence.

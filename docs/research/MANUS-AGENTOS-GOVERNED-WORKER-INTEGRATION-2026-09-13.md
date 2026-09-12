# Integrating Manus into AgentOS as a Governed Worker/Provider

**Prepared by Manus AI — 13 September 2026**

## Executive conclusion

The most practical and officially supported integration is a **server-side AgentOS Manus provider built on Manus API v2**. AgentOS should submit bounded tasks through `POST https://api.manus.ai/v2/task.create`, constrain connectors and skills explicitly, receive completion or waiting notifications through Manus webhooks, retrieve structured results and attachments, and retain a complete provenance record. Polling `task.listMessages` is an acceptable prototype fallback, but production should use signed webhooks and a reconciliation poller.

Manus API v2 is explicitly positioned for programmatic creation and management of asynchronous AI-agent tasks, multi-turn follow-up, files, projects, connectors, webhooks, structured output, usage, and browser clients.[1] The API is therefore a natural provider boundary for a provider-neutral AgentOS scheduler. The Windows desktop installation and connected ChatGPT plugin should **not** be treated as the integration boundary: I found no public official documentation establishing a supported local IPC, desktop CLI, task-control API, or plugin-to-AgentOS automation interface. Those paths remain unproven and should not be dependencies of the MVP.

The credit requirement needs careful interpretation. Manus exposes an official available-credit endpoint to API keys and trusted OAuth apps, with fields for `total_credits`, periodic subscription credits, add-on credits, event credits, and accumulated daily/weekly refresh credits.[2] The documentation makes `total_credits` authoritative and describes the component balances, but it does **not** document a request parameter or scheduling guarantee that lets a caller choose which wallet is debited. AgentOS may therefore **observe balances and enforce its own admission policy**, such as refusing noncritical work when the available refresh balance is below a reserve, but it must not claim that it can force daily refresh credits to be consumed before monthly credits. That ordering remains a Manus billing behavior to verify empirically and must be modeled as an assumption until confirmed.

## 1. Supported integration matrix

| Surface | Evidence status | What is supported | AgentOS decision |
|---|---|---|---|
| Manus API v2 REST | **Officially supported** | Asynchronous task creation, continuation, stopping, deletion, files, projects, connectors, skills, browser clients, webhooks, structured output, usage, and agents.[1] | **Use as the primary provider interface.** |
| API-key authentication | **Officially supported** | `x-manus-api-key`; intended for first-party integrations and scripts. Keys are shown once, provide full account access, and are subject to per-user limits across keys.[3] | Use only for a single controlled service account or development. Store in a secrets manager; never expose to workers or prompts. |
| OAuth2 Open App | **Officially supported, conditional** | Authorization-code OAuth with PKCE options, scoped tokens, refresh tokens, consent, revocation, and Team-account restrictions.[4] | Prefer for multi-user or delegated AgentOS. Request least privilege: normally `create_task`, optionally `use_connectors` with approved connector IDs. |
| Task lifecycle API | **Officially supported** | `task.create`, `task.sendMessage`, `task.listMessages`, `task.detail`, `task.stop`, `task.delete`, and `task.confirmAction`; statuses include running, stopped, waiting, and error.[5] | Implement an explicit state machine; never auto-approve an unknown waiting event. |
| Webhooks | **Officially supported** | `task_created` and `task_stopped` notifications, public callback URL, HTTPS requirement, test delivery, signed requests, and structured task details.[6] | Use webhooks for production completion delivery; retain polling reconciliation. |
| Webhook security | **Officially supported** | RSA-SHA256 signature, `X-Webhook-Signature`, `X-Webhook-Timestamp`, a five-minute freshness window, URL/body-hash signing, and a public-key endpoint.[7] | Verify signature before parsing; deduplicate by webhook event ID and task ID. |
| Structured output | **Officially supported** | JSON Schema supplied at task creation or follow-up; result arrives in `task.listMessages` or `task_stopped.task_detail.structured_output`; result includes `success`, `value`, and `error`.[8] | Make structured output the default AgentOS result contract; validate again locally. |
| Connectors and skills | **Officially supported, conditional** | Connector UUIDs and skill IDs can be explicitly supplied per task; omitted connectors resolve from project or user defaults, so omission is unsafe for governance.[9] | Always send an allowlisted connector and skill set; do not inherit user defaults unintentionally. |
| My Browser | **Officially supported, conditional** | API lifecycle can detect `needConnectMyBrowser`; `browser.onlineList` identifies available browser clients and `task.confirmAction` selects one.[5] | Treat as a separate high-risk capability requiring explicit authority and human confirmation. |
| Usage history | **Officially supported, restricted** | `usage.list` returns signed credit changes at session granularity, including costs, refunds, and grants; standard OAuth apps cannot access it.[10] | Use for reconciliation when API key or trusted OAuth is available; do not require it for standard delegated OAuth MVP. |
| Available-credit balance | **Officially supported, restricted** | `usage.availableCredits` returns authoritative `total_credits`, `periodic_credits`, `addon_credits`, `event_credits`, `refresh_credits`, refresh schedule, and subscription-period information. Standard OAuth apps cannot access it; trusted OAuth apps can.[2] | Add an optional privileged budget observer. Cache snapshots and label them as observations, not debit reservations. |
| Team usage statistics/logs | **Officially supported, restricted** | Team daily totals and per-user logs; standard OAuth apps cannot access them, and visibility depends on team role.[11] | Use only for administrative reporting, not per-request admission control. |
| SDK | **Not evidenced as a distinct official SDK** | The official documentation provides REST examples and an installable API skill, but the reviewed sources did not establish an official language SDK with stability guarantees.[12] | Implement a thin internal REST client; do not depend on an unofficial SDK for MVP. |
| CLI | **Not evidenced as a Manus task-control CLI** | The official API skill is installable through the Skills CLI, but that is a documentation/skill installation mechanism, not evidence of a CLI for submitting and governing Manus tasks.[12] | Do not build around desktop or CLI invocation. |
| MCP | **Not evidenced as a provider-control surface** | Manus API documentation discusses connectors and skills, but the reviewed primary sources did not establish a supported Manus MCP server for external task orchestration. | Treat MCP as a future adapter only if Manus publishes an official server and contract. |
| Windows desktop automation / IPC | **Not evidenced in reviewed official sources** | No official local task-control IPC, localhost API, Windows automation contract, or supported desktop worker interface was found. | Do not use UI automation, reverse-engineered IPC, or process injection in a governed production path. |
| ChatGPT plugin connection | **Not evidenced as an AgentOS control plane** | The user’s connected plugin is a useful interactive session surface, but no reviewed official source establishes that it exposes task creation, status polling, webhook registration, usage, or credential delegation to AgentOS. | Keep it out of the MVP; use API/OAuth instead. |
| Selectable credit source | **Not evidenced** | The balance API exposes credit categories and remaining balances, but no request field or documented debit-order control was found.[2] | AgentOS can budget and gate; it cannot promise daily-before-monthly consumption. |

## 2. Recommended MVP connector

The MVP should be a **Manus API v2 provider adapter** behind an AgentOS provider-neutral interface. The adapter should expose the following logical operations: `estimate_or_admit`, `submit`, `get_status`, `receive_event`, `reply_to_question`, `confirm_action`, `cancel`, `collect_result`, and `reconcile_usage`. AgentOS should own policy, authorization, queueing, retry budgets, and evidence storage; Manus should own agent execution and its internal tool orchestration.

For a first implementation, use a dedicated Manus Team service identity and an API key held by the AgentOS control plane, provided that AgentOS is operating one organizational Manus account. For a product serving multiple Manus users, use a standard Team Open App with OAuth2 and PKCE. The narrow `create_task` scope is preferable because it limits the app to tasks it created; `manage_all_tasks` should be reserved for an explicitly approved administrative connector. Webhook registration is documented as API-key-only, so a production Open App deployment may need a separately controlled webhook-management credential or an operational setup step performed by an administrator.[4] [13]

The MVP should send explicit `project_id` only when the project is governed and approved, explicit connector IDs only from the AgentOS capability registry, explicit skill IDs where relevant, `interactive_mode: false` for jobs that must not pause for ordinary questions, `hide_in_task_list: true` for background work when appropriate, `share_visibility: private`, and a bounded `agent_profile` such as `lite` or `standard`. Structured output should be supplied for machine-consumed results. A task title should include the AgentOS job ID, but prompts must not contain secrets or unredacted policy material.

## 3. Credential and permission model

AgentOS should separate **identity**, **capability**, **budget**, and **human-approval** decisions. A Manus credential authenticates the provider but must never itself be treated as authority to perform every action available in Manus.

| Layer | Recommended control |
|---|---|
| Provider identity | One credential per environment and trust domain. Prefer OAuth client credentials plus per-user grants for multi-tenant deployments; use API keys only for tightly controlled first-party service accounts. |
| Secret storage | Store API keys, OAuth client secrets, access tokens, refresh tokens, and webhook verification material in a secrets manager. Encrypt at rest; redact from logs; support rotation and revocation. |
| OAuth scopes | Start with `create_task`. Add `create_project`, `use_connectors`, or `use_my_browsers` only when a concrete workflow requires them. Avoid `manage_all_tasks` unless owner-approved. |
| Connector allowlist | AgentOS capability policy maps logical capabilities to approved Manus connector UUIDs. Never rely on omitted connectors because Manus resolves defaults from the project or user account.[9] |
| Skill allowlist | Send `enable_skills` explicitly. Use `force_skills` only for a narrow, auditable requirement. |
| Task visibility | Default to private. Use team/public sharing only under a policy decision and record the reason. |
| Action confirmation | Route email sends, deployments, browser connection, terminal execution, secret requests, calendar mutations, marketing actions, and unknown action types to a human approval queue. |
| Data boundary | Classify inputs and outputs. Do not send restricted data unless the Manus tenant, project, connector, and retention policy permit it. |

The API key is powerful: the official authentication documentation states that each API key provides full access to the Manus account.[3] Consequently, a raw API key should not be distributed to individual AgentOS workers, plugins, task runners, or untrusted tenants. Only the provider gateway should possess it.

## 4. Task lifecycle and state machine

AgentOS should persist its own job record before submitting to Manus. The record should contain an immutable AgentOS job ID, policy decision, requester identity, provider credential reference, allowed connector/skill IDs, prompt hash, structured-output schema hash, budget snapshot, and idempotency correlation value.

The execution sequence is:

1. **Admit.** Evaluate authority, data classification, allowed capabilities, model/profile, maximum runtime, and budget reserve.
2. **Prepare.** Upload large files through `file.upload`; create or select an approved project; construct a bounded task message and structured-output schema.
3. **Submit.** Call `task.create`; persist `request_id`, `task_id`, `task_url`, profile, visibility, and the exact request envelope after secret redaction.
4. **Run.** Prefer a signed `task_stopped` webhook. Use `task.listMessages` only for reconciliation, development, or when a webhook is temporarily unavailable.
5. **Handle running.** Keep the job pending and apply an AgentOS deadline. Do not create duplicate tasks merely because a status read is delayed.
6. **Handle waiting.** For `messageAskUser` or `cascadeAskUser`, surface the question to the authorized human and reply with `task.sendMessage`. For recognized action confirmations, use `task.confirmAction`. For unknown waiting types, stop automatic dispatch and require review.[5]
7. **Handle stopped.** If `stop_reason` is `finish`, validate structured output, collect attachments, and mark the job succeeded only after provenance is durable. If `stop_reason` is `ask`, retain the job in a waiting state.
8. **Handle error.** Persist the error code and request ID. Retry only transient transport, rate-limit, or clearly retryable provider failures, with bounded exponential backoff and jitter.
9. **Reconcile.** Periodically compare local records with task status, webhook events, and usage records where privileged access exists. Reconciliation must be idempotent.
10. **Close.** Store final result hashes, attachment metadata, cost observations, policy outcome, and timestamps.

A webhook handler should acknowledge quickly, verify the signature using the raw request body and full callback URL, reject stale timestamps beyond five minutes, deduplicate event IDs, enqueue internal work, and return HTTP 2xx. Manus documents RSA-SHA256 signatures and the public-key endpoint for verification.[7]

## 5. Evidence and provenance model

Every AgentOS result should be accompanied by a provenance envelope rather than only the assistant’s final text. At minimum, store the provider name and API version, credential/tenant reference, AgentOS job ID, Manus task ID, request ID, task URL, creation and completion timestamps, profile, project ID, connector and skill IDs, input-file IDs and hashes, prompt hash, schema hash, webhook event IDs, raw event hashes, result hash, attachment URLs and hashes, and the policy decisions that allowed or rejected actions.

Raw prompts and outputs should be encrypted or access-controlled according to data classification. Logs should record normalized metadata and hashes instead of duplicating sensitive content. The provenance record should distinguish **provider assertions**—for example, Manus’s `credits` field or `stop_reason`—from **AgentOS observations** and **AgentOS policy decisions**. A result is not authoritative merely because structured output parsed successfully; AgentOS should record `success`, validate the schema locally, and preserve the extraction error if `success` is false.[8]

## 6. Cost-control strategy

AgentOS should implement a **budget gate**, not a fictitious credit-source selector. Before submission, the gateway may query `usage.availableCredits` when using an API key or trusted OAuth credential. The response exposes `total_credits` as the authoritative spendable balance and reports remaining periodic, add-on, event, and refresh credits, plus the refresh interval and next refresh time for personal accounts.[2]

The practical policy is:

| Policy element | Implementation |
|---|---|
| Daily-credit preference | If `refresh_credits` is available and the business rule prefers non-accumulating credits, permit low-risk work only when the observed refresh balance exceeds a reserve and the task’s expected cost is within the configured daily envelope. |
| Monthly-credit protection | Maintain a reserve threshold for `total_credits` and refuse or queue discretionary work below it. This protects the account but does not control Manus’s internal debit ordering. |
| Admission uncertainty | Treat the preflight balance as a snapshot, not a reservation. Concurrent tasks can spend credits after the read. Add a concurrency semaphore and conservative margin. |
| Post-spend accounting | Reconcile `usage.list` or trusted usage logs after completion when available. Record actual signed credit changes, including refunds and grants.[10] |
| Profile control | Prefer `lite` for low-stakes work and require policy approval for `standard` or `max`; note that free personal accounts may be downgraded to `lite` regardless of the request.[14] |
| Rate-limit control | Centralize per-user throttling. Respect documented limits such as 10 task creates/minute, 100 detail/message reads/minute, and 40 stops/deletes/confirmations/minute.[15] |
| High-cost actions | Treat high-credit notices and media/video actions as confirmation-required. Never auto-accept a high-credit notice solely because a job was admitted. |
| Attribution | Attach AgentOS cost-center, requester, task class, and policy IDs to the job record; use Manus usage data for reconciliation, not as the only budget ledger. |

The system should explicitly report: “Manus exposed the following balances at preflight; AgentOS applied this admission policy; Manus did not expose a documented debit-source selector.” That wording prevents the daily-before-monthly preference from becoming an unsupported guarantee.

## 7. Failure and retry handling

The provider gateway should classify failures into transport, authentication, authorization, validation, rate-limit, provider execution, user-waiting, and policy categories. A 429 `rate_limited` response should use exponential backoff with jitter; the official documentation specifically recommends this and advises preferring webhooks over polling.[15] Authentication failures should not be retried automatically. Validation failures should be surfaced as permanent until the request is corrected. `permission_denied` should trigger capability review rather than a retry storm.

Task creation is not safely retryable unless AgentOS has an application-level deduplication strategy. Since a repeated `task.create` can create two billable tasks, the gateway should first persist a submission intent, use a deterministic correlation identifier in the task title and metadata where possible, and reconcile ambiguous timeouts through task listing or an operator workflow before resubmitting. If Manus provides no server-side idempotency key in the documented create contract, the connector must treat ambiguous create responses as “unknown outcome,” not “failed.”

Webhook delivery should be idempotent. The top-level webhook `event_id` identifies the notification; task identity identifies the logical job. Store both, verify the five-minute timestamp, and process each event at most once while allowing safe redelivery. A periodic reconciler should inspect incomplete local jobs and retrieve task messages/status with bounded concurrency.

## 8. Unsupported or speculative paths

The following should be marked **not evidenced in public official sources reviewed** rather than silently implemented: a Windows desktop local automation API; a supported Manus desktop IPC protocol; a task-control CLI; a public Manus MCP server intended to orchestrate Manus itself; a ChatGPT plugin API that exposes task lifecycle controls to AgentOS; and a selectable billing-wallet parameter. UI automation against the Windows desktop, reverse-engineered local endpoints, browser-cookie reuse, or plugin scraping would create fragile and security-sensitive coupling and would not satisfy a governed-provider requirement.

The connected ChatGPT plugin may remain useful for human work, but it should be modeled as a separate interactive channel. AgentOS should not infer that “plugin connected” means that a server-side API credential, webhook registration, task visibility, or usage endpoint is available.

## 9. Implementation backlog

| ID | Priority | Work item | Acceptance criterion |
|---|---:|---|---|
| AOS-MAN-001 | P0 | Define the provider-neutral AgentOS worker contract. | Contract covers submit, status, wait, reply, confirm, cancel, result, usage, and provenance. |
| AOS-MAN-002 | P0 | Build a Manus API v2 REST client. | Client supports auth headers, response envelopes, typed errors, timeouts, redaction, and request IDs. |
| AOS-MAN-003 | P0 | Implement task submission with explicit policy fields. | `task.create` sends approved connectors, skills, profile, visibility, project, interactive mode, and schema; omitted capability defaults are prohibited by policy. |
| AOS-MAN-004 | P0 | Implement webhook receiver and signature verification. | RSA-SHA256 verification, raw-body hashing, timestamp freshness, public-key caching, event deduplication, and fast 2xx acknowledgement are tested. |
| AOS-MAN-005 | P0 | Implement lifecycle state machine. | Running, stopped/finish, stopped/ask, waiting/action, error, timeout, and unknown states are persisted and tested. |
| AOS-MAN-006 | P0 | Add structured-output validation. | AgentOS validates the schema and accepts `value` only when Manus reports `success: true`. |
| AOS-MAN-007 | P0 | Add human approval queue. | Known high-impact confirmations are routed to authorized approvers; unknown waiting types halt automation. |
| AOS-MAN-008 | P0 | Add secrets and credential rotation. | API keys/OAuth tokens/client secrets are stored outside application logs and can be rotated or revoked without code changes. |
| AOS-MAN-009 | P1 | Add usage and balance observer. | Privileged credentials can read available balances and usage history; standard OAuth gracefully degrades when restricted endpoints return permission denied. |
| AOS-MAN-010 | P1 | Implement budget admission and reserve policy. | Daily-refresh preference is represented as an observable-policy heuristic, with no claim of debit-source control. |
| AOS-MAN-011 | P1 | Implement ambiguous-submit reconciliation. | A network timeout cannot cause an automatic duplicate task without reconciliation or operator approval. |
| AOS-MAN-012 | P1 | Add polling reconciler. | Incomplete jobs are reconciled within rate limits using cursor-aware reads and exponential backoff. |
| AOS-MAN-013 | P1 | Add file and attachment provenance. | Uploaded file IDs, hashes, attachment URLs, sizes, and retention status are recorded. |
| AOS-MAN-014 | P1 | Add connector/skill registry. | Logical AgentOS capabilities map to approved Manus IDs with owner, data-classification, and confirmation requirements. |
| AOS-MAN-015 | P2 | Add OAuth Open App deployment. | PKCE, state/CSRF validation, exact redirect URI checks, token refresh, revocation, and least-privilege scopes are tested. |
| AOS-MAN-016 | P2 | Add operational dashboards. | Dashboard shows task state, latency, errors, webhook health, observed credit balances, reconciled costs, and policy denials. |
| AOS-MAN-017 | P2 | Run a controlled debit-order experiment. | Test results record whether Manus actually consumes refresh/periodic/add-on credits in a predictable order; until then, selector remains unsupported. |
| AOS-MAN-018 | P3 | Reassess desktop, MCP, SDK, and plugin surfaces. | Reassessment is triggered only by new official documentation or a vendor-supported announcement; no reverse engineering is accepted as production evidence. |

## 10. Recommended rollout

The safest rollout is staged. First, deploy API-key-based development against a noncritical Manus account with private tasks, no external connectors, `lite` or `standard` profile, structured output, and a polling reconciler. Next, add signed webhooks, idempotent event processing, human confirmation, and provenance storage. Then enable approved connectors one at a time under AgentOS capability policy. Finally, introduce OAuth for multi-user delegation and privileged usage observation only where the Team account and Open App type justify it.

The production readiness gate should require successful tests for credential rotation, rate limiting, ambiguous task creation, duplicate webhook delivery, stale webhook rejection, waiting-state routing, unknown action-type blocking, structured-output failure, attachment collection, cancellation, and budget reserve enforcement. No release should depend on the installed Windows desktop or connected ChatGPT plugin.

## References

[1]: https://open.manus.im/docs/v2/introduction "Manus API v2 — Introduction"
[2]: https://open.manus.im/docs/v2/usage.availableCredits "Manus API v2 — usage.availableCredits"
[3]: https://open.manus.im/docs/v2/authentication "Manus API v2 — Authentication"
[4]: https://open.manus.im/docs/v2/open-app "Manus API v2 — Open App"
[5]: https://open.manus.im/docs/v2/task-lifecycle "Manus API v2 — Task Lifecycle"
[6]: https://open.manus.im/docs/webhooks "Manus API v2 — Webhooks Overview"
[7]: https://open.manus.im/docs/v2/webhooks-security "Manus API v2 — Webhook Security"
[8]: https://open.manus.im/docs/v2/structured-output "Manus API v2 — Structured Output"
[9]: https://open.manus.im/docs/v2/connectors "Manus API v2 — Connectors"
[10]: https://open.manus.im/docs/v2/usage.list "Manus API v2 — usage.list"
[11]: https://open.manus.im/docs/v2/usage.teamStatistic "Manus API v2 — usage.teamStatistic"; https://open.manus.im/docs/v2/usage.teamLog "Manus API v2 — usage.teamLog"
[12]: https://open.manus.im/docs/v2/manus-api-skill "Manus API v2 — Manus API skill"
[13]: https://open.manus.im/docs/v2/webhook.create "Manus API v2 — webhook.create"
[14]: https://open.manus.im/docs/v2/task.create "Manus API v2 — task.create"
[15]: https://open.manus.im/docs/v2/rate-limits "Manus API v2 — Rate Limits"

## Evidence note

This report distinguishes documented capability from absence of evidence. “Not evidenced” means the reviewed current public primary sources did not establish a supported contract; it is not a claim that the capability can never exist. Manus documentation can change, so the connector should pin API v2 behavior to contract tests and periodically revalidate the official reference.

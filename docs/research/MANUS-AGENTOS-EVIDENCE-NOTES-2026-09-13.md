# Manus AgentOS Research Evidence

## Official API v2

- Introduction: https://open.manus.im/docs/v2/introduction
  - Manus API v2 is the current API; v1 is deprecated.
  - REST base URL: https://api.manus.ai
  - Supports programmatic task creation/management, follow-up messages, results, projects, files, webhooks, skills, agents.
  - Responses use `{ok:true, request_id}` success envelope or `{ok:false, request_id, error:{code,message}}`; documented errors include invalid_argument, not_found, permission_denied, rate_limited.

- Authentication: https://open.manus.im/docs/v2/authentication
  - API key: `x-manus-api-key`; intended for own integrations/scripts. Keys are created in Manus web settings, shown once, should be stored securely, and each key gives full access to the Manus account. Up to 50 keys/account. Limits are per user across keys.
  - OAuth2: `Authorization: Bearer {access_token}` for third-party apps acting for users; tokens are scoped and endpoint pages specify scopes. Open App creation/authorization requires Team account; only same-team users can authorize standard apps.

- Open App: https://open.manus.im/docs/v2/open-app
  - Open Apps use OAuth2 Authorization Code plus PKCE options. Team apps are scope-limited; trusted_team apps bypass scope restrictions and have API-key-like access; trusted_public is partner-only/not generally available.
  - Scopes include `create_task`, `manage_all_tasks`, `create_project`, `use_connectors`, `use_my_browsers`.
  - `create_task` is narrow and only accesses tasks created by the app; `manage_all_tasks` is broad. `use_my_browsers` is separate from `use_connectors`.
  - Access token lifetime documented as 24 hours, refresh token 30 days; refresh atomically revokes old token pair. App secrets shown once; up to 5 active secrets for rotation. User can revoke authorized apps.
  - OAuth code expires in 10 minutes and is single-use; redirect URIs must match exactly and cannot use forbidden schemes.

- Rate limits: https://open.manus.im/docs/v2/rate-limits
  - Limits are per user and shared across all API keys; requests/minute; no subscription-tier differentiation currently documented.
  - task.create/sendMessage 10/min; task.detail/list/listMessages 100/min; stop/delete/update/confirmAction 40/min; usage endpoints 600/min; webhook create/delete 40/min/list 100/min.
  - 429 uses `rate_limited`; official guidance is exponential backoff with jitter, prefer webhooks over polling, cursor pagination, and cache webhook public key.

## Open questions for further primary-source validation

- Exact task lifecycle states, waiting-for-input/confirmation semantics, cancellation and result retrieval details.
- Webhook event schema, signature verification and replay/idempotency.
- Structured output schema and delivery behavior.
- Usage/credit endpoints and whether daily versus monthly credit pools can be selected.
- Official SDK/CLI/MCP/desktop/ChatGPT plugin support evidence.

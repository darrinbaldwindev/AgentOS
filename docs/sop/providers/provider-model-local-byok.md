# SOP-PROVIDER-001 — Provider, Model, Local AI and BYOK Configuration

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Architecture rule
AgentOS is model/provider/tool agnostic. Provider configuration supplies intelligence/capability; it does not become orchestration, authority, permission, mission state, memory authority, Green or PRS.

## Configuration packet
Record provider/adapter; model identifier; local/remote; endpoint/gateway; credential class; scopes; data categories sent; retention/training settings if evidenced; cost/rate limits; context/tool support; fallback policy; jurisdiction/data-processing notes; health evidence; version/date; owner; revoke/remove path.

## BYOK
Bring-your-own-key means the user supplies a credential for a bounded provider integration. It does not mean AgentOS may expose the key to prompts/workers/logs, use it for unrelated providers, increase spending without budget authority or infer permission for actions the provider can technically perform.

## Local AI
`local` must describe an evidenced execution/data boundary, not a marketing synonym for private. Record which model/process runs locally, what still leaves the device, where files/indexes/logs live and which remote fallbacks are enabled. If any of those are unknown, do not claim zero-cloud/private-local behavior for that flow.

## Routing
Routing may consider capability, quality, latency, cost, privacy/data policy and availability. It must preserve mission authority and budget limits. Fallback cannot silently send data to a provider that is disallowed for that data/scope.

## Health/failure
Provider API success != task success. Model output != verified fact. Tool-call capability != authority. On auth/rate/quota/outage failures, preserve evidence and select only policy-compatible fallback; otherwise block.

## Removal
Revoking/removing a provider must stop future credential use and update routing eligibility. It does not prove the external provider deleted previously transmitted data; provider-side deletion is a separate evidenced action.
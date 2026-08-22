# AgentOS Integration Fallback API

**Status:** Self-contained offline contract replacement for B4. The originally referenced source file was not present in the supplied project materials or accessible archives. This document defines request and response shapes only; it does not implement live endpoints.

## Scope and safety boundary

The contract describes how a future frontend/backend integration may represent fallback conditions and recoverable failures. It is compatible with the local deterministic API mock in `api/agentos-local-mock-api.mjs`, but it is not a production API, transport implementation, provider SDK, credential flow, persistence layer, or release claim.

> All identifiers and examples below are synthetic. Requests must not contain prompt text, secrets, credentials, repository contents, raw tool payloads, private artifact payloads, or unredacted external URLs.

Every response should include a stable `correlationId`, a machine-readable `error.code` when unsuccessful, and a `retryable` decision where a retry may be offered. Clients must preserve the correlation identifier across retries and recovery actions while generating a new request identifier for each transport attempt.

## Common envelope

```json
{
  "schemaVersion": 1,
  "correlationId": "corr_fixture_001",
  "requestId": "req_fixture_001",
  "idempotencyKey": "idem_fixture_001",
  "ok": false
}
```

The `idempotencyKey` is required for commands that can create or resume an operation. It is scoped to the caller and operation route. Repeating a request with the same key must return the same semantic result rather than create a second operation. The contract does not prescribe storage or retention.

## Context overflow

A client should receive a bounded diagnostic and a recovery offer when the selected model cannot safely accept the requested context. The response must contain counts and options, not the underlying prompt or context contents.

### Request

```json
{
  "method": "POST",
  "path": "/v1/recovery/context-overflow",
  "idempotencyKey": "idem_overflow_001",
  "body": {
    "executionId": "exec_fixture_001",
    "modelId": "fixture-model-local-coder",
    "estimatedTokens": 34800,
    "contextLimit": 32768
  }
}
```

### Response

```json
{
  "schemaVersion": 1,
  "ok": false,
  "correlationId": "corr_fixture_001",
  "error": {
    "code": "CONTEXT_OVERFLOW",
    "retryable": false,
    "message": "The selected model cannot accept the requested context."
  },
  "recovery": {
    "actions": ["preview_compaction", "switch_model", "cancel"],
    "requiresConfirmation": true
  }
}
```

## Stream interruption

A stream interruption must identify the last confirmed sequence boundary and whether partial output may be preserved. The contract must not transmit or log raw partial content in the recovery envelope.

### Request

```json
{
  "method": "POST",
  "path": "/v1/recovery/stream-interruption",
  "idempotencyKey": "idem_stream_001",
  "body": {
    "executionId": "exec_fixture_001",
    "streamId": "stream_fixture_001",
    "lastConfirmedSequence": 12,
    "failureCode": "connection_lost"
  }
}
```

### Response

```json
{
  "schemaVersion": 1,
  "ok": false,
  "correlationId": "corr_fixture_001",
  "error": {
    "code": "STREAM_INTERRUPTED",
    "retryable": true,
    "message": "The response stream ended before completion."
  },
  "recovery": {
    "partialOutputPreserved": true,
    "resumeFromSequence": 12,
    "actions": ["resume", "preview_fallback", "keep_partial_output"]
  }
}
```

## Tool failure

Tool failures use an opaque `toolId`, bounded `failureCode`, and retry policy. Raw arguments, raw output, filesystem paths, and provider credentials are never part of this response.

### Request and response

```json
{
  "method": "POST",
  "path": "/v1/recovery/tool-failure",
  "idempotencyKey": "idem_tool_001",
  "body": {
    "executionId": "exec_fixture_001",
    "toolId": "fixture-tool-indexer",
    "failureCode": "timeout",
    "retryable": true,
    "durationMs": 30000
  }
}
```

```json
{
  "schemaVersion": 1,
  "ok": false,
  "correlationId": "corr_fixture_001",
  "error": {
    "code": "TOOL_FAILURE",
    "retryable": true,
    "message": "The requested tool did not complete within its bounded time."
  },
  "recovery": {
    "actions": ["retry_once", "skip_tool", "cancel"],
    "requiresConfirmation": false
  }
}
```

## Artifact conflict

Artifact conflicts are represented using an opaque artifact identifier, revision numbers, and a resolution choice. The artifact body is not included in the error.

```json
{
  "schemaVersion": 1,
  "ok": false,
  "correlationId": "corr_fixture_001",
  "error": {
    "code": "ARTIFACT_CONFLICT",
    "retryable": false,
    "message": "The artifact changed after the operation began."
  },
  "artifactConflict": {
    "artifactId": "artifact_fixture_001",
    "expectedRevision": 4,
    "observedRevision": 5,
    "actions": ["review_diff_metadata", "keep_local", "keep_latest", "cancel"]
  }
}
```

## Idempotency

Commands such as model switching, recovery selection, or artifact resolution require an idempotency key. A duplicate semantic request must return a stable result envelope with the original `correlationId`, an explicit `duplicate: true` marker, and no second side effect.

```json
{
  "schemaVersion": 1,
  "ok": true,
  "correlationId": "corr_fixture_001",
  "requestId": "req_fixture_002",
  "idempotency": {
    "key": "idem_fixture_001",
    "duplicate": true,
    "originalRequestId": "req_fixture_001"
  },
  "result": {
    "action": "fallback_selected",
    "persisted": false
  }
}
```

## SSE reconnection

A future SSE transport may use `Last-Event-ID` and a bounded reconnect policy. The contract only specifies event identity and replay metadata; it does not require a live SSE server.

### Reconnect request headers

```text
Accept: text/event-stream
Last-Event-ID: evt_fixture_012
X-Correlation-ID: corr_fixture_001
X-Idempotency-Key: idem_stream_001
```

### Reconnect response event

```text
event: recovery.resume
data: {"schemaVersion":1,"eventId":"evt_fixture_013","correlationId":"corr_fixture_001","replayedFrom":"evt_fixture_012","replayComplete":true}

```

If the requested event is outside the bounded replay window, the client receives `SSE_REPLAY_UNAVAILABLE` and must offer a fresh local recovery path rather than silently duplicate or discard output.

## Error correlation

All controlled failures use the same shape so the UI can present a concise explanation, an explicit recovery action, and a correlation identifier for diagnostics. Correlation metadata must never be used as a substitute for authorization or a secret.

```json
{
  "schemaVersion": 1,
  "ok": false,
  "correlationId": "corr_fixture_001",
  "error": {
    "code": "RECOVERY_REQUIRED",
    "retryable": true,
    "message": "The operation requires an explicit recovery action.",
    "category": "provider_status"
  },
  "recovery": {
    "actions": ["retry", "switch_model", "stop"],
    "automaticActionTaken": false
  }
}
```

## Frontend obligations

The client must show the provider health label, preserve partial-output status when supplied, distinguish a preview from a real action, request confirmation before destructive or externally visible actions, and avoid automatic retries when a response says `requiresConfirmation: true`. Referral status remains secondary to capability fit, and any eventual redirect must be separately consented, auditable, and guarded by a dry-run path.

## Implementation gate

This document is a contract refinement only. A later implementation may add typed handlers and transport tests, but must preserve the no-live-endpoint boundary until a real frontend/backend project is explicitly attached or initialized and the owner approves that scope.

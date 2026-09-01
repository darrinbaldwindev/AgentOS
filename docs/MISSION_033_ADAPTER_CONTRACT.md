# AgentOS Governance Adapter Contract — v0

## Purpose

Define the minimum stable boundary for wrapping an external agent/orchestration framework with AgentOS governance.

## Principle

The adapter submits **intent** to AgentOS. It does not decide whether an action is authorized.

## Pre-flight input

A governed action request should carry, at minimum:

- `project_id`
- `actor_id`
- `mission_id`
- `action_type`
- `target`
- `requested_capability`
- `estimated_cost`
- `estimated_tokens`
- `tool_or_operation`
- `consent_context` where required

Missing project scope or required identity must fail closed.

## Decision output

The governance boundary should return a deterministic decision containing:

- `decision`: `allow` | `deny` | `escalate`
- `reason_code`
- `project_id`
- `mission_id`
- `reservation` when budget is reserved
- `evidence_id` or equivalent correlation identifier

An `allow` decision is not itself execution. The caller must execute only after receiving the allowed decision and must report the resulting outcome for reconciliation.

## Budget semantics

Budget checks must use the existing AgentOS reservation/reconciliation model where available. A pre-flight estimate must not be treated as spent cost. A successful execution must reconcile actual usage; failed or cancelled execution must release or reconcile its reservation according to the runtime contract.

## Path and capability semantics

The adapter must pass the original target/action information to the authoritative AgentOS path and capability controls. It must not implement a second permissive authorization policy that can disagree with AgentOS.

## Fail-closed cases

At minimum:

- missing/unknown project scope;
- missing actor identity;
- budget reservation failure;
- invalid or unauthorized path;
- unavailable capability;
- denied consent;
- malformed governance request;
- governance service/runtime unavailable when enforcement is mandatory.

## Framework neutrality

The first concrete implementation may target one framework, but the contract must not encode framework-specific assumptions. Framework adapters should translate native lifecycle events into this boundary.

## Evidence requirements

Tests must demonstrate both positive and negative paths. At minimum cover:

1. authorized action;
2. unknown project;
3. budget exhaustion;
4. concurrent reservation contention;
5. unauthorized path;
6. capability mismatch;
7. consent denial;
8. malformed request;
9. governance/runtime failure;
10. post-call reconciliation.

## Latency measurement

Integration tests should measure adapter overhead separately from model/provider latency. The target is to minimize governance overhead without weakening controls; no unsupported latency guarantee should be published.

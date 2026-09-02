# AgentOS — Marketing Implementation Evidence: Governed Scheduler Wake Test — 2026-09-03

**Owner:** Marketing Overseer  
**Status:** VERIFIED TEST-EVIDENCE / NOT CUSTOMER-WORKFLOW PROOF  
**Scope:** Marketing evidence mapping only.

## Evidence inspected

The repository contains a scheduled wake test that invokes `runGitHubWakeCycle` through `scripts/scheduled-wake-test.mjs`. The test constructs a governed task with an issuer, target, required capability, authority grant, acceptance criteria and wake trace, then applies authority, lease and idempotency controls. The test requires completion, matching task/response wake traces and preserved worker provenance.

The GitHub workflow invokes this canonical wake test for both scheduled and manual triggers and requires a GREEN result before recording durable scheduler evidence.

## What is verified

- A governed GitHub wake test path is implemented in the repository.
- Scheduled and manual test invocations use the same wake-test contract.
- The test exercises authority/capability policy, lease and idempotency controls.
- Task progression and worker provenance are asserted by executable test code.
- Wake-trace correlation is explicitly asserted.
- The workflow records a boundary statement that this does **not** prove an independently installed local AgentOS process was awakened by GitHub.

## Marketing interpretation

**Verified capability signal:** AgentOS has repository evidence for governed scheduled wake orchestration in a test environment.

**Not verified:** customer workflow value, production autonomy, installed local-host wake, business outcome improvement, adoption, willingness to pay, or general-purpose autonomous execution.

Therefore this evidence may support a future demonstration of governance/control mechanics, but it must not yet be marketed as proof of a production customer workflow or autonomous-agent outcome.

## Mapping to proof sequence

| Proof field | Current evidence | State |
|---|---|---|
| Trigger | GitHub scheduled/manual workflow | VERIFIED TEST |
| Workers/models | Registered scheduler test worker | VERIFIED TEST |
| Policy/authority | Capability + authority policy | VERIFIED TEST |
| Execution | Governed wake-cycle test | VERIFIED TEST |
| Challenge/review | Not demonstrated as a customer workflow | UNKNOWN |
| Assurance | Assertions + durable issue evidence path | VERIFIED TEST |
| Acceptance | Test completion criteria | VERIFIED TEST |
| Failure path | Fail-closed test assertions | VERIFIED TEST |
| Customer baseline/result | None | UNKNOWN |

## Gate

The next marketing proof step remains identification of a real currently implemented Project Overseer/customer-relevant workflow. Do not substitute this scheduler test for that workflow.

## Source evidence

- `.github/workflows/scheduler-roundtrip-test.yml`
- `scripts/scheduled-wake-test.mjs`
- Existing AgentOS marketing proof and claim-guardrail documents

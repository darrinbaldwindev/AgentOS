# AGENTOS-OPERATOR-INTEGRATION-READINESS-001

## Mission

Define the first-wave implementation boundary for a governed computer-use / Operator-style capability without creating a second scheduler, worker registry, mission ledger, authority system, governance layer, persistence layer, assurance system, or source of truth.

This is an implementation-readiness artifact only. It does not enable computer use, browser control, Windows control, production autonomy, or any external side effect.

## Why this slice exists

PR #104 project-file mutation remains blocked on a kernel-enforced ownership boundary that must survive through publish/recovery/receipt persistence. Adding a private lock or transaction inside the project-file writer would duplicate canonical persistence/locking authority. While that blocker remains open, this document advances the explicitly permitted first-wave Operator integration path without bypassing it.

## External capability model

OpenAI's Computer-Using Agent model interacts with GUIs from screenshots and returns computer actions such as clicks, typing and scrolling. OpenAI's safety guidance treats computer use as a higher-risk capability requiring layered safeguards and human oversight, particularly for sensitive actions and less-reliable OS-level operation.

AgentOS must therefore treat any Operator/CUA provider as an untrusted execution capability downstream of AgentOS governance, not as an Overseer, scheduler, authority source, mission ledger, worker registry, or assurance source.

## Canonical AgentOS placement

Provider adapter position:

`canonical task -> authority -> consent -> capability -> policy/risk/budget/approval -> Operator adapter -> observed action/result -> execution receipt -> verification/reconciliation -> Green/PRS`

The adapter may translate an already-authorized bounded AgentOS action into provider-specific computer-use requests. It must not grant or broaden authority.

## First-wave capability boundary

Initial implementation should be **browser/UI observation plus bounded non-destructive interaction only**.

Allowed first-wave candidate action classes:

- `computer.observe` — obtain a screenshot / visible UI state.
- `computer.click` — click a coordinate or resolved UI target within an approved application/site context.
- `computer.scroll` — bounded scrolling.
- `computer.type` — bounded text entry only when the destination field is explicitly approved and the text payload is already present in the governed task.
- `computer.wait` — bounded wait for UI stabilization.

Explicitly excluded from first wave:

- purchases, checkout confirmation, subscription changes or financial transactions;
- credential creation/change, MFA changes or secret retrieval;
- accepting legal terms or signing agreements;
- sending email/messages/posts or publishing content;
- deleting user data or files;
- privilege elevation, shell/terminal execution or unrestricted PowerShell;
- production deployment or production writes;
- changing AgentOS governance, scheduler, authority, Green or PRS state;
- autonomous CAPTCHA handling;
- any action outside the approved application/site/window boundary.

## Required adapter contract

A provider-neutral adapter should consume an immutable governed request containing at minimum:

- canonical `project_id`, `mission_id`, `task_id`, `worker_id` correlation;
- `provider` and `model` selected upstream;
- approved action class;
- approved application/site/window scope;
- maximum action count;
- maximum elapsed time;
- explicit text payload hashes for any typing action;
- consent/approval evidence IDs already established upstream;
- risk classification and budget evidence;
- idempotency / attempt identity.

The adapter should emit immutable evidence containing at minimum:

- exact correlation tuple and attempt identity;
- provider/model identifiers actually used;
- ordered action transcript with monotonic sequence numbers;
- pre/post screenshot hashes or equivalent observation hashes for each state-changing action;
- requested versus executed coordinates/targets where applicable;
- typed-payload hash, never plaintext secrets;
- provider response IDs when available;
- start/end timestamps and termination reason;
- any user-confirmation request surfaced by the provider;
- final observed UI state hash;
- explicit `success`, `failed`, `blocked`, `needs_owner_confirmation`, or `indeterminate` execution result.

Execution success must never imply Green, PRS or mission completion.

## Fail-closed rules

The adapter must fail closed when:

1. correlation is incomplete;
2. action class is not in the fixed approved catalogue;
3. application/site/window scope cannot be established;
4. requested action count or time exceeds governed limits;
5. a provider asks for an action outside the approved action class;
6. a sensitive confirmation boundary is reached without owner approval evidence;
7. the visible target cannot be reconciled to the prior observation;
8. a screenshot/observation required for verification is unavailable;
9. provider identity/model identity is not the one selected by the governed task;
10. a replay/idempotency conflict is detected;
11. receipt persistence fails;
12. the provider attempts to expose or request secrets beyond the approved input boundary.

## Human-in-the-loop boundary

Owner confirmation is mandatory before any future expansion into:

- external communications;
- irreversible changes;
- purchases or payments;
- account/identity/security changes;
- public publishing;
- production state changes;
- downloading or uploading sensitive user files.

First-wave implementation should stop and return `needs_owner_confirmation`; it must not synthesize confirmation or continue optimistically.

## Prompt-injection boundary

Screen content, websites, documents and application text are untrusted data. Instructions found in the UI must never alter AgentOS authority, policy, capability scope, budget, approval state, Green/PRS state, or the fixed action catalogue.

The provider adapter must distinguish:

- task instruction: produced by canonical AgentOS governance;
- environment content: untrusted observation only.

A provider suggestion to broaden the task must be surfaced as evidence and fail closed pending a new canonical authorization decision.

## Provider-neutral interface shape

A minimal implementation seam should be narrow enough to support OpenAI CUA initially while preserving provider agnosticism:

```text
createComputerUseAdapter({ invokeProvider, persistReceipt, captureObservation })

execute({ governedTask, actionBudget, approvedScope }) -> {
  status,
  correlation,
  attempt_id,
  provider,
  model,
  actions[],
  evidence,
  receipt_id
}
```

No provider-specific API object should become canonical task, mission, authority, consent, budget, approval, or assurance state.

## Deterministic acceptance tests before any live provider call

1. rejects incomplete canonical correlation;
2. rejects an action outside the fixed catalogue with zero provider invocation;
3. rejects scope drift with zero state-changing provider invocation;
4. rejects typing when payload hash/content does not match the governed request;
5. stops at sensitive confirmation boundary and returns `needs_owner_confirmation`;
6. rejects provider-requested privilege/shell expansion;
7. rejects action after action-budget exhaustion;
8. rejects action after time-budget exhaustion;
9. records ordered action evidence and observation hashes;
10. receipt persistence failure returns indeterminate/recovery-required, never success;
11. duplicate attempt/idempotency replay does not repeat a state-changing action;
12. environment prompt injection cannot alter action catalogue, authority or approval state;
13. execution verifier cannot set Green, PRS or completion eligibility;
14. provider/model mismatch fails closed before action;
15. owner-confirmation token for one action/attempt cannot authorize a different action/attempt.

## Live acceptance progression

Only after deterministic tests pass:

1. mock provider loop;
2. local inert HTML fixture in an isolated browser;
3. owner-supervised read-only public webpage observation;
4. owner-supervised bounded click/scroll on a non-production fixture;
5. owner-supervised bounded typing into a disposable local fixture;
6. independent Green review of exact implementation head;
7. PRS challenge on the same exact head only after Green PASS.

No production website/account action belongs in this progression.

## Relationship to current PR #104

This readiness slice does not change or weaken the current project-file mutation blocker. Project-file mutation remains AMBER until an ownership boundary is proven across publish/recovery/receipt persistence.

The existing bounded PowerShell worker and any future computer-use adapter are sibling capabilities downstream of the same governed execution boundary. Computer use must not route around canonical authority admission, consent, capability, risk, budget, approval, receipt, verification or Green/PRS gates.

## Implementation order

When code work resumes, prefer this order:

1. provider-neutral action/evidence types;
2. fixed first-wave action catalogue and scope validator;
3. mock adapter with zero external side effects;
4. deterministic fail-closed tests above;
5. receipt persistence through the existing canonical persistence seam;
6. provider-specific OpenAI CUA adapter behind the neutral seam;
7. inert-fixture acceptance;
8. exact-head CI + dependency audit;
9. independent Green;
10. PRS only if Green passes.

## Classification

`OPERATOR-INTEGRATION-IMPLEMENTATION-READY / NO-RUNTIME-ENABLEMENT`

This classification means the architecture and deterministic acceptance contract are ready to implement. It is not evidence that Operator/CUA is connected, configured, safe for production, Green, PRS-passed, or enabled.

# Manus One-Month AgentOS Onboarding

## Objective

Use a one-month Manus subscription as a controlled real-world worker integration test for AgentOS. Preserve the existing Manus Overseer; do not create a fresh Manus Overseer unless the existing one is inaccessible or corrupted.

## Before activation

1. Full AgentOS repository/control-plane scan before relying on logs.
2. Reconcile current repository state against canonical logs and persistent context.
3. Identify stale, missing, contradictory or unverified state.
4. Prepare the Manus worker capability profile and task handshake.
5. Prepare a bounded first workload that can prove the worker loop.
6. Record subscription start date and billing/renewal date after purchase.

## First-month objectives

- Establish Manus as an available external worker, not as a permanent AgentOS dependency.
- Prove Overseer → Manus task → acknowledgement → execution → evidence → response → verification.
- Test Manus against the same provider-independent worker contract used by other workers.
- Test scoped worker reconnaissance: task area, dependencies, related tests, recent changes and prior evidence.
- Require scan expansion/escalation when evidence shows broader impact.
- Test GitHub access and local-workspace capability where authorised.
- Compare Manus performance against other workers on representative tasks.
- Record cost, speed, quality, reliability and evidence quality.
- Determine whether Manus remains economically justified after the one-month experiment.

## Manus schedule

Initial Manus Overseer check schedule: **every hour at :30**.

The first schedule is intentionally hourly. Do not replace it with a five-minute cadence until the hourly cycle is proven reliable.

Each check should:

1. Perform the required state/control-plane check.
2. Read the relevant logs after the current-state scan.
3. Identify tasks assigned to Manus.
4. Claim only authorised work.
5. Execute or report a deterministic block.
6. Return evidence and status.
7. Check for follow-up delegation.
8. Log discrepancies and unresolved requirements.

## Communication handshake

`GPTChat/AgentOS Overseer → Manus Overseer → Manus worker → acknowledgement → execution → evidence → response → verification → follow-up task`

The Manus Overseer must not ask the ChatGPT Overseer for its conclusions before independently assessing assigned work. Both Overseers remain independent reviewers while sharing authorised task/evidence state through the AgentOS coordination mechanisms.

## GitHub and local workspace

Where Manus has authorised access, validate:

- repository identity
- branch
- read access
- scoped file access
- changes/diff
- commit evidence
- PR/issue evidence where authorised
- local workspace access if using Manus Desktop/My Computer

Manus currently documents GitHub connectors and a Desktop App My Computer capability for authorised local folders and command-line execution. These must be treated as capabilities to verify, not assumptions. 

## Work preparation

Before sending a task to Manus, AgentOS should prepare:

- precise objective
- relevant repository/project context
- scoped files or workspace
- dependencies
- prior evidence
- expected output
- acceptance criteria
- verification method
- authority boundaries

Do not claim Manus executed anything until evidence is returned.

## One-month evaluation

At the end of the subscription period evaluate:

- tasks completed
- successful vs blocked tasks
- quality
- speed
- cost/credit efficiency
- autonomous reliability
- GitHub/workspace effectiveness
- usefulness as an AgentOS worker
- overlap with other providers
- whether continued subscription is justified

If Manus is no longer justified, AgentOS should be able to recommend cancellation rather than biasing the decision toward continued affiliate revenue.

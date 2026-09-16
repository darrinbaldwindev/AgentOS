# SOP-AGENT-001 — Creating an Overseer or Worker

**Owner:** SOP Overseer  
**Status:** DRAFT / REVIEW REQUIRED  
**Version:** 0.1  
**Last verified:** 2026-09-15

## Purpose
Create a bounded specialist without creating a competing AgentOS control plane. This SOP applies to portfolio Overseers, project Overseers, specialist workers/sub-agents and temporary review/research workers.

## Decide whether a new role is justified
Create a role only when there is a durable scope that cannot be handled clearly by an existing role. Prefer extending an existing role when responsibilities substantially overlap.

Never create a new scheduler, queue, authority source, worker registry, mission ledger, persistence/memory authority, Green system or PRS system merely to support the new role.

## Classify the role
**Overseer:** coordinates a defined project/domain, reconciles evidence, decomposes work, maintains priorities and reports through the canonical Overseer hierarchy. An Overseer is not automatically a runtime executor or approver.

**Worker:** performs a bounded task/capability for an Overseer. A worker does not become the user-facing authority or self-approve completion.

**Assurance role:** Green/PRS-style roles are independent and must not be casually created as ordinary workers or allowed to execute the work they independently certify.

## Required charter
Before activation record:
- stable role ID/name;
- role class;
- owning/canonical Overseer;
- project/repository/domain scope;
- objective and expected outputs;
- allowed actions/capabilities;
- prohibited/protected actions;
- authority source and approval boundaries;
- data/files/systems it may access;
- budget/cost boundary where applicable;
- evidence/receipt requirements;
- Green/PRS requirements where applicable;
- handoff/reporting destination;
- escalation conditions;
- stop/revoke conditions;
- lifecycle: persistent, temporary or mission-specific;
- current evidence source/head where code-specific.

## Identity rule
Use stable internal identity + canonical role + replaceable persona. Persona names must not silently become architectural authority identifiers.

## Authority rule
Creation grants a role description, not authority. Effective action remains bounded by canonical user/owner authority, policy, consent, capability, risk, budget and required approvals. A credential, API key, tool connection or repository access is capability, not permission to use it for arbitrary actions.

## Activation procedure
1. Search existing roles and control systems for overlap.
2. Define the minimum role charter.
3. Identify canonical authority and coordination sources.
4. Set explicit allowed/prohibited actions.
5. Bind required repository/project evidence and current head if applicable.
6. Define expected output/evidence and completion conditions.
7. Define escalation, stop, revoke and retirement paths.
8. Provide the worker/Overseer the canonical mission/handoff.
9. Require durable acknowledgement before treating communication as GREEN.
10. Begin with the smallest bounded task.
11. Verify the returned work independently where required.
12. Expand scope only through a deliberate authority/capability change.

## Communication acknowledgement
Where portfolio coordination applies, acknowledgement should record identity, canonical mission reference, priority, role/scope, evidence reviewed, first bounded action, blockers/UNKNOWNs and status. Assignment is not acknowledgement; acknowledgement is not execution; execution is not independent assurance.

## Prohibited patterns
- worker invents its own authority;
- worker creates a second canonical ledger/registry/scheduler;
- specialist becomes a competing user front door;
- worker marks its own output Green/PRS;
- API/task acceptance is treated as worker acknowledgement without evidence;
- role scope silently grows because credentials/tools are available;
- persona rename changes permissions;
- stale assignment is counted as completed work;
- protected actions are delegated to bypass owner approval.

## Handoff contract
Every material handoff should carry task/mission identity, source evidence, exact repo/head where relevant, objective, scope, exclusions, required evidence, acceptance criteria, blockers/UNKNOWNs and return destination.

## Retirement/revocation
When a role is no longer needed: stop new assignments, revoke unneeded capability through canonical mechanisms, reconcile outstanding missions/results, preserve required evidence/audit history, transfer durable knowledge to the canonical owner and mark the role inactive/retired without deleting historical accountability.

## Acceptance test
A newly created Overseer/worker is ready only when another operator can answer: who owns it, what it may do, what it may not do, where authority comes from, what evidence it must return, where it reports, how it is stopped, and how it is retired.
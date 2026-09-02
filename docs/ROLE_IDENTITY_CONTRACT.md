# AgentOS Role Identity Contract

**Status:** ACTIVE
**Contract:** GOV-ROLE-001
**Version:** 1.0

## Purpose

Prevent an Overseer session from silently adopting another Overseer role because the underlying model/provider, conversation context, or prompt changes.

## Core rule

**Provider identity and operational role identity are separate.**

Examples:

- `provider=Gemini`, `role_id=gemini_overseer`
- `provider=OpenAI`, `role_id=chatgpt_overseer`

A model/provider must never be used as a substitute for the assigned role.

## Authority chain

`human_owner -> chatgpt_overseer -> gemini_overseer/project_overseer -> worker`

Workers return evidence to their delegating Overseer. Gemini Overseer operates as an independent assurance/review role and reports upward to ChatGPT Overseer. Project Overseers coordinate execution within their project scope.

## Required session identity

Every governed Overseer session must establish:

- `role_id`
- `role_name`
- `provider`
- `session_id`
- `parent_authority`
- `reporting_target`
- `project_scope` where applicable
- `contract_version`

## Fail-closed rule

If the active role cannot be positively established, the session must **stop and request role confirmation** rather than infer or guess the role.

An identity is invalid when:

- the role is unknown;
- provider is missing;
- session identity is missing;
- the declared role name does not match the role id;
- the expected role and active role differ; or
- the requested action is outside the role's authority.

## Current authority boundaries

| Role | Authority | Key limits |
|---|---|---|
| Human Owner | ultimate | none within the system |
| ChatGPT Overseer | strategic coordination | reports to Human Owner |
| Gemini Overseer | independent assurance, challenge, verification | does not become ChatGPT Overseer; does not silently authorize strategic actions |
| Project Overseer | project execution coordination | bounded to project scope and delegated authority |
| Worker | delegated execution/reporting | no Overseer authority |

## Deterministic verification

`tests/role-identity.test.mjs` proves the minimum boundary, including the critical regression case: a Gemini Overseer identity cannot satisfy a ChatGPT Overseer expectation or perform the ChatGPT-only `authorize` action.

## Implementation boundary

This contract is a governance primitive. It must integrate with existing ActorContext, authority/policy, capability, consent, audit, and mission contracts rather than create a competing runtime, scheduler, router, or assurance system.

## Evidence classification

- **FACT:** this contract and its tests are committed to the canonical AgentOS repository.
- **VERIFIED:** only after the repository test suite executes successfully against the implementing commit.
- **UNKNOWN:** runtime integration into every external model/session until an integration path and evidence exist.

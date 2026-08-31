# External Worker Installation & Capability Onboarding

Status: DESIGN BASELINE

## Purpose

Provide a provider-neutral onboarding path for external workers such as Manus, Gemini, ChatGPT/Codex, Claude and future approved providers. The user performs provider-specific configuration where required; AgentOS then discovers, tests and governs the resulting capabilities.

## Core rule

AgentOS does not assume that an external worker's plugins, integrations or tools exist merely because the provider supports them. A provider-specific adapter must map supported external tools to AgentOS capabilities and expose the verification required to prove that capability is actually available.

AgentOS cannot directly install, remove or configure an external provider's internal plugins unless that provider exposes an authorised management interface. Where no such interface exists, AgentOS provides the user with precise setup instructions and then verifies the result.

## Onboarding lifecycle

1. Detect an approved provider/worker.
2. Determine the capabilities required by the current portfolio and approved worker role.
3. Generate provider-specific setup instructions for missing capabilities.
4. User manually installs/enables/configures the provider integrations where required.
5. User grants only the requested permissions.
6. AgentOS performs authentication/connectivity checks through the supported integration.
7. AgentOS performs capability discovery and capability-specific tests.
8. Record the resulting worker capability passport.
9. Mark each capability as available locally, available remotely, unavailable, degraded, or requires owner approval.
10. Activate the worker only for capabilities that have passed verification and policy checks.

## Capability-first configuration

Instructions should be generated from required capabilities rather than from a static plugin list. Example capabilities include repository access, task execution, result reporting, browser automation, research, code execution and external callbacks.

Provider-specific plugin names are implementation details of the adapter. AgentOS's stable abstraction is the capability contract.

## Capability handshake

```text
Configure
  -> Authenticate
  -> Discover
  -> Capability test
  -> Permission test
  -> Record passport
  -> READY / DEGRADED / BLOCKED
```

A worker is not READY solely because setup instructions were completed. Each required capability must have evidence.

## Permission model

The user may grant capabilities such as repository read/write, Git operations, filesystem access, shell/process execution, network access, provider/API access, credential access and browser automation. AgentOS must enforce least privilege and must not grant capabilities that the worker did not request or policy does not permit.

## Installed AgentOS advantage

When an equivalent capability can safely be provided by the installed local runtime, AgentOS may use the local capability instead of depending on an external provider plugin. Examples include local Git/repository access, local shell/test execution, local browser automation where explicitly enabled, and local development tooling.

The selection process is therefore:

```text
Task requirements
  -> Required capabilities
  -> Capability registry
  -> Local vs external implementations
  -> Permission/authority check
  -> Worker/provider selection
  -> Execution
  -> Evidence
  -> Verification
```

## Lifecycle management

After onboarding, AgentOS should periodically revalidate critical capabilities and detect provider/plugin changes, authentication expiry, permission changes and degraded integrations. A failed capability test must immediately affect worker eligibility and create the appropriate remediation or capability-acquisition task.

## Security boundary

External-worker onboarding must never require secrets to be placed in repository files or coordination logs. Credentials remain in the approved local secret mechanism or provider-managed authentication flow. User approval is required for privileged capabilities and destructive operations.

## Acceptance criteria

- Provider-specific instructions can be generated from capability requirements.
- A worker cannot become READY without capability evidence.
- Missing plugins/integrations produce actionable setup instructions.
- Provider plugin names remain isolated behind adapters.
- Local capabilities are preferred when appropriate and authorised.
- Permission boundaries are enforced.
- Capability degradation removes or limits worker eligibility.
- Provider/plugin changes can be detected and remediated.
- No secrets are written to repositories or logs.
- The workflow supports future providers without changing AgentOS's core capability model.

# Capability / MCP Supply-Chain Policy

**Owner:** SOP Overseer  
**Status:** RECOMMENDED POLICY / REVIEW REQUIRED  
**Version:** 0.1-draft  
**Scope:** MCP servers, tools, plugins/connectors, local executables, provider capabilities and equivalent integrations

## Core rule
AgentOS is MCP-first, not MCP-only. A capability may extend execution but must not become a competing scheduler, queue, worker registry, mission ledger, authority system, persistence system, memory authority, Green system or PRS system.

## Admission expectations
Before a capability is trusted for meaningful work, record where applicable:

- stable capability identity and source;
- publisher/provider and distribution channel;
- version/build/hash or equivalent provenance;
- requested permissions/capabilities;
- filesystem/network/process/credential access;
- data destinations and provider processing implications;
- licensing/terms relevant to intended use;
- update mechanism;
- rollback/removal method;
- evidence/receipt behaviour;
- known security/advisory status;
- owner/admin approval requirements.

## Least privilege
Grant only capabilities required for the task. Capability availability never implies authority to use it. Unknown scope, unexpected permission expansion, changed identity/provenance, or failed policy evaluation must fail closed for protected actions.

## Updates
Treat material capability updates as revalidation events. Permission expansion, publisher/source changes, executable changes, data-flow changes or changed credential requirements require renewed review before protected use.

## Compromise/revocation
A suspected compromised capability should be disabled/revoked through the canonical control path, affected credentials reviewed, recent evidence preserved, dependent missions identified, and downstream SOPs marked for revalidation. Do not delete historical evidence to hide the event.

## Documentation boundary
This policy does not prove that AgentOS currently implements a complete capability passport, signature verification, vulnerability scanner, sandbox, automatic rollback or revocation engine. Each such claim requires repository/runtime evidence.
# AgentOS Overseer Hierarchy Reconciliation — 2026-08-24

## Purpose

Reconcile the canonical AgentOS Overseer role established during the current evolution work with the repository's newer coordination/runtime hierarchy.

## Canonical roles

### Owner
Darrin remains the final authority over AgentOS and its governance.

### Manus Overseer
Portfolio-level secondary Overseer operating from Manus Desktop. It supervises the broader collection of projects and can provide cross-project recommendations or reusable capabilities.

### AgentOS Overseer
The primary AI/runtime intelligence of the AgentOS project. It is the renamed successor to AgentOS Main and inherits Main's legitimate knowledge, continuity, responsibilities and authority.

AgentOS Overseer owns the runtime-facing intelligence: mission continuity, user task handling, model/provider routing, execution monitoring, audit/recommendation behaviour and eventual multi-agent coordination.

### Project coordination / architect-prime
A distinct project-governance and coordination role. It must not be treated as a competing Overseer. Its purpose is project coordination, canonical project records, bounded task issuance, scope protection and development coordination.

### Specialist agents
Worker agents operating under the AgentOS coordination/runtime hierarchy. They do not replace AgentOS Overseer as the primary AgentOS intelligence.

### Models/providers
Execution resources only. They are interchangeable workers and must not become AgentOS identities or own mission continuity.

## Authority reconciliation

The existence of a project coordination role does not invalidate the earlier AgentOS Overseer role decision. The hierarchy is layered rather than competitive:

Darrin -> project coordination -> AgentOS runtime -> AgentOS Overseer -> specialist agents/tools/providers.

Manus Overseer remains outside this chain as the portfolio-level secondary Overseer reporting to the owner.

## Important invariant

AgentOS Overseer remains the canonical primary AI identity for AgentOS. No second AgentOS Overseer should be created merely because another coordination agent exists.

## Implementation implication

Future development must preserve the separation between:

1. project governance/coordination;
2. runtime intelligence and user-facing AgentOS operation;
3. worker-agent execution;
4. provider/model execution resources.

This reconciliation is intended to prevent contradictory role definitions from entering future logs, prompts, agent instructions or runtime configuration.

## Current engineering priority

Continue from the repository's existing implementation rather than rebuilding it. Verify and harden the Overseer-first execution path, runtime shell boundary, durable persistence, capability probes and end-to-end execution before expanding autonomous authority.

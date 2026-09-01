# AgentOS Security Control Plane

**Status:** Launch workstream established
**Date:** 2026-09-01

## Objective

Treat security as a first-class AgentOS control-plane concern protecting identity, authority, execution, data, tools, evidence and recovery.

## Security layers

1. Identity and authentication
2. Capability and least-privilege authorization
3. Authority/delegation and consent controls
4. Policy integrity and fail-closed enforcement
5. Worker/tool sandboxing and execution isolation
6. Data protection and tenant isolation
7. Secrets and credential management
8. Prompt-injection and untrusted-input boundaries
9. Supply-chain, dependency and release provenance
10. Runtime anomaly detection
11. Tamper-evident audit/event history
12. Green Agent protection and monitoring integrity
13. PRS independence and assurance-result protection
14. Recovery, quarantine and emergency stop controls
15. Partner/API security
16. Model/provider isolation and output validation

## Agent security levels

- **A0 Observer:** read/analyse only
- **A1 Assistant:** low-risk reversible actions
- **A2 Operator:** bounded operational actions
- **A3 Privileged:** sensitive systems/actions
- **A4 Critical:** high-impact actions requiring explicit approval

Agents must never grant themselves higher authority.

## Security tripwire

Attempts to bypass policy, escalate privileges, disable monitoring, alter audit records, exceed budget, access unapproved capabilities, manipulate evidence, or modify governance rules must generate a security finding and may trigger quarantine/escalation according to policy.

Green Agent observes and escalates; it does not remediate.

## Launch requirements

Security work must include threat modelling, automated scanning, secret scanning, dependency/SBOM review, access-control testing, runtime isolation testing, incident/recovery testing and an independent security review before enterprise launch.

## Product boundary

Security controls should be reusable in the Universal Execution Governance Middleware where technically and commercially appropriate. The architecture must remain provider/model agnostic.

# AgentOS Coordinator Bootstrap Export

**Export date:** 21 August 2026 GMT+10  
**Purpose:** Provide a first-contact onboarding package for a separate AgentOS project coordinator, based on PRS-derived coordination and verification lessons without transferring PRS implementation or governance authority.  
**Status:** External-project reference package; non-binding for PRS and AgentOS until the AgentOS owner/coordinator independently reviews it.

## Package identity

| Item | Value |
|---|---|
| Package directory | `/home/ubuntu/projects/AGENTOS_COORDINATOR_BOOTSTRAP_2026-08-21/` |
| Transfer archive | `AGENTOS_COORDINATOR_BOOTSTRAP_2026-08-21.zip` |
| SHA-256 | `530756923a40c11e57bdb399c9f7237169b37e4be9861fca3f7d9881de6c0fc7` |
| Validation | Six Markdown files present; AgentOS-local templates contain no PRS-specific records or identifiers; Markdown code-fence parity passed; ZIP integrity passed. |

## Contents

| File | Purpose |
|---|---|
| `AGENTOS_MAIN_FIRST_CONTACT_BRIEF.md` | Defines the first-session role, initial reading, authority boundaries, recommended control categories, and required baseline assessment. |
| `README.md` | Transfer/adoption guide and explicit exclusions. |
| `templates/agents/AGENTOS_SPECIALIST_PREFLIGHT_TEMPLATE.md` | Attachment/path/runtime/return-channel preflight control. |
| `templates/agents/AGENTOS_VERIFICATION_EVIDENCE_MATRIX_TEMPLATE.md` | Evidence-level and capability-verification matrix. |
| `templates/agents/AGENTOS_DOCUMENTATION_DRIFT_REGISTER_TEMPLATE.md` | Append-only inconsistency and remediation record. |
| `templates/agents/AGENTOS_SECURITY_CAPABILITY_MATRIX_TEMPLATE.md` | Capability-specific security, consent, and evidence gate. |

## Preserved boundaries

The package does not transfer PRS source patches, dual-console architecture, project-state authority conflict, persistence formats, test counts, runtime archives, CORS changes, ledgers, schedules, external-service configurations, deployment settings, or release decisions. AgentOS must independently determine its canonical record, authority model, security posture, and product strategy.

## Recommended use

The owner should upload the bootstrap ZIP, the current AgentOS reference archive, and the current generic AI Coordination Kit to the new AgentOS project. The first AgentOS MAIN session should return an evidence-led baseline assessment before creating any project-local control record, specialist role, source change, external integration, schedule, or release claim.

# Machine-Readable Policy Candidate Schema

**Document ID:** SOP-ACCEPT-003
**Status:** PRODUCT-DIRECTION / IMPLEMENTATION-DESIGN-INPUT

## Purpose
Define fields that existing AgentOS authority/governance may expose to deterministic evaluators. This is not a new authority system and does not grant permission.

## Candidate policy object
```yaml
policy_id: stable-id
version: 1
applies_to:
  action_class: file_mutation|external_send|production_write|financial|security_change|other
  capability: stable-capability-id
constraints:
  approved_roots: []
  excluded_paths: []
  allowed_targets: []
  max_cost: null
  allowed_providers: []
  allowed_data_classes: []
  requires_human_approval: true
  requires_green: true
  requires_prs: false
evidence:
  required_preconditions: []
  required_receipt_fields: []
  required_verification: []
expiry: null
source_authority_ref: canonical-reference
```

## Evaluation contract
An evaluator consumes canonical authority; it does not invent or extend it. Missing required fields, unknown authority source, expired/revoked approval, target escape or conflicting constraints fail closed.

## Design requirements
Policy decisions should be deterministic for the same canonical inputs, versioned, auditable, bound to mission/task/actor/action/target, and represented in receipts without exposing secrets.

## Non-goals
No alternate permission store, scheduler, mission ledger, worker registry, persistence authority, Green or PRS engine. Adoption requires architecture review against existing AgentOS components.

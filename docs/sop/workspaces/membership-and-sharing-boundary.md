# Workspace / Project Membership and Sharing Boundary

**Document ID:** SOP-WORKSPACE-001
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Principle
Membership, visibility, execution authority and ownership are separate dimensions.

A member who can view a project is not thereby allowed to mutate files, run workers, approve protected actions, invite others, change roles, export data or delete the project.

## Required state
Record workspace/project identity, member stable identity, role, explicit capabilities, inherited constraints, data boundary, invitation state, effective time, revocation/removal state and durable change receipt.

## Sharing
Before sharing data or granting access, evaluate classification, project/operator policy, recipient identity, least privilege and external-domain/connector implications. Link sharing must not silently bypass membership controls.

## Removal
Removal/revocation should prevent new authorized actions but must not be described as erasing previously exported/provider-held data or required audit/legal-hold evidence.

## Conflict
Conflicting membership/role evidence, stale invitations, unresolved identity or unknown sharing scope fail closed for mutation and protected actions.

# SOP-DOC-001 — Documentation Freshness and Revalidation

Status: DRAFT
Owner: SOP Overseer

## Core rule
Documentation is a view of current evidence, not authority and not timeless truth. Fresh runtime/repository/primary-source evidence outranks stale prose.

## Every controlled document records
Document ID; owner; status; scope; evidence dependencies; last verified date; exact repository/runtime version where material; jurisdiction where relevant; revalidation triggers; superseding document if any.

## Revalidation triggers
Revalidate when implementation behavior, repository head, authority model, provider/tool, data flow, product/price/tier, supplier/marketplace, jurisdiction/law/guidance, user mode, security boundary, Green/PRS finding, incident, or public claim materially changes.

## Dependency states
CURRENT — evidence still binds the documented scope.
STALE — a material dependency changed; do not use for completion/promotion claims.
CONFLICTING — current evidence disagrees; safer interpretation controls.
UNKNOWN — required evidence unavailable.
SUPERSEDED — replaced by a newer controlled document.

## Procedure
1. Identify changed dependency.
2. Find all affected SOPs, policies, legal drafts, user docs and marketing claims.
3. Mark stale/conflicting scope before rewriting conclusions.
4. Fetch current evidence; do not copy remembered SHAs or regulatory summaries.
5. Update only what evidence supports.
6. Preserve unresolved UNKNOWNs and prior evidence for audit.
7. Re-run exact-head checks appropriate to the changed artifact.
8. Update register/version and durable handoff.

Automated freshness checks may flag dependencies but cannot independently certify legal compliance, runtime enforcement, Green or PRS.
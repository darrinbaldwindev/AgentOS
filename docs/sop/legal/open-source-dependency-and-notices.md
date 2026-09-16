# SOP-LEGAL-023 — Open-Source Dependencies and Notices

Status: DRAFT / LEGAL REVIEW REQUIRED
Owner: SOP Overseer

## Core rule
Presence in a package manager, repository or AI-generated code does not prove that a dependency may be used, modified, redistributed or offered commercially without conditions.

## Dependency record
For each material direct dependency and required transitive review set record package/project, version/commit, source/provenance, declared license, license-text source, copyright/notice files, modification status, distribution mode, linking/bundling relationship where relevant, source-offer/copy-left/notice obligations identified, patent/trademark clauses where material, security/provenance status, evidence date and reviewer.

## Procedure
1. Generate inventory from the exact release candidate.
2. Resolve UNKNOWN/missing/ambiguous licenses before distribution.
3. Preserve required license/copyright/NOTICE text.
4. Review strong/weak copyleft and unusual/custom/non-commercial licenses for the actual distribution model.
5. Check copied snippets/assets separately; dependency metadata does not license unrelated copied material.
6. Re-run inventory after dependency/version/build changes.
7. Produce release notice bundle from reviewed evidence.

## AI-assisted code
Model output does not guarantee originality or license compatibility. Suspected substantial reproduction, named-source imitation or uncertain provenance routes to SOP-LEGAL-014/legal review.

## Fail closed
Do not publish `all dependencies compliant`, `open-source cleared` or similar blanket claims from a scanner result alone. Missing license evidence is UNKNOWN, not permissive approval.
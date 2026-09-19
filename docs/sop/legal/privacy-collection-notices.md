# SOP-LEGAL-005 — Privacy Collection Notices

Status: DRAFT / IMPLEMENTATION-DEPENDENT / LEGAL REVIEW REQUIRED
Jurisdiction baseline: Australia

## Purpose
Control notices shown when a portfolio surface collects personal information.

## Applicability
First determine whether the collecting entity is an APP entity or otherwise subject to a comparable jurisdictional notice duty. Do not assume coverage merely because a website or form exists.

## Australian APP 5 baseline
Where APP 5 applies, take reasonable steps at or before collection, or as soon as practicable afterwards, to notify the individual or ensure awareness of relevant matters. The notice assessment must cover identity/contact details, collection circumstances, legal authority where relevant, purpose, consequences of non-collection, usual disclosures, privacy-policy information, and likely overseas disclosures/countries where practicable.

## Procedure
For every form, signup, checkout, account, support intake, newsletter, telemetry or connected-app collection:
1. name the collecting entity;
2. inventory fields and derived data;
3. classify purpose and necessity;
4. record direct/third-party collection source;
5. identify disclosures/processors and overseas handling;
6. map the collection to the privacy policy;
7. place a clear contextual notice or prominent link where required;
8. version the notice and retain publication evidence;
9. revalidate after material collection/use/disclosure changes.

## Fail closed
Unknown collecting entity, unknown purpose, undisclosed material third-party collection or stale notice => do not represent privacy compliance as verified.

## AgentOS boundary
A connector, MCP server, plugin, worker, model or telemetry component does not create consent or notice authority merely because it can collect data.

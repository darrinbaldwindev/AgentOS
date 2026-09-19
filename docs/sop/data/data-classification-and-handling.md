# SOP-DATA-001 — Data Classification and Handling

Status: DRAFT / IMPLEMENTATION-DEPENDENT / LEGAL REVIEW REQUIRED WHERE APPLICABLE
Owner: SOP Overseer

## Classes
PUBLIC; INTERNAL; CONFIDENTIAL; PERSONAL_INFORMATION; SENSITIVE/REGULATED; SECRET/CREDENTIAL; PROJECT_LOCAL_ONLY; UNKNOWN.

UNKNOWN is handled at the more restrictive plausible class until resolved.

## Required data record
Record data category, source, owner/controller, purpose, authorised users/workers, storage locations, local/cloud/connector boundary, providers/subprocessors, jurisdictions, retention trigger, deletion method, backup/log/receipt copies, encryption/access controls where applicable, legal/contractual basis where required and revalidation trigger.

## Handling rules
- minimum necessary data only;
- credentials use the dedicated secret policy and must not enter normal prompts/logs/issues/receipts;
- local-file/zero-cloud constraints are binding where the project declares them;
- connector/tool capability does not authorise sending data to it;
- external model/provider routing must respect the mission's data boundary;
- logs/evidence should identify records without unnecessarily copying their contents;
- production/customer data is not a test fixture by default;
- deletion request != verified deletion across local copies, providers, backups and legal retention;
- access revocation != deletion.

## AI/agent rule
Workers may not infer consent, confidentiality waiver, public status or cross-border permission from the fact data was supplied to AgentOS. Tool/provider selection must fail closed when the applicable data boundary cannot be satisfied.

## Privacy coordination
Where personal information is involved, reconcile this SOP with privacy applicability, collection notices, tracking, retention/deletion, breach response and automated-decision requirements. Documentation does not itself prove privacy compliance.
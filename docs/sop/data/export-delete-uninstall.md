# SOP-DATA-002 — Export, Delete, Disconnect and Uninstall

Status: DRAFT / IMPLEMENTATION-DEPENDENT / LEGAL-REVIEW-DEPENDENT
Owner: SOP Overseer

## Core rule
These are different operations and must never be presented as equivalent:
- export/copy data;
- delete local data;
- revoke AgentOS access;
- disconnect a provider/connector;
- delete provider-held data/account;
- uninstall AgentOS software;
- satisfy a legal erasure/deletion request.

## Pre-action inventory
Identify exact user/project; data classes; local paths/databases/indexes/logs/receipts; connected providers/apps; credentials/tokens; backups; legal/audit retention; active missions/workers; shared/team data; requested scope.

## Export
Define format, included/excluded data, provenance/time, integrity metadata and sensitive-data handling. Export success does not imply deletion.

## Delete
Bind the exact target and authority. Stop conflicting writers before mutation. Preserve required audit/legal records only where justified and document the exception. Verify post-condition. If any replica/index/backup/provider copy is not covered, state that explicitly.

## Disconnect/revoke
Revoke future AgentOS access using the canonical connector/credential path. Disconnecting a connector does not itself delete data already copied locally or held by the provider.

## Uninstall
Uninstall software/processes/services separately from user-data deletion. Never silently delete projects, evidence, credentials or external accounts merely because the application is removed.

## Provider-side deletion
Use only the provider's evidenced deletion/account controls with explicit authority. Record request/result and limitations. Do not claim external deletion from a local uninstall or token revocation.

## Legal requests
Identity verification, applicability, exemptions, response deadlines and retained-record obligations are jurisdiction-specific and require the legal/privacy workflow. This SOP coordinates execution evidence; it does not decide legal entitlement.

## Completion
Report each requested layer as VERIFIED, PARTIAL, BLOCKED or UNKNOWN with exact evidence. Never summarize a partial multi-system deletion as `everything deleted`.
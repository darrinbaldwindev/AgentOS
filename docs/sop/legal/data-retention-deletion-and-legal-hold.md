# SOP-LEGAL-010 — Data Retention, Deletion and Legal Hold

Status: DRAFT / IMPLEMENTATION-DEPENDENT / JURISDICTION REVIEW REQUIRED
Owner: SOP Overseer

## Purpose
Define evidence-controlled retention and deletion for personal information, operational records, mission evidence, receipts, logs, customer data, marketing data and connected-app data.

## Core rule
Keep data only under an identified purpose/obligation and retention rule. Do not delete evidence subject to a valid legal/security/assurance hold. Do not retain personal information indefinitely merely because storage is available.

## Retention register
Each data class should record: system/source; owner; data classification; purpose; jurisdiction; retention trigger; retention period/basis; archive rule; deletion/anonymisation method; backup treatment; downstream copies/processors; legal/assurance hold behavior; evidence owner; last review.

UNKNOWN retention basis is a governance defect requiring review; it is not permission for permanent retention.

## Deletion workflow
1. authenticate/authorize request or scheduled action;
2. identify canonical record and replicas;
3. check legal, contractual, security, fraud, tax/accounting and assurance holds;
4. determine required vs optional retention;
5. execute bounded deletion/anonymisation;
6. record outcome and exceptions without unnecessarily reproducing deleted sensitive content;
7. handle backups according to documented lifecycle;
8. verify downstream deletion obligations where applicable.

## AgentOS evidence exception
Mission receipts, Green/PRS evidence and security/audit records may have justified retention needs, but governance value alone does not create unlimited retention. Sensitive payloads should be minimized; evidence should prove the event without copying unnecessary secrets or personal data.

## Connected apps
Revoking a connector/capability does not automatically prove deletion at the external provider. AgentOS must distinguish access revocation, local deletion, provider deletion request and provider-confirmed deletion.

This SOP is not a legal retention schedule; jurisdiction- and record-specific periods require verified sources/review.
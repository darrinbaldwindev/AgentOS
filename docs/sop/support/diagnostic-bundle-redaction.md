# Support Diagnostic Bundle Privacy and Redaction SOP

**Document ID:** SOP-SUPPORT-003
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Default
Collect the minimum evidence needed to diagnose the issue. Diagnostic convenience does not authorize collection or disclosure of project content, secrets, personal information or unrelated logs.

## Bundle manifest
Record requested diagnostic purpose, files/fields included, exclusions, data classifications, redaction method, time range, source version/head, collector version and destination/recipient if export is proposed.

## Redact/exclude
Credentials, tokens, cookies/session material, private keys, authorization headers, raw connector secrets, unrelated personal data and unnecessary file contents should be excluded or irreversibly redacted before export.

Do not claim a bundle is safe merely because common secret patterns were scanned; unknown/custom secrets and contextual identifiers remain possible.

## Export boundary
Creating a local bundle is distinct from sending/uploading it. External transfer requires separate authority and recipient/destination verification.

## Evidence
Preserve hashes/manifest metadata where useful so support can correlate a bundle without requiring unredacted content.

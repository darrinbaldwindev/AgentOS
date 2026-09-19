# Crash and Telemetry Collection Disclosure Gate

**Document ID:** SOP-PRIVACY-001
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT / JURISDICTION REVIEW REQUIRED

## Principle
Do not document telemetry, crash reporting or analytics as enabled, disabled, anonymous, local-only or privacy-preserving without implementation evidence.

## Evidence map
For each signal record: purpose, event/schema, fields, collection trigger, default state, user control, local processing, destination/provider, retention, identifiers, project/file content exposure, sampling, consent/legal-basis review where applicable and deletion/access behavior.

## Crash reports
Treat stack traces, paths, command lines, environment data and attachments as potentially sensitive. Secret-pattern redaction is a control, not proof that no sensitive data remains.

## User disclosure
Explain material collection and controls in language consistent with actual runtime behavior. A privacy-policy sentence cannot create a runtime opt-out, and a UI toggle cannot prove upstream/provider deletion.

## Gate
UNKNOWN material data flow blocks strong privacy claims and public compliance claims until resolved.

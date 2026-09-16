# SOP-RELEASE-002 — Release Notes and Changelog Truth

Status: DRAFT

## Rule
Release notes describe evidence-backed changes in an identified release. They are not a marketing surface for unshipped PRODUCT DIRECTION or a substitute for Green/PRS/legal approval.

For each entry bind release/version/head, change/PR/issue evidence, user impact, migration/compatibility effect, security sensitivity, known limitations/UNKNOWNs, documentation impact and verification status.

Use precise verbs: `added`, `changed`, `fixed`, `deprecated`, `removed`, `security`, `known issue`. Do not say `secure`, `production-ready`, `fully supported`, `compliant`, `guaranteed`, `zero downtime` or equivalent without the exact evidence/approval required for that claim.

A merged change is not necessarily deployed/released. A draft PR is not shipped. CI success is not user acceptance. Hosted-platform success is not physical Windows acceptance. If a capability is behind a flag, experimental, partial or documentation-only, say so.

Security-sensitive notes must follow the vulnerability disclosure gate and must not publish exploit-enabling detail before authorised disclosure.
# SOP-DATA-003 — Local Files, Indexing and Zero-Cloud Evidence

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Core rule
`Local`, `on-device` and `zero-cloud` are evidence claims, not branding shortcuts. They may be used only for the exact data path proven not to leave the governed local boundary.

## Data-path record
For each file/indexing feature record source roots, excluded paths, file types, metadata/content extracted, index/database/vector location, model/provider used for embeddings/inference, network destinations, telemetry/logging/crash reporting, backups/sync, connector access, retention/deletion, encryption/access controls, temporary files/caches and exact implementation/version evidence.

## Zero-cloud gate
A zero-cloud claim requires evidence that the relevant file contents/derived representations are not transmitted to external providers through inference, embeddings, telemetry, logs, support upload, sync, backup or connector paths. If any material path is UNKNOWN, narrow the claim or fail closed.

## Indexing
Respect explicit roots/exclusions, symlink/junction boundaries, permissions and file changes. Do not silently broaden an approved root. Derived indexes inherit sensitivity from source content unless a documented classification rule proves otherwise.

## Provider routing
Local-file approval does not automatically authorize sending content to a remote model. Provider/model routing must check data policy and current user/mission authority before transmission.

## Delete/export
Deleting an index is not necessarily deleting source files; deleting source files is not necessarily deleting backups/provider copies. UX must state the actual scope and invoke SOP-DATA-001 / retention-deletion controls.

This SOP does not prove the current runtime implements zero-cloud indexing.

## Identifier note
This document was originally labelled `SOP-DATA-002`, colliding with the pre-existing Export, Delete, Disconnect and Uninstall SOP. It is `SOP-DATA-003` from Cycle 018 onward. The content scope is unchanged by the identifier correction.
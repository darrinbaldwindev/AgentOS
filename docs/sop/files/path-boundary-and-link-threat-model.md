# Project-File Path Boundary and Link Threat Model

**Document ID:** SOP-FILE-002
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Purpose
Document fail-closed path-resolution requirements for bounded project-file operations without claiming the runtime already enforces them.

## Threats
- `..` traversal and mixed separator/case normalization.
- symlinks, junctions, reparse points or mount-like redirection escaping an approved root.
- path replacement between validation and mutation (TOCTOU).
- hard links or aliases causing a write to affect an unintended target.
- excluded/private directories reached through an allowed-looking alias.
- network/UNC/device paths or alternate data streams where not explicitly allowed.
- case/Unicode/canonicalization ambiguity.

## Required evidence contract
Before mutation, bind the requested path, normalized/canonical path, approved root, resolved target identity where available, exclusion decision and ownership token. Revalidate immediately before the side effect and again before verification/receipt persistence when the platform permits target replacement.

## Fail closed
Reject unresolved links/reparse behavior, target escape, exclusion conflict, unsupported path class, ownership displacement or material target-identity change.

## Level-2 boundary
This SOP does not resolve the current continuous-ownership/recovery blocker. Implementation tests plus independent Green/PRS evidence remain required.

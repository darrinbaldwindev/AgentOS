# PRS Independent Assurance Gate

**Status:** DESIGN / VERIFICATION GATE — not an ASSURED verdict
**Date:** 2026-09-03

## Purpose

Define the smallest deterministic contract required for Project Reliability & Assurance (PRS) to independently assure an AgentOS lifecycle without treating worker, Overseer, or Green Agent claims as independent verification.

## Independence boundary

PRS consumes durable AgentOS evidence but does not execute project work, grant authority, alter canonical task state, or certify its own implementation.

## Required input

A PRS evaluation fixture must identify:

- evaluated commit/ref;
- mission/task identifier;
- wake trace identifier;
- lifecycle evidence chain;
- authority/consent evidence;
- worker identity and capability match;
- verification evidence;
- durable completion/audit evidence;
- Green Agent findings where applicable.

## Required checks

1. **Provenance:** evidence belongs to the evaluated commit and lifecycle.
2. **Completeness:** required lifecycle stages are present.
3. **Authority:** execution was authorised under the applicable policy; wake alone is not permission.
4. **Worker independence:** worker self-report is treated as a claim, not independent proof.
5. **Verification independence:** closure evidence comes from an independent verifier/rescan rather than the worker that performed the action.
6. **Consistency:** task, mission, wake trace, response, and audit identifiers correlate.
7. **Safety boundary:** no production authority, provider credential, billing activation, or protected scheduler mutation is implied by deterministic evidence.
8. **Historical integrity:** prior failures/findings cannot be overwritten to manufacture GREEN.

## Verdicts

- `PASS`: every required gate has independently verifiable evidence.
- `FAIL`: one or more required gates are disproved or missing.
- `INCONCLUSIVE`: evidence is insufficient to establish assurance.

Only `PASS` may promote the evaluated lifecycle to `ASSURED`, and only when the verdict itself is durably recorded as PRS evidence.

## Promotion rule

Implementation presence, passing AgentOS tests, Green Agent reports, Overseer conclusions, or worker claims alone must never promote a lifecycle to `ASSURED`.

## Current determination

The repository currently has strong deterministic AgentOS and Green Agent evidence, while the canonical PRS evaluator/verdict path remains a separate verification gate. Therefore this document does **not** assert `ASSURED`.

## Safety

This gate is documentation-only. It does not enable production execution, external providers, credentials, billing, live customer workflows, or autonomous remediation.

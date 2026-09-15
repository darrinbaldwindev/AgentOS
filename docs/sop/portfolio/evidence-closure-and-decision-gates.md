# SOP-PORT-002 — Evidence Closure and Decision Gates

**Status:** DRAFT / PORTFOLIO-DERIVED  
**Last verified:** 2026-09-15

## Purpose
Convert research, implementation and commercial work into explicit evidence-backed decisions without false completion.

## Closure matrix
For each decision-critical claim record: claim/question, owner, required evidence, current evidence, evidence date/head, classification, blocker, next evidence action, decision state and revalidation trigger.

## Decision states
Use explicit states such as `NOT EVALUATED`, `EVIDENCE INCOMPLETE`, `BLOCKED`, `CANDIDATE`, `VERIFIED FOR DEFINED SCOPE`, `APPROVAL REQUIRED`, `REJECTED`, `SUPERSEDED`. Do not use a generic GREEN where the scope is narrower.

## Gate rules
A gate closes only when all mandatory evidence is present and current for the scope. Unknown material inputs keep the gate open. Tests prove only their tested scope. Research does not prove implementation. Implementation does not prove production acceptance. Worker verification does not substitute for required independent assurance.

## Reopening
Any material change to code/head, supplier terms, pricing, freight, platform rules, authority, capability, policy, evidence expiry or assurance finding reopens the affected gate until revalidated.
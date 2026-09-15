# SOP-FILE-001 — Project-File Mutation

**Owner:** SOP Overseer  
**Status:** IMPLEMENTATION-DEPENDENT / BLOCKED  
**Version:** 0.1-draft  
**Last verified:** 2026-09-15  
**Audience:** operators, developers, Green, PRS  
**Current disposition:** NOT YET SUPPORTABLE as a shipped Level 2 procedure

## Purpose
Define the documentation and acceptance boundary for controlled project-file mutation without implying that current AgentOS can safely perform it end to end.

## Required dependency chain
A release-grade mutation procedure requires evidence for all of the following:

1. authenticated actor and canonical grant binding;
2. approved project/workspace scope and canonical path containment;
3. exact task/mission/worker/result correlation;
4. continuous single ownership of the mutation from final verification through publish/prepared recovery and durable success receipt;
5. bounded edit semantics;
6. pre-image/post-image evidence;
7. atomicity or an explicitly proven recoverable write protocol;
8. duplicate/replay/idempotency protection;
9. concurrent-writer protection;
10. interrupted/crash recovery;
11. durable mutation receipt;
12. independent verification on the unchanged eligible head;
13. PRS assurance after Green where required;
14. separate physical Windows acceptance.

## Current blocker
Current PR #104 evidence says SG-08 continuous ownership is not independently proven through final verification -> publish/prepared recovery -> durable success receipt -> release. Project-file mutation therefore remains AMBER/BLOCKED.

## Prohibited documentation claims while blocked
Do not tell users that AgentOS can safely edit project files autonomously, that a successful CI run proves safe mutation, that a receipt proves the write happened, that a write proves a valid receipt exists, or that worker self-verification is Green/PRS.

## Candidate future procedure
When dependencies become PROVEN, the intended lifecycle is:

`inspect -> authorise -> establish ownership -> edit -> test -> verify -> publish/recover -> persist durable receipt -> release ownership -> independent Green -> PRS where required`

This sequence is descriptive only and must be reconciled against the canonical runtime before approval.

## Failure conditions
Treat partial mutation, uncertain ownership, stale owner, concurrent writer, crash between write and receipt, crash between execution and verification, result-write failure, replay, correlation mismatch, missing evidence, or uncertain post-image as recovery/incident conditions rather than success.

## Revalidation trigger
Any implementation change to ownership, file writer, recovery, receipts, mission ledger, authority, correlation, Windows worker, Green, or PRS invalidates this draft until rechecked.
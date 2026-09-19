# SOP-REC-002 — Timeout and Descendant Process Containment

**Owner:** SOP Overseer  
**Status:** REVIEW REQUIRED / BLOCKED BY SOFTWARE ASSURANCE  
**Version:** 0.1-draft  
**Last verified:** 2026-09-15

## Problem
A timeout of a bounded PowerShell parent process does not by itself prove that descendant processes terminated. A terminal/FAILED receipt must therefore not be documented as proof of contained termination unless the canonical implementation and exact-head assurance establish that property.

## Current evidence boundary
Current Overseer #49 control evidence reports this as a live AgentOS blocker and records `powershell_level1_accepted=false`. PRS cannot advance while exact-head process-tree containment is non-GREEN.

## Operator handling
When a PowerShell operation times out:

1. record the timeout and exact task/mission/worker/result correlation;
2. do not infer descendant termination from parent termination;
3. do not treat a FAILED receipt as evidence that all side effects ceased;
4. establish actual descendant/process/service state using the canonical supported inspection path;
5. if descendants may remain active, report `Execution state uncertain` / `Recovery required` and prevent unsafe dependent work;
6. preserve evidence for independent verification;
7. resume only after the canonical containment/recovery mechanism establishes a safe state and current authority remains valid.

## Acceptance requirements before this blocker can close
- deterministic regression proving timeout handles descendants according to the intended contract;
- no false terminal receipt while descendants remain active;
- recovery/reconciliation for uncertain termination;
- exact-head CI on required platforms;
- independent Green on the unchanged eligible head;
- PRS challenge after Green, including descendant survival and false-terminal-receipt cases;
- physical-host acceptance kept separate where required.

## Documentation rule
Until those gates are satisfied, do not say that timeout means `Execution stopped`, that Level 1 PowerShell is fully accepted, or that Level 2 runtime wiring is safe to advance solely because the parent command returned/failed.
# AGENTOS / OVERSEER — MISSION 025

## STATUS
**Verification execution required — no GREEN claim permitted**

## PURPOSE
Convert the canonical Tier 2.3 five-gate/seven-test model into an executable verification checkpoint and prevent status drift between documentation, implementation, and evidence.

## FRESH REPOSITORY CHECK
Current AgentOS main reference observed during this mission: `18d5605569a11bb085d588bb8f190e4d89d031c8`.
The repository contains the canonical machine-readable Tier 2.3 status schema at `schemas/tier2_3_status.schema.json` and the GREEN-eligible reference fixture at `schemas/tier2_3_examples/green-eligible.json`.

The status schema explicitly models five governance gates and seven evidence suites. The seven tests are evidence suites, not additional GREEN gates.

## CANONICAL MODEL
- G1 Scope & Authority -> T1
- G2 Budget & Resource Control -> T2
- G3 Execution Safety -> T3
- G4 Worker Capability & Consent -> T4
- G5 Verification, Recovery & Integrity -> T5 + T6 + T7

GREEN requires all five gates to pass with sufficient current evidence. Any required BLOCKED, FAIL, PENDING, RUNNING, or unapproved SKIPPED state prevents GREEN.

## NEXT EXECUTION OBJECTIVE
Build/execute the deterministic validator and integration evidence path against the current repository state. The validator must:

1. Load the canonical JSON Schema.
2. Validate the known-good GREEN fixture.
3. Validate representative invalid states, including:
   - BLOCKED gate without blocking reason;
   - PASS gate with blocking reason;
   - PASS test without executed=true;
   - BLOCKED test without blocking reason;
   - green_eligible=true while any gate/test is not PASS/VERIFIED;
   - stale/mismatched commit evidence.
4. Verify the exact G1-G5 / T1-T7 mapping.
5. Produce a deterministic machine-readable result.
6. Persist the result as repository evidence.

## SAFETY RULE
Do not use a successful schema-validation fixture as proof that the runtime safety gates themselves work. Schema validation proves the status contract; integration tests must prove runtime enforcement.

## CURRENT GREEN DECISION
**YELLOW / NOT VERIFIED** until the runtime T1-T7 evidence suites have actually executed successfully against the relevant current commit.

## GEMINI STATUS
**NO NEW GEMINI RESEARCH REQUIRED.** The current bottleneck is deterministic repository execution and evidence capture.

## WEBSITE STATUS
Continue non-production website/design preparation only. Public deployment/indexing remains gated by the Tier 2.3 GREEN decision.

## GLOBALSHOPCO PROTECTION
No production scheduler, credential, Shopify, WordPress, or GlobalShopCo runtime changes are authorised by this mission.

## REQUIRED FINAL EVIDENCE
- current commit SHA;
- validator command and output;
- schema-validation result;
- T1-T7 execution results;
- G1-G5 roll-up;
- failures/blockers if any;
- audit evidence;
- independent verification result;
- final GREEN/YELLOW decision.

## HANDOFF
CHATGPT Overseer -> AgentOS Project Overseer -> deterministic validator/tests -> evidence -> PRS/Green Agent review -> CHATGPT Overseer.

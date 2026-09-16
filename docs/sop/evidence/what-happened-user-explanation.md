# SOP-EVID-002 — User-Facing “What Happened?” Explanation

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Goal
Give ordinary users a truthful explanation of AgentOS work without exposing unnecessary technical detail or collapsing execution, verification and assurance into one status.

## Minimum explanation
For a selected task show, where evidenced:
- what the user/Overseer asked for;
- whether work was admitted/blocked;
- worker/capability used in ordinary language;
- what was actually changed or observed;
- tests/checks performed;
- receipt/evidence correlation;
- Green verification state;
- Henry/PRS assurance state separately when applicable;
- unresolved blocker/UNKNOWN;
- next safe action.

## Truth vocabulary
`Requested` != `Started`.
`Stop requested` != `Execution stopped`.
`Worker finished` != `Verified`.
`Verified for defined scope` != `Green` unless Green actually issued that state.
`Green` != `PRS assured`.
`CI passed` != `production ready`.
`Drafted` != `sent/published`.

## Progressive disclosure
Simple view uses plain language and hides implementation detail, but cannot hide a material blocker or turn UNKNOWN into success. Essentials shows bounded evidence summary. Tech Head may expose correlation IDs, exact heads, receipt paths and diagnostic details. All three consume the same canonical truth.

## Evidence selection
Bind evidence to exact task/mission/worker/result/head where applicable. Do not display stale or foreign-task receipts as the current task’s evidence. Contradictory evidence must produce a safer blocked/uncertain explanation.

## Privacy/security
Do not surface secrets, raw tokens, unnecessary personal data or sensitive vulnerability detail in ordinary user explanations.

## Fallback
If canonical evidence is missing, say evidence is unavailable/insufficient. Never synthesize a plausible timeline from model narration.
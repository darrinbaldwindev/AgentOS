# AgentOS Level 2 lineage map — 2026-09-14

Canonical portfolio control: `darrinbaldwindev/Overseer#49`.

Canonical main at fresh scan: `6e94e00fc5d81f9de9fc03ff6efc929a2a7ddcc1`.

This map prevents safety fixes from being lost across stacked draft lineages. It is not merge authority and does not promote any draft to canonical main.

## Ownership by concern

| Concern | Strongest current draft evidence | Role / preserved contract | Current gate |
|---|---|---|---|
| Remote/local admission, scheduler pickup, durable delivery, persistence/CAS, receipt publication | PR #91 `agent/overseer/remote-local-bridge-contract` @ `5cc27c96d48e18419cc678fd03b37c9e1c7ccd70` | Reuse existing scheduler, local wake, worker registry, authority, budget and runner; fail closed on stale/ambiguous delivery | remote physical execution still not proven |
| Completion correlation / false-GREEN identity conflicts | PR #94 @ `e2decd360755156125a1a4133366a9657f6c00e3` | Reject missing/conflicting task/wake/Green identities rather than reporting completion | independent exact-head assurance still required |
| Strict autonomy authority booleans | PR #95 @ `3b9b71de5e1f1fb20a64c10f78636d0829da89e2` | Literal `true` required for authority/capability/scope/budget and literal `false` for production | not yet reconciled into Level 2 hot path |
| Host status / read-only observability | PR #101 @ `d91abaecf602d7ef223c4888f10fa9361677302e` | Observe exact host/task/mission/wake evidence without mutating scheduler/locks | exact-head CI/assurance required |
| Basic Chat host-lock ownership | PR #102 @ `d3714c406c08de1a950b6f55ba27d5e4fe0af1c3` | Existing lock means ownership uncertain; no automatic takeover | explicit recovery and physical Windows reacceptance remain open |
| Governed PowerShell + project-file mutation candidate | PR #104 current GitHub head `9f53df16ae37ee6a86e66d2a808ca7f62f203d76` | Bounded Windows worker on remote-bridge/mission-ledger lineage; project-file mutation adds receipts/recovery tests | **HOLD:** reported independent Green FAIL on ownership-through-publish race; mutation must remain disabled |
| Pre-execution composition boundary | PR #108 @ `48a7aea9ab5428ddd758ee76d53ca5503a84c8bb` | Reuses runtime-shell eligibility, authority, capability grants, human approval, tool policy and budget | not wired into strongest Level 2 lineage |
| Frontend trust/presentation | PR #110/#111 | Presentation only; must project canonical runtime/authority/evidence/Green/PRS truth | cannot synthesize backend proof or unblock mutation |

## Canonical integration direction

Do not choose one PR as a winner merely because it is newest. Preserve the strongest contract for each concern and integrate in dependency order:

1. existing #91 bridge/persistence/receipt semantics;
2. #94 exact completion correlation;
3. #95 strict authority semantics where autonomy/effective authority is used;
4. project-wide canonical eligibility evaluation (this batch's runtime-shell consolidation);
5. pre-execution composition from #108 only where it adds gates without replacing the existing authority/worker/scheduler/persistence path;
6. #104 bounded PowerShell/project-file work only after the ownership boundary is independently repaired and Green/PRS gates pass;
7. #101/#110/#111 consume canonical evidence read-only and never become execution authority.

## Current highest-risk gap

PR #104 reports a writer can validate lock ownership, lose ownership to a successor before target publication, then still publish and persist a success receipt using stale ownership. Detection only on release is too late. Prepared-write recovery has the same class of gap. Until a kernel-enforced or transactionally equivalent ownership boundary is held through publish/recovery/receipt, controlled project-file mutation remains AMBER/HOLD.

## Non-negotiable preservation tests for any future integration head

- no execution when authority/capability/scope/budget grants are ambiguous or non-Boolean;
- no completion when task/mission/wake/host/worker identities conflict;
- no final COMPLETED before durable receipt and required Green disposition;
- no stale/uncertain lock stealing;
- no duplicate delivery/execution under concurrent pickup;
- failed result/receipt persistence cannot leak a completion claim;
- crash recovery reconciles durable evidence before any rerun;
- provider/tool discovery cannot self-grant execution authority;
- frontend/host status cannot synthesize Green or PRS PASS.

## Protected actions

No merge, approval, ready transition, rebase, deployment, credential change, production write, unrestricted PowerShell, production autonomy or mutation enablement is authorized by this map.

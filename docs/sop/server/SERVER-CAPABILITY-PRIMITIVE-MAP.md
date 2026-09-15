# AgentOS Server — Capability / Primitive Map

Status: DRAFT / evidence-controlled
Workstream: S-SRV-01
Candidate lineage: `docs/sop-server-overseer`

## Purpose

This map prevents AgentOS Server from creating a parallel control plane. Each server requirement is classified against current AgentOS evidence as `REUSE`, `ADAPT`, `EXTEND`, `NEW-GAP`, or `BLOCKED`.

A classification describes implementation shape only. It does not grant authority, Green, PRS, merge or deployment permission.

## Fresh evidence anchors

- Portfolio task ledger checkpoint: 2026-09-16 03:30 Brisbane.
- AgentOS PR #104 current API head observed during this cycle: `bae44534d6d11b967fdac09bd734f8c073f23f2f` on `agent/overseer/windows-worker-bridge`.
- PR #104 remains DRAFT / UNMERGED and reports project-file mutation blocked on continuous ownership, while authenticated actor transport and canonical grant lookup remain unwired composition seams.
- AgentOS PR #112 current head: `832847fc613c1673379f065e49e093cdcc62d239`; runtime-shell eligibility consolidation remains DRAFT / UNMERGED.
- Server SOP PR #119 began at `4e66841a5fe01a55e8d926e68fe284e650771c4a` and remains DRAFT / UNMERGED.

Important evidence rule: prose inside a PR description may lag its current Git ref. Exact API head controls candidate identity; tests/assurance must bind to that exact head.

## Primitive map

| Server requirement | Classification | Canonical owner / evidence | Server responsibility | Fail-closed boundary |
|---|---|---|---|---|
| Overseer / orchestration role | REUSE | AgentOS architecture / portfolio doctrine | Expose server transport into existing orchestration | Server endpoint cannot become a second Overseer authority |
| Scheduler / cadence | REUSE | Existing AgentOS scheduler/local-wake lineage | Host or transport adapter only where required | No server scheduler or shadow queue |
| Mission/task correlation | REUSE | Existing mission/receipt lineage | Preserve identifiers end-to-end | Missing/conflicting IDs cannot synthesize success |
| Authority decision | REUSE | Existing AgentOS governance/authority composition | Pass authenticated evidence to canonical checks | Server transport is never grant authority |
| Authenticated actor transport | ADAPT + BLOCKED | #104 explicitly identifies unwired authenticated transport | Define transport adapter once canonical identity source is evidenced | No invented identity registry/source |
| Canonical grant lookup transport | ADAPT + BLOCKED | #104 explicitly identifies unwired canonical grant lookup | Carry source-backed grant evidence | No invented grant registry/source |
| Capability normalization | REUSE | #112 runtime-shell canonical evaluator | Project server worker capabilities into canonical evaluator | Claimed capability cannot self-authorize |
| Worker identity / host identity | ADAPT | Existing worker/host/correlation concepts | Bind server host/worker/build identity to existing model | Health or registration cannot grant authority |
| Bounded shell/runtime | REUSE | #104 governed PowerShell/runtime lineage | Select existing eligible runtime only | No unrestricted shell/elevation |
| Project-file mutation | BLOCKED | #104 / A-AG-01 SG-08 | None until continuous ownership is repaired and assured | Mutation remains disabled/fail-closed |
| Mission persistence | REUSE | Existing AgentOS mission/persistence ownership | Storage adapter only if canonical owner requires it | No second mission ledger |
| Idempotency / replay state | REUSE or ADAPT | Existing delivery/receipt/recovery semantics | Preserve canonical keys in server storage/transport | No new completion ledger |
| Durable receipt | REUSE | Existing AgentOS receipt path | Preserve server correlation/evidence fields where schema supports | Receipt cannot manufacture missing evidence |
| Functional verification / Green | REUSE | Jess / Green role | Supply immutable evidence to existing verifier | Worker/server cannot self-Green |
| Security verification | REUSE | Michael security role | Supply exact-head/exact-runtime evidence | Functional PASS does not imply security PASS |
| PRS assurance | REUSE | Henry / PRS | Supply immutable evidence bundle after prerequisites | Server cannot self-certify PRS |
| Recovery | REUSE + ADAPT | Existing AgentOS recovery semantics | Server runtime/storage adapter must preserve canonical recovery identity | Cross-generation/cross-owner recovery fails closed |
| Observability logs | ADAPT | Existing evidence/receipt truth | Emit projections with exact correlation | Logs are not completion authority |
| Metrics / health | ADAPT | Host/worker evidence concepts | Report availability/capability state | Healthy != authorized/verified/assured |
| Secrets | BLOCKED for mutation | Owner/platform credential boundary | Consume only through approved secret injection mechanism once evidenced | Never commit/log/echo; no new secret store by convenience |
| Production deployment | BLOCKED | Owner-only protected action | Prepare non-production acceptance only | No deploy/prod writes/autonomy |

## What is genuinely server-specific

The current evidence does **not** justify a new scheduler, authority system, worker registry, mission ledger, Green implementation, PRS implementation or recovery authority.

The smallest credible server-specific seams are adapters:

1. authenticated request transport into canonical AgentOS admission;
2. server host/worker/build identity projection into canonical capability/routing semantics;
3. persistence implementation behind an already-owned canonical persistence contract, if fresh code evidence proves such an adapter is required;
4. server observability projection from canonical receipts/evidence;
5. server runtime lifecycle and recovery integration without changing completion truth.

## Highest-value next technical seam

`S-SRV-02 authenticated server transport contract` is architecturally valuable but implementation-blocked until a real authenticated identity source and canonical grant source are evidenced. Do not invent either source.

Therefore the next executable non-competing work is to inventory exact admission/correlation interfaces and define a transport-neutral envelope + deterministic denial fixtures **without wiring a fake identity provider or grant registry**. If existing #104 work already owns the exact interface mutation, Server must stop at an adapter contract/fixture handoff rather than compete.

## S-SRV-01 disposition

`S-SRV-01 = VERIFYING` for documentation-level architecture inventory.

This map materially narrows the server build: the server is predominantly an adapter/deployment/runtime composition layer over canonical AgentOS control primitives. No NEW-GAP control-plane primitive has yet been evidenced.

This is not implementation GREEN. Exact source-interface inventory remains required before S-SRV-02 code work.
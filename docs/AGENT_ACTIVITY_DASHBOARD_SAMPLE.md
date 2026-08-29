# Agent Activity Dashboard — Sample Projection

> SAMPLE / NOT LIVE STATE. Values below are illustrative and must not be interpreted as current execution evidence.

| Agent/Role | Project | Current Task | State | Started | Last Heartbeat | Last Completed | Evidence | Verifier | Next Task |
|---|---|---|---|---|---|---|---|---|---|
| GPTChat Overseer | Portfolio | Control-plane coordination | EXECUTING | — | — | — | — | — | Reconcile portfolio |
| AgentOS Overseer | AgentOS | Scheduler/runtime | AWAITING_VERIFICATION | — | — | AgentOS bootstrap | checkpoint | GPTChat | Runtime test |
| GlobalShopCo Overseer | GlobalShopCo | Vertical slice | AWAITING_VERIFICATION | — | — | Bootstrap | checkpoint | GPTChat | Validation |
| Manus | AgentOS | TEST-003 | ASSIGNED | — | — | — | — | — | Return evidence |
| Repo/Code Worker | AgentOS | Scheduler adapter | READY | — | — | — | — | — | Claim next eligible task |
| QA/Test Worker | Portfolio | Lifecycle testing | READY | — | — | — | — | — | Claim next eligible task |
| Research Worker | AgentOS | Provider/local-model research | READY | — | — | — | — | — | Claim next eligible task |
| Architecture Worker | AgentOS | Local controller architecture | READY | — | — | — | — | — | Claim next eligible task |
| Skills Worker | AgentOS | Skills integration | READY | — | — | — | — | — | Claim next eligible task |
| Security/Health Worker | Overseer | State/log consistency | READY | — | — | — | — | — | Claim next eligible task |

## Live-state rule

This file is a UI/projection prototype only. A future controller must generate the live dashboard from canonical state, queue, evidence and logs. Never infer EXECUTING from assignment alone.

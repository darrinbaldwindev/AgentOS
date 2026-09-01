# AgentOS Governance Roadmap

## Execution order

1. Reconcile existing P0 safety and runtime work before adding new execution paths.
2. Define Policy Engine contracts and fail-closed evaluation.
3. Extend existing mission/task state into auditable ledger views without creating duplicate canonical state.
4. Add checkpoint/recovery contracts to existing dispatch lifecycle.
5. Formalise event emission/consumption around existing state transitions.
6. Add evidence-backed worker trust signals; keep authority separate from reputation.
7. Add deterministic simulation/sandbox fixtures before enabling broader autonomy.
8. Integrate Green Agent and PRS consumers using evidence/events without execution authority.
9. Prove the CI/CD governance wedge with CLI/GitHub Action and hard budget gates.
10. Evaluate LangGraph and n8n only at concrete integration boundaries.

## Existing P0 reconciliation

Directly reconcile with #35 Heartbeat safety, #20 scheduler, #36 local worker execution, #41 consent/intervention registry, #40 Green Agent and #38 PRS. Also reconcile #17 workspace providers, #19 Skill Agents and #42 architecture integration.

## Definition of done for the governance layer

A deterministic test can demonstrate: policy evaluation -> capability/trust selection -> consent/authority -> bounded dispatch -> budget circuit breaker -> worker execution -> checkpoint/evidence -> independent verification -> ledger/event persistence -> Overseer decision, while prohibited/unknown actions fail closed and PRS/Green Agent cannot execute.

# AgentOS Operating Hierarchy

Status: CANONICAL OPERATING DECISION

## Current development operating model

Human Owner
→ GPTChat Overseer (head Overseer)
→ Project Overseers / workers / specialist subs / models / agents

Manus is a worker under GPTChat Overseer. Manus is not a peer Overseer in the current operating model and does not oversee GPTChat.

Manus may receive substantial delegated autonomy and may manage its own specialist bots/workers within the authority delegated by GPTChat Overseer.

## Current GPTChat ↔ Manus relationship

GPTChat Overseer delegates work to Manus.
Manus executes, decomposes delegated work, uses its specialist workers, tests, produces evidence and reports back to GPTChat Overseer.
GPTChat Overseer reviews, reconciles, verifies and assigns further work.

Target check-in cadence:
- GPTChat Overseer: :00 each hour
- Manus worker: :30 each hour

The shared AgentOS/GitHub control plane is the durable coordination record.

## Future AgentOS operating model

Human Owner
→ AgentOS Overseer
→ GPTChat / Manus / Gemini / other models and agents
→ Project Overseers / workers
→ projects

AgentOS is the eventual orchestration platform. Its Overseer will control the available intelligence, models, agents, skills and workers according to capability, authority, availability and verification policy.

## Non-overlap principle

GPTChat's current primary strengths/authority: strategic reasoning, architecture, portfolio prioritisation, reconciliation, independent review and escalation.

Manus's current delegated worker role: execution-heavy repository work, implementation, testing, validation, task decomposition and specialist-worker orchestration.

Overlap is permitted for verification and resilience, but unnecessary duplicate work should be avoided.

## Evidence rule

A task is not considered completed merely because a worker acknowledged or was assigned it. Completion requires persisted evidence and verification according to the AgentOS lifecycle.

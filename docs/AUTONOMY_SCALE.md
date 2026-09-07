# AgentOS Graduated Autonomy Scale

## Purpose

AgentOS uses graduated autonomy rather than a binary autonomous/not-autonomous switch. The scale controls how much initiative AgentOS may take and how much user input is required, while permissions and authority remain independently governed.

## Levels

| Level | Name | User involvement | Typical authority |
|---|---|---|---|
| 0 | Manual | User approves every meaningful action | Read-only until explicitly approved |
| 1 | Assisted | AgentOS proposes; user approves | Limited execution |
| 2 | Guided | AgentOS executes routine pre-authorised work | Pre-authorised project workspace |
| 3 | Autonomous | AgentOS plans and executes within defined boundaries | Broader project permissions |
| 4 | High Autonomy | AgentOS continuously manages defined objectives | Multi-step execution and delegation within policy |
| 5 | Mission Autonomy | AgentOS continuously pursues defined objectives | Maximum explicitly authorised scope, bounded by hard safety controls |

## Autonomy is not permission

An autonomy level never grants capabilities by itself. Effective authority is the intersection of autonomy, policy, user consent, capability grants, scope, budget, environment and safety controls.

Example: Level 4 autonomy + GitHub write permission may allow autonomous repository work, while production deployment, credentials, personal files or other restricted capabilities remain denied.

## Temporary elevation

AgentOS should support time- or mission-bounded elevation, such as granting Level 4 for a project for 24 hours or permitting GitHub push until a defined mission completes. Temporary grants must expire automatically and be recorded in the durable audit/mission ledger.

## Heartbeat interaction

The scheduled heartbeat is a trigger, not permission. At higher authorised levels, each heartbeat can recover durable state, select the exact authorised next action, execute or delegate, verify, challenge through Green, route repairs, record evidence and continue. The five-minute heartbeat therefore increases continuity, not authority.

## Control path

Autonomy Level → Policy → Authority → Capability → Budget → Execution → Verification → Green → PRS → Mission Ledger.

Green remains independent READ → ANALYSE → REPORT → CHALLENGE assurance; it does not gain remediation authority merely because the system is operating at a higher autonomy level. PRS remains an independent assurance gate.

## Safety invariant

No autonomy level permits credentials, unrestricted filesystem access, production changes, destructive operations or other restricted capabilities unless those capabilities are separately and explicitly authorised by policy. Current AgentOS DRY_RUN/autonomy-disabled acceptance state remains unchanged until an authorised transition is implemented and verified.

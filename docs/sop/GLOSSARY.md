# AgentOS SOP Glossary

Status: DRAFT

**Authority** — canonical permission for an action; not inferred from technical capability.

**Capability** — ability/tool to perform an operation. Capability != authority.

**Approval** — explicit bounded decision by an authorised approver for a defined action/target/conditions/time.

**Assignment** — work offered/routed to a worker. Assignment != ACK.

**ACK / acknowledgement** — durable evidence the intended worker consumed a handoff. ACK != execution.

**Receipt** — durable record describing an attempted/completed operation and its correlation/evidence. Receipt existence alone does not prove the represented side effect occurred or remained valid.

**Verification** — checking claimed result against defined evidence/acceptance criteria.

**Green** — independent verification role/gate for its defined scope. Worker success or CI does not automatically equal Green.

**PRS** — independent assurance layer challenging false-GREEN and evidence/control integrity. Green != PRS.

**Stop requested** — a stop instruction has been issued.

**Execution stopped** — evidence shows execution actually ceased.

**Permission revoked** — future authority has been removed; does not by itself prove a running process stopped.

**Simple / Essentials / Tech Head** — progressive-disclosure views over one canonical truth/capability model; not authority levels, separate runtimes or paid tiers.

**PRODUCT DIRECTION** — intended/design direction not yet proven as shipped behavior.

**PROVEN** — evidence supports the exact defined claim/scope.

**IMPLEMENTATION-ADVANCED** — substantial implementation exists but required acceptance/assurance remains incomplete.

**UNKNOWN** — evidence is insufficient. UNKNOWN is not permission to assume the favorable outcome.

**BLOCKED** — required next action/evidence cannot safely proceed under current conditions.

**Exact head** — exact repository commit SHA to which code/test/review/assurance evidence is bound.

**Protected action** — action requiring separate explicit authority, such as merge/deploy/credentials/production writes/external publication/spend/legal approval/Green/PRS certification under current doctrine.

**Overseer** — coordinating role that reconciles evidence, decomposes work and routes bounded execution; not inherently ChatGPT and not automatically an executor/approver.

**Worker** — bounded execution role. A worker cannot self-grant authority or independently certify work it performed.

**Persona** — replaceable presentation identity. Stable internal identity and canonical role remain distinct from persona.
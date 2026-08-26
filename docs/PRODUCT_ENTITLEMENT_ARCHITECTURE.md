# AgentOS Product Entitlement Architecture

**Status:** Locked baseline
**Effective date:** 2026-08-27
**Primary AI role:** AgentOS Overseer

## 1. Product model

AgentOS is one program/platform with progressive capability entitlements. Customer tiers are not separate codebases or separate products. Software/runtime versions are independent of customer tier.

- **Software version** answers: what AgentOS is running.
- **Tier entitlement** answers: what the customer is allowed to use.

The same AgentOS core is progressively unlocked as the customer moves through tiers.

## 2. AI ecosystem layers

AgentOS must distinguish three layers:

1. **Models** — external model providers such as OpenAI/GPT, Anthropic/Claude, Google/Gemini, xAI/Grok, Mistral, DeepSeek, Qwen and other supported providers.
2. **External AI agents** — external agent products/platforms such as Manus and Perplexity.
3. **AgentOS Skill Agents** — reusable specialist workers configured and governed inside AgentOS.

These layers must not be treated as interchangeable in the product registry, entitlement system or commercial partner system.

## 3. Tier baseline

### Tier 1 — Free

- 3 high-quality recognised models.
- 1 external AI agent.
- Basic but genuinely usable AgentOS.
- User selects the model/AI resource.
- **Overseer does not select the best model for the user.**
- No user-created Skill Agents.
- Skill-Agent intelligence is not a core Free entitlement.

### Tier 2 — AgentOS Program

Tier 2 has three upgrade levels.

#### Tier 2.1

- 5 models.
- 2 external AI agents.
- 1 preconfigured Skill Agent.
- Overseer may select the best available model/AI resource for a task.
- Core intelligent orchestration begins here.

#### Tier 2.2

- Expanded model and external-agent access beyond 2.1.
- 2 preconfigured Skill Agents.
- More AgentOS capabilities to make the larger AI ecosystem useful.
- Intelligent model/agent selection and broader orchestration.

#### Tier 2.3

- Further expanded model and external-agent access beyond 2.2.
- 3 preconfigured Skill Agents.
- Additional orchestration, automation and coordination capabilities.
- Advanced intelligent selection across the available ecosystem.

The exact provider/model identities remain dynamic. Tier definitions should use capability/slot requirements and the Model/Agent Registry should determine the strongest currently supported eligible candidates.

### Tier 3 — Subscription 1

- Full available model ecosystem.
- Full available external AI-agent ecosystem.
- Larger preconfigured Skill-Agent library.
- Users may create their own Skill Agents.
- Advanced AgentOS features and orchestration.

### Tier 4 — Subscription 2

- Full available model ecosystem.
- Full available external AI-agent ecosystem.
- Maximum preconfigured Skill-Agent library.
- Users may create their own Skill Agents.
- Maximum AgentOS features, autonomy, coordination and governance capabilities.

## 4. Model-selection boundary

The Free tier is intentionally user-directed. The user chooses between available models/agents.

Tier 2 introduces Overseer-assisted selection. Overseer may evaluate task requirements and available capabilities and choose or recommend the best eligible model/agent/workflow.

Tier 3 and Tier 4 extend this into full ecosystem orchestration, subject to policy, permissions, availability and user settings.

Selection must consider capability, context, tools, reliability, availability, user preferences and applicable cost/usage policy. Commercial partner revenue must never be the hidden determinant of capability ranking.

## 5. Skill Agent progression

Skill Agents are internal AgentOS reusable workers. They are not the same thing as external AI agents such as Manus or Perplexity.

Initial progression:

- Tier 2.1: 1 preconfigured Skill Agent.
- Tier 2.2: 2 preconfigured Skill Agents.
- Tier 2.3: 3 preconfigured Skill Agents.
- Tier 3: expanded library + custom Skill-Agent creation.
- Tier 4: maximum library + advanced custom Skill-Agent creation and management.

The initial Skill-Agent catalogue should be selected around repeated, high-value workflows and validated against actual AgentOS usage rather than fixed permanently before runtime evidence exists.

## 6. Overseer Skill-Agent intelligence

AgentOS Overseer should monitor permitted activity for:

- repeated workflows;
- recurring task patterns;
- repeated instructions/tool combinations;
- bottlenecks;
- specialist capability gaps;
- opportunities where a reusable Skill Agent would materially improve reliability or efficiency.

Lifecycle:

**Observe → Detect → Evaluate → Recommend/Create according to entitlement → Test → Deploy → Monitor → Improve/Retire.**

Lower tiers should primarily receive recommendations within their entitlement boundaries. Higher tiers can permit increasingly autonomous Skill-Agent creation, subject to configured authority and safety policies.

## 7. Entitlement implementation rule

Do not fork AgentOS into separate Free, 2.1, 2.2, 2.3, 3 or 4 codebases.

Implement one core platform with an entitlement/policy layer controlling:

- model slots;
- external-agent slots;
- Skill-Agent availability;
- model-selection authority;
- orchestration features;
- automation/autonomy;
- custom-agent creation;
- limits and quotas;
- integrations;
- advanced governance features.

## 8. Versioning

Customer tiers and software versions are independent.

Example:

- Customer entitlement: Tier 2.2
- Runtime version: AgentOS 1.x

A future AgentOS 2.0 release is a software/runtime milestone, not automatically a new commercial tier.

## 9. Commercial architecture

AgentOS may generate revenue through:

- AgentOS program/tier sales;
- subscriptions;
- eligible model/agent affiliate relationships;
- eligible provider/API referral or partner commissions;
- eligible marketplace/channel arrangements.

Partner revenue must be tracked separately from capability selection. Provider terms and eligibility must be verified before forecasting or implementing a specific revenue mechanism.

## 10. Hard product principle

**AgentOS does not restrict model quality to force upgrades.**

Higher tiers provide broader AI ecosystem access and increasingly capable AgentOS functionality. Tier 3 and Tier 4 remove the artificial model/agent count ceiling; their primary differentiation is what AgentOS can do with the full ecosystem.

# AgentOS Identity and Intelligence Model

## Canonical distinction

AgentOS is the operating/orchestration system. The Overseer is a first-class AgentOS system role. Neither is synonymous with any AI provider.

A provider such as OpenAI, Anthropic or Google supplies intelligence. A product such as ChatGPT, Claude or Gemini is a model/assistant capability. A product such as Perplexity or Manus is treated by AgentOS as an external agent capability. Specialist products such as Codex, Cursor, Devin, Replit Agent, n8n and Make provide focused execution capabilities.

## Stable user-facing identity

The first-run experience must greet the user as **AgentOS Overseer**. The greeting and setup flow must not identify the Overseer as ChatGPT, Claude, Gemini or another provider unless the user explicitly asks which intelligence is currently powering a particular interaction.

The Overseer identity persists independently of provider selection.

## Provider-neutral execution

The Overseer may use one or more eligible intelligence sources for a task. Provider selection is a runtime capability decision, not an identity decision.

Examples:

- architecture task -> Claude may be selected;
- research task -> Gemini and/or Perplexity may be selected;
- coding task -> Codex or Devin may be selected;
- general orchestration -> any eligible model may be selected;
- no paid provider -> free/limited workers remain valid.

Changing or removing a subscription must not change the identity of the Overseer or require AgentOS to be reconfigured architecturally.

## First-run setup contract

1. Bootstrap the persistent `agentos:overseer` system agent.
2. Greet the user as AgentOS Overseer.
3. Discover available free/limited models and agents.
4. Discover connected paid subscriptions and APIs.
5. Verify actual runtime capabilities; do not infer access from a provider name or subscription label.
6. Establish the user's free baseline.
7. Configure available workers and permissions.
8. Only recommend a paid subscription/API when a material capability gap or temporary workload spike justifies it.
9. Present official acquisition/connect paths, including verified affiliate/referral routes where applicable.
10. Activate the selected worker without replacing the Overseer identity.

## Commercial neutrality

Commercial metadata is advisory and must never alter technical worker ranking. Affiliate/referral/reward opportunities are surfaced only after a capability-based recommendation has been established.

## Authority

The Overseer remains subject to AgentOS authority, entitlement and policy controls. Connecting a provider does not grant that provider governance over AgentOS.

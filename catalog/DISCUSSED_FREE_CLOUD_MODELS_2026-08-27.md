# AgentOS — Discussed Free Cloud AI Models & Providers

**Date:** 2026-08-27
**Status:** Candidate/reference list — NOT yet an approved production fleet.

## Purpose

Record the cloud-based AI models/providers discussed for AgentOS's Free tier and future paid/subscription tiers. Availability, pricing, quotas, model names, licensing and reliability must be independently revalidated before production adoption.

## Model/provider candidates discussed

### Primary/general reasoning
- Google Gemini
- DeepSeek V4 / V4 Pro
- GLM-5.2
- Qwen 3.6
- Kimi K3
- MiniMax M3
- Mistral Large 3
- GPT-OSS 120B
- Llama 4
- Gemma 4
- Phi-4 Mini

### Cloud inference/provider layer
- OpenRouter — multi-model gateway; not itself a model
- Groq — inference/provider layer
- Cerebras — inference/provider layer
- Cloudflare Workers AI — inference/provider layer
- SambaNova Cloud — inference/provider layer
- Cohere — model/provider layer
- Hugging Face Inference — model/provider layer

## Proposed initial Free-tier cloud fleet

The conversation proposed starting with **5 active cloud providers/models**, subject to validation:

1. Gemini — primary general/reasoning
2. OpenRouter — multi-model gateway/fallback
3. Groq — high-speed inference
4. Mistral — coding/general backup
5. Cerebras — high-speed alternative

Important: OpenRouter, Groq and Cerebras are provider/inference layers rather than equivalent individual models. AgentOS should therefore model **providers, models and routing endpoints as separate entities**.

## Proposed future scaling

- Free: approximately 5 active providers / ~10 selectable models
- Starter: approximately 8–10 providers/models
- Pro: approximately 15–25 models
- Business: approximately 40–50+ models
- Enterprise: 100+ models/providers where commercially and operationally justified

These are architectural targets, not final commercial commitments.

## AgentOS design requirement

Do not hard-code AgentOS to a single model. Maintain a model/provider registry and routing layer so the Overseer can evaluate and rank candidates by:

- availability
- reliability
- latency
- capability
- coding performance
- reasoning quality
- context capacity
- tool/agent support
- cost/free quota
- provider terms

The fleet should be replaceable without requiring users to rebuild their agents.

## Important validation note

The discussion was based on a high-level shortlist and should not be treated as a verified statement that every named model currently has a free cloud API. Before implementation, AgentOS should perform a live provider/catalog reconciliation and record current free-tier limits, API access, model IDs, licensing/terms and reliability.

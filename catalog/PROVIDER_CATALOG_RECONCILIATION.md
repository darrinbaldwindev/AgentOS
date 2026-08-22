# Provider Catalog Reconciliation

**Status:** Local evidence reconciliation for backlog task C1. This report classifies project-recorded evidence only. It does not verify current external program terms, enroll any affiliate program, activate routing, open redirects, use credentials, or make a provider-availability claim.

## Scope and evidence boundary

The reconciliation compares the project-local candidate spreadsheet and its originating chat record with the structured Tier-1/Tier-2 research records contained in `AgentOSzipfinal.zip`. The structured output is stored in [`provider_catalog_reconciliation.json`](./provider_catalog_reconciliation.json). Its evidence cutoff is **2026-08-21**; its classifications must be treated as historical project evidence, not live verification.

> An entry classified as `verified_project_record` has a project record marked verified as of the evidence cutoff. It is **not approved for activation**. Before any provider enrollment, referral routing, redirect, API connection, or monetized ranking, current official terms must be re-verified and the owner must approve the scope, consent treatment, and disclosure.

| Status | Count | Meaning | Activation posture |
|---|---:|---|---|
| `verified_project_record` | 11 | A structured project research record was marked verified at the 2026-08-21 cutoff. | Re-verify current official terms and obtain owner approval before any activation. |
| `non_affiliate_integration` | 5 | The project record describes no individual/consumer affiliate program or an enterprise-only partner path. | Do not apply a referral bonus. |
| `verify_before_activation` | 9 | Evidence is unconfirmed, third-party-only, or candidate-list-only. | Do not activate or route by affiliate status. |
| `expired` | 0 | No project-local evidence established an expired entry in this reconciliation. | Do not infer that a program remains active. |

## Reconciled status groups

### Project records marked verified

The project’s archived structured records classify **Perplexity, Replicate, Vercel v0, ElevenLabs, n8n, Framer, Fireflies.ai, Synthflow, Otter.ai, Taskade AI Agents, and Botpress** as verified project records. Their recorded affiliate terms, if any, have different constraints, payment structures, and eligibility rules; this report intentionally does not reproduce activation parameters or ranking weights.

Some recorded recommendations remain negative despite a historical verified label. Replicate is recorded as one-time rather than recurring and therefore excluded from referral-routing economics. Synthflow and Otter.ai are recorded below the project’s prior routing threshold. Fireflies.ai is conditional in the archived shortlist. These distinctions are retained in the structured catalog rather than collapsed into a binary affiliate flag.

### Non-affiliate or enterprise-only integrations

**OpenRouter, Groq, GitHub, Anthropic, and Mistral AI** are retained as integration or ecosystem records without an individual-consumer referral-routing path in the project evidence. The archived records describe either no individual program, discontinued/unconfirmed referral evidence, or enterprise/partner programs that are unsuitable for automatic individual routing. They must remain available as capability/integration candidates only where later owner-approved product work defines that use.

### Verify-before-activation candidates

**Together AI** is a structured `verify_before_activation` record because the project evidence cites third-party claims rather than an accepted official confirmation. **Chatbase, Relevance AI, AgentWorks, Manus, Tidio AI (Lyro), Dynamiq, FlowGent, and AI Agent Store** appear in the local candidate CSV and originating chat record but are not included in the archived structured registry. Their commission fields are provenance claims rather than activation evidence.

No row in this group may influence a provider card, rank, fallback selection, referral link, or disclosure behavior until a separate owner-approved current-terms verification task is completed.

## Reconciliation findings

| Finding | Evidence | Deterministic handling |
|---|---|---|
| The local CSV is a candidate list, not a verification registry. | It has commission/cookie/notes fields but no source URL, date, consent, enrollment, or eligibility data. | Preserve it as provenance; classify unstructured-only rows as `verify_before_activation`. |
| Archived structured research is time-bounded. | Registry manifest and shortlist records are dated 2026-08-21. | Use `verified_project_record`, never a live or permanent verification label. |
| Program status and routing suitability are separate. | Several structured records are historically verified but excluded or conditional under prior suitability logic. | Keep `routingRecommendation` explicit; do not rank by affiliate status. |
| Enterprise partner paths are not consumer referral programs. | Structured entries record enterprise-only limitations for selected providers. | Classify them as `non_affiliate_integration` for individual referral-routing purposes. |
| No live re-verification occurred here. | This task used only project-local records and a disposable archive extraction. | Keep all activation owner-gated and current-terms-dependent. |

## Data maintenance requirements

Future evidence updates should add a dated official source reference, evidence capture date, program type, eligibility constraints, disclosure requirements, consent scope, and an explicit non-activation status. The catalog must not store secrets, account identifiers, referral codes, personal browsing history, or unredacted external redirect URLs.

A future owner-approved verification task may promote an entry only after reviewing current official terms. A later routing task must independently establish capability fit, health, privacy, user consent, disclosure, and non-affiliate alternatives; historical affiliate status alone must never determine selection.

## Project-local sources

The evidence described above derives from the following project materials:

1. [`ai_agent_affiliate_programs.csv`](../ai_agent_affiliate_programs.csv), candidate spreadsheet provenance.
2. [`Affiliate Chat.md`](../Affiliate%20Chat.md), originating candidate-list narrative and verification caveat.
3. `AgentOSzipfinal.zip` archived records: `agents/research/affiliate/REGISTRY_MANIFEST.json`, `BRIEF_2026-08-21.md`, and `TIER2_SHORTLIST.json`.

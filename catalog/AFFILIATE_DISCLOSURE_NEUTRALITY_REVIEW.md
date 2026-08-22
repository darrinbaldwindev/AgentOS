# Affiliate Disclosure and Neutrality Review

**Status:** Local source review for backlog task C4. This review assesses only the supplied offline fixtures, contracts, prototype UI, catalog records, and policy artifacts. It does not verify current program terms, activate a referral, enroll an affiliate account, inspect a live landing page, open a redirect, or assess a deployed product.

## Review scope and decision rule

The review tested five local control areas: explicit disclosure, opt-in consent, non-affiliate alternatives, neutral ranking, and silent monetized fallback prevention. Each control is classified as **PASS**, **PARTIAL**, or **NOT ASSESSED** based on source evidence. A PASS means a local fixture or contract encodes the control; it does not mean the control has been deployed or is legally sufficient for a production surface.

| Control area | Classification | Local evidence | Boundary |
|---|---|---|---|
| Capability-neutral ranking | **PASS** | The fallback manager ranks by required capability, then health, then name; its ranking function does not read `referralStatus`. The fixture ranker likewise excludes affiliate metadata from scoring. | This applies to local fixtures only. |
| Non-affiliate alternatives | **PASS** | The fallback manager includes `Local Runtime` and `Free Community Gateway`, both marked `referralStatus: "none"`; the catalog maintains non-affiliate integration records. | Alternatives are previews, not live routes. |
| Opt-in consent | **PARTIAL** | The local mock accepts explicit boolean consent and marks it `persisted: false` with `scope: "local_fixture_only"`. | No durable preference, withdrawal UI, consent ledger, or production consent enforcement exists. |
| Referral/redirect safety | **PASS** | The only redirect interface is `/v1/redirects/dry-run`, which returns `dryRun: true`, `wouldOpen: false`, and a local fixture destination. | No real referral URL, signup action, or external navigation exists. |
| Silent monetized fallback prevention | **PASS** | Fallback and recovery actions are previews or explicit user selections; local policies prohibit provider invocation and preserve capability-first ordering. | No live provider execution is present. |
| Provider-card disclosure | **PARTIAL** | The fallback fixture records `referralStatus` and labels credit-provider referral metadata as display-only, but the prototype does not render a dedicated visible disclosure statement or opt-in affordance on the provider card. | A future UI must add owner-approved wording before any real referral surface. |
| Landing-page copy | **NOT ASSESSED** | No landing-page source or runtime frontend is attached in the project snapshot. | No claim is made about production or public copy. |

## Evidence summary

The `IntegrationFallbackManager` is explicitly self-contained and offline. Its provider ranking uses capability fit and health only; referral metadata is intentionally excluded. The model fixture ranker follows the same rule, and the capability matrix verifies an affiliate-supported and neutral model fixture remain equal on capability fields.

The local mock API protects consent and redirects by making both non-persistent. Its consent endpoint accepts an explicit boolean in a local-fixture scope. Its redirect endpoint is dry-run-only and returns `wouldOpen: false`. The fallback API contract requires an eventual redirect to be separately consented, auditable, and guarded by a dry-run path; it does not provide an activation path.

The local catalog reconciliation classifies historical provider evidence without activation authority. It records non-affiliate integrations and verify-before-activation entries, and its policy expressly prevents historical affiliate status from determining selection. The provider-health policy similarly returns local recommendations only and does not invoke a provider, persist state, schedule retries, or silently select a monetized alternative.

## Required remediation before a live referral surface

A future owner-approved implementation must add a dedicated provider-card disclosure component that displays referral status in plain language, states that selection is capability-first, identifies a non-affiliate alternative when one is available, and requires affirmative opt-in before an external referral action. It must support withdrawal, durable consent records with data minimization, current official-term verification, accessible disclosure placement, and audit evidence. These requirements are a review finding only; this task does not implement, approve, or activate them.

> **No silent monetized fallback:** A provider must never be selected because it has affiliate metadata, an unverified program claim, a historical program record, or a referral parameter. Any future paid or referral action requires capability fit, clear disclosure, explicit user consent, current term verification, and owner approval.

## Local source references

1. `agents/ui/components/IntegrationFallbackManager.tsx`, self-contained fallback provider list and capability/health ranking.
2. `fixtures/frontend-provider-fixtures.mjs`, synthetic model/provider ranker and display-only affiliate metadata.
3. `api/agentos-local-mock-api.mjs` and `api/LOCAL_MOCK_API.md`, local consent and dry-run redirect boundaries.
4. `agents/api/INTEGRATION_FALLBACK_API.md`, fallback contract consent, dry-run, and capability-first obligations.
5. `catalog/provider_catalog_reconciliation.json` and `catalog/CAPABILITY_COMPARISON_MATRIX.md`, historical evidence boundary and affiliate-neutral matrix policy.
6. `policy/provider-health-policy.mjs`, local-only health and fallback recommendation boundaries.

# Autonomy grant type repair

Base: PR #78 `9cfe7aa38b2ffccd4872f0ba69ffbd6a4f4c6b80`.
Baseline: 261 tests passed. Adversarial additions reproduced 16 false grants:
string `false`, number 1, object and array accepted for each of authorised,
capabilityGranted, inScope and withinBudget. JavaScript truthiness was the cause.

Repair requires explicit true for each grant and explicit false for production.
Twenty negative cases now included; complete suite 281 passed locally.
This modifies the existing pure policy helper only. It does not wire autonomy into
runtime, create scheduling, enable autonomy or establish Night Shift. Scope,
expiry, required level and trusted-context origin still need hot-path integration
and independent assurance. Paid tiers must not bypass these checks.

Execution-produced tests, not independent PRS approval. No overall GREEN.

# SOP-AFF-001 — Prime, Deal and Affiliate Destination Revalidation

Status: DRAFT / IMPLEMENTATION-DEPENDENT
Owner: SOP Overseer

## Purpose
Prevent MyPrimeDelivery and affiliate properties from presenting stale Prime eligibility, price, discount, stock, delivery or monetised destination state as current.

## Core rule
Time-sensitive commerce facts expire. Historical observation is not current availability. Consumer product verification is separate from publisher affiliate approval and from destination/tracking validity.

## Evidence record
Bind exact product/variant/ASIN/SKU; merchant; marketplace/country; observed price; reference/former price basis; deal amount/percentage; deal start/end if known; Prime eligibility; delivery promise and destination/postcode assumptions; stock; seller; affiliate-program approval state; destination resolver result; tracking relationship; source; observed timestamp; expiry/recheck rule.

## Publication gate
1. Revalidate time-sensitive fields at the configured freshness boundary.
2. Reject malformed/unknown destinations and never invent tracking parameters.
3. Resolve commercial eligibility independently of consumer product existence.
4. Keep `Prime`, `deal`, `sale`, `limited`, delivery-date and savings claims scoped to evidence.
5. If evidence expires or conflicts, remove/downgrade the claim rather than preserve conversion copy.
6. Record the evidence used for each published state.

## Automation
Scheduled refresh does not grant marketplace, affiliate, publication or spend authority. Missing/failed refresh must fail closed to stale/unknown presentation rather than silently retaining a time-sensitive claim.

## Fail closed
UNKNOWN affiliate approval, stale price/Prime/delivery evidence, unresolved destination, unsupported reference price or seller/variant mismatch => no verified time-sensitive CTA/claim.
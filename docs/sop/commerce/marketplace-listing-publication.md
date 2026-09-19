# SOP-COM-003 — Marketplace Listing Publication Gate

Status: DRAFT / IMPLEMENTATION-DEPENDENT / LEGAL REVIEW REQUIRED
Owner: SOP Overseer

## Core rule
A researched product candidate is not an authorised listing. Supplier availability, Shopify presence, marketplace acceptance and positive margin inference are separate evidence dimensions.

## Required listing packet
Bind operator/store; marketplace/account; country; exact SKU/variant; canonical Shopify/product source; supplier/manufacturer; title/description/images rights; category/attributes; safety/compliance evidence; stock; cost; freight/fulfilment; fees/tax assumptions; returns/warranty; target price; contribution calculation; delivery claim; environmental/quality/performance claims; marketplace restrictions; affiliate vs seller role; approval; exact intended listing payload; revalidation timestamp.

## Gate
1. Reconcile canonical commerce truth and exact product identity.
2. Require material cost/freight/fees evidence before margin/free-delivery claims.
3. Run supplier/importer/product-safety/recall gate.
4. Verify IP/image/content rights and claim substantiation.
5. Verify marketplace/account/category eligibility separately.
6. Verify stock/delivery evidence freshness.
7. Require explicit production publication authority.
8. Preview/diff the exact payload.
9. Publish only through governed connector/workflow when authorised.
10. Capture listing ID/version/receipt and independently verify rendered listing.

## Fail closed
Unknown freight or material cost, unverifiable supplier/SKU, unresolved safety/compliance, unsupported claim, missing rights, stale stock, malformed payload or absent production authority => HOLD.

## Protected actions
Research/drafting/testing do not authorise account changes, listing activation, price changes, inventory writes, advertising spend, purchases, supplier contact or customer communication.
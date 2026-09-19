# Marketplace Price / Stock / Freight Synchronization Truth

**Document ID:** SOP-MKTPLACE-002
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Canonical-source rule
Where portfolio architecture designates Shopify as canonical commerce truth, marketplace and headless surfaces consume governed projections; they do not silently become independent authorities for product identity, stock or price.

## Synchronization record
Bind SKU/variant, canonical source version/time, marketplace account/listing, price, stock, freight/delivery promise, tax/fee assumptions where relevant, transform rules, publish attempt, marketplace acknowledgement and read-back verification.

## Distinctions
`sync queued` != `published`; API success != storefront read-back; canonical stock != marketplace available quantity if buffers/reservations apply; free-delivery policy != evidenced supplier freight; price freshness != delivered-margin proof.

## Conflict
If marketplace read-back conflicts with canonical intended state, mark drift and stop compounding writes until reconciled. Unknown freight or stock must not be converted into a free-delivery/in-stock claim.

## Protected actions
Production listing/price/stock mutation remains protected and requires exact authority. Research or dry-run reconciliation does not authorize publication.

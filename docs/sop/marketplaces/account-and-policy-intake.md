# Marketplace Account and Policy Intake Gate

**Document ID:** SOP-MKTPLACE-001
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## Purpose
Separate marketplace research and technical connectivity from permission to operate a seller account or publish listings.

## Intake packet
Record marketplace/country, legal account/operator identity, account state, authorised users/roles, API/app connection, scopes, fee schedule evidence, listing/category restrictions, fulfilment/returns requirements, prohibited/restricted product controls, seller-performance obligations, payout/payment path, policy versions and review dates.

## Truth boundaries
- Account access != authority to list.
- API credentials != permission to mutate.
- Marketplace acceptance != product legality/compliance.
- Category eligibility != exact-SKU eligibility.
- A fee estimate != verified delivered margin.
- Marketplace stock/price data != Shopify canonical truth where portfolio architecture assigns Shopify that role.

## Gate
Production listing, price/stock mutation, offer acceptance, customer contact, purchase/spend and policy/terms acceptance remain protected actions.

Unknown material account/policy/product constraints keep the relevant operation on HOLD.

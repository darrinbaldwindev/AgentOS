# SOP-LEGAL-017 — United Kingdom Affiliate, Privacy, Tracking and Direct-Marketing Annex

Status: DRAFT / LEGAL REVIEW REQUIRED
Owner: SOP Overseer
Research baseline: 2026-09-16
Primary regulator baseline: UK Information Commissioner's Office (ICO); affiliate/advertising rules require separate ASA/CAP applicability review before launch.

## Scope
UK Affiliate Website and any portfolio flow directed to people in the UK. This annex supplements, not replaces, the global/Australian SOPs.

## Current privacy/direct-marketing baseline
Current ICO guidance describes the UK regime as UK GDPR + Data Protection Act 2018, with PECR applying where relevant to direct marketing and storage/access technologies. The Data (Use and Access) Act has changed parts of the framework, and current ICO material contains updated 2026 guidance plus some pages explicitly marked under review.

## Tracking/storage gate
Before UK activation inventory every cookie, pixel, script, tag, local-storage item, device-fingerprinting mechanism, link decoration/navigational tracking and similar technology; record purpose, party, duration, data, destination and applicable exception/consent basis.

Do not use an old blanket rule such as `all non-essential cookies always require consent` without checking the current post-DUAA exceptions. Current ICO detailed storage/access guidance must be consulted for the exact technology/purpose. Where consent is required, it must meet the applicable standard and the user must receive clear information.

## Direct-marketing gate
For email/text/phone/targeted marketing:
1. classify whether the activity is direct marketing;
2. identify PECR rule by channel/recipient;
3. identify the data-protection lawful basis where personal information is processed;
4. evidence consent/soft-opt-in or other applicable route rather than infer it;
5. respect objection/opt-out and suppression state;
6. identify sender/instigator responsibility, including third-party platforms;
7. preserve collection notice/source and campaign evidence.

Current ICO guidance states people have an absolute right to object to direct marketing. Use the current ICO channel-specific guidance because rules differ by channel and recipient type.

## Affiliate tracking/content
Affiliate commission relationships require a separate advertising-disclosure review. Tracking permission does not prove affiliate-program approval, and affiliate-program approval does not prove PECR/UK GDPR compliance. Consumer referral availability is not publisher approval.

## Fail closed
Block launch when tracker inventory is incomplete, consent/exception status is UNKNOWN, marketing source/permission is unproven, opt-out suppression cannot be honoured, controller/processor responsibility is unresolved, or affiliate advertising disclosure has not been separately reviewed.

## Revalidation
Recheck current ICO/ASA/CAP primary guidance before launch and after material legal/guidance changes. This annex is an operational research draft, not UK legal advice or certification.
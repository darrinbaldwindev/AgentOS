# SOP-LEGAL-008 — Cookies, Tracking, Analytics and Advertising Technology

Status: DRAFT / JURISDICTION REVIEW REQUIRED
Owner: SOP Overseer

## Purpose
Govern use of cookies, pixels, SDKs, analytics, advertising identifiers, affiliate attribution and comparable tracking across AgentOS and portfolio web properties.

## Core rule
A technical ability to set/read an identifier is not authority to collect, disclose, profile, advertise or transfer personal information.

## Required inventory before activation
Record: property/app; jurisdiction/audience; tracker/vendor; purpose; data/identifiers collected; first/third party; recipients; retention; cross-border destination where known; whether essential; consent/legal basis requirement; privacy/collection-notice coverage; opt-out/withdrawal mechanism; owner; evidence date.

UNKNOWN material fields fail closed for non-essential advertising/profiling tracking.

## Publication gate
Before enabling non-essential analytics/advertising/affiliate tracking:
1. identify applicable jurisdiction(s);
2. verify current primary/regulator requirements;
3. ensure privacy/collection disclosures match actual behavior;
4. implement any required consent/choice before collection or disclosure;
5. ensure refusal/withdrawal is respected where required;
6. prevent dark patterns or misleading controls;
7. record vendor/config/version and evidence date;
8. revalidate after material vendor, purpose, destination or data changes.

## AgentOS rule
Overseer, worker, scheduler, plugin, MCP capability, Content360 or Marketing automation cannot infer tracking consent from account creation, general site use, an API key, prior unrelated consent or commercial value.

## Affiliate attribution
Affiliate cookies/referral identifiers must be documented separately from publisher approval. A functioning tracking destination does not prove lawful disclosure, valid consent, program authorization or commercial eligibility.

## Evidence states
MANDATORY / CONDITIONALLY MANDATORY / RECOMMENDED CONTROL / LEGAL REVIEW REQUIRED / NOT APPLICABLE / UNKNOWN.

This SOP is an operational control, not legal advice or certification.
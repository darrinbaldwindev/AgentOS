# LEGAL-COMPLIANCE-REGISTER — Australian baseline

**Status:** LEGAL REVIEW REQUIRED / IMPLEMENTATION-DEPENDENT  
**Owner:** SOP Overseer  
**Jurisdiction baseline:** Australia  
**Last researched:** 2026-09-15

This register is a compliance control and research index. It is not legal advice, legal approval, or proof that AgentOS or another portfolio product is compliant.

## Classification

Every legal/control item MUST be classified as one of:

- `MANDATORY` — primary law/regulator evidence supports a requirement and the applicability conditions are satisfied.
- `CONDITIONALLY MANDATORY` — required only if stated coverage/trigger conditions apply.
- `RECOMMENDED CONTROL` — regulator guidance or prudent governance, but not represented here as universally mandated.
- `LEGAL REVIEW REQUIRED` — applicability, wording, jurisdiction, product facts, or implementation needs qualified review.
- `NOT APPLICABLE` — applicability has been assessed and evidence supports exclusion.
- `UNKNOWN` — insufficient evidence. UNKNOWN fails closed for legal/commercial publication claims.

## Australian baseline register

| ID | Area | Classification | Trigger / scope | Required control or gate | Primary regulator/source |
|---|---|---|---|---|---|
| LEG-AU-001 | APP Privacy Policy | CONDITIONALLY MANDATORY | Entity is covered by Privacy Act / is an APP entity | Clearly expressed, current APP Privacy Policy; required APP 1 content; free/appropriate availability | OAIC, APP 1 |
| LEG-AU-002 | Privacy collection notice | CONDITIONALLY MANDATORY | APP entity collects personal information and APP 5 applies | Give required collection notification at/before collection or as soon as practicable | OAIC, APP 5 |
| LEG-AU-003 | Privacy governance | CONDITIONALLY MANDATORY | APP entity | Reasonable practices, procedures and systems for APP compliance and inquiries/complaints | OAIC, APP 1.2 |
| LEG-AU-004 | Automated-decision privacy-policy disclosure | CONDITIONALLY MANDATORY; FUTURE GATE | From 2026-12-10, APP entity arranges computer program use of personal information for decisions reasonably expected to significantly affect rights/interests | Add specified automated-decision information to APP Privacy Policy before applicable processing/public launch | OAIC APP 1 guidance / 2024 amendments |
| LEG-AU-005 | Data-breach response plan | RECOMMENDED CONTROL; may support mandatory privacy/security duties | Personal information held; stronger relevance where Privacy Act/NDB applies | Written, accessible, reviewed/tested plan; contain -> assess -> notify if required -> review | OAIC NDB guidance |
| LEG-AU-006 | NDB notification | CONDITIONALLY MANDATORY | Entity covered by NDB scheme has eligible data breach | Assess breach and notify affected individuals/OAIC where statutory test is met | OAIC NDB scheme |
| LEG-AU-007 | Commercial electronic messages | CONDITIONALLY MANDATORY | Sending commercial email/SMS covered by Spam Act | Consent basis; accurate sender identification/contact details; compliant unsubscribe | ACMA Spam Act guidance |
| LEG-AU-008 | Unsubscribe | CONDITIONALLY MANDATORY | Covered commercial electronic message | Clear unsubscribe; functional at least 30 days; honour within 5 working days; no fee/account-login barrier | ACMA |
| LEG-AU-009 | Advertising / claims | MANDATORY when ACL applies | Business makes representations in trade/commerce | Do not make false/misleading claims; substantiate material product, price, performance, availability, delivery and benefit claims | ACCC / Australian Consumer Law |
| LEG-AU-010 | Affiliate / influencer commercial relationship disclosure | CONDITIONALLY MANDATORY as misleading-conduct risk control; LEGAL REVIEW REQUIRED for exact placement/wording | Affiliate commission, referral link/code, payment, gift, incentive, ownership or other commercial relationship could affect consumer understanding | Clear, prominent disclosure before/with endorsement or commercial action; do not obscure relationship | ACCC influencer/endorsement guidance + ACL |
| LEG-AU-011 | Consumer guarantees | MANDATORY when ACL consumer guarantees apply | Goods/services supplied to covered consumers | Do not exclude statutory rights; provide legally required remedy where guarantee not met | ACCC / ACL |
| LEG-AU-012 | Refund/returns wording | MANDATORY when ACL applies | Selling covered goods/services | Store policy must operate in addition to statutory guarantees; prohibit blanket `no refunds` wording that removes ACL rights | ACCC |
| LEG-AU-013 | Warranty against defects mandatory wording | CONDITIONALLY MANDATORY | Business supplies a warranty against defects within applicable ACL regulations | Use applicable prescribed mandatory text and required warranty information; obtain legal review before publication | ACCC warranties guidance / ACL regulations |
| LEG-AU-014 | Terms / unfair contract terms | CONDITIONALLY MANDATORY / LEGAL REVIEW REQUIRED | Standard-form consumer or small-business contracts in covered circumstances | Review terms for prohibited/unfair terms and current penalty regime before publication/use | ACCC / ACL |
| LEG-AU-015 | Cookies, pixels, analytics and tracking | LEGAL REVIEW REQUIRED | Tracking technologies, personal information, overseas recipients, direct marketing, or non-AU users | Inventory technologies and data flows; determine privacy/consent/disclosure requirements per jurisdiction before activation | OAIC + applicable foreign regulators |
| LEG-AU-016 | Records of legal evidence | RECOMMENDED CONTROL | Any regulated publication/decision | Preserve source, retrieval date, applicability assessment, approved wording/version, publication evidence and reviewer | SOP governance |

## Portfolio applicability

This register is the Australian baseline for AgentOS and Australian-facing portfolio properties. AU, UK and US affiliate sites MUST NOT treat this as a universal legal template. Country workstreams require their own legal annex and primary-source research.

For GlobalShopCo and other commerce projects, product/supplier verification does not replace ACL review. For Affiliate-Websites, consumer verification does not establish publisher approval and publisher approval does not remove disclosure obligations. For AgentOS, technical capability or an AI-generated policy does not establish Privacy Act/ACL compliance.

## Publication gate

Legal/public-facing material MUST NOT be marked approved merely because a draft exists. Before publishing a privacy policy, terms, warranty, affiliate disclosure framework, refund policy or regulatory statement:

1. identify entity and jurisdiction;
2. identify applicability trigger;
3. retrieve current primary/regulator source;
4. record source and retrieval date;
5. distinguish mandatory law from regulator guidance/recommended control;
6. reconcile wording with actual product/data/commercial behaviour;
7. identify unresolved UNKNOWNs;
8. obtain legal review where this register requires it or material ambiguity remains;
9. preserve approved version and evidence of publication;
10. schedule/retrigger review after material product, data, pricing, marketing or law change.

## Prohibited shortcuts

- Do not claim `legally compliant` because an SOP or policy exists.
- Do not copy another project's privacy policy or terms without applicability review.
- Do not use an affiliate disclosure only in a footer when the commercial relationship may otherwise be unclear at the endorsement/action point.
- Do not allow AI-generated marketing to invent legal, earnings, price, delivery, capability or compliance claims.
- Do not treat a privacy policy as a substitute for a collection notice where APP 5 requires notification.
- Do not treat an internal refund policy as overriding Australian Consumer Law.
- Do not publish legal wording marked `LEGAL REVIEW REQUIRED` as approved legal text.

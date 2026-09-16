# SOP-LEGAL-015 — Accessibility and Conformance Claims

Status: DRAFT / JURISDICTION REVIEW REQUIRED
Owner: SOP Overseer

## Purpose
Make portfolio interfaces and publications progressively accessible while preventing unsupported accessibility/conformance claims.

## Core rule
Accessibility intent, a design system, automated linting or a framework default does not prove WCAG conformance or legal compliance.

## Minimum operational controls
- semantic structure and keyboard operation;
- meaningful labels and accessible names;
- focus visibility/order;
- text alternatives for meaningful non-text content;
- adequate contrast and scalable/reflowing content;
- accessible forms/errors/status messages;
- captions/transcripts or alternatives where applicable;
- avoid interaction dependent only on colour, pointer precision or motion;
- test important flows with representative assistive technology/manual methods as appropriate;
- provide a channel for accessibility problems and alternative formats where appropriate.

## Claim gate
Before publishing `WCAG AA`, `fully accessible`, `compliant` or equivalent, record: target standard/version/level; scope; automated tests; manual tests; assistive-technology/browser matrix; known exceptions; evidence date/head/release; independent review if required; remediation owner.

UNKNOWN/untested surfaces cannot inherit a conformance claim from another surface.

## Modes/personas
Simple / Essentials / Tech Head or persona changes must not create inaccessible authority-critical controls or hide required status/evidence. Progressive disclosure must preserve equivalent task completion and governance information.

Australian baseline: the Australian Human Rights Commission treats accessible information as important and references WCAG and Australian digital-accessibility guidance. Exact legal applicability must be reviewed for the operator/service rather than inferred from this SOP.

This SOP is not a certification.
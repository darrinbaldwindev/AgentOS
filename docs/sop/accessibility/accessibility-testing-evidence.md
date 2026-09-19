# SOP-ACCESS-001 — Accessibility Testing Evidence

Status: DRAFT / IMPLEMENTATION-DEPENDENT / JURISDICTION REVIEW REQUIRED
Owner: SOP Overseer

## Purpose
Turn accessibility intent into bounded, reproducible evidence without manufacturing a WCAG or legal-conformance claim.

## Test packet
Bind exact release/head/surface, target standard/version/level if any, viewport/input modes, browser/OS, automated tool/version, keyboard path, focus behavior, labels/names/roles, headings/landmarks, form errors/status messages, contrast/reflow/zoom, motion/time limits, media alternatives, representative assistive-technology/manual checks, defects, severity, exceptions, evidence date and reviewer.

## Rules
- automated scan != conformance;
- component-library compliance != whole-product compliance;
- one browser/AT combination != universal accessibility;
- untested routes cannot inherit a pass;
- fixed code != verified remediation until retested;
- accessibility statement must match tested scope and known exceptions.

## AgentOS modes
Simple, Essentials and Tech Head must preserve equivalent completion of authority-critical tasks. Detail may change; approvals, denials, stop/revoke state, evidence and error recovery cannot become inaccessible or disappear by mode.

## Gate
A public `WCAG AA`, `fully accessible` or equivalent claim requires the evidence defined by SOP-LEGAL-015 plus any applicable jurisdiction review. Otherwise describe concrete tested behavior and known limitations only.
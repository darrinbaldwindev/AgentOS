# SOP-REPORT-001 — Morning Brief and Portfolio Status

Status: DRAFT
Owner: SOP Overseer

## Purpose
Give the owner a compact truthful handoff after unattended or multi-worker execution without turning activity into completion.

## Required sections
1. Executive movement: verified changes since prior checkpoint.
2. Exact evidence: repository/PR/head, CI/test/receipt identifiers where material.
3. Blockers/UNKNOWNs: stable blockers separated from new blockers.
4. Assurance: worker result, Green and PRS shown separately.
5. Protected decisions awaiting owner/authorised approver.
6. Cost/spend actually incurred where authorised and evidenced.
7. Next 3–12 executable actions, ordered P0/P1/P2.
8. Superseded/stale evidence that should no longer drive decisions.

## Truth rules
- scheduled run fired != useful work completed;
- commit != merged/shipped;
- CI pass != physical acceptance/Green/PRS;
- worker says done != independently verified;
- no new evidence means say no material movement rather than manufacture progress;
- exact-head claims must be fresh enough for their use;
- historical evidence remains identifiable as historical.

## Format
Lead with key movement, blockers and next actions. Use detail only where it changes a decision or provides auditability. Preserve durable links/IDs in the canonical checkpoint rather than relying on chat memory.
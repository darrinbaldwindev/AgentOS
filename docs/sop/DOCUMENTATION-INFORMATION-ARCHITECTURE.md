# AgentOS Documentation Information Architecture

Status: DRAFT
Owner: SOP Overseer

## One documentation truth
Documentation is a view over current product/runtime/governance evidence. It is not an alternate source of authority or implementation truth.

## User journey
1. **Understand** — what AgentOS is; capability/status vocabulary; Free/Standard/Advanced/AI Plus product direction clearly separated from shipped entitlements.
2. **Install** — prerequisites, supported platforms, install, doctor, first-run evidence.
3. **Configure** — providers/models/local/BYOK, credentials, connectors, local files/indexing, privacy choices.
4. **Use** — chat, Simple/Essentials/Tech Head, projects, workers, missions.
5. **Authorise** — permissions, approvals, budgets, protected actions, stop/pause/revoke.
6. **Execute** — scheduled work, Autonomy Hours, capability routing, bounded Windows/files/browser when proven.
7. **Monitor** — task/mission status, receipts, cost, Morning Brief, incident status.
8. **Verify** — evidence, exact head, Green, PRS and scope of each result.
9. **Recover** — uncertain execution, replay, result-write failure, backup/restore, rollback.
10. **Update** — upgrade compatibility, migration, release notes, rollback.
11. **Troubleshoot** — evidence-first support and escalation.
12. **Administer** — users/teams/roles only where implemented; data/export/deletion; audit.
13. **Retire** — disconnect, uninstall, worker/project retirement and residual-data handling.

## Operator/developer layer
Architecture/governance; mission/worker contracts; authority/approval; scheduler; receipts; Green/PRS; security; capability onboarding; data classification; CI/release; legal/commercial gates; incident response.

## Publishing rules
Every capability-sensitive page should state applicable version/head/release, status class, prerequisites, protected actions, evidence source and revalidation trigger. PRODUCT DIRECTION and UNKNOWN must remain visibly distinct from implemented behavior.

## Progressive disclosure
Simple, Essentials and Tech Head may have different documentation entry points, but cross-link to the same canonical truth. Do not fork policy or authority documentation by mode.

## Freshness
SOP-DOC-001 controls review and staleness. A stale page cannot overrule fresher repository/runtime evidence.
# AgentOS Frontend Overseer — Cycle 012

**Date:** 2026-09-15 Australia/Brisbane  
**Canonical coordination:** `darrinbaldwindev/Overseer#49`  
**Status:** ACTIVE / AMBER  

## Fresh reconciliation

- `main`: `962cb3820b83506f9e6d90f50e003690dd85a8a1`.
- #101: `d91abaecf602d7ef223c4888f10fa9361677302e`.
- #104: `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`; AgentOS Tests #1268 SUCCESS.
- #111 began Cycle 012 at `3efea32bec11725b5b1d221190f0424fc5eb57dc`.
- #112: `d1645450a06d00c49a7a78f176e97b44b9eaa225`.

No SG-08 repair landed during this cycle. #104 remains controlling negative evidence for project-file mutation: durable `MUTATED_VERIFIED` can precede later ownership-loss detection. Mutation remains BLOCKED/UNKNOWN in frontend presentation.

## Runtime evidence consumed

Current #104 host probing is stronger than the prior frontend projection assumed.

`runtime/windows-worker-default-host-probe.mjs` resolves each required executable using fixed `where.exe`, canonicalizes the located path with `realpath`, and attempts a fixed version query. `runtime/windows-worker-host-probe.mjs` preserves these facts in `evaluation.tool_evidence` alongside Boolean tool availability.

`runtime/windows-powershell-adapter.mjs` independently resolves executable identity before execution and can compare execution-time path/version against caller-supplied expected executable evidence. This exists specifically to detect probe/execution identity mismatch.

Frontend consequence: Boolean `tools[powershell/git/npm] === true` is no longer sufficient evidence for a positive Windows-capable presentation. The canonical probe now has stronger executable-identity evidence, so frontend should consume it rather than discard it.

## Cycle 012 implementation

On #111, `runtime/basic-chat-readiness-projection.mjs` now requires, before `windowsHostCapability.state === capable`:

- Windows platform confirmed;
- PowerShell/Git/npm Boolean availability;
- `tool_evidence` for every required executable;
- each tool-evidence record says `available:true`;
- each tool-evidence record has a non-empty resolved executable path;
- workspace readable and writable.

If the Boolean tools are all positive but executable identity evidence is missing/incomplete, the projection now fails closed to:

`unknown / WINDOWS_EXECUTABLE_IDENTITY_EVIDENCE_REQUIRED`

It does not expose raw executable paths to the browser-facing projection. The path facts are consumed as trust evidence only.

Tests were updated to prove:

- Boolean-only positive capability no longer yields `capable`;
- complete path-backed `tool_evidence` does yield bounded `capable`;
- a missing path for one required tool fails closed;
- lifecycle/capability/physical acceptance still never upgrades project-file mutation readiness.

Final #111 exact head: `2bd30bc456fdd1f564d0c938b21ed17de001888e`.

AgentOS Tests #1282 (`34915285418`) completed SUCCESS on this exact head. The general test job, full suite, npm audit and Windows Basic Chat lifecycle all passed.

## Boundaries preserved

This change performs no command probing, execution, persistence, authority mutation, Green/PRS promotion or runtime enablement. It consumes caller-supplied canonical facts only.

The readiness adapter remains intentionally not live-wired because #101/#104 facts remain on separate draft lineages. Runtime/project integration still owns the future composed read-only readiness snapshot.

No merge, approval, ready transition, rebase, deploy, credential change, production write, unrestricted PowerShell, mutation enablement, synthetic authority/Green/PRS/recovery/readiness state, beta activation or overall GREEN.

## Next P0

1. Continue SG-08 change detection on #104.
2. Require runtime/project integration composition to preserve `tool_evidence`, not collapse it back to Boolean capability.
3. When a canonical composed readiness snapshot exists, wire it read-only to Basic Chat and present only bounded user-facing states.
4. Keep mutation readiness unknown until independent assurance has its own canonical source.
5. Continue Jack lifetime/expiry/revoke field detection and recovery producer detection.
6. Execute physical browser/mobile acceptance only against a trustworthy runnable draft target.

# Novice chat feedback repair

Base: current host repair fa0be202057ab18aeb8ffb485e7d35e6d728f30e.
Two interaction regressions reproduced stale COMPLETE status while a new send
was pending. Rendering now derives WORKING from the pending request until it
settles. Failed requests retain the typed draft; the composer stays present.
No layout change or authority change. Adds the missing npm run chat:local entry
point to the existing host CLI, so the documented launch action is discoverable.

Full local suite: 306 tests passed. UI regressions execute the actual client JS
against a minimal DOM/HTTP fixture; they do not verify CSS layout, keyboard resize
or browser behavior. Browser validation was attempted via agent-browser, but its
Chrome download failed certificate validation (UnknownIssuer). No certificate
checks were disabled and no inbound port was exposed to work around this.

A real browser and Windows novice acceptance remain open. Existing host lock,
scheduler-off default, Green and persistence behavior are preserved. This draft
is stacked on host #96, not a merged release candidate. No overall GREEN.

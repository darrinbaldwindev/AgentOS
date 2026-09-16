# Bounded receipt prerequisite handoff

Base: AgentOS #104 `bae44534d6d11b967fdac09bd734f8c073f23f2f`.
Candidate: `work/powershell-receipt-proof`; see its draft PR and Actions for exact committed head evidence.

## Verified implementation finding

`createCanonicalPowerShellReceiptGate` previously accepted any truthy recorder return. Nine adversarial recorder results, including explicit negative acknowledgement and a receipt with a different task ID, passed this gate and allowed the execution boundary to return VERIFIED. The new negatives fail on the original implementation and pass on the repaired implementation.

The existing adapter now rejects malformed/negative acknowledgements; if an artifact is supplied, requires canonical artifact type and delivery-derived ID plus the exact receipt payload; a positive acknowledgement cannot override contradictory artifact evidence. The claim guard retains the delivery after post-invocation failure, prevents blind replay and never invokes verification after receipt rejection. A positive integration uses the existing local persistence adapter, reloads state and compares exact receipt/correlation.

Explicit `{persisted:true}` remains a supported trusted-recorder acknowledgement. It is not independently verified durability. The caller must compose the canonical durable recorder; a fabricated acknowledgement or matching artifact does not itself prove a physical write. This patch makes no stronger claim.

## Evidence and limitations

The isolated nine-negative baseline run failed all nine as expected. Targeted repaired adapter/composition tests passed 28/28. Independent worker review additionally ran canonical receipt persistence tests, reporting 43/43 across reviewed suites, bound to adapter blob `ade7255ee8cd1598fe9547d82fb247bc7cbc23bb` and composition test blob `2049229bfb9906e3384a80dd416893418350e2d5`. Review is not Jess, Michael or PRS assurance.

An initial full-suite attempt ran from the parent directory and produced path-resolution failures; it is invalid acceptance evidence. The correct repository-root run and remote exact-head CI must be checked separately. No old/head-mismatched evidence promotes the candidate.

## Unresolved execution and ownership gates

W-AG-02 remains blocked: local-wake still stops at PowerShell eligibility. The current factory needs canonical context, actor/grant, consent, policy, risk, budget, human gate, receipt and verifier composition; the missing authenticated source must not be replaced by trusting task payloads.

SG-08 remains BLOCKED_STABLE. Historical exact-target PRS reproduction on `4c8bcc3bc2ad2041b0a1871d3004c1db23f3c091`, run `34931211386`, found normal and prepared-recovery false success. It is historical evidence for that target, not certification of this successor. Current writer code is unchanged: success can precede retirement ownership-loss detection; prepared success can be finalized before ownership acquisition. A repair must retain one kernel ownership fence throughout verification, publish/recovery, receipt and release. Extra pathname checks or releasing before writing the receipt do not satisfy this.

Next: exact-candidate CI; designated independent functional/security review; then eligible independent PRS only after prerequisites. Mutation and physical Windows acceptance remain blocked. No merge, approve, ready, rebase, deployment, credential/security-policy change, provider execution or production write.

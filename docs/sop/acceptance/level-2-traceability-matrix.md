# Level-2 SOP-to-Enforcement Traceability Matrix

**Document ID:** SOP-TRACE-001
**Status:** DRAFT / EXACT-HEAD-SCOPED
**Reconciled:** 2026-09-19 Cycle 018

This matrix maps requirements to current evidence. It does not create enforcement or assurance.

| Requirement | Current implementation/evidence | State | Current gap / next proof |
|---|---|---|---|
| Bounded governed Windows execution | AgentOS #104 exact head `6b32b2cad54eb58bbf8d30285c82af875a211686`; hosted exact-head CI recorded SUCCESS | TESTED for hosted bounded scope | physical owner-Windows acceptance; independent promotion gates |
| Continuous ownership through mutation -> verification -> success receipt -> release | AgentOS #125 exact head `203273761794cca8c7a9636d45eae0249a435a72` integrates POSIX directory-fd kernel fence through receipt/release; AgentOS Tests #2029 SUCCESS; independent PRS #30 run `35421118895` returned `NEGATIVE_CASES_PASS`, `defect_count:0` for the previously reproduced class | INDEPENDENTLY VERIFIED FOR BOUNDED SG-08 DEFECT CLASS ON #125 | identical-head Green/security review, integrated lineage reconciliation and any required physical Windows acceptance; do not transfer to #104 |
| Authenticated session/grant/consent evidence validation | AgentOS #129 exact head `ecd7fa33536fa963c51dbbcf381ee676e385c117` adds read-only typed durable evidence loader; AgentOS Tests #2037 SUCCESS; PRS #31 exact-head challenge reports `NEGATIVE_CASES_PASS`, `defect_count:0` | INDEPENDENTLY VERIFIED FOR LOADER/VALIDATOR CONTRACT ONLY | trusted canonical issuers/authenticator and governed integration are still absent |
| Authenticated actor + canonical grant provenance end-to-end | #104 admission still consumes injected actor/grant-shaped dependencies; #129 intentionally does not issue/authenticate evidence | BLOCKED_STABLE AT ISSUER/INTEGRATION BOUNDARY | identify/reuse canonical transport authenticator, grant issuer, consent issuer and governed evidence-ID selection without self-issuing authority |
| Admission -> local-wake compatibility | #104/#121 evidence shows target/acceptance criteria/consent mode need canonical provenance; #129 validator can validate those values when legitimately issued | BLOCKED_STABLE AT SOURCE/INTEGRATION BOUNDARY | wire only after legitimate canonical issuers/source exist; no fixture defaults |
| Receipt persistence contradiction rejection | AgentOS #120 exact head `a0b13feafdfc85a81ba5656c188118f7cf5effc9`; cross-platform exact-head tests recorded SUCCESS | TESTED | independent exact-head challenge; physical durability remains separate |
| Runtime-shell eligibility normalization | AgentOS #112 exact head `dbd7a18b845f6fa24c8b1c9a7e58825d949211fc`; Tests + Wake SUCCESS | TESTED for bounded eligibility scope | does not prove authority/mutation readiness |
| Duplicate/replay/correlation fail-closed behavior | #104 records bounded verified correlation/replay regression coverage | TESTED for cited paths | integrated exact-candidate challenge |
| Crash/result-write/recovery fail-closed behavior | #104/#120 recovery and receipt lineages; #125 closes the specifically reproduced SG-08 false-success class on its exact head | MAPPED / PARTIALLY INDEPENDENTLY VERIFIED | integrated golden-mission failure injections on one candidate lineage |
| Physical Windows Level-2 evidence | PRS #24 contract + PRS evaluator provenance requirements | BLOCKED / OWNER_REQUIRED | real owner machine only after upstream software/integration gates are eligible |
| Green independence | governance contract requires independent Green | MAPPED | identical-head Green evidence for integrated candidate; worker/CI/PRS slice alone cannot satisfy overall completion |
| PRS independence | PRS exact-head probes independently challenged #125 SG-08 and #129 loader slices | INDEPENDENTLY VERIFIED FOR CITED SLICES ONLY | completion-grade PRS must challenge the final integrated exact candidate, not compose slice PASSes into overall PASS |

## Enforcement points now evidenced
### SG-08 bounded repair slice
`runtime/project-file-writer.mjs` on #125 acquires the existing new POSIX kernel fence before metadata ownership, retires metadata ownership before the success receipt while retaining the kernel fence, persists the receipt, then releases the continuous fence last. `runtime/posix-kernel-fence.mjs` anchors `flock` to an already-open parent-directory descriptor so pathname replacement cannot create a second fence owner. This is POSIX-specific; Windows retains its existing handle path.

### SG-01/02 bounded evidence slice
`runtime/remote-authority-evidence-source.mjs` on #129 reads exact typed artifacts `remote.authenticated.session`, `remote.authority.grant`, and `remote.consent.decision`; checks correlation, active lifetime, revocation, actor/issuer/project/mission/request/delivery/objective/target/capability/consent fields; and exposes only read-only validation methods. It deliberately cannot authenticate, issue, create, update, delete or execute.

## Controlling interpretation
Slice evidence is exact-head and scope-bound. #125's bounded SG-08 result does not make #104 or an integrated future head PASS. #129's loader PASS does not create the missing trusted issuers. Workflow SUCCESS means the tests/probes executed successfully; it does not mean overall AgentOS GREEN or production promotion.

## Revised golden-mission closure order
1. preserve #125's bounded continuous-ownership repair semantics while reconciling into the eventual integrated candidate;
2. define/reuse trusted canonical session/grant/consent issuers and governed evidence selection; then wire #129-style validation into admission without accepting remote self-asserted truth;
3. close admission -> local-wake canonical field sourcing;
4. run integrated golden mission and all P0 failure injections on one exact candidate head;
5. obtain independent Green/security evidence and completion-grade PRS on that identical head;
6. only then perform owner-authorized physical Windows acceptance where required;
7. preserve DRAFT/unmerged/non-production state until separate promotion authority exists.

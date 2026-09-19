# SOP-IR-001 — AgentOS Incident Response

**Owner:** SOP Overseer  
**Status:** REVIEW REQUIRED  
**Version:** 0.1-draft  
**Technical enforcement:** must be verified per incident type

## Incident examples
Unexpected/unauthorised action, credential exposure, capability compromise, incorrect external communication, uncontrolled spend, data exposure, repeated/duplicate side effect, corrupted mission state, recovery failure, evidence conflict, or inability to establish execution/stop state.

## Procedure
1. **Identify and classify.** Record what is known, unknown, affected scope, mission/task IDs, capability/provider and time window.
2. **Contain.** Use canonical Stop/Pause/Revoke controls as appropriate; do not overstate containment until confirmed.
3. **Preserve evidence.** Preserve logs, receipts, state, correlation IDs, relevant versions/heads and target-state evidence. Do not rewrite history.
4. **Protect credentials/data.** If exposure is suspected, restrict further use and escalate to the credential/data owner for rotation/revocation decisions.
5. **Establish actual state.** Determine whether side effects occurred and whether execution is still active.
6. **Recover.** Use only the canonical verified recovery path. Avoid blind retries where duplicate side effects are possible.
7. **Verify.** Confirm containment/recovery independently where required.
8. **Assure.** Route completion-grade security/assurance evidence through Green/PRS according to current governance.
9. **Communicate.** Give affected users/admins precise known/unknown status; external/legal/regulatory communication requires appropriate authority and review.
10. **Correct and learn.** Record root cause when established, remediation, affected SOP dependencies, and revalidation tasks.

## Severity considerations
Severity should increase with irreversible/external side effects, credential/data exposure, authority bypass, financial action, broad scope, persistence, inability to stop, uncertain ownership, repeated execution, or evidence integrity failure.

## Protected actions
This SOP does not authorize public disclosure, regulatory filing, contacting third parties, credential rotation, production configuration changes, deployment, or destructive cleanup without the applicable authority.

## Legal review
Notification duties vary by jurisdiction and incident facts. LEGAL REVIEW REQUIRED for any conclusion about mandatory breach notification, regulator/customer notification, contractual notice, or statutory timeframe.
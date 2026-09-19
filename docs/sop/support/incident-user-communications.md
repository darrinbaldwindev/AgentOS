# SOP-SUPPORT-002 — Incident Escalation and User Communications

Status: DRAFT / REVIEW REQUIRED
Owner: SOP Overseer

## Core rule
Internal incident evidence, technical diagnosis and external user communication are separate authority domains. A worker may assemble facts and draft text; it may not send, publish, admit liability or make legal/regulatory promises without explicit authority.

## Communication packet
Record incident ID, affected service/version/scope, start/detection time, verified symptoms, user impact, containment state, workaround status, data/security/privacy flags, evidence timestamp, technical owner, communications owner, approved audience/channel, approved wording/version and next-update condition.

## Truth rules
Use VERIFIED facts; label estimates and UNKNOWNs. Do not state `resolved` until the defined user-impact condition is verified. `Fix committed`, `CI passed`, `service restarted` and `worker returned success` are narrower facts. Do not speculate about cause, compromise, data exposure or recovery time.

## Escalation
Security/privacy/safety/legal or material customer-impact signals route to their specialist process. Potential data breach does not become a notifiable breach solely from technical suspicion; legal/privacy assessment remains separate.

## Channels
Status page, email, in-product notice, support response and social post each require current audience/content authority. Scheduled/Autonomy Hours cannot independently authorize external incident messaging.

## Closure
Record restored behavior, verification evidence, residual risk, affected versions/users where known, follow-up owner and whether a post-incident review is required. User communication closure does not erase the incident record.
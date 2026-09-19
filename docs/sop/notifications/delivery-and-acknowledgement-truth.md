# Notification Delivery and Acknowledgement Truth Contract

**Document ID:** SOP-NOTIFY-001
**Status:** DRAFT / IMPLEMENTATION-DEPENDENT

## State model
`CREATED -> QUEUED -> HANDED_TO_CHANNEL -> DELIVERY_CONFIRMED? -> ACKNOWLEDGED?`

Each transition requires its own evidence. A send API returning success normally proves only the scope documented for that API; it does not automatically prove human receipt, reading, understanding or acceptance.

## Rules
- Never label queued/handed-off notifications as read.
- Never infer acknowledgement from silence.
- Retries require an idempotency/deduplication key where duplicate delivery would matter.
- Acknowledgement must bind actor, notification/message identity, time and acknowledgement semantics.
- Approval, contractual acceptance and consent require their dedicated controls; a notification ACK is not a substitute.
- Failed or uncertain delivery remains visible and may trigger governed escalation, not fabricated success.

## Protected communications
External sends remain subject to authority, recipient, content, privacy and channel controls. Scheduling a notification does not create permission to send it.

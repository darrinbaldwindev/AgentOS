# Communication Loop Test 005

Status: IN PROGRESS

Purpose: exercise the durable Overseer mailbox pattern for five sequential round trips.

Protocol:
1. ChatGPT Overseer writes work.
2. Project Overseer reads the latest work.
3. Project Overseer completes or advances the work and writes evidence back.
4. ChatGPT Overseer reads the response, verifies it, and writes the next work item if one remains.
5. Repeat until round 5.

Important: this artifact tests the durable state/sequence protocol. It does not by itself prove that an independent unattended Project Overseer process executed each step.

## Round 1

STATE: CHATGPT_WORK_ISSUED
WORK: Confirm mailbox can carry a bounded task and preserve mission identity.

# Portfolio Project Overseer Wake Rollout

**Status:** Active rollout plan — 2026-09-01

## Goal

Every canonical portfolio project must have a durable, scoped path for receiving a ChatGPT Overseer mission, waking its Project Overseer, inspecting the repository, acting within authority, verifying the result and returning a durable response.

## Rollout sequence

1. **Control contract:** use `docs/PROJECT_OVERSEER_WAKE_PROTOCOL.md`.
2. **Repository adapter:** use `.agentos/missions/*` and `.agentos/reports/*` as the durable project mailbox/report surface.
3. **Wake trigger:** connect the project's supported scheduler/event/CI trigger to a scoped mission validation step.
4. **Project execution:** Project Overseer/worker consumes only validated pending missions targeted to that repository.
5. **Evidence:** implementation and verification evidence are written back with the mission response.
6. **Upstream:** ChatGPT Overseer reconciles the response and determines the next mission.
7. **Assurance:** Green Agent observes the lifecycle; PRS independently assures evidence.

## Required project readiness states

- `ACCESSIBLE` — repository can be inspected through the control plane.
- `MISSION_READY` — durable inbox/response contract is present.
- `WAKE_READY` — an approved trigger can invoke mission validation.
- `EXECUTION_READY` — bounded authorised execution is connected.
- `VERIFICATION_READY` — deterministic verification/evidence is connected.
- `ASSURED` — independent PRS evidence exists.
- `GREEN` — all canonical gates pass.

No project may be marked GREEN merely because its repository is accessible.

## Safety boundary

The wake mechanism is not permission. Missions must pass authority/consent checks. Empty, malformed, duplicated, stale or unauthorised missions fail closed. Production credentials, billing, protected scheduler state and external provider activation remain explicit policy boundaries.

## Portfolio order

Roll out to all canonical repositories, starting with critical control-plane repositories (AgentOS and Overseer), then critical/high project repositories, then medium/informational repositories. The same protocol must be used across the portfolio; project-specific adapters may differ but must not create competing sources of truth.

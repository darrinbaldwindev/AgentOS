# AgentOS Shared Agent Records

This active repository uses the shared project records as the sole mutable autonomous queue and progress log.

| Record | Canonical shared location |
| --- | --- |
| Task backlog | `/home/ubuntu/projects/agentos-9f48286b/AUTONOMOUS_TASK_BACKLOG.md` |
| Progress log | `/home/ubuntu/projects/agentos-9f48286b/AUTONOMOUS_TASK_PROGRESS_LOG.md` |
| Role protocol | `/home/ubuntu/projects/agentos-9f48286b/AGENTOS_AUTONOMOUS_RECORD_SYNC_PROTOCOL.md` |
| Autonomous prompt | `/home/ubuntu/projects/agentos-9f48286b/AGENTOS_AUTONOMOUS_LAUNCH_PROMPT.md` |
| Task Discovery prompt | `/home/ubuntu/projects/agentos-9f48286b/AGENTOS_TASK_DISCOVERY_LAUNCH_PROMPT.md` |

AgentOS Task Discovery and AgentOS Autonomous both operate against `/home/ubuntu/agentos-affiliate-dashboard` and these shared canonical records. Do not create or update a separate repository-local backlog or progress-log mirror. The old isolated worktree is historical reference only.

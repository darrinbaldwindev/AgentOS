export const validProjectOverseerResponse = {
  mission_id: 'MISSION-LOCAL-001',
  status: 'COMPLETED',
  started_at: '2026-09-01T00:00:00Z',
  completed_at: '2026-09-01T00:01:00Z',
  repository_commit: 'abcdef1234567',
  inspection_summary: 'Inspected repository and reconciled current work.',
  work_claimed: ['inspect'],
  work_implemented: ['validated'],
  verification: ['deterministic test passed'],
  evidence: ['commit:abcdef1234567'],
  blockers: [],
  escalations: [],
  next_action: 'await upstream reconciliation'
};

export const invalidGreenSelfReport = {
  ...validProjectOverseerResponse,
  mission_id: 'MISSION-LOCAL-002',
  status: 'GREEN'
};

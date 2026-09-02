// MISSION-050: additive SQLite budget ledger for bounded mission execution.
// This is a budget ledger only; it is not a second mission/task database.

import { DatabaseSync } from 'node:sqlite';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS mission_budget_reservations (
  reservation_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  mission_id TEXT NOT NULL,
  limit_units INTEGER NOT NULL CHECK (limit_units > 0),
  reserved_units INTEGER NOT NULL CHECK (reserved_units >= 0),
  actual_units INTEGER,
  status TEXT NOT NULL CHECK (status IN ('RESERVED','RECONCILED','RELEASED','FAILED')),
  created_at TEXT NOT NULL,
  reconciled_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_mission_budget_project ON mission_budget_reservations(project_id, status);
`;

export async function createMissionBudget({ filePath }) {
  if (!filePath) throw new TypeError('filePath is required');
  const target = resolve(filePath);
  await mkdir(dirname(target), { recursive: true });
  const db = new DatabaseSync(target);
  db.exec(SCHEMA);

  function reserve({ project_id, mission_id, limit_units = 1 }) {
    if (!project_id || !mission_id) throw new Error('BUDGET_IDENTITY_REQUIRED');
    if (!Number.isInteger(limit_units) || limit_units < 1) throw new Error('BUDGET_LIMIT_INVALID');
    const reservation_id = `budget-${randomUUID()}`;
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO mission_budget_reservations
      (reservation_id, project_id, mission_id, limit_units, reserved_units, actual_units, status, created_at)
      VALUES (?, ?, ?, ?, ?, NULL, 'RESERVED', ?)`)
      .run(reservation_id, project_id, mission_id, limit_units, limit_units, now);
    return { reservation_id, project_id, mission_id, limit_units, reserved_units: limit_units, status: 'RESERVED' };
  }

  function reconcile({ reservation_id, actual_units = 0 }) {
    if (!reservation_id) throw new Error('BUDGET_RESERVATION_REQUIRED');
    if (!Number.isInteger(actual_units) || actual_units < 0) throw new Error('BUDGET_ACTUAL_INVALID');
    const current = db.prepare('SELECT * FROM mission_budget_reservations WHERE reservation_id = ?').get(reservation_id);
    if (!current) throw new Error('BUDGET_RESERVATION_NOT_FOUND');
    if (current.status !== 'RESERVED') throw new Error(`BUDGET_RESERVATION_NOT_ACTIVE: ${current.status}`);
    if (actual_units > current.limit_units) throw new Error('BUDGET_LIMIT_EXCEEDED');
    const now = new Date().toISOString();
    db.prepare(`UPDATE mission_budget_reservations
      SET actual_units = ?, status = 'RECONCILED', reconciled_at = ?
      WHERE reservation_id = ?`).run(actual_units, now, reservation_id);
    return { ...current, actual_units, status: 'RECONCILED', reconciled_at: now };
  }

  function get(reservation_id) {
    return db.prepare('SELECT * FROM mission_budget_reservations WHERE reservation_id = ?').get(reservation_id) ?? null;
  }

  return Object.freeze({ reserve, reconcile, get, filePath: target, close: () => db.close() });
}

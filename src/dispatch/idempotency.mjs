export class IdempotencyStore {
  #completed = new Map();

  begin(taskId, now = Date.now()) {
    if (!taskId) return { accepted: false, reason: 'invalid_task_id' };
    const existing = this.#completed.get(taskId);
    if (existing) return { accepted: false, reason: 'already_completed', record: { ...existing } };
    return { accepted: true, task_id: taskId, started_at: now };
  }

  complete(taskId, response, now = Date.now()) {
    if (!taskId || !response) return { completed: false, reason: 'invalid_completion' };
    if (this.#completed.has(taskId)) return { completed: false, reason: 'already_completed', record: { ...this.#completed.get(taskId) } };
    const record = { task_id: taskId, completed_at: now, response: structuredClone(response) };
    this.#completed.set(taskId, record);
    return { completed: true, record: structuredClone(record) };
  }

  get(taskId) {
    const record = this.#completed.get(taskId);
    return record ? structuredClone(record) : null;
  }
}

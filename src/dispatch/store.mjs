import { validateDispatchTask } from './dispatch.mjs';

export class MemoryDispatchStore {
  #tasks = new Map();

  constructor(tasks = []) {
    for (const task of tasks) {
      validateDispatchTask(task, { issuer: task.issuer, target: task.target });
      if (this.#tasks.has(task.task_id)) throw new Error(`duplicate task_id: ${task.task_id}`);
      this.#tasks.set(task.task_id, structuredClone(task));
    }
  }

  list() {
    return [...this.#tasks.values()].map((task) => structuredClone(task));
  }

  get(taskId) {
    const task = this.#tasks.get(taskId);
    return task ? structuredClone(task) : null;
  }

  replace(task) {
    if (!this.#tasks.has(task.task_id)) throw new Error(`unknown task_id: ${task.task_id}`);
    this.#tasks.set(task.task_id, structuredClone(task));
    return structuredClone(task);
  }
}

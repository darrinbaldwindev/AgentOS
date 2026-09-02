// LOCAL-RUNTIME-005: durable adapter from the canonical dispatch runner to local persistence.
// This is an adapter, not a second dispatch store or runtime.

export function createLocalDispatchStore(persistence) {
  if (!persistence?.list || !persistence?.get || !persistence?.update) {
    throw new TypeError('local persistence interface is required');
  }

  async function list() {
    const artifacts = await persistence.list('artifact');
    return Object.freeze(artifacts
      .filter((artifact) => artifact.artifactType === 'dispatch.task')
      .map((artifact) => ({
        ...structuredClone(artifact.payload),
        dispatch_sha: artifact.updatedAt ?? artifact.createdAt ?? null,
      })));
  }

  async function writeTask(task, expectedSha = null) {
    const current = await persistence.get('artifact', task.task_id);
    if (!current || current.artifactType !== 'dispatch.task') {
      return { written: false, error: `dispatch task not found: ${task.task_id}` };
    }

    const currentSha = current.updatedAt ?? current.createdAt ?? null;
    if (expectedSha !== null && currentSha !== expectedSha) {
      return {
        written: false,
        reason: 'version_conflict',
        current: { task: structuredClone(current.payload), sha: currentSha },
      };
    }

    const updated = await persistence.update('artifact', task.task_id, {
      payload: structuredClone(task),
    });
    return {
      written: true,
      sha: updated.updatedAt ?? updated.createdAt ?? null,
    };
  }

  return Object.freeze({ list, writeTask });
}

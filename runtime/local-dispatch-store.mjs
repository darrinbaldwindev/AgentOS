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
        dispatch_sha: artifact.revision ?? artifact.updatedAt ?? artifact.createdAt ?? null,
      })));
  }

  async function writeTask(task, expectedSha = null) {
    const current = await persistence.get('artifact', task.task_id);
    if (!current || current.artifactType !== 'dispatch.task') {
      return { written: false, error: `dispatch task not found: ${task.task_id}` };
    }

    const currentSha = current.revision ?? current.updatedAt ?? current.createdAt ?? null;
    if (expectedSha !== null && currentSha !== expectedSha) {
      return {
        written: false,
        reason: 'version_conflict',
        current: { task: structuredClone(current.payload), sha: currentSha },
      };
    }

    let updated;
    try {
      updated = await persistence.update('artifact', task.task_id, { payload: structuredClone(task) }, currentSha);
    } catch (error) {
      if (error.message !== 'LOCAL_STATE_VERSION_CONFLICT') throw error;
      const latest = await persistence.get('artifact', task.task_id);
      return { written: false, reason: 'version_conflict', current: { task: latest.payload, sha: latest.revision ?? latest.updatedAt } };
    }
    return {
      written: true,
      sha: updated.revision ?? updated.updatedAt ?? updated.createdAt ?? null,
    };
  }

  return Object.freeze({ list, writeTask });
}

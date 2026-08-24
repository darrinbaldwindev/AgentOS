// CORE-002: first user-task pipeline. Overseer remains the identity while the
// selected worker/model is an execution detail.

export function createTaskPipeline({ session }) {
  if (!session || typeof session.send !== 'function') throw new TypeError('session.send is required');

  async function handle({ missionId, message, requirements = {} }) {
    if (!missionId || !message) throw new TypeError('missionId and message are required');
    const task = {
      requirements,
      freePreferred: true,
      source: 'overseer-user-chat',
    };
    return session.send({ missionId, message, task });
  }

  return Object.freeze({ handle });
}

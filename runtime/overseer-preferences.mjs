export const DEFAULT_OVERSEER_PREFERENCES = Object.freeze({
  qualityRequired: 0.9,
  priority: 'balanced',
});

export function resolveOverseerTask(task = {}, preferences = DEFAULT_OVERSEER_PREFERENCES) {
  const priority = task.preference ?? preferences.priority;
  if (!['cost', 'speed', 'balanced'].includes(priority)) throw new Error('invalid routing preference');
  const qualityRequired = task.quality?.required ?? preferences.qualityRequired;
  if (!Number.isFinite(qualityRequired) || qualityRequired < 0 || qualityRequired > 1) throw new Error('qualityRequired must be between 0 and 1');
  return {
    ...task,
    preference: priority,
    quality: { ...(task.quality ?? {}), required: qualityRequired },
  };
}

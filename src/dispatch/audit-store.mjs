export function createAuditStore({ readEvents, appendEvent }) {
  if (typeof readEvents !== 'function' || typeof appendEvent !== 'function') {
    throw new Error('readEvents and appendEvent are required');
  }

  return {
    async list() {
      return readEvents();
    },

    async record(event) {
      const events = await readEvents();
      const duplicate = events.find(existing => existing.event_id === event.event_id);
      if (duplicate) return { written: false, duplicate: true, event: duplicate };
      const result = await appendEvent(event);
      return { written: true, result };
    },
  };
}

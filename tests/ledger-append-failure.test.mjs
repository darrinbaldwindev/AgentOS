import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { wakeLocal } from '../runtime/local-wake.mjs';
import {
  appendMissionRecord,
  __testOnlySetAppendMissionRecord,
} from '../runtime/mission-ledger.mjs';

describe('Mission C true post-Green ledger append failure', () => {
  it('N: Green PASS then mandatory completion ledger failure → no durable COMPLETED', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-ledfail-'));
    await installLocal({ root });
    let greenDispositionSeen = false;

    const wrapper = async (args) => {
      const actions = args.record?.actions || [];
      if (args.record?.outcome === 'green_verified' && actions.includes('GREEN_DISPOSITION')) {
        greenDispositionSeen = true;
      }
      if (actions.includes('COMPLETED')) {
        throw new Error('FORCED_LEDGER_APPEND_FAILURE');
      }
      __testOnlySetAppendMissionRecord(null);
      try {
        return await appendMissionRecord(args);
      } finally {
        __testOnlySetAppendMissionRecord(wrapper);
      }
    };
    __testOnlySetAppendMissionRecord(wrapper);

    try {
      await assert.rejects(
        () => wakeLocal({ root, objective: 'force ledger fail after green' }),
        /FORCED_LEDGER_APPEND_FAILURE/,
      );
      assert.equal(greenDispositionSeen, true, 'Green disposition ledger must occur before failure');

      const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
      const responses = Object.values(state.records.artifact || {}).filter(
        (a) => a.artifactType === 'project-overseer.response',
      );
      const completed = responses.filter((a) => a.payload?.status === 'COMPLETED');
      assert.equal(completed.length, 0, 'no final COMPLETED after ledger failure');
      const dispositions = Object.values(state.records.artifact || {}).filter(
        (a) => a.artifactType === 'green.disposition',
      );
      assert.ok(dispositions.length >= 1, 'Green disposition evidence remains');
    } finally {
      __testOnlySetAppendMissionRecord(null);
      await rm(root, { recursive: true, force: true });
    }
  });
});

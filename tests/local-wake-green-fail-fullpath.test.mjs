import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { __testOnlyWakeLocal as wakeLocal } from '../runtime/local-wake.mjs';

async function makeInstall() {
  const root = await mkdtemp(join(tmpdir(), 'agentos-gfail-'));
  await installLocal({ root });
  return root;
}

describe('Mission B full-path Green FAIL and ledger failure', () => {
  it('FULL-PATH Green FAIL: wakeLocal leaves zero COMPLETED response artifacts', async () => {
    const root = await makeInstall();
    try {
      const forcedFail = () =>
        Object.freeze({
          disposition: 'fail',
          task_status: 'incomplete',
          advance_to_prs: false,
          failures: Object.freeze(['forced_fullpath_fail']),
          production_promotion_allowed: false,
          task_id: 'forced',
        });
      const result = await wakeLocal({
        root,
        objective: 'forced green fail cycle',
        greenEvaluate: forcedFail,
      });
      assert.notEqual(result.status, 'COMPLETED');
      assert.equal(result.status, 'INCOMPLETE');

      const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
      const responses = Object.values(state.records.artifact).filter(
        (a) => a.artifactType === 'project-overseer.response',
      );
      const completed = responses.filter((a) => a.payload?.status === 'COMPLETED');
      assert.equal(completed.length, 0, 'must not persist final COMPLETED when Green fails');
      const incomplete = responses.filter((a) => a.payload?.status === 'INCOMPLETE' || a.payload?.status === 'AWAITING_GREEN');
      assert.ok(incomplete.length >= 1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('LEDGER FAILURE before COMPLETED: throwing greenEvaluate after worker still no COMPLETED', async () => {
    const root = await makeInstall();
    try {
      const boom = () => {
        throw new Error('forced_green_exception');
      };
      const result = await wakeLocal({
        root,
        objective: 'forced green throw',
        greenEvaluate: boom,
      });
      assert.equal(result.status, 'GREEN_BLOCKED');
      const state = JSON.parse(await readFile(join(root, DEFAULT_CONFIG.stateFile), 'utf8'));
      const completed = Object.values(state.records.artifact).filter(
        (a) => a.artifactType === 'project-overseer.response' && a.payload?.status === 'COMPLETED',
      );
      assert.equal(completed.length, 0);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});

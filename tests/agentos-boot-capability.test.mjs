import test from 'node:test';
import assert from 'node:assert/strict';
import { bootAgentOS, assertBootCapabilities } from '../runtime/agentos-boot.mjs';

function createPersistence() {
  const records = new Map();
  return {
    async get(type, id) { return records.get(`${type}:${id}`) ?? null; },
    async create(type, value) {
      const id = value.id ?? `${type}:${records.size + 1}`;
      const record = Object.freeze({ ...value, id });
      records.set(`${type}:${id}`, record);
      return record;
    },
    async update(type, id, patch) {
      const key = `${type}:${id}`;
      const current = records.get(key);
      if (!current) throw new Error('missing record');
      const record = Object.freeze({ ...current, ...patch });
      records.set(key, record);
      return record;
    },
  };
}

test('boot capability assertion rejects claimed eligibility without canonical results', () => {
  assert.throws(
    () => assertBootCapabilities({ evaluation: { eligible: true } }),
    (error) => error.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
  );
});

test('boot capability assertion normalizes aliases and evaluates canonical evidence', () => {
  const evaluation = assertBootCapabilities({
    results: {
      githubRead: true,
      continuityRead: true,
      handoff: true,
      workspaceRead: true,
      workspaceWrite: true,
    },
  });
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.results['github.read'], true);
  assert.equal(evaluation.localPreferred, true);
});

test('boot fails before model routing when capability evidence is absent', async () => {
  let modelRegistryCalls = 0;
  const persistence = createPersistence();

  await assert.rejects(
    () => bootAgentOS({
      persistence,
      continuityCheck: async () => ({ ok: true }),
      capabilityProbe: { probe: async () => ({ evaluation: { eligible: true } }) },
      modelRegistry: { listAvailable: async () => { modelRegistryCalls += 1; return []; } },
      now: () => '2026-09-14T08:20:00.000Z',
    }),
    (error) => error.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
  );

  assert.equal(modelRegistryCalls, 0);
});

test('unclassified DRY_RUN eligible claim is not accepted as compatibility evidence', () => {
  assert.throws(
    () => assertBootCapabilities({ mode: 'DRY_RUN', evaluation: { eligible: true } }),
    (error) => error.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
  );
});

test('legacy fixture classification cannot claim physical capability', () => {
  assert.throws(
    () => assertBootCapabilities({
      mode: 'DRY_RUN',
      classification: 'legacy-dry-run-fixture',
      physical: true,
      evaluation: { eligible: true },
    }),
    (error) => error.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
  );
});

test('near-match legacy fixture classification cannot bypass canonical evidence', () => {
  assert.throws(
    () => assertBootCapabilities({
      mode: 'DRY_RUN',
      classification: 'legacy-dry-run',
      physical: false,
      evaluation: { eligible: true },
    }),
    (error) => error.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
  );
});

test('nested mode cannot convert a bare eligible claim into compatibility evidence', () => {
  assert.throws(
    () => assertBootCapabilities({
      classification: 'legacy-dry-run-fixture',
      physical: false,
      evaluation: { eligible: true, mode: 'DRY_RUN' },
    }),
    (error) => error.code === 'OVERSEER_CAPABILITY_EVIDENCE_REQUIRED',
  );
});

test('explicitly classified legacy DRY_RUN fixture cannot imply local preference', () => {
  const evaluation = assertBootCapabilities({
    mode: 'DRY_RUN',
    classification: 'legacy-dry-run-fixture',
    physical: false,
    evaluation: { eligible: true },
  });
  assert.equal(evaluation.eligible, true);
  assert.equal(evaluation.evidenceClass, 'legacy-dry-run-fixture');
  assert.equal(evaluation.localPreferred, false);
  assert.deepEqual(evaluation.results, {});
});

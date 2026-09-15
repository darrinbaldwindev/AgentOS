import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installLocal, DEFAULT_CONFIG } from '../scripts/install-local.mjs';
import { doctorLocal } from '../scripts/doctor-local.mjs';
import { createLocalChat, USER_STATES } from '../runtime/local-chat.mjs';
import { safeRuntimeConfig } from '../runtime/local-wake.mjs';

describe('Mission C-Repair: V1 first-run scheduler / Basic Chat coherence', () => {
  it('fresh installLocal writes scheduler.enabled === false', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-firstrun-'));
    try {
      const result = await installLocal({ root });
      assert.equal(result.created, true);
      const config = JSON.parse(await readFile(join(root, 'config.json'), 'utf8'));
      assert.equal(config.scheduler.enabled, false);
      assert.equal(DEFAULT_CONFIG.scheduler.enabled, false);
      assert.equal(config.mode, 'DRY_RUN');
      assert.equal(config.autonomyEnabled, false);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('doctor is GREEN on fresh install with scheduler OFF', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-doc-'));
    try {
      await installLocal({ root });
      const result = await doctorLocal({ root });
      assert.equal(result.status, 'GREEN', JSON.stringify(result.checks, null, 2));
      const sched = result.checks.find((c) => c.name === 'scheduler-config');
      assert.equal(sched?.status, 'PASS');
      assert.match(String(sched?.detail), /safe default|chat-ready|enabled=false/i);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('first Basic Chat send on fresh install does not fail scheduler guard', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-chat-first-'));
    try {
      await installLocal({ root });
      const chat = await createLocalChat({ root });
      try {
        const snap = await chat.send('first governed chat on fresh install');
        assert.ok(
          [USER_STATES.COMPLETE, USER_STATES.BLOCKED].includes(snap.status),
          `unexpected status ${snap.status}`,
        );
        assert.notEqual(snap.status, USER_STATES.BLOCKED, 'should not block on scheduler after fresh install');
        assert.ok(snap.history.some((m) => m.role === 'user'));
      } finally {
        await chat.close();
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('reinstall without force preserves explicit scheduler-enabled choice', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-preserve-'));
    try {
      await installLocal({ root });
      const configPath = join(root, 'config.json');
      const config = JSON.parse(await readFile(configPath, 'utf8'));
      config.scheduler = { enabled: true, cadenceMinutes: 5 };
      await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

      const second = await installLocal({ root });
      assert.equal(second.created, false);
      const after = JSON.parse(await readFile(configPath, 'utf8'));
      assert.equal(after.scheduler.enabled, true, 'must not silently reset user scheduler choice');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('Basic Chat still fails closed when scheduler deliberately enabled', async () => {
    const root = await mkdtemp(join(tmpdir(), 'agentos-sched-on-'));
    try {
      await installLocal({ root });
      const configPath = join(root, 'config.json');
      const config = JSON.parse(await readFile(configPath, 'utf8'));
      config.scheduler = { enabled: true, cadenceMinutes: 5 };
      await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

      const chat = await createLocalChat({ root });
      try {
        await assert.rejects(
          () => chat.send('should fail closed'),
          /LOCAL_WAKE_REQUIRES_SCHEDULER_DISABLED|scheduled checks turned off/i,
        );
      } finally {
        await chat.close();
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('scheduler enabled does not grant autonomy', () => {
    assert.throws(
      () =>
        safeRuntimeConfig(
          { schemaVersion: 1, mode: 'DRY_RUN', autonomyEnabled: true, scheduler: { enabled: true } },
          { requireSchedulerDisabled: false },
        ),
      /LOCAL_WAKE_REQUIRES_SAFE_MODE/,
    );
  });
});

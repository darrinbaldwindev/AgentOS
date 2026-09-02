#!/usr/bin/env node
// LOCAL-RUNTIME-004: safe installed boot entrypoint.
// Boot is local-only and DRY_RUN by default; it does not execute external AI work.

import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { DEFAULT_CONFIG, resolveInstallRoot } from './install-local.mjs';
import { createLocalPersistence } from '../runtime/local-persistence.mjs';
import { bootAgentOS } from '../runtime/agentos-boot.mjs';

export async function bootLocal({ root = resolveInstallRoot() } = {}) {
  const installRoot = resolve(root);
  const configPath = join(installRoot, 'config.json');
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  if (config.schemaVersion !== DEFAULT_CONFIG.schemaVersion) throw new Error('CONFIG_SCHEMA_INVALID');
  if (config.autonomyEnabled !== false || config.mode !== 'DRY_RUN') throw new Error('LOCAL_BOOT_REQUIRES_SAFE_MODE');

  const persistence = await createLocalPersistence({ filePath: join(installRoot, config.stateFile) });
  const result = await bootAgentOS({
    persistence,
    continuityCheck: async () => ({ ok: true }),
    capabilityProbe: { probe: async () => ({ evaluation: { eligible: true, mode: 'local-dry-run' } }) },
    modelRegistry: { listAvailable: async () => [] },
    now: () => new Date().toISOString(),
  });
  return Object.freeze({ ...result, installRoot, mode: config.mode, autonomyEnabled: config.autonomyEnabled });
}

async function main() {
  try {
    console.log(JSON.stringify(await bootLocal({ root: process.env.AGENTOS_HOME || join(homedir(), '.agentos') }), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: 'FAILED', code: error.message }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && process.argv[1].endsWith('boot-local.mjs')) await main();

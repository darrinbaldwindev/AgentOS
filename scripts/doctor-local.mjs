#!/usr/bin/env node
// LOCAL-INSTALL-002: deterministic local installation health check.
// Read-only: never changes configuration, authority, credentials or scheduler state.

import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { MIN_NODE_MAJOR, DEFAULT_CONFIG, resolveInstallRoot } from './install-local.mjs';

export async function doctorLocal({ root = resolveInstallRoot() } = {}) {
  const checks = [];
  const check = (name, ok, detail) => checks.push({ name, status: ok ? 'PASS' : 'FAIL', detail });

  const major = Number.parseInt(process.versions.node.split('.')[0], 10);
  check('node-version', major >= MIN_NODE_MAJOR, `requires Node ${MIN_NODE_MAJOR}+, found ${process.versions.node}`);

  const configPath = join(root, 'config.json');
  const statePath = join(root, DEFAULT_CONFIG.stateFile);
  const workspacePath = join(root, DEFAULT_CONFIG.workspaceRoot);

  let config = null;
  let state = null;
  try {
    config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    check('config-readable', true, configPath);
  } catch (error) {
    check('config-readable', false, `${error.code ?? 'CONFIG_READ_FAILED'}: ${error.message}`);
  }

  try {
    state = JSON.parse(await fs.readFile(statePath, 'utf8'));
    check('state-readable', true, statePath);
  } catch (error) {
    check('state-readable', false, `${error.code ?? 'STATE_READ_FAILED'}: ${error.message}`);
  }

  try {
    const stat = await fs.stat(workspacePath);
    check('workspace-directory', stat.isDirectory(), workspacePath);
  } catch (error) {
    check('workspace-directory', false, `${error.code ?? 'WORKSPACE_READ_FAILED'}: ${error.message}`);
  }

  if (config) {
    check('config-schema', config.schemaVersion === DEFAULT_CONFIG.schemaVersion, `schemaVersion=${config.schemaVersion}`);
    check('safe-autonomy-default', config.mode === 'DRY_RUN' && config.autonomyEnabled === false,
      `mode=${config.mode}, autonomyEnabled=${config.autonomyEnabled}`);
    check('scheduler-config', config.scheduler?.enabled === true && config.scheduler?.cadenceMinutes === 5,
      `enabled=${config.scheduler?.enabled}, cadenceMinutes=${config.scheduler?.cadenceMinutes}`);
    check('github-canonical-sync', config.github?.canonicalSync === true, `canonicalSync=${config.github?.canonicalSync}`);
  }

  if (state) check('state-schema', state.schemaVersion === 1, `schemaVersion=${state.schemaVersion}`);

  const failed = checks.filter(({ status }) => status === 'FAIL');
  return Object.freeze({
    status: failed.length ? 'FAILED' : 'GREEN',
    root: resolve(root),
    checks,
    failedChecks: failed.length,
    checkedAt: new Date().toISOString(),
  });
}

async function main() {
  const result = await doctorLocal({ root: process.env.AGENTOS_HOME || resolve(join(homedir(), '.agentos')) });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'GREEN') process.exitCode = 1;
}

if (process.argv[1] && process.argv[1].endsWith('doctor-local.mjs')) await main();

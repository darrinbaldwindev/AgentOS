#!/usr/bin/env node
// LOCAL-INSTALL-001: dependency-free local bootstrap for AgentOS.
// Creates a user-local control directory and writes a safe default config.
// It never enables autonomous execution and never stores credentials.

import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const MIN_NODE_MAJOR = 22;
export const DEFAULT_CONFIG = Object.freeze({
  schemaVersion: 1,
  mode: 'DRY_RUN',
  autonomyEnabled: false,
  workspaceRoot: 'workspaces',
  stateFile: 'state/agentos.json',
  scheduler: Object.freeze({ enabled: true, cadenceMinutes: 5 }),
  github: Object.freeze({ canonicalSync: true }),
});

export function assertSupportedNode(version = process.versions.node) {
  const major = Number.parseInt(String(version).split('.')[0], 10);
  if (!Number.isInteger(major) || major < MIN_NODE_MAJOR) {
    throw new Error(`NODE_VERSION_UNSUPPORTED: AgentOS local runtime requires Node.js ${MIN_NODE_MAJOR}+ (found ${version})`);
  }
}

export function resolveInstallRoot(env = process.env, platformHome = homedir()) {
  return resolve(env.AGENTOS_HOME || join(platformHome, '.agentos'));
}

export async function installLocal({ root = resolveInstallRoot(), force = false } = {}) {
  assertSupportedNode();
  await fs.mkdir(root, { recursive: true });
  const workspaceRoot = join(root, DEFAULT_CONFIG.workspaceRoot);
  const stateDir = join(root, 'state');
  await fs.mkdir(workspaceRoot, { recursive: true });
  await fs.mkdir(stateDir, { recursive: true });

  const configPath = join(root, 'config.json');
  const statePath = join(root, DEFAULT_CONFIG.stateFile);
  try {
    await fs.access(configPath);
    if (!force) return { root, configPath, statePath, created: false };
  } catch {}

  await fs.writeFile(configPath, `${JSON.stringify(DEFAULT_CONFIG, null, 2)}\n`, { mode: 0o600 });
  try { await fs.chmod(configPath, 0o600); } catch {}
  try { await fs.access(statePath); } catch {
    await fs.writeFile(statePath, JSON.stringify({ schemaVersion: 1, installedAt: new Date().toISOString(), runs: [], events: [] }, null, 2) + '\n', { mode: 0o600 });
  }
  return { root, configPath, statePath, created: true };
}

async function main() {
  const result = await installLocal({ force: process.argv.includes('--force') });
  console.log(JSON.stringify({
    status: 'installed',
    created: result.created,
    root: result.root,
    configPath: result.configPath,
    statePath: result.statePath,
    mode: DEFAULT_CONFIG.mode,
    autonomyEnabled: DEFAULT_CONFIG.autonomyEnabled,
  }, null, 2));
}

if (process.argv[1] && process.argv[1].endsWith('install-local.mjs')) await main();

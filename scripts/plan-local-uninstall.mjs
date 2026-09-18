import { lstat, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_CONFIG, resolveInstallRoot } from './install-local.mjs';

async function requireLocalArtifact(name, path) {
  let stat;
  try {
    stat = await lstat(path);
  } catch (error) {
    throw new Error(`LOCAL_UNINSTALL_PREFLIGHT_FAILED: ${name} unavailable (${error.code ?? 'LSTAT_FAILED'}: ${error.message})`);
  }
  if (stat.isSymbolicLink()) {
    throw new Error(`LOCAL_UNINSTALL_PREFLIGHT_FAILED: ${name} is redirected (${path})`);
  }
}

export async function planLocalUninstall({ root = resolveInstallRoot() } = {}) {
  const installRoot = resolve(root);
  const configPath = join(installRoot, 'config.json');
  const statePath = join(installRoot, DEFAULT_CONFIG.stateFile);
  const workspacePath = join(installRoot, DEFAULT_CONFIG.workspaceRoot);

  await requireLocalArtifact('config', configPath);
  await requireLocalArtifact('canonical state', statePath);
  await requireLocalArtifact('workspace', workspacePath);

  let config;
  try {
    config = JSON.parse(await readFile(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`LOCAL_UNINSTALL_PREFLIGHT_FAILED: config unreadable (${error.message})`);
  }

  if (config.stateFile !== DEFAULT_CONFIG.stateFile || config.workspaceRoot !== DEFAULT_CONFIG.workspaceRoot) {
    throw new Error('LOCAL_UNINSTALL_PREFLIGHT_FAILED: installed paths drift from canonical local defaults');
  }
  if (config.mode !== 'DRY_RUN' || config.autonomyEnabled !== false || config.scheduler?.enabled !== false) {
    throw new Error('LOCAL_UNINSTALL_PREFLIGHT_FAILED: installation is not in the safe disabled pre-acceptance state');
  }

  return Object.freeze({
    status: 'PLAN_ONLY',
    root: installRoot,
    mutationPerformed: false,
    ownerGateRequired: true,
    artifacts: Object.freeze([configPath, statePath, workspacePath]),
    nextAction: 'Owner-authorized uninstall implementation must separately stop/disable any installed scheduler, preserve evidence, and explicitly approve deletion.',
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  planLocalUninstall().then((plan) => {
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
  }).catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}

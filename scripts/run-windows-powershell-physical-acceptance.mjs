#!/usr/bin/env node
// Supervised owner-run physical Windows acceptance CLI.
// This command exercises only the existing bounded PowerShell adapter.
// It does not enable scheduler/local-wake execution or production autonomy.

import { promises as fs } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { runWindowsPowerShellPhysicalAcceptance } from '../runtime/windows-powershell-physical-acceptance.mjs';

function usage() {
  return [
    'Usage:',
    '  node scripts/run-windows-powershell-physical-acceptance.mjs',
    '    --root <AgentOS repo root>',
    '    --expected-head <40-char git sha>',
    '    --acknowledge-physical-run',
    '    [--include-dev-execution --acknowledge-dev-execution]',
    '    [--output <json evidence path>]',
    '',
    'Default acceptance operations are read-only: repo.status, process.list, service.list.',
    'Development acceptance adds only test.run and requires a second acknowledgement.',
    'No scheduler/local-wake runtime enablement occurs.',
  ].join('\n');
}

function parseArgs(argv) {
  const out = {
    root: null,
    expectedHead: null,
    acknowledgePhysicalRun: false,
    includeDevExecution: false,
    acknowledgeDevExecution: false,
    output: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') out.root = argv[++index] ?? null;
    else if (arg === '--expected-head') out.expectedHead = argv[++index] ?? null;
    else if (arg === '--acknowledge-physical-run') out.acknowledgePhysicalRun = true;
    else if (arg === '--include-dev-execution') out.includeDevExecution = true;
    else if (arg === '--acknowledge-dev-execution') out.acknowledgeDevExecution = true;
    else if (arg === '--output') out.output = argv[++index] ?? null;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else throw new Error(`UNKNOWN_ARGUMENT:${arg}`);
  }
  return out;
}

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }
  if (!args.root || !args.expectedHead) {
    process.stderr.write(`${usage()}\n`);
    return 2;
  }

  try {
    const evidence = await runWindowsPowerShellPhysicalAcceptance({
      root: resolve(args.root),
      expectedHead: args.expectedHead,
      acknowledgePhysicalRun: args.acknowledgePhysicalRun,
      includeDevExecution: args.includeDevExecution,
      acknowledgeDevExecution: args.acknowledgeDevExecution,
    });
    const json = `${JSON.stringify(evidence, null, 2)}\n`;
    process.stdout.write(json);
    if (args.output) {
      const outputPath = resolve(args.output);
      await fs.mkdir(dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, json, { encoding: 'utf8', flag: 'wx' });
    }
    return evidence.pass ? 0 : 1;
  } catch (error) {
    const failure = {
      schema: 'agentos.windows-powershell-physical-acceptance.error.v1',
      pass: false,
      disposition: 'PHYSICAL_POWERSHELL_ACCEPTANCE_BLOCKED',
      code: error?.code ?? 'PHYSICAL_ACCEPTANCE_ERROR',
      message: String(error?.message ?? error),
      local_wake_execution_enabled: false,
      scheduler_execution_enabled: false,
      production_autonomy_enabled: false,
    };
    process.stderr.write(`${JSON.stringify(failure, null, 2)}\n`);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  process.exitCode = await main();
}

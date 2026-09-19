// Family Safety first read-only Windows posture adapter.
// Fixed queries only. No caller-supplied PowerShell. No remediation/elevation.

const FIREWALL_SCRIPT = "Get-NetFirewallProfile | Select-Object Name,Enabled | ConvertTo-Json -Compress";
const DEFENDER_SCRIPT = "Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled,AntivirusEnabled | ConvertTo-Json -Compress";

function finding({ checkId, state, source, observedAt, detail }) {
  return Object.freeze({ checkId, state, source, observedAt, detail });
}

function parseJson(stdout) {
  if (typeof stdout !== 'string' || stdout.trim() === '') throw new Error('empty probe output');
  return JSON.parse(stdout);
}

export function createWindowsFamilySafetyProbe({ executor, clock = () => new Date() } = {}) {
  if (!executor || typeof executor.run !== 'function') throw new TypeError('executor.run is required');

  async function runFixed(script) {
    const result = await executor.run({
      file: 'powershell.exe',
      args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script],
      timeoutMs: 8000,
      readOnly: true,
    });
    if (!result || result.exitCode !== 0) {
      const error = new Error('windows safety probe failed');
      error.code = 'FAMILY_SAFETY_PROBE_FAILED';
      throw error;
    }
    return result.stdout;
  }

  async function inspectFirewall() {
    const observedAt = clock().toISOString();
    try {
      const rows = parseJson(await runFixed(FIREWALL_SCRIPT));
      const profiles = Array.isArray(rows) ? rows : [rows];
      if (profiles.length === 0 || profiles.some((p) => typeof p?.Enabled !== 'boolean')) {
        return finding({ checkId: 'windows-firewall', state: 'UNKNOWN', source: 'Get-NetFirewallProfile', observedAt, detail: 'unrecognized firewall output' });
      }
      const disabled = profiles.filter((p) => p.Enabled !== true).map((p) => p.Name ?? 'unknown');
      return finding({
        checkId: 'windows-firewall',
        state: disabled.length ? 'NEEDS_ATTENTION' : 'VERIFIED',
        source: 'Get-NetFirewallProfile',
        observedAt,
        detail: disabled.length ? `disabled profiles: ${disabled.join(', ')}` : 'all reported firewall profiles enabled',
      });
    } catch (error) {
      return finding({ checkId: 'windows-firewall', state: 'UNKNOWN', source: 'Get-NetFirewallProfile', observedAt, detail: `probe unavailable: ${error.code ?? error.name}` });
    }
  }

  async function inspectDefender() {
    const observedAt = clock().toISOString();
    try {
      const status = parseJson(await runFixed(DEFENDER_SCRIPT));
      if (typeof status?.RealTimeProtectionEnabled !== 'boolean' || typeof status?.AntivirusEnabled !== 'boolean') {
        return finding({ checkId: 'windows-defender', state: 'UNKNOWN', source: 'Get-MpComputerStatus', observedAt, detail: 'unrecognized defender output' });
      }
      const ok = status.RealTimeProtectionEnabled && status.AntivirusEnabled;
      return finding({
        checkId: 'windows-defender',
        state: ok ? 'VERIFIED' : 'NEEDS_ATTENTION',
        source: 'Get-MpComputerStatus',
        observedAt,
        detail: ok ? 'antivirus and real-time protection reported enabled' : 'antivirus or real-time protection reported disabled',
      });
    } catch (error) {
      return finding({ checkId: 'windows-defender', state: 'UNKNOWN', source: 'Get-MpComputerStatus', observedAt, detail: `probe unavailable: ${error.code ?? error.name}` });
    }
  }

  async function inspect() {
    return Object.freeze([await inspectFirewall(), await inspectDefender()]);
  }

  return Object.freeze({ inspect, inspectFirewall, inspectDefender });
}

// Family Safety first read-only Windows posture adapter.
// Fixed queries only. No caller-supplied PowerShell. No remediation/elevation.

const FIREWALL_SCRIPT = "Get-NetFirewallProfile | Select-Object Name,Enabled | ConvertTo-Json -Compress";
const DEFENDER_SCRIPT = "Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled,AntivirusEnabled | ConvertTo-Json -Compress";
const EXPECTED_FIREWALL_PROFILES = Object.freeze(['Domain', 'Private', 'Public']);

function finding({ checkId, state, source, observedAt, detail }) {
  return Object.freeze({ checkId, state, source, observedAt, detail });
}

function parseJson(stdout) {
  if (typeof stdout !== 'string' || stdout.trim() === '') throw new Error('empty probe output');
  return JSON.parse(stdout);
}

function normalizeFirewallProfiles(rows) {
  const profiles = Array.isArray(rows) ? rows : [rows];
  if (profiles.length !== EXPECTED_FIREWALL_PROFILES.length) return null;

  const seen = new Set();
  for (const profile of profiles) {
    if (
      !profile ||
      typeof profile.Name !== 'string' ||
      !EXPECTED_FIREWALL_PROFILES.includes(profile.Name) ||
      typeof profile.Enabled !== 'boolean' ||
      seen.has(profile.Name)
    ) {
      return null;
    }
    seen.add(profile.Name);
  }

  if (EXPECTED_FIREWALL_PROFILES.some((name) => !seen.has(name))) return null;
  return profiles;
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
      const profiles = normalizeFirewallProfiles(parseJson(await runFixed(FIREWALL_SCRIPT)));
      if (!profiles) {
        return finding({
          checkId: 'windows-firewall',
          state: 'UNKNOWN',
          source: 'Get-NetFirewallProfile',
          observedAt,
          detail: 'incomplete or unrecognized firewall profile set',
        });
      }

      const disabled = profiles.filter((profile) => profile.Enabled !== true).map((profile) => profile.Name);
      return finding({
        checkId: 'windows-firewall',
        state: disabled.length ? 'NEEDS_ATTENTION' : 'VERIFIED',
        source: 'Get-NetFirewallProfile',
        observedAt,
        detail: disabled.length ? `disabled profiles: ${disabled.join(', ')}` : 'Domain, Private, and Public firewall profiles reported enabled',
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

      if (!status.RealTimeProtectionEnabled || !status.AntivirusEnabled) {
        return finding({
          checkId: 'windows-defender',
          state: 'UNKNOWN',
          source: 'Get-MpComputerStatus',
          observedAt,
          detail: 'Defender protection is not fully enabled; provider and running-mode context required before classification',
        });
      }

      return finding({
        checkId: 'windows-defender',
        state: 'VERIFIED',
        source: 'Get-MpComputerStatus',
        observedAt,
        detail: 'Defender antivirus and real-time protection reported enabled',
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

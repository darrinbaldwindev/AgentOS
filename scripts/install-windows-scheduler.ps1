# SCHEDULER-BRIDGE-002: Windows Task Scheduler registration for AgentOS.
# Registration only by default: this script does NOT start the task and does NOT enable AgentOS autonomy.
# Run from an elevated PowerShell session after local installation has passed doctor:local.

[CmdletBinding()]
param(
    [string]$AgentOSHome = (Join-Path $HOME '.agentos'),
    [string]$RepoRoot = (Split-Path -Parent $PSScriptRoot),
    [int]$IntervalMinutes = 5,
    [switch]$Enable
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($IntervalMinutes -lt 1) { throw 'IntervalMinutes must be >= 1.' }
$node = (Get-Command node -ErrorAction Stop).Source
$entry = Join-Path $RepoRoot 'scripts\scheduler-tick.mjs'
$config = Join-Path $AgentOSHome 'config.json'
if (-not (Test-Path $entry -PathType Leaf)) { throw "Scheduler entrypoint not found: $entry" }
if (-not (Test-Path $config -PathType Leaf)) { throw "AgentOS is not installed at $AgentOSHome. Run npm run install:local first." }

$runtimeConfig = Get-Content -Raw -Path $config | ConvertFrom-Json
if ($runtimeConfig.mode -ne 'DRY_RUN' -or $runtimeConfig.autonomyEnabled -ne $false) {
    throw 'LOCAL_SCHEDULER_REQUIRES_SAFE_MODE: config must remain DRY_RUN with autonomyEnabled=false.'
}

$taskName = 'AgentOS Local Scheduler'
$action = New-ScheduledTaskAction -Execute $node -Argument ('"' + $entry + '" --root "' + $AgentOSHome + '"') -WorkingDirectory $RepoRoot
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -RepetitionDuration (New-TimeSpan -Days 3650)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 4) -MultipleInstances IgnoreNew -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
if (-not $Enable) {
    Disable-ScheduledTask -TaskName $taskName | Out-Null
}

$task = Get-ScheduledTask -TaskName $taskName
[pscustomobject]@{
    status = 'REGISTERED'
    taskName = $task.TaskName
    state = $task.State.ToString()
    intervalMinutes = $IntervalMinutes
    entrypoint = $entry
    agentosHome = $AgentOSHome
    autonomyEnabled = [bool]$runtimeConfig.autonomyEnabled
    mode = [string]$runtimeConfig.mode
    enabled = $task.State.ToString() -ne 'Disabled'
} | ConvertTo-Json -Depth 4

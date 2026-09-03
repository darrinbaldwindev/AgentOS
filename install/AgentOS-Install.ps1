# AgentOS v1 Windows installer
# Safe by default: installs local runtime only, DRY_RUN, autonomy disabled.
$ErrorActionPreference = 'Stop'
$Repo = 'https://github.com/darrinbaldwindev/AgentOS.git'
$InstallRoot = Join-Path $HOME 'AgentOS'
$NodeMinMajor = 22

Write-Host 'AgentOS v1 Installer' -ForegroundColor Cyan
Write-Host 'This installer does not enable production autonomy or install credentials.'

function Get-NodeMajor {
  try { return [int]((& node --version) -replace '^v','').Split('.')[0] } catch { return 0 }
}

$nodeMajor = Get-NodeMajor
if ($nodeMajor -lt $NodeMinMajor) {
  Write-Host "Node.js 22+ is required. Detected: $nodeMajor" -ForegroundColor Yellow
  Write-Host 'Install Node.js 22+ from https://nodejs.org/ and run this installer again.'
  exit 2
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Host 'Git is required. Install Git for Windows from https://git-scm.com/download/win and run again.' -ForegroundColor Yellow
  exit 3
}

if (Test-Path (Join-Path $InstallRoot '.git')) {
  Write-Host "Updating existing AgentOS checkout at $InstallRoot"
  git -C $InstallRoot pull --ff-only
} elseif (Test-Path $InstallRoot) {
  throw "Install path exists but is not an AgentOS Git checkout: $InstallRoot"
} else {
  git clone $Repo $InstallRoot
}

Push-Location $InstallRoot
try {
  npm run install:local
  npm run doctor:local
  npm run boot:local
  Write-Host ''
  Write-Host 'AgentOS v1 installation completed.' -ForegroundColor Green
  Write-Host "Installed source: $InstallRoot"
  Write-Host 'Runtime safety: DRY_RUN; autonomy disabled.'
  Write-Host 'Next check: npm run wake:local'
} finally { Pop-Location }

# AgentOS v1 Windows installer

## Install

1. Install Git for Windows and Node.js 22+ if they are not already installed.
2. Download `AgentOS-Install.ps1` from this folder.
3. Open PowerShell in the folder containing the script.
4. Run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\AgentOS-Install.ps1
```

The installer clones or updates the canonical AgentOS repository at `$HOME\AgentOS`, runs the local bootstrap, doctor, and boot checks, and leaves AgentOS in the safe `DRY_RUN` / autonomy-disabled state.

## First wake

After installation:

```powershell
cd $HOME\AgentOS
npm run wake:local
```

This is a bounded local wake test. It does not activate production providers, credentials, billing, or autonomous production execution.

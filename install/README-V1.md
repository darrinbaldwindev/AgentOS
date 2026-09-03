# AgentOS v1 — Windows PC Installer

## Fast install

1. Download the AgentOS repository to the Windows PC.
2. Open the `install` folder.
3. Double-click `Install-AgentOS.bat`.
4. The launcher invokes the PowerShell installer.

The installer checks Node.js 22+ and Git, obtains/updates the AgentOS checkout, runs the local bootstrap, doctor and boot checks, and leaves AgentOS in DRY_RUN with autonomy disabled.

## Direct PowerShell option

From PowerShell:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install\AgentOS-Install.ps1
```

## Safety

V1 does not enable production autonomy, install provider credentials, change billing, or execute live customer workflows.

## Validation boundary

The repository contains the installer and deterministic local runtime. A real Windows host must still execute the installer once for physical-host validation. A successful GitHub CI run is not treated as proof of physical installation.

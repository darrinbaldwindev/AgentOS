# AgentOS Manus Family Safety Batch 002 — Bounded Research/Assurance Report

**Repository:** `darrinbaldwindev/AgentOS`  
**Batch:** `.overseer/batches/VERTICAL-EXECUTION-BATCH.md`  
**Checked-out branch/head:** `work/manus-family-safety-batch-002-2026-09-19` / `56aa350bfc849eaffe7338c253659daaf78b83af`  
**PR #135 implementation anchor:** `e5d744ce0cc160ce12b6183aaf173b5c79206d9c`  
**Review mode:** read-only research and assurance challenge; no project code, tests, builds, Windows host, settings, credentials, production systems, or external communications were changed.

> **Status boundary:** This is a worker recommendation, not verification, readiness evidence, Green/PRS certification, or a whole-device safety claim. ChatGPT Overseer must independently reconcile every recommendation against repository evidence and exact-head CI before implementation status changes. `safeClaimPermitted` remains `false`.

## Executive result

The next bounded adapter slice should prioritize **(1) current-session administrator-token separation** and **(2) Remote Desktop exposure indication**, both as read-only checks with fixed commands, typed output validation, and conservative `UNKNOWN` handling. These checks are useful because they expose privilege and remote-entry conditions without changing device state. They must not be interpreted as proof that all accounts are correctly separated, that the network is unreachable, or that a device is safe.

**Screen-lock posture** is valuable but should remain a later bounded check until the implementation has a locale-independent, edition-supported source that distinguishes policy configuration from effective per-user behavior. **Windows Update posture** should remain HOLD for the first slice because update history and pending-update state are not equivalent to current security posture and may be incomplete, policy-managed, or network-dependent. **Defender/third-party AV** should not be converted into a simple pass/fail extension of #135: Microsoft documents active, passive, disabled, and hybrid states whose meaning depends on Windows version, Defender for Endpoint onboarding, Smart App Control, Security Center, and server/client differences. **Browser-extension inventory** should remain UNKNOWN/HOLD unless a browser-specific, profile-scoped source is explicitly defined; Edge `ExtensionSettings` is a management policy, not proof of the currently installed extension set.

## Source-backed Windows check matrix

| Candidate | Exact read-only source | Standard-user expectation | Supported/caveat boundary | Output and semantics | Conservative mapping | Fixed-command adapter decision |
|---|---|---|---|---|---|---|
| Current-session administrator separation | A fixed `whoami /groups /fo csv` query, with group SID `S-1-5-32-544` evaluated from structured output; optionally pair with a fixed `whoami /user /fo csv`. Microsoft documents `whoami` as the identity/group inspection tool; the stable SID is preferred over localized display names. | Usually yes for the current token; access or command availability failure is not a pass. | Windows client/server versions with `whoami`; does not enumerate every local account and does not establish family-role identity. UAC filtered tokens, domain groups, nested groups, Microsoft accounts, and managed policy can affect interpretation. | Record command identity, group SID presence, enabled/deny-only attributes if exposed, exit code, stdout/stderr digest, source, and timestamp. The check answers only whether the executing session presents administrator-group membership. | `VERIFIED` only when the expected non-admin/admin relation is explicit for the assessed session and all required fields are present. `NEEDS_ATTENTION` when the assessed child/session is an administrator or required separation is violated. `UNKNOWN` for missing fields, parsing ambiguity, access denied, truncation, localization-dependent parsing, unexpected SID attributes, or inability to establish which profile is being assessed. | **RECOMMEND next slice**, with no caller-supplied PowerShell and no account modification. Do not call it “all-account separation.” |
| Local administrator roster | `net localgroup Administrators` or a fixed CIM query such as `Win32_GroupUser`; Microsoft documents `net user` for account display, but localized command output and group aliases are problematic. | Often readable, but not guaranteed; provider/ACL/domain conditions can block it. | Localized group names, Home/Pro/Enterprise differences, domain membership, nested groups, disabled accounts, and provider availability make a generic roster interpretation unsafe. | If attempted, preserve raw source identifier, SID/account principal, local/domain origin, enabled state where reliably exposed, and completeness indicator. | `UNKNOWN` unless the adapter can prove the target group, complete enumeration, and semantics. Never infer “safe” from an empty or partial list. | **HOLD** as a first slice; do not rely on display name `Administrators` or a successful-but-incomplete enumeration. |
| Screen/session lock | Microsoft policy `Interactive logon: Machine inactivity limit`; the documented policy locks after inactivity and when screensaver/display-off conditions apply. A fixed registry/security-policy query may inspect `InactivityTimeoutSecs`, but effective behavior also depends on screensaver and per-user settings. Source: [Microsoft policy documentation](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/interactive-logon-machine-inactivity-limit). | Reading local policy may be possible, but policy stores and effective per-user settings vary. | Applies to Windows 10/11 per Microsoft page; domain/MDM policy, screensaver state, power/display policy, remote sessions, and per-user settings complicate effective posture. Zero/blank disables this machine-inactivity policy. | Capture policy value, source path, scope (local/domain/MDM if knowable), screensaver enabled state if separately established, and observed timestamp. | `VERIFIED` only for the narrowly assessed policy when all required inputs are present and within a defined threshold. `NEEDS_ATTENTION` for an explicit disabled/over-threshold policy. `UNKNOWN` when scope/effective behavior is unresolved. | **HOLD for later** until a locale-independent and cross-edition source plus deterministic threshold is specified. |
| Windows Update/security-update posture | Windows Update Agent COM interfaces, especially `IUpdateHistoryEntry` / `IUpdateHistoryEntryCollection`, and separately a documented reboot-required signal where available. Source: [Windows Update Agent API](https://learn.microsoft.com/en-us/windows/win32/api/_wua/). | Read-only history queries may work as standard user, but search/metadata can be policy/network dependent. | History is not a complete vulnerability assessment; servicing stack/component updates, feature updates, offline servicing, WSUS/MDM policy, failed entries, clock skew, and missing history matter. WUA exposes update operations and incomplete-result exceptions. | Preserve update identity, title/product, operation/result code, date, reboot-required status, source/service, completeness/errors, and timestamp. | `VERIFIED` only for a narrowly stated claim such as “a recent successful history record was observed,” never “fully patched.” `NEEDS_ATTENTION` for explicit failed/pending/reboot-required evidence. `UNKNOWN` for incomplete history, unavailable service, stale/future dates, policy-managed scope, or no authoritative vulnerability baseline. | **HOLD** for first slice; high risk of semantically incomplete successful output. |
| Defender with third-party AV | Fixed `Get-MpComputerStatus` fields may report `AMRunningMode`, `AntivirusEnabled`, and `RealTimeProtectionEnabled`; Security Center provider inventory may be a separate source and must not be conflated. Source: [Defender compatibility](https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-antivirus-compatibility). | Some status reads may work without elevation; tamper protection, product edition, provider, and management policy can restrict or alter results. | Microsoft documents Windows 10/11 and server differences; non-Microsoft AV, Defender for Endpoint onboarding, Smart App Control, Windows Security Center service, and server mode change interpretation. | Preserve all relevant fields, product/provider identity if available, mode, onboarding/management indicators if available, completeness, and timestamp. | `VERIFIED` only for the exact asserted control, not generic antivirus safety. A Defender-disabled result with a registered third-party provider is **not automatically NEEDS_ATTENTION**; it may be expected, otherwise UNKNOWN. `UNKNOWN` for missing provider identity, contradictory fields, disabled Security Center, unsupported mode, or third-party ambiguity. | **HOLD as a simple pass/fail check**; revise #135 semantics before adding a provider check. |
| Remote Desktop exposure | Fixed read-only registry value `HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\\fDenyTSConnections`, plus fixed `Get-Service -Name TermService` state and, only if explicitly bounded, a read-only listener/firewall indication. Microsoft documents `fDenyTSConnections=true` as deny/default and `false` as enabled. Source: [Microsoft fDenyTSConnections](https://learn.microsoft.com/en-us/windows-hardware/customize/desktop/unattend/microsoft-windows-terminalservices-localsessionmanager-fdenytsconnections). | Local registry/service reads are commonly available, but access-denied and managed-policy cases must remain UNKNOWN. | The registry flag alone does not prove network reachability; enabling RDP also requires firewall configuration. Home editions, policy, Remote Assistance, third-party remote tools, and IPv4/IPv6/network boundaries limit scope. | Record flag, service state, source paths, firewall/listener sub-check status, completeness, and timestamp. | `VERIFIED` only for “RDP configuration indicates connections denied” when both required fields are present. `NEEDS_ATTENTION` for an explicit enabled state if the assessed policy requires it denied. `UNKNOWN` for mismatch, missing firewall/listener evidence, third-party tools, access denied, or partial output. | **RECOMMEND next slice**, but name it “RDP configuration exposure indicator,” not “remote access is impossible.” |
| Browser extensions | Edge `ExtensionSettings` policy is a management control, not an installed-profile inventory. Source: [Microsoft Edge extension management](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-manage-extensions-ref-guide). | Policy registry reads may be possible; browser profile inventory is profile/user-specific and browser-dependent. | The policy can control install modes, permissions, update URLs, and allowed types, but cannot by itself prove actual installed/running extensions. Chrome/Firefox have different stores and profile layouts. | If policy is inspected, record browser, policy scope, raw JSON completeness, extension IDs/settings, and timestamp; label it policy evidence only. | `VERIFIED` only for a specific policy assertion. `UNKNOWN` for absent policy, malformed JSON, unmanaged browser, non-Edge browser, profile not identified, or inventory not authoritative. | **REJECT/HOLD** for generic Family Safety posture; no reliable single non-invasive cross-browser source was established. |

## Recommended next 1–2 bounded checks

### 1. `windows-session-admin-membership`

Use one fixed, injected executor command for `whoami` group membership and evaluate the administrator-group SID rather than localized names. Define the assessed session explicitly. Require non-empty, parseable, complete output, command success, a non-future timestamp, and a bounded evidence age. Emit `VERIFIED` or `NEEDS_ATTENTION` only for the session-level proposition being tested; otherwise emit `UNKNOWN`. Do not enumerate, disable, delete, or modify accounts.

### 2. `windows-rdp-configuration`

Use fixed read-only queries for `fDenyTSConnections` and `TermService` state. Treat the result as an RDP configuration indicator. If a future implementation adds firewall/listener fields, make those separate required sub-checks; do not collapse a missing firewall profile or unavailable listener query into a pass. A disabled/denied flag with contradictory service or firewall evidence is `UNKNOWN`, not `VERIFIED`.

Both checks must flow through the existing #133 evidence contract rather than create a second summary plane. Add deterministic injected-executor fixtures for success, command unavailable, access denied, malformed/partial output, future timestamp, stale evidence, and contradictory fields. Physical Windows validation remains separately gated and is not implied by this report.

## HOLD/rejected checks

- **Generic local administrator roster:** HOLD because localized output, domain/nested membership, provider support, and completeness are difficult to establish without turning a successful command into a false-safe result.
- **Screen-lock effective behavior:** HOLD until policy scope, screensaver, per-user, power/display, and MDM/domain precedence can be assessed without confusing configured policy with observed enforcement.
- **Windows Update “fully patched” claim:** HOLD because update history is not a complete vulnerability or patch-baseline source; WUA can return incomplete results and policy-managed devices can hide scope.
- **Defender simple boolean pass:** REJECT. Third-party antivirus and Smart App Control can produce expected passive/disabled/hybrid states. A disabled Defender field must not automatically become `NEEDS_ATTENTION` without provider context.
- **Browser-extension posture:** HOLD. Edge policy documentation describes management controls, not a reliable installed/running inventory; cross-browser/profile coverage would require invasive or unstable sources.
- **Any remediation or elevation:** REJECT under this batch, including changing firewall, Defender, update, account, lock, parental-control, or remote-access settings.

## False-safe adversarial matrix

| False-safe path | Required handling |
|---|---|
| Command exists but policy/edition makes it unavailable | Non-zero exit, missing executable, unsupported provider, or access denied becomes `UNKNOWN`; preserve error class and source. |
| JSON is empty, malformed, truncated, or only one row of an expected set | Validate shape, required fields, and completeness. Never treat parse success alone as evidence. |
| Timestamp is future-dated, stale, unparsable, or clock source is unknown | Preserve source timestamp; #133 should convert future/stale evidence to `UNKNOWN` and retain the reason. |
| Firewall/profile-like collection omits a profile | Require the expected profile set or an explicit completeness signal; omission is `UNKNOWN`, not “all enabled.” |
| Third-party AV causes Defender fields to be disabled/passive | Require provider/mode context; disabled Defender alone is not sufficient for `NEEDS_ATTENTION`. |
| Domain/MDM policy overrides local values | Preserve scope/source and mark effective posture `UNKNOWN` where precedence cannot be established. |
| Localized names or display labels drift | Use stable SIDs/IDs/enums where documented; never compare localized display names as authority. |
| Provider is unsupported or returns semantically incomplete success | Require exact typed fields and source identity; successful process exit with missing semantics is `UNKNOWN`. |
| One check passes while another required check is UNKNOWN/BLOCKED | #133 summary must retain per-check states and overall `UNKNOWN`; no “mostly safe” collapse. |
| Registry flag suggests RDP denied but firewall/listener/third-party remote tool is unresolved | Report only the narrow registry proposition; overall remote-exposure assessment remains `UNKNOWN`. |

## Evidence mapping into #133

The inspected contract in `runtime/family-safety-evidence.mjs` already provides the correct composition primitive: `createFamilySafetyFinding` accepts `checkId`, `status`, `observedAt`, `evidenceSource`, and `detail`; `summarizeFamilySafetyCheck` evaluates an explicit `requiredCheckIds` list, converts missing required checks to `UNKNOWN/MISSING_REQUIRED_CHECK`, converts stale or future evidence to `UNKNOWN/STALE_OR_INVALID_EVIDENCE`, preserves per-check findings, and forces `safeClaimPermitted: false`.

Recommended finding IDs are:

- `windows-firewall` (existing #135 identifier; preserve its source and timestamp).
- `windows-defender` (existing #135 identifier; revise semantics before treating it as a generic safety result).
- `windows-session-admin-membership` (new; current-session proposition only).
- `windows-rdp-configuration` (new; RDP configuration indicator only).
- Future checks should use one stable ID per assessed proposition, not one summary ID.

The #135 adapter currently uses fixed PowerShell scripts and `readOnly: true`, catches failures as `UNKNOWN`, and detects malformed semantic output. However, its firewall path accepts any non-empty returned profile collection, so a semantically omitted profile can pass; the next implementation must define expected profile completeness. Its Defender path treats either `RealTimeProtectionEnabled` or `AntivirusEnabled` false as `NEEDS_ATTENTION`, which is too strong when a documented third-party AV/passive/disabled state explains the value. These are review findings, not implementation changes.

The required-check list must be explicit at the caller/orchestrator boundary. Never infer it from returned findings. Preserve source and timestamp per finding, reject duplicate IDs, and retain `BLOCKED`, `UNKNOWN`, stale, future, and missing states. A summary may say `CHECKS_PASSED` only for the assessed controls whose evidence is current and complete; it must not mint `SAFE`, `GREEN`, or a whole-device claim.

## Parent assurance and Split View implications

Parent-facing projection should distinguish four states using the evidence summary, not UI-local logic:

1. **Checks passed for assessed controls** — current evidence exists for the explicitly assessed checks; no whole-device safety claim.
2. **Needs attention** — a current, evidence-backed control is outside the configured expectation and parent action may be needed.
3. **Parent action required** — the evidence contract has a current `NEEDS_ATTENTION` finding requiring an authorized parent decision; the UI must not perform the action automatically.
4. **Unknown / could not verify** — missing, stale, future, blocked, unsupported, incomplete, contradictory, or managed-policy evidence.

Split View may place chat/Overseer beside the evidence surface for explanation and navigation, but the chat side must not grant capability, override policy, rewrite findings, or convert `UNKNOWN` into a pass. The child-facing view should minimize surveillance detail and show only the minimum status/action explanation needed. Changing Simple, Essentials, or Tech Head presentation must not alter policy, required checks, evidence source, timestamps, or summary truth.

## UNKNOWNs and limitations

The workflow-based Wide Research attempt spawned seven agents but failed before producing usable results with `creditNotEnough`; no parallel agent result or reducer output was relied upon. This fallback report is therefore a direct bounded review, not a successful Wide Research synthesis.

No physical Windows execution occurred. No standard-user compatibility claim was empirically validated on Windows editions. No domain/MDM-managed device, third-party antivirus product, browser profile, or localized installation was tested. Microsoft documentation describes interfaces and behavior but does not establish AgentOS runtime behavior on the exact target host.

The checked-out repository and batch records are repository evidence, not independent verification of PR/CI freshness beyond the recorded exact revisions. No project tests or builds were run, consistent with the read-only assurance boundary. The report does not authorize implementation, merge, deployment, production writes, parental-control activation, remediation, or readiness status changes.

## Authoritative sources

- [Microsoft `net user` command](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/net-user)
- [Microsoft Interactive logon: Machine inactivity limit](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/security-policy-settings/interactive-logon-machine-inactivity-limit)
- [Microsoft Windows Update Agent API](https://learn.microsoft.com/en-us/windows/win32/api/_wua/)
- [Microsoft Defender Antivirus compatibility with other security products](https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-antivirus-compatibility)
- [Microsoft `fDenyTSConnections`](https://learn.microsoft.com/en-us/windows-hardware/customize/desktop/unattend/microsoft-windows-terminalservices-localsessionmanager-fdenytsconnections)
- [Microsoft Edge extension management reference](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-manage-extensions-ref-guide)

**Next safe action:** ChatGPT Overseer independently reconciles this report against live repository/PR/CI evidence and decides whether to commission a fresh, narrowly scoped draft implementation; no implementation status changes follow from this worker report alone.

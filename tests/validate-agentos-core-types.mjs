import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const contractPath = resolve("contracts/agentos-core-types.ts");
const source = readFileSync(contractPath, "utf8");
const failures = [];

function requirePattern(description, pattern) {
  if (!pattern.test(source)) {
    failures.push(description);
  }
}

function forbidPattern(description, pattern) {
  if (pattern.test(source)) {
    failures.push(description);
  }
}

const requiredInterfaces = [
  "ProviderRecord",
  "ModelRecord",
  "AgentProfile",
  "IntegrationState",
  "ExecutionState",
  "ContextConfig",
  "ArtifactRecord",
  "ToolRecord",
  "CredentialConnection",
  "AttributionState",
];

for (const name of requiredInterfaces) {
  requirePattern(`missing exported interface ${name}`, new RegExp(`export\\s+interface\\s+${name}\\s*\\{`));
}

const requiredUnions = [
  "IntegrationStateKind",
  "ProviderKind",
  "ProviderAuthKind",
  "ExecutionStatus",
  "AgentEvent",
  "ContextWarning",
  "AgentAction",
];

for (const name of requiredUnions) {
  requirePattern(`missing exported type ${name}`, new RegExp(`export\\s+type\\s+${name}\\s*=`));
}

requirePattern(
  "integration state omits required deterministic mock states",
  /"available"[\s\S]*"needs_connection"[\s\S]*"limited"[\s\S]*"offline"[\s\S]*"permission_denied"[\s\S]*"rate_limited"[\s\S]*"degraded"[\s\S]*"error"/,
);
requirePattern(
  "credential connection does not reference SecretReference metadata",
  /export\s+interface\s+CredentialConnection\s*\{[\s\S]*?readonly\s+secret:\s+SecretReference;/,
);
requirePattern(
  "secret reference does not identify an approved secure-store boundary",
  /export\s+interface\s+SecretReference\s*\{[\s\S]*?readonly\s+store:\s+"os_keychain"\s*\|\s*"external_secret_store";/,
);
requirePattern(
  "attribution user records do not require a display-safe hash",
  /export\s+interface\s+UserAttribution\s*\{[\s\S]*?readonly\s+userHash:\s+string;/,
);
requirePattern(
  "execution state does not expose ordered step results",
  /export\s+interface\s+ExecutionState\s*\{[\s\S]*?readonly\s+stepResults:\s+readonly\s+ExecutionStepResult\[\];/,
);
requirePattern(
  "context warning does not include a truncation variant",
  /readonly\s+kind:\s+"truncated";/,
);
requirePattern(
  "agent events do not include a user-pause variant",
  /readonly\s+kind:\s+"paused";\s*readonly\s+reason:\s+string\s*;?\s*\}/,
);

forbidPattern("contract contains a plaintext apiKey field", /readonly\s+apiKey\s*:/i);
forbidPattern("contract contains a plaintext token field", /readonly\s+token\s*:/i);
forbidPattern("contract contains a plaintext password field", /readonly\s+password\s*:/i);
forbidPattern("contract contains a secretValue field", /readonly\s+secretValue\s*:/i);
forbidPattern("contract contains a privateKey field", /readonly\s+privateKey\s*:/i);

if (failures.length > 0) {
  console.error("AgentOS core type validation failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`AgentOS core type validation passed: ${requiredInterfaces.length} required interfaces, ${requiredUnions.length} required union types, and secret-boundary checks verified.`);

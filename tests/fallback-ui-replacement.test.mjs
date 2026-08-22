import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const html = readFileSync(resolve("agents/ui/prototype/agentos_fallback_sample.html"), "utf8");
const manager = readFileSync(resolve("agents/ui/components/IntegrationFallbackManager.tsx"), "utf8");

assert.match(html, /^<!doctype html>/i);
assert.match(html, /<html lang="en">/);
assert.match(html, /Self-contained offline sample/);
assert.match(html, /class="skip-link" href="#fallback-workspace"/);
assert.match(html, /id="fallback-workspace" tabindex="-1"/);
assert.match(html, /aria-labelledby="context-warning-title"/);
assert.match(html, /Context window is nearly full/);
assert.match(html, /id="toggle-context" aria-expanded="false" aria-controls="context-panel"/);
assert.match(html, /role="toolbar" aria-label="Fallback controls"/);
assert.match(html, /role="group" aria-label="Stream recovery actions"/);
assert.match(html, /id="announcer" role="status" aria-live="polite"/);
assert.match(html, /Arrow Up/);
assert.match(html, /Arrow Down/);
assert.match(html, /Response stream interrupted/);
assert.match(html, /Partial output is preserved locally/);
assert.match(html, /Local Runtime/);
assert.match(html, /Rate limited/);
assert.match(html, /Degraded/);
assert.match(html, /Affiliate status was not used/);
assert.match(html, /It never connects to a provider, stores credentials, opens a redirect, or sends telemetry\./);

for (const prohibitedPattern of [
  /<script[^>]+\bsrc=/i,
  /<link[^>]+\bhref=/i,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bhttps?:\/\//,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
]) {
  assert.equal(prohibitedPattern.test(html), false, `HTML replacement must remain self-contained and offline: ${prohibitedPattern}`);
}

assert.match(manager, /export function IntegrationFallbackManager/);
assert.match(manager, /export function rankFallbackProviders/);
assert.match(manager, /export interface FallbackProviderView/);
assert.match(manager, /aria-live="polite"/);
assert.match(manager, /aria-pressed=/);
assert.match(manager, /onKeyDown=/);
assert.match(manager, /ArrowDown/);
assert.match(manager, /ArrowUp/);
assert.match(manager, /Context window is nearly full/);
assert.match(manager, /Streaming recovery/);
assert.match(manager, /No provider connection, credential access, redirect, or persistence/);

const rankingBlock = manager.match(/export function rankFallbackProviders[\s\S]*?\n}\n\nfunction recoveryMessage/);
assert.ok(rankingBlock, "manager must expose a bounded fallback ranking function");
assert.equal(/referralStatus/.test(rankingBlock[0]), false, "referral status must not influence local fallback ranking");
for (const prohibitedPattern of [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bhttps?:\/\//, /\bprocess\.env\b/, /\blocalStorage\b/]) {
  assert.equal(prohibitedPattern.test(manager), false, `manager replacement must remain local-only: ${prohibitedPattern}`);
}

console.log("Fallback UI replacement validation passed: accessible structure, keyboard controls, health labels, context and stream recovery states, capability-first ranking, and self-contained offline safeguards verified.");

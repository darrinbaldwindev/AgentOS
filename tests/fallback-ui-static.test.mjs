import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve('agents/ui/prototype/agentos_fallback_sample.html'), 'utf8');

function count(pattern) {
  return [...source.matchAll(pattern)].length;
}

assert.match(source, /<html\s+lang="en">/);
assert.match(source, /Skip to fallback workspace/);
assert.match(source, /id="fallback-workspace"[^>]*tabindex="-1"/);
assert.match(source, /role="status"\s+aria-live="polite"/);
assert.match(source, /aria-label="Offline mode active"/);
assert.match(source, /id="toggle-context"[^>]*aria-expanded="false"[^>]*aria-controls="context-panel"/);
assert.match(source, /id="context-panel"[^>]*hidden/);
assert.match(source, /id="provider-list"[^>]*aria-label="Provider health choices"/);
assert.equal(count(/class="provider(?:\s+selected)?"[^>]*tabindex="0"/g), 3);
assert.equal(count(/aria-pressed="(?:true|false)"/g), 3);
assert.equal(count(/class="status (?:available|rate-limited|degraded|offline|error|warning)"/g), 3);
assert.match(source, /ArrowDown/);
assert.match(source, /ArrowUp/);
assert.match(source, /Home/);
assert.match(source, /End/);
assert.match(source, /data-recovery="resume"/);
assert.match(source, /data-recovery="switch"/);
assert.match(source, /data-recovery="save"/);
assert.match(source, /does not retry automatically/);
assert.match(source, /affiliate status never determines this preview/);
assert.match(source, /prefers-reduced-motion/);

for (const prohibitedPattern of [/\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /\bprocess\.env\b/]) {
  assert.equal(prohibitedPattern.test(source), false, `fallback sample must remain self-contained: ${prohibitedPattern}`);
}

console.log('Fallback UI static validation passed: accessibility landmarks, context warning, provider health states, keyboard navigation, streaming recovery, neutrality, and offline-only safeguards verified.');

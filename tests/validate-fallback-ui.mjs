import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../agents/ui/prototype/agentos_fallback_sample.html', import.meta.url), 'utf8');

const requiredMarkers = [
  'Skip to fallback workspace',
  'focus-visible',
  'prefers-reduced-motion',
  'Context window is nearly full',
  'aria-expanded',
  'aria-controls="context-panel"',
  'role="toolbar"',
  'Required capability',
  'Preview local route',
  'aria-live="polite"',
  'Response stream interrupted',
  'Resume from last confirmed boundary',
  'Preview compatible fallback',
  'Keep partial output and stop',
  'Arrow Up',
  'Arrow Down',
  'affiliate status never determines this preview',
  'does not retry automatically',
  'Offline fallback workspace is ready',
];

for (const marker of requiredMarkers) {
  assert.ok(html.includes(marker), `missing fallback UI marker: ${marker}`);
}

assert.ok(!/https?:\/\//i.test(html), 'offline sample must not contain external URLs');
assert.ok(!/<form\b/i.test(html), 'offline sample should not introduce submission-capable forms');
assert.ok(!/fetch\s*\(/i.test(html), 'offline sample must not perform fetch calls');
assert.ok(!/XMLHttpRequest/i.test(html), 'offline sample must not perform XHR');

console.log(`fallback UI validation passed: ${requiredMarkers.length} accessibility/recovery markers and offline safeguards`);

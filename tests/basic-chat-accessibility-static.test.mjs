import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../ui/basic-chat.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../ui/basic-chat.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../ui/basic-chat.js', import.meta.url), 'utf8');

test('Basic Chat keeps keyboard-visible focus and touch-sized controls', () => {
  assert.match(html, /<meta name="viewport" content="width=device-width,initial-scale=1">/);
  assert.match(html, /aria-label="Job controls"/);
  assert.match(html, /aria-describedby="control-note"/);
  assert.match(html, /id="control-note"/);
  assert.match(html, /role="status"/);
  assert.match(html, /role="alert"/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /button:focus-visible/);
  assert.match(css, /textarea:focus-visible/);
  assert.match(css, /summary:focus-visible/);
  assert.match(css, /outline:\s*3px solid currentColor/);
});

test('Basic Chat limits live announcements to concise status and alert channels', () => {
  assert.match(html, /id="status" role="status" aria-live="polite" aria-atomic="true"/);
  assert.match(html, /id="history" class="history" aria-label="Conversation"/);
  assert.doesNotMatch(html, /id="history"[^>]*aria-live=/);
  assert.match(html, /id="error" role="alert"/);
});

test('Basic Chat exposes form busy state without inventing runtime status', () => {
  assert.match(html, /class="composer-area" aria-busy="false"/);
  assert.match(html, /id="chat" aria-busy="false"/);
  assert.match(js, /composer\.setAttribute\('aria-busy', sending \? 'true' : 'false'\)/);
  assert.match(js, /form\.setAttribute\('aria-busy', sending \? 'true' : 'false'\)/);
  assert.match(js, /if \(sending\) return 'Working'/);
});

test('Basic Chat has a narrow-layout fallback without removing the composer', () => {
  assert.match(html, /class="composer-area"/);
  assert.match(html, /id="message"/);
  assert.match(html, /id="send"/);
  assert.match(css, /@media \(max-width:\s*600px\)/);
  assert.match(css, /\.row\s*\{[^}]*flex-direction:\s*column/s);
  assert.match(css, /#send\s*\{\s*width:\s*100%/s);
  assert.match(css, /\.controls\s*\{[^}]*flex-wrap:\s*wrap/s);
  assert.match(css, /\.product-heading\s*\{[^}]*flex-direction:\s*column/s);
});

test('Basic Chat honors reduced-motion preference', () => {
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation-iteration-count:\s*1\s*!important/);
  assert.match(css, /scroll-behavior:\s*auto\s*!important/);
});

test('Simple Essentials and Tech Head are presentation modes rather than capability switches', () => {
  assert.match(html, /name="view-mode" value="simple"/);
  assert.match(html, /name="view-mode" value="essentials" checked/);
  assert.match(html, /name="view-mode" value="tech"/);
  assert.match(html, /View changes detail only\. It does not change permissions, running work, safety checks, or AgentOS capabilities\./);
  assert.match(js, /const VIEW_MODES = new Set\(\['simple', 'essentials', 'tech'\]\)/);
  assert.match(js, /document\.documentElement\.dataset\.viewMode = viewMode/);
  assert.doesNotMatch(js, /api\([^\n]*view-mode/i);
  assert.doesNotMatch(js, /fetch\([^\n]*view-mode/i);
  assert.match(css, /html\[data-view-mode="simple"\] \.tech-disclosure/);
});

test('Recent Jobs keeps project and mission correlation in Tech Head disclosure only', () => {
  assert.match(js, /viewMode === 'tech' \? `Project \$\{job\.projectId\} · Task \$\{job\.taskId\} · Mission \$\{job\.missionId\}` : `Task \$\{job\.taskId\}`/);
  assert.match(css, /html\[data-view-mode="simple"\] \.essentials-surface\s*\{\s*display:\s*none/);
  assert.doesNotMatch(js, /api\([^\n]*projectId/i);
  assert.doesNotMatch(js, /fetch\([^\n]*projectId/i);
});

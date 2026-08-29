import test from 'node:test';
import assert from 'node:assert/strict';
import { createTelemetryConsent, sanitiseTelemetry, shouldTransmit } from '../src/telemetry/consent.mjs';

test('telemetry is off by default', () => {
  const consent = createTelemetryConsent();
  assert.equal(consent.enabled, false);
  assert.equal(shouldTransmit(consent), false);
});

test('performance consent permits performance data only', () => {
  const consent = createTelemetryConsent('performance');
  assert.equal(shouldTransmit(consent, 'performance'), true);
  assert.equal(shouldTransmit(consent, 'improvement'), false);
});

test('sanitisation excludes conversation content and arbitrary fields', () => {
  const result = sanitiseTelemetry({ taskCategory: 'research', workerId: 'chatgpt', prompt: 'secret', conversation: 'secret', cost: 0.03 });
  assert.equal(result.cost, 0.03);
  assert.equal('prompt' in result, false);
  assert.equal('conversation' in result, false);
});

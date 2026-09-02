import test from 'node:test';
import assert from 'node:assert/strict';
import { assertRoleAuthority, assertRoleIdentity, createRoleIdentity } from '../src/governance/role-identity.mjs';

test('role identity is explicit and provider-neutral', () => {
  const identity = createRoleIdentity({ roleId: 'gemini_overseer', provider: 'Gemini', sessionId: 'session-001' });
  assert.equal(identity.role_id, 'gemini_overseer');
  assert.equal(identity.role_name, 'Gemini Overseer');
  assert.equal(identity.provider, 'Gemini');
  assert.equal(identity.parent_authority, 'chatgpt_overseer');
});

test('role identity fails closed when expected role differs', () => {
  const identity = createRoleIdentity({ roleId: 'gemini_overseer', provider: 'Gemini', sessionId: 'session-002' });
  assert.throws(() => assertRoleIdentity(identity, 'chatgpt_overseer'), /ROLE_IDENTITY_INVALID/);
});

test('role identity rejects missing provider or session', () => {
  assert.throws(() => createRoleIdentity({ roleId: 'gemini_overseer', sessionId: 'session-003' }), /ROLE_IDENTITY_INVALID/);
  assert.throws(() => createRoleIdentity({ roleId: 'gemini_overseer', provider: 'Gemini' }), /ROLE_IDENTITY_INVALID/);
});

test('role identity rejects unknown roles', () => {
  assert.throws(() => createRoleIdentity({ roleId: 'chatgpt', provider: 'OpenAI', sessionId: 'session-004' }), /ROLE_IDENTITY_INVALID/);
});

test('Gemini Overseer cannot perform ChatGPT Overseer-only authorization', () => {
  const identity = createRoleIdentity({ roleId: 'gemini_overseer', provider: 'Gemini', sessionId: 'session-005' });
  assert.throws(() => assertRoleAuthority(identity, 'authorize'), /ROLE_IDENTITY_INVALID/);
});

test('Gemini Overseer is allowed independent review and challenge actions', () => {
  const identity = createRoleIdentity({ roleId: 'gemini_overseer', provider: 'Gemini', sessionId: 'session-006' });
  assert.equal(assertRoleAuthority(identity, 'review'), true);
  assert.equal(assertRoleAuthority(identity, 'challenge'), true);
  assert.equal(assertRoleAuthority(identity, 'verify'), true);
  assert.equal(assertRoleAuthority(identity, 'escalate'), true);
});

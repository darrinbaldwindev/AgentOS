import test from 'node:test';
import assert from 'node:assert/strict';
import { authoriseDispatch, createAuthorityPolicy } from '../src/dispatch/authority.mjs';

const task = {
  issuer: 'GPTChat Overseer',
  authority: { granted_capabilities: ['repository_read', 'tests'] },
};

test('trusted issuer with permitted capabilities is authorised', () => {
  const policy = createAuthorityPolicy({
    issuers: ['GPTChat Overseer'],
    capabilities: ['repository_read', 'tests'],
  });
  assert.equal(authoriseDispatch(task, policy), true);
});

test('issuer identity is independently trusted', () => {
  const policy = createAuthorityPolicy({
    issuers: ['Manus Overseer'],
    capabilities: ['repository_read', 'tests'],
  });
  assert.throws(() => authoriseDispatch(task, policy), /untrusted issuer/);
});

test('requested capabilities cannot exceed policy', () => {
  const policy = createAuthorityPolicy({
    issuers: ['GPTChat Overseer'],
    capabilities: ['repository_read'],
  });
  assert.throws(() => authoriseDispatch(task, policy), /unauthorised capability: tests/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { createEfficiencyGovernor } from '../src/dispatch/efficiency-governor.mjs';

test('governor prevents spending beyond token, call and cost budgets', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  assert.equal(governor.canSpend(governor.estimate({ cost: 0.5, calls: 1, tokens: 500 })), true);
  assert.equal(governor.canSpend(governor.estimate({ cost: 1.1, calls: 1, tokens: 500 })), false);
  governor.record({ cost: 0.5, calls: 1, tokens: 500 });
  assert.deepEqual(governor.remaining(), { cost: 0.5, calls: 1, tokens: 500 });
});

test('record rejects direct usage that would exceed the hard budget', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  governor.record({ cost: 0.5, calls: 1, tokens: 500 });
  assert.throws(
    () => governor.record({ cost: 0.6, calls: 1, tokens: 500 }),
    /usage would exceed budget limits/,
  );
  assert.deepEqual(governor.remaining(), { cost: 0.5, calls: 1, tokens: 500 });
});

test('reservations consume remaining budget before execution', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  const first = governor.reserve({ cost: 0.6, calls: 1, tokens: 600 });
  assert.ok(first?.id);
  assert.deepEqual(governor.remaining(), { cost: 0.4, calls: 1, tokens: 400 });
  assert.equal(governor.reserve({ cost: 0.5, calls: 1, tokens: 500 }), null);
});

test('reservation IDs are unique across rapid reservations', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 100, maxCalls: 100, maxTokens: 100000 } });
  const reservations = Array.from({ length: 100 }, () => governor.reserve({ cost: 1, calls: 1, tokens: 1 }));
  const ids = reservations.map(reservation => reservation.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('reconciliation releases the reservation and records actual usage', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  const reservation = governor.reserve({ cost: 0.6, calls: 1, tokens: 600 });
  const result = governor.reconcile({ reservation, actual: { cost: 0.4, calls: 1, tokens: 450 } });
  assert.equal(result.reservationId, reservation.id);
  assert.equal(result.overBudget, false);
  assert.deepEqual(governor.remaining(), { cost: 0.6, calls: 1, tokens: 550 });
  assert.throws(() => governor.reconcile({ reservation, actual: { cost: 0.1 } }), /unknown or already reconciled reservation/);
});

test('reconciliation rejects actual usage above the hard ceiling without consuming the reservation', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  const reservation = governor.reserve({ cost: 0.5, calls: 1, tokens: 500 });
  assert.throws(
    () => governor.reconcile({ reservation, actual: { cost: 1.2, calls: 1, tokens: 500 } }),
    /actual usage exceeds budget limits/,
  );
  assert.deepEqual(governor.remaining(), { cost: 0.5, calls: 1, tokens: 500 });
  assert.equal(governor.release(reservation).reservationId, reservation.id);
});

test('released reservations become available without recording spend', () => {
  const governor = createEfficiencyGovernor({ budget: { maxCost: 1, maxCalls: 2, maxTokens: 1000 } });
  const reservation = governor.reserve({ cost: 0.6, calls: 1, tokens: 600 });
  governor.release(reservation);
  assert.deepEqual(governor.remaining(), { cost: 1, calls: 2, tokens: 1000 });
  assert.equal(governor.reserve({ cost: 1, calls: 2, tokens: 1000 })?.id !== undefined, true);
});

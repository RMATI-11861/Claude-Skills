import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addItem, createCart, subtotal, total } from '../src/cart.js';

test('subtotal sums price times quantity', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', price: 10, quantity: 2 });
  addItem(cart, { sku: 'B', price: 5 });
  assert.equal(subtotal(cart), 25);
});

test('adding an existing sku increases its quantity', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', price: 10 });
  addItem(cart, { sku: 'A', price: 10, quantity: 2 });
  assert.equal(cart.items.length, 1);
  assert.equal(cart.items[0].quantity, 3);
});

test('total applies a percentage discount', () => {
  const cart = createCart();
  addItem(cart, { sku: 'A', price: 100 });
  assert.equal(total(cart, 10), 90);
});

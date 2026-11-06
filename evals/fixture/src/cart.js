// Shopping cart operations. Prices are in BRL; quantities are whole units.

export function createCart() {
  return { items: [] };
}

export function addItem(cart, { sku, price, quantity = 1 }) {
  const existing = cart.items.find((item) => item.sku === sku);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ sku, price, quantity });
  }
  return cart;
}

export function subtotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function total(cart, discountPercent = 0) {
  const gross = subtotal(cart);
  const discount = gross * (discountPercent / 100);
  return Math.round(gross * 100) / 100;
}

export const defaultProducts = [
  { id: 1, name: 'Pulse Wireless Headphones', category: 'Audio', price: 129, stock: 24 },
  { id: 2, name: 'Apex Mechanical Keyboard', category: 'Accessories', price: 89, stock: 18 },
  { id: 3, name: 'Precision Wireless Mouse', category: 'Accessories', price: 59, stock: 32 },
  { id: 4, name: 'Summit Laptop', category: 'Computing', price: 1499, stock: 7 },
];

export const productStorageKey = 'apexstore.admin-preview.products.v1';

export const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function createDefaultProducts() {
  return defaultProducts.map((product) => ({ ...product }));
}

export function loadProducts() {
  const savedProducts = localStorage.getItem(productStorageKey);
  if (savedProducts === null) return createDefaultProducts();

  const parsedProducts = JSON.parse(savedProducts);
  if (!Array.isArray(parsedProducts)) {
    throw new TypeError('Saved products must be a list.');
  }

  const ids = new Set();
  const validProducts = parsedProducts.every((product) => {
    const valid =
      product !== null &&
      Number.isSafeInteger(product.id) &&
      product.id > 0 &&
      typeof product.name === 'string' &&
      typeof product.category === 'string' &&
      Number.isFinite(product.price) &&
      product.price >= 0 &&
      Number.isInteger(product.stock) &&
      product.stock >= 0;

    if (!valid || ids.has(product.id)) return false;
    ids.add(product.id);
    return true;
  });

  if (!validProducts) {
    throw new TypeError('Saved product data is invalid.');
  }

  return parsedProducts;
}

export function saveProducts(products) {
  localStorage.setItem(productStorageKey, JSON.stringify(products));
}

export const defaultProducts = [
  { id: 1, name: 'Pulse Wireless Headphones', category: 'Audio', price: 129, stock: 24 },
  { id: 2, name: 'Apex Mechanical Keyboard', category: 'Accessories', price: 89, stock: 18 },
  { id: 3, name: 'Precision Wireless Mouse', category: 'Accessories', price: 59, stock: 32 },
  { id: 4, name: 'Summit Laptop', category: 'Computing', price: 1499, stock: 7 },
];

export const productStorageKey = 'apexstore.admin-preview.products.v1';
export const billStorageKey = 'apexstore.admin-preview.bills.v1';

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

export function loadBills() {
  const savedBills = localStorage.getItem(billStorageKey);
  if (savedBills === null) return [];

  const parsedBills = JSON.parse(savedBills);
  if (!Array.isArray(parsedBills)) {
    throw new TypeError('Saved bills must be a list.');
  }

  const ids = new Set();
  const validBills = parsedBills.every((bill) => {
    const valid =
      bill !== null &&
      Number.isSafeInteger(bill.id) &&
      bill.id > 0 &&
      typeof bill.createdAt === 'string' &&
      Number.isFinite(Date.parse(bill.createdAt)) &&
      typeof bill.reviewed === 'boolean' &&
      Array.isArray(bill.items) &&
      bill.items.length > 0 &&
      Number.isFinite(bill.total) &&
      bill.total >= 0 &&
      bill.items.every((item) =>
        item !== null &&
        Number.isSafeInteger(item.productId) &&
        item.productId > 0 &&
        typeof item.name === 'string' &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
      );

    if (!valid || ids.has(bill.id)) return false;
    ids.add(bill.id);
    return true;
  });

  if (!validBills) {
    throw new TypeError('Saved bill data is invalid.');
  }

  return parsedBills;
}

export function saveBills(bills) {
  localStorage.setItem(billStorageKey, JSON.stringify(bills));
}

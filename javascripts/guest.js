import {
  createDefaultProducts,
  loadProducts,
  money,
  productStorageKey,
} from './store.js';

const productSearch = document.querySelector('#productSearch');
const categoryFilter = document.querySelector('#categoryFilter');
const guestProductGrid = document.querySelector('#guestProductGrid');
const storeResultCount = document.querySelector('#storeResultCount');
const billItems = document.querySelector('#billItems');
const billItemCount = document.querySelector('#billItemCount');
const billSubtotal = document.querySelector('#billSubtotal');
const billTotal = document.querySelector('#billTotal');
const billMessage = document.querySelector('#billMessage');
const printBillButton = document.querySelector('#printBillButton');

let products;
try {
  products = loadProducts();
} catch {
  products = createDefaultProducts();
  billMessage.textContent =
    'Saved products could not be loaded. Showing the sample list instead.';
}

const cart = new Map();
let searchTerm = '';

function renderCategoryOptions() {
  const selectedCategory = categoryFilter.value || 'all';
  const categories = [...new Set(products.map((product) => product.category))]
    .sort((first, second) => first.localeCompare(second));
  categoryFilter.replaceChildren(new Option('All categories', 'all'));

  categories.forEach((category) => {
    categoryFilter.append(new Option(category, category));
  });

  categoryFilter.value = categories.includes(selectedCategory) ? selectedCategory : 'all';
}

function renderProducts() {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const selectedCategory = categoryFilter.value || 'all';
  const matchingProducts = products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(normalizedSearch);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  guestProductGrid.replaceChildren();
  storeResultCount.textContent = `${matchingProducts.length} ${
    matchingProducts.length === 1 ? 'product' : 'products'
  }`;

  if (matchingProducts.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'store-empty-state';
    emptyState.textContent = 'No products found. Try a different search or category.';
    guestProductGrid.append(emptyState);
    return;
  }

  matchingProducts.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'guest-product-card';

    const category = document.createElement('p');
    category.className = 'guest-product-category';
    category.textContent = product.category;

    const name = document.createElement('h2');
    name.textContent = product.name;

    const details = document.createElement('div');
    details.className = 'guest-product-details';

    const price = document.createElement('strong');
    price.textContent = money.format(product.price);

    const stock = document.createElement('span');
    stock.textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';

    const addButton = document.createElement('button');
    addButton.className = 'primary-button';
    addButton.dataset.addProduct = String(product.id);
    addButton.type = 'button';
    addButton.textContent = product.stock > 0 ? 'Add to bill' : 'Out of stock';
    addButton.disabled = product.stock === 0 || (cart.get(product.id) || 0) >= product.stock;
    if (cart.get(product.id) >= product.stock && product.stock > 0) {
      addButton.textContent = 'Stock limit reached';
    }

    details.append(price, stock);
    card.append(category, name, details, addButton);
    guestProductGrid.append(card);
  });
}

function renderBill() {
  billItems.replaceChildren();
  const entries = [...cart.entries()]
    .map(([id, quantity]) => ({
      product: products.find((item) => item.id === id),
      quantity,
    }))
    .filter((entry) => entry.product);

  const itemCount = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const subtotal = entries.reduce(
    (sum, entry) => sum + entry.product.price * entry.quantity,
    0,
  );
  billItemCount.textContent = String(itemCount);
  billSubtotal.textContent = money.format(subtotal);
  billTotal.textContent = money.format(subtotal);
  printBillButton.disabled = entries.length === 0;

  if (entries.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'bill-empty-state';
    emptyState.textContent = 'Your bill is empty. Add a product to get started.';
    billItems.append(emptyState);
    return;
  }

  entries.forEach(({ product, quantity }) => {
    const item = document.createElement('div');
    item.className = 'bill-item';

    const itemHeading = document.createElement('div');
    itemHeading.className = 'bill-item-heading';

    const name = document.createElement('strong');
    name.textContent = product.name;

    const unitPrice = document.createElement('span');
    unitPrice.textContent = `${money.format(product.price)} each`;
    itemHeading.append(name, unitPrice);

    const itemFooter = document.createElement('div');
    itemFooter.className = 'bill-item-footer';

    const quantityControls = document.createElement('div');
    quantityControls.className = 'bill-quantity-controls';

    const decrementButton = document.createElement('button');
    decrementButton.type = 'button';
    decrementButton.dataset.cartAction = 'decrement';
    decrementButton.dataset.productId = String(product.id);
    decrementButton.setAttribute('aria-label', `Remove one ${product.name}`);
    decrementButton.textContent = '−';

    const quantityValue = document.createElement('span');
    quantityValue.textContent = String(quantity);

    const incrementButton = document.createElement('button');
    incrementButton.type = 'button';
    incrementButton.dataset.cartAction = 'increment';
    incrementButton.dataset.productId = String(product.id);
    incrementButton.setAttribute('aria-label', `Add one ${product.name}`);
    incrementButton.textContent = '+';
    incrementButton.disabled = quantity >= product.stock;

    const lineTotal = document.createElement('strong');
    lineTotal.textContent = money.format(product.price * quantity);

    quantityControls.append(decrementButton, quantityValue, incrementButton);
    itemFooter.append(quantityControls, lineTotal);
    item.append(itemHeading, itemFooter);
    billItems.append(item);
  });
}

productSearch.addEventListener('input', () => {
  searchTerm = productSearch.value;
  renderProducts();
});

categoryFilter.addEventListener('change', renderProducts);

guestProductGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-product]');
  if (!button) return;

  const productId = Number(button.dataset.addProduct);
  const product = products.find((item) => item.id === productId);
  if (!product || product.stock <= 0) return;

  const quantity = cart.get(productId) || 0;
  if (quantity >= product.stock) {
    billMessage.textContent = `Only ${product.stock} ${product.name} available in stock.`;
    return;
  }

  cart.set(productId, quantity + 1);
  billMessage.textContent = `${product.name} added to your bill.`;
  renderProducts();
  renderBill();
});

billItems.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;

  const productId = Number(button.dataset.productId);
  const product = products.find((item) => item.id === productId);
  const quantity = cart.get(productId) || 0;
  if (!product || quantity === 0) return;

  if (button.dataset.cartAction === 'increment' && quantity < product.stock) {
    cart.set(productId, quantity + 1);
  } else if (button.dataset.cartAction === 'decrement') {
    if (quantity === 1) cart.delete(productId);
    else cart.set(productId, quantity - 1);
  }

  billMessage.textContent = '';
  renderProducts();
  renderBill();
});

printBillButton.addEventListener('click', () => {
  if (cart.size > 0) window.print();
});

window.addEventListener('storage', (event) => {
  if (event.key !== productStorageKey && event.key !== null) return;

  try {
    products = loadProducts();
  } catch {
    billMessage.textContent = 'Product updates could not be loaded from the other tab.';
    return;
  }

  for (const [productId, quantity] of cart) {
    const product = products.find((item) => item.id === productId);
    if (!product) cart.delete(productId);
    else if (quantity > product.stock) {
      if (product.stock === 0) cart.delete(productId);
      else cart.set(productId, product.stock);
    }
  }

  renderCategoryOptions();
  renderProducts();
  renderBill();
});

renderCategoryOptions();
renderProducts();
renderBill();

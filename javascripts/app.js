const adminTab = document.querySelector('#adminTab');
const customerTab = document.querySelector('#customerTab');
const adminPanel = document.querySelector('#adminPanel');
const customerPanel = document.querySelector('#customerPanel');
const guestMessage = document.querySelector('#guestMessage');
const adminAccessCard = document.querySelector('#adminAccessCard');
const adminLoginForm = document.querySelector('#adminLoginForm');
const adminMessage = document.querySelector('#adminMessage');
const adminDashboard = document.querySelector('#adminDashboard');
const productMessage = document.querySelector('#productMessage');
const productTableBody = document.querySelector('#productTableBody');
const productCount = document.querySelector('#productCount');
const productForm = document.querySelector('#productForm');
const productFormTitle = document.querySelector('#productFormTitle');
const saveProductButton = document.querySelector('#saveProductButton');
const storageKey = 'apexstore.admin-preview.products.v1';
const sampleAdmin = {
  email: 'admin@apexstore.test',
  password: 'admin123',
};

const defaultProducts = [
  { id: 1, name: 'Pulse Wireless Headphones', category: 'Audio', price: 129, stock: 24 },
  { id: 2, name: 'Apex Mechanical Keyboard', category: 'Accessories', price: 89, stock: 18 },
  { id: 3, name: 'Precision Wireless Mouse', category: 'Accessories', price: 59, stock: 32 },
  { id: 4, name: 'Summit Laptop', category: 'Computing', price: 1499, stock: 7 },
];

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function loadProducts() {
  try {
    const savedProducts = localStorage.getItem(storageKey);
    if (savedProducts === null) return defaultProducts.map((product) => ({ ...product }));

    const parsedProducts = JSON.parse(savedProducts);
    if (!Array.isArray(parsedProducts)) {
      throw new TypeError('Saved products must be a list.');
    }

    return parsedProducts;
  } catch {
    productMessage.textContent =
      'Saved products could not be loaded. Showing the sample list instead.';
    return defaultProducts.map((product) => ({ ...product }));
  }
}

let products = loadProducts();

function saveProducts(nextProducts, successMessage) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextProducts));
  } catch {
    productMessage.textContent =
      'Could not save changes in this browser. Check storage permissions and try again.';
    return false;
  }

  products = nextProducts;
  renderProducts();
  productMessage.textContent = successMessage;
  return true;
}

function makeCell(value) {
  const cell = document.createElement('td');
  cell.textContent = value;
  return cell;
}

function renderProducts() {
  productTableBody.replaceChildren();
  productCount.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'}`;

  if (products.length === 0) {
    const row = document.createElement('tr');
    const cell = makeCell('No products yet. Add your first product.');
    cell.colSpan = 6;
    row.append(cell);
    productTableBody.append(row);
    return;
  }

  products.forEach((product) => {
    const row = document.createElement('tr');
    row.append(
      makeCell(String(product.id)),
      makeCell(product.name),
      makeCell(product.category),
      makeCell(money.format(product.price)),
      makeCell(String(product.stock)),
    );

    const actions = document.createElement('td');
    actions.className = 'table-actions';

    const editButton = document.createElement('button');
    editButton.className = 'table-action';
    editButton.dataset.action = 'edit';
    editButton.dataset.productId = String(product.id);
    editButton.type = 'button';
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'table-action delete-action';
    deleteButton.dataset.action = 'delete';
    deleteButton.dataset.productId = String(product.id);
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';

    actions.append(editButton, deleteButton);
    row.append(actions);
    productTableBody.append(row);
  });
}

function openProductForm(product) {
  productForm.reset();
  productMessage.textContent = '';
  productForm.hidden = false;

  if (product) {
    productFormTitle.textContent = `Edit product #${product.id}`;
    saveProductButton.textContent = 'Save changes';
    productForm.elements.id.value = String(product.id);
    productForm.elements.name.value = product.name;
    productForm.elements.category.value = product.category;
    productForm.elements.price.value = String(product.price);
    productForm.elements.stock.value = String(product.stock);
  } else {
    productFormTitle.textContent = 'Add product';
    saveProductButton.textContent = 'Save product';
  }

  productForm.elements.name.focus();
}

function closeProductForm() {
  productForm.reset();
  productForm.hidden = true;
}

function showPanel(selectedTab) {
  const isAdmin = selectedTab === adminTab;
  const tabs = [adminTab, customerTab];

  tabs.forEach((tab) => {
    const active = tab === selectedTab;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  adminPanel.hidden = !isAdmin;
  customerPanel.hidden = isAdmin;
  guestMessage.textContent = '';
}

adminTab.addEventListener('click', () => showPanel(adminTab));
customerTab.addEventListener('click', () => showPanel(customerTab));

for (const tab of [adminTab, customerTab]) {
  tab.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const nextTab = tab === adminTab ? customerTab : adminTab;
      showPanel(nextTab);
      nextTab.focus();
    }
  });
}

adminLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(adminLoginForm);
  const email = String(formData.get('email')).trim().toLowerCase();
  const password = String(formData.get('password'));

  if (email !== sampleAdmin.email || password !== sampleAdmin.password) {
    adminMessage.textContent = 'Email or password is incorrect.';
    return;
  }

  adminMessage.textContent = '';
  adminAccessCard.hidden = true;
  adminDashboard.hidden = false;
  renderProducts();
});

document.querySelector('#closeDashboardButton').addEventListener('click', () => {
  adminDashboard.hidden = true;
  adminAccessCard.hidden = false;
  adminLoginForm.reset();
  adminMessage.textContent = '';
  closeProductForm();
});

document.querySelector('#addProductButton').addEventListener('click', () => {
  openProductForm();
});

document.querySelector('#cancelProductButton').addEventListener('click', closeProductForm);
document.querySelector('#discardProductButton').addEventListener('click', closeProductForm);

productTableBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const productId = Number(button.dataset.productId);
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  if (button.dataset.action === 'edit') {
    openProductForm(product);
    return;
  }

  if (button.dataset.action === 'delete' && window.confirm(`Delete "${product.name}"?`)) {
    saveProducts(
      products.filter((item) => item.id !== productId),
      `${product.name} was deleted.`,
    );
  }
});

productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!productForm.reportValidity()) return;

  const formData = new FormData(productForm);
  const idValue = formData.get('id');
  const name = String(formData.get('name')).trim();
  const category = String(formData.get('category')).trim();
  const price = Number(formData.get('price'));
  const stock = Number(formData.get('stock'));

  if (!name || !category || !Number.isFinite(price) || price < 0 ||
      !Number.isInteger(stock) || stock < 0) {
    productMessage.textContent = 'Enter a name, category, valid price, and whole-number stock.';
    return;
  }

  if (idValue) {
    const productId = Number(idValue);
    const nextProducts = products.map((product) =>
      product.id === productId
        ? { ...product, name, category, price, stock }
        : product,
    );
    if (saveProducts(nextProducts, `${name} was updated.`)) closeProductForm();
    return;
  }

  const nextId = products.reduce((highestId, product) => Math.max(highestId, product.id), 0) + 1;
  const nextProducts = [...products, { id: nextId, name, category, price, stock }];
  if (saveProducts(nextProducts, `${name} was added.`)) closeProductForm();
});

document.querySelector('#guestButton').addEventListener('click', () => {
  guestMessage.textContent =
    'Guest shopping needs no account. The storefront is the next step to build.';
});

renderProducts();

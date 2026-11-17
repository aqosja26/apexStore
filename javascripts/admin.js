import {
  createDefaultProducts,
  loadProducts,
  money,
  productStorageKey,
  saveProducts as persistProducts,
} from './store.js';
import { endAdminSession, hasAdminSession, startAdminSession } from './admin-session.js';

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

const sampleAdmin = {
  email: 'admin@apexstore.test',
  password: 'admin123',
};

let products;
try {
  products = loadProducts();
} catch {
  products = createDefaultProducts();
  productMessage.textContent =
    'Saved products could not be loaded. Showing the sample list instead.';
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

function saveProductList(nextProducts, successMessage) {
  try {
    persistProducts(nextProducts);
  } catch {
    productMessage.textContent =
      'Could not save product changes in this browser. Check storage permissions and try again.';
    return false;
  }

  products = nextProducts;
  renderProducts();
  productMessage.textContent = successMessage;
  return true;
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
  startAdminSession();
  adminAccessCard.hidden = true;
  adminDashboard.hidden = false;
  renderProducts();
});

document.querySelector('#signOutButton').addEventListener('click', () => {
  endAdminSession();
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
    saveProductList(
      products.filter((item) => item.id !== productId),
      `${product.name} was deleted.`,
    );
  }
});

window.addEventListener('storage', (event) => {
  if (event.key !== productStorageKey && event.key !== null) return;

  try {
    products = loadProducts();
    renderProducts();
  } catch {
    productMessage.textContent = 'Product updates could not be loaded from the other tab.';
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
    if (saveProductList(nextProducts, `${name} was updated.`)) closeProductForm();
    return;
  }

  const nextId = products.reduce((highestId, product) => Math.max(highestId, product.id), 0) + 1;
  const nextProducts = [...products, { id: nextId, name, category, price, stock }];
  if (saveProductList(nextProducts, `${name} was added.`)) closeProductForm();
});

if (hasAdminSession()) {
  adminAccessCard.hidden = true;
  adminDashboard.hidden = false;
}

renderProducts();

import { endAdminSession, hasAdminSession } from './admin-session.js';
import {
  billStorageKey,
  loadBills,
  loadProducts,
  money,
  productStorageKey,
} from './store.js';

if (!hasAdminSession()) {
  window.location.replace('admin.html');
} else {
  const statisticsPage = document.querySelector('#statisticsPage');
  const statisticsMessage = document.querySelector('#statisticsMessage');
  const productCount = document.querySelector('#statisticsProductCount');
  const stockCount = document.querySelector('#statisticsStockCount');
  const inventoryValue = document.querySelector('#statisticsInventoryValue');
  const billCount = document.querySelector('#statisticsBillCount');
  const billValue = document.querySelector('#statisticsBillValue');
  const pendingCount = document.querySelector('#statisticsPendingCount');
  let products = [];
  let bills = [];
  let productsUnavailable = false;
  let billsUnavailable = false;

  function renderStatistics() {
    const stock = products.reduce((sum, product) => sum + product.stock, 0);
    const inventory = products.reduce(
      (sum, product) => sum + product.price * product.stock,
      0,
    );
    const submittedTotal = bills.reduce((sum, bill) => sum + bill.total, 0);
    const pending = bills.filter((bill) => !bill.reviewed).length;

    productCount.textContent = productsUnavailable ? 'Unavailable' : String(products.length);
    stockCount.textContent = productsUnavailable ? 'Unavailable' : String(stock);
    inventoryValue.textContent = productsUnavailable ? 'Unavailable' : money.format(inventory);
    billCount.textContent = billsUnavailable ? 'Unavailable' : String(bills.length);
    billValue.textContent = billsUnavailable ? 'Unavailable' : money.format(submittedTotal);
    pendingCount.textContent = billsUnavailable ? 'Unavailable' : String(pending);

    const errors = [];
    if (productsUnavailable) errors.push('Product statistics could not be loaded.');
    if (billsUnavailable) errors.push('Bill statistics could not be loaded.');
    statisticsMessage.textContent = errors.join(' ');
  }

  function refreshProducts() {
    try {
      products = loadProducts();
      productsUnavailable = false;
    } catch {
      productsUnavailable = true;
    }
    renderStatistics();
  }

  function refreshBills() {
    try {
      bills = loadBills();
      billsUnavailable = false;
    } catch {
      billsUnavailable = true;
    }
    renderStatistics();
  }

  window.addEventListener('storage', (event) => {
    if (event.key === productStorageKey || event.key === null) refreshProducts();
    if (event.key === billStorageKey || event.key === null) refreshBills();
  });

  document.querySelector('#signOutButton').addEventListener('click', () => {
    endAdminSession();
    window.location.replace('admin.html');
  });

  statisticsPage.hidden = false;
  refreshProducts();
  refreshBills();
}

import { endAdminSession, hasAdminSession } from './admin-session.js';
import {
  billStorageKey,
  loadBills,
  money,
  saveBills,
} from './store.js';

if (!hasAdminSession()) {
  window.location.replace('admin.html');
} else {
  const billReviewPage = document.querySelector('#billReviewPage');
  const billReviewList = document.querySelector('#billReviewList');
  const billCount = document.querySelector('#billCount');
  const billReviewMessage = document.querySelector('#billReviewMessage');
  let bills = [];
  let loadFailed = false;

  function renderBills() {
    billReviewList.replaceChildren();
    billCount.textContent = `${bills.length} ${bills.length === 1 ? 'bill' : 'bills'}`;

    if (bills.length === 0) {
      const emptyState = document.createElement('p');
      emptyState.className = 'bill-review-empty';
      emptyState.textContent = loadFailed
        ? 'Bills could not be loaded from this browser.'
        : 'No bills have been submitted for review yet.';
      billReviewList.append(emptyState);
      return;
    }

    bills.forEach((bill) => {
      const card = document.createElement('article');
      card.className = 'bill-review-card';

      const heading = document.createElement('div');
      heading.className = 'bill-review-heading';

      const title = document.createElement('div');
      const billTitle = document.createElement('h3');
      billTitle.textContent = `Bill #${bill.id}`;
      const date = document.createElement('p');
      date.textContent = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(bill.createdAt));
      title.append(billTitle, date);

      const status = document.createElement('span');
      status.className = bill.reviewed ? 'bill-status is-reviewed' : 'bill-status';
      status.textContent = bill.reviewed ? 'Reviewed' : 'Needs review';
      heading.append(title, status);

      const items = document.createElement('ul');
      items.className = 'bill-review-items';
      bill.items.forEach((item) => {
        const line = document.createElement('li');
        line.textContent = `${item.name} × ${item.quantity} — ${money.format(item.price * item.quantity)}`;
        items.append(line);
      });

      const footer = document.createElement('div');
      footer.className = 'bill-review-footer';
      const total = document.createElement('strong');
      total.textContent = `Total: ${money.format(bill.total)}`;
      footer.append(total);

      if (!bill.reviewed) {
        const reviewButton = document.createElement('button');
        reviewButton.className = 'secondary-button';
        reviewButton.type = 'button';
        reviewButton.dataset.reviewBill = String(bill.id);
        reviewButton.textContent = 'Mark reviewed';
        footer.append(reviewButton);
      }

      card.append(heading, items, footer);
      billReviewList.append(card);
    });
  }

  function refreshBills() {
    try {
      bills = loadBills();
      loadFailed = false;
      billReviewMessage.textContent = '';
    } catch {
      loadFailed = true;
      billReviewMessage.textContent = "Saved bills could not be loaded. Check this browser's storage.";
    }
    renderBills();
  }

  billReviewList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-review-bill]');
    if (!button) return;

    const billId = Number(button.dataset.reviewBill);
    const nextBills = bills.map((bill) =>
      bill.id === billId ? { ...bill, reviewed: true } : bill,
    );

    try {
      saveBills(nextBills);
    } catch {
      billReviewMessage.textContent =
        'Could not save this review in this browser. Check storage permissions and try again.';
      return;
    }

    bills = nextBills;
    billReviewMessage.textContent = `Bill #${billId} marked as reviewed.`;
    renderBills();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === billStorageKey || event.key === null) refreshBills();
  });

  document.querySelector('#signOutButton').addEventListener('click', () => {
    endAdminSession();
    window.location.replace('admin.html');
  });

  billReviewPage.hidden = false;
  refreshBills();
}

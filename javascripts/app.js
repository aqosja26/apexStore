const adminTab = document.querySelector('#adminTab');
const customerTab = document.querySelector('#customerTab');
const adminPanel = document.querySelector('#adminPanel');
const customerPanel = document.querySelector('#customerPanel');
const loginForm = document.querySelector('#adminLoginForm');
const adminMessage = document.querySelector('#adminMessage');
const guestMessage = document.querySelector('#guestMessage');

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
  adminMessage.textContent = '';
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

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  adminMessage.textContent =
    'Administrator sign-in is not connected yet. Secure authentication needs a backend.';
});

document.querySelector('#guestButton').addEventListener('click', () => {
  guestMessage.textContent =
    'Guest shopping needs no account. The storefront is the next step to build.';
});

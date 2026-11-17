const adminSessionKey = 'apexstore.admin-preview.admin-access.v1';

export function hasAdminSession() {
  return localStorage.getItem(adminSessionKey) === 'signed-in';
}

export function startAdminSession() {
  localStorage.setItem(adminSessionKey, 'signed-in');
}

export function endAdminSession() {
  localStorage.removeItem(adminSessionKey);
}

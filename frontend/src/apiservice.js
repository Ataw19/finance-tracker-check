// src/apiService.js

const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Terjadi kesalahan pada server');
  }
  if (response.status === 204 || response.headers.get('Content-Length') === '0') {
      return null;
  }
  return response.json();
};

// --- AUTH ---
export const login = (email, password) => apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
export const register = (email, password) => {
  return apiFetch('/auth/register', { // Pastikan endpoint-nya '/auth/register'
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};
// --- TRANSACTIONS (CRUD) ---
export const getTransactions = () => apiFetch('/transactions');
export const createTransaction = (data) => apiFetch('/transactions', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateTransaction = (id, data) => apiFetch(`/transactions/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const deleteTransaction = (id) => apiFetch(`/transactions/${id}`, { method: 'DELETE' });

// --- CATEGORIES (CRUD) ---
export const getCategories = () => apiFetch('/categories');
export const createCategory = (data) => apiFetch('/categories', {
  method: 'POST',
  body: JSON.stringify(data),
});
export const updateCategory = (id, data) => apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
});
export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' });


// --- BUDGETS (Read & Update) ---
export const getBudgets = (year, month) => apiFetch(`/budgets?year=${year}&month=${month}`);
export const setBudget = (data) => apiFetch('/budgets', {
    method: 'POST', // Backend menggunakan POST untuk create/update
    body: JSON.stringify(data)
});

// --- ACCOUNTS ---
export const getAccounts = () => apiFetch('/accounts');
export const createAccount = (data) => apiFetch('/accounts', {
  method: 'POST',
  body: JSON.stringify(data),
});
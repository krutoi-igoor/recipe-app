const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

let accessToken = localStorage.getItem('accessToken') || '';
let refreshToken = localStorage.getItem('refreshToken') || '';

const setTokens = (token, refresh) => {
  accessToken = token || '';
  refreshToken = refresh || '';
  if (token) localStorage.setItem('accessToken', token); else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh); else localStorage.removeItem('refreshToken');
};

const authHeaders = () => accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

const handleJson = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const errors = Array.isArray(data?.errors) ? data.errors.join(', ') : undefined;
    const message = errors || data?.error || data?.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

const request = async (path, { method = 'GET', body, auth = false } = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleJson(res);
};

export const api = {
  setTokens,
  getTokens: () => ({ accessToken, refreshToken }),
  clearTokens: () => setTokens('', ''),

  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),

  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me', { auth: true }),
  refresh: async () => {
    if (!refreshToken) throw new Error('No refresh token');
    const data = await request('/auth/refresh', { method: 'POST', body: { refreshToken } });
    setTokens(data.data.token, data.data.refreshToken);
    return data;
  },

  recipes: {
    list: () => request('/recipes', { auth: true }),
    create: (payload) => request('/recipes', { method: 'POST', body: payload, auth: true }),
    get: (id) => request(`/recipes/${id}`, { auth: true }),
  },

  rawGet: (path) => fetch(`${API_BASE}${path}`),
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

let accessToken = localStorage.getItem('accessToken') || '';
let refreshToken = localStorage.getItem('refreshToken') || '';
let refreshPromise = null;

const setTokens = (token, refresh) => {
  accessToken = token || '';
  refreshToken = refresh || '';
  if (token) localStorage.setItem('accessToken', token); else localStorage.removeItem('accessToken');
  if (refresh) localStorage.setItem('refreshToken', refresh); else localStorage.removeItem('refreshToken');
};

const clearTokens = () => setTokens('', '');

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

const rawFetch = (path, { method = 'GET', body, headers }) => fetch(`${API_BASE}${path}`, {
  method,
  headers,
  body: body ? JSON.stringify(body) : undefined,
});

const performRefresh = async () => {
  if (!refreshToken) throw new Error('No refresh token');
  if (!refreshPromise) {
    refreshPromise = rawFetch('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      headers: { 'Content-Type': 'application/json' },
    })
      .then(handleJson)
      .then((data) => {
        const next = data?.data || data;
        setTokens(next.token, next.refreshToken);
        return next;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

const request = async (path, { method = 'GET', body, auth = false, retry = true } = {}) => {
  const res = await rawFetch(path, {
    method,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? authHeaders() : {}),
    },
  });

  if (res.status === 401 && auth && retry) {
    try {
      await performRefresh();
      return request(path, { method, body, auth, retry: false });
    } catch (err) {
      clearTokens();
      throw err;
    }
  }

  return handleJson(res);
};

export const api = {
  setTokens,
  getTokens: () => ({ accessToken, refreshToken }),
  clearTokens,

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
    update: (id, payload) => request(`/recipes/${id}`, { method: 'PUT', body: payload, auth: true }),
    delete: (id) => request(`/recipes/${id}`, { method: 'DELETE', auth: true }),
  },

  mealPlans: {
    list: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/meal-plans${qs ? '?' + qs : ''}`, { auth: true });
    },
    create: (payload) => request('/meal-plans', { method: 'POST', body: payload, auth: true }),
    get: (id) => request(`/meal-plans/${id}`, { auth: true }),
    update: (id, payload) => request(`/meal-plans/${id}`, { method: 'PUT', body: payload, auth: true }),
    delete: (id) => request(`/meal-plans/${id}`, { method: 'DELETE', auth: true }),
    shoppingList: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/meal-plans/shopping-list${qs ? '?' + qs : ''}`, { auth: true });
    },
  },

  collections: {
    list: () => request('/collections', { auth: true }),
    create: (payload) => request('/collections', { method: 'POST', body: payload, auth: true }),
    addRecipe: (collectionId, payload) => request(`/collections/${collectionId}/recipes`, { method: 'POST', body: payload, auth: true }),
    removeRecipe: (collectionId, recipeId) => request(`/collections/${collectionId}/recipes/${recipeId}`, { method: 'DELETE', auth: true }),
    delete: (id) => request(`/collections/${id}`, { method: 'DELETE', auth: true }),
  },

  rawGet: (path) => fetch(`${API_BASE}${path}`),
};

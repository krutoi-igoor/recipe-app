const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export const api = {
  get: (path, options = {}) => fetch(`${API_BASE}${path}`, {
    ...options,
    method: 'GET'
  })
};

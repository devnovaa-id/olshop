const API_BASE = '/api';

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}/${endpoint}`, { ...options, headers });
  
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.hash = '#/login';
    throw new Error('Sesi habis, silakan login ulang');
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: (endpoint, params) => {
    const url = new URL(`${API_BASE}/${endpoint}`, window.location.origin);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    return fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => {
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '#/login';
        throw new Error('Sesi habis');
      }
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    });
  },
  post: (endpoint, data) => apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => apiCall(endpoint, { method: 'DELETE' }),
};

window.api = api;
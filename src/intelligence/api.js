// intelligence/api.js — cliente isolado da Torre Intel
// Reusa apenas o TOKEN do api.js principal (dependência unidirecional permitida).
// Ponto único de contato entre as torres no frontend.

import api from '../api';

const API_BASE = api.baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, opts = {}) {
  const token = api.getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Intel API ${res.status}: ${text || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export const intelApi = {
  health: () => request('/api/intel/health'),
  ping: () => request('/api/intel/ping'),

  nichesOptions: () => request('/api/intel/niches/options'),
  nichesTenants: () => request('/api/intel/niches/tenants'),
  setTenantNiche: (tenantId, niche) =>
    request(`/api/intel/niches/${tenantId}`, {
      method: 'PUT',
      body: JSON.stringify({ niche }),
    }),
  inferTenantNiche: (tenantId) =>
    request(`/api/intel/niches/${tenantId}/infer`, { method: 'POST' }),

  topObjections: (niche, { force = false } = {}) =>
    request(`/api/intel/objections/${niche}${force ? '?force=1' : ''}`),
  invalidateObjectionsCache: (niche) =>
    request(`/api/intel/objections/${niche}/cache`, { method: 'DELETE' }),
};

export default intelApi;

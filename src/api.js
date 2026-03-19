const API_URL = 'https://borsato-crm-api.vercel.app';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  }

  logout() {
    this.clearToken();
  }

  async getTenants() {
    return await this.request('/api/tenants');
  }

  async getTenant(id) {
    return await this.request(`/api/tenants/${id}`);
  }

  async createTenant(tenantData) {
    return await this.request('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData)
    });
  }

  async updateTenant(id, data) {
    return await this.request(`/api/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async healthCheck() {
    return await this.request('/api/health');
  }
}

export const api = new ApiService();
export default api;

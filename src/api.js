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
        throw new Error(error.error || 'Erro na requisicao');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Autenticacao
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

  // Tenants
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

  async deleteTenant(id) {
    return await this.request(`/api/tenants/${id}`, {
      method: 'DELETE'
    });
  }

  // Leads
  async createLead(leadData) {
    return await this.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  async updateLead(id, data) {
    return await this.request(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteLead(id) {
    return await this.request(`/api/leads/${id}`, {
      method: 'DELETE'
    });
  }

  // Grupos
  async createGroup(groupData) {
    return await this.request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  }

  async updateGroup(id, data) {
    return await this.request(`/api/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteGroup(id) {
    return await this.request(`/api/groups/${id}`, {
      method: 'DELETE'
    });
  }

  // Base de Conhecimento
  async createKnowledge(knowledgeData) {
    return await this.request('/api/knowledge', {
      method: 'POST',
      body: JSON.stringify(knowledgeData)
    });
  }

  async updateKnowledge(id, data) {
    return await this.request(`/api/knowledge/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteKnowledge(id) {
    return await this.request(`/api/knowledge/${id}`, {
      method: 'DELETE'
    });
  }

  // Usuarios
  async getUsers() {
    return await this.request('/api/users');
  }

  async createUser(userData) {
    return await this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id, data) {
    return await this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id) {
    return await this.request(`/api/users/${id}`, {
      method: 'DELETE'
    });
  }

  // WhatsApp
  async connectWhatsApp(tenantId, instanceToken) {
    return await this.request('/api/whatsapp/connect', {
      method: 'POST',
      body: JSON.stringify({ tenantId, instanceToken })
    });
  }

  async getWhatsAppStatus(tenantId) {
    return await this.request(`/api/whatsapp/status?tenantId=${tenantId}`);
  }

  async disconnectWhatsApp(tenantId) {
    return await this.request('/api/whatsapp/disconnect', {
      method: 'POST',
      body: JSON.stringify({ tenantId })
    });
  }

  async syncWhatsAppGroups() {
    return await this.request('/api/whatsapp/sync-groups', {
      method: 'POST'
    });
  }

  // Chats
  async getChats(tenantId) {
    return await this.request(`/api/chats?tenantId=${tenantId}`);
  }

  async getChatMessages(chatId, limit, offset) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    return await this.request(`/api/chats/${chatId}/messages?${params.toString()}`);
  }

  // Enviar mensagem WhatsApp
  async sendWhatsAppMessage(number, message, tenantId, chatId) {
    return await this.request('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ number, message, tenantId, chatId })
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/api/health');
  }
}

export const api = new ApiService();
export default api;

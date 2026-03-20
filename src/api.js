class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na requisição');
    return data;
  }

  // AUTH
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  }

  logout() {
    localStorage.removeItem('token');
  }

  // TENANTS
  async getTenants() { return await this.request('/api/tenants'); }
  async getTenant(id) { return await this.request(`/api/tenants/${id}`); }
  async createTenant(data) {
    return await this.request('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async updateTenant(id, data) {
    return await this.request(`/api/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  async deleteTenant(id) {
    return await this.request(`/api/tenants/${id}`, { method: 'DELETE' });
  }

  // LEADS
  async getLeads(tenantId) { return await this.request(`/api/leads?tenantId=${tenantId}`); }
  async createLead(data) {
    return await this.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async updateLead(id, data) {
    return await this.request(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  async updateLeadStage(id, stage) {
    return await this.request(`/api/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ stage })
    });
  }
  async deleteLead(id) {
    return await this.request(`/api/leads/${id}`, { method: 'DELETE' });
  }
  async getLeadByPhone(phone, tenantId) {
    return await this.request(`/api/leads/by-phone/${phone}?tenantId=${tenantId}`);
  }

  // KANBAN COLUMNS (ADICIONADO)
  async getKanbanColumns(tenantId) {
    return await this.request(`/api/kanban-columns?tenantId=${tenantId}`);
  }
  async createKanbanColumn(data) {
    return await this.request('/api/kanban-columns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async deleteKanbanColumn(id) {
    return await this.request(`/api/kanban-columns/${id}`, { method: 'DELETE' });
  }

  // GROUPS
  async getGroups(tenantId) { return await this.request(`/api/groups?tenantId=${tenantId}`); }
  async createGroup(data) {
    return await this.request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async deleteGroup(id) {
    return await this.request(`/api/groups/${id}`, { method: 'DELETE' });
  }

  // WHATSAPP
  async getWhatsAppStatus(tenantId) {
    return await this.request(`/api/whatsapp/status?tenantId=${tenantId}`);
  }
  async connectWhatsApp(tenantId, instanceToken) {
    return await this.request('/api/whatsapp/connect', {
      method: 'POST',
      body: JSON.stringify({ tenantId, instanceToken })
    });
  }
  async disconnectWhatsApp(tenantId) {
    return await this.request('/api/whatsapp/disconnect', {
      method: 'POST',
      body: JSON.stringify({ tenantId })
    });
  }
  async sendWhatsAppMessage(number, message, tenantId, chatId) {
    return await this.request('/api/whatsapp/send', {
      method: 'POST',
      body: JSON.stringify({ number, message, tenantId, chatId })
    });
  }
  async syncWhatsAppGroups() {
    return await this.request('/api/whatsapp/sync-groups', { method: 'POST' });
  }

  // CHATS & MESSAGES
  async getChats(tenantId) { return await this.request(`/api/chats?tenantId=${tenantId}`); }
  async getChatMessages(chatId, limit = 50, offset = 0) {
    return await this.request(`/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  // KNOWLEDGE BASE
  async createKnowledge(data) {
    return await this.request('/api/knowledge', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async deleteKnowledge(id) {
    return await this.request(`/api/knowledge/${id}`, { method: 'DELETE' });
  }

  // USERS
  async getUsers(tenantId) { return await this.request(`/api/users?tenantId=${tenantId}`); }
  async createUser(data) {
    return await this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  async deleteUser(id) {
    return await this.request(`/api/users/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export default api;

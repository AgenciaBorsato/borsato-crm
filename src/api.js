class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}), ...options.headers };
    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro');
    return data;
  }

  async login(email, password) { const d = await this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); if (d.token) localStorage.setItem('token', d.token); return d; }
  logout() { localStorage.removeItem('token'); }

  async getTenants() { return await this.request('/api/tenants'); }
  async getTenant(id) { return await this.request(`/api/tenants/${id}`); }
  async createTenant(data) { return await this.request('/api/tenants', { method: 'POST', body: JSON.stringify(data) }); }
  async updateTenant(id, data) { return await this.request(`/api/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteTenant(id) { return await this.request(`/api/tenants/${id}`, { method: 'DELETE' }); }

  async getLeads(tid) { return await this.request(`/api/leads?tenantId=${tid}`); }
  async createLead(data) { return await this.request('/api/leads', { method: 'POST', body: JSON.stringify(data) }); }
  async updateLead(id, data) { return await this.request(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async updateLeadStage(id, stage) { return await this.request(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify({ stage }) }); }
  async deleteLead(id) { return await this.request(`/api/leads/${id}`, { method: 'DELETE' }); }
  async getLeadByPhone(phone, tid) { return await this.request(`/api/leads/by-phone/${phone}?tenantId=${tid}`); }

  async getKanbanColumns(tid) { return await this.request(`/api/kanban-columns?tenantId=${tid}`); }
  async createKanbanColumn(data) { return await this.request('/api/kanban-columns', { method: 'POST', body: JSON.stringify(data) }); }
  async updateKanbanColumn(id, data) { return await this.request(`/api/kanban-columns/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteKanbanColumn(id) { return await this.request(`/api/kanban-columns/${id}`, { method: 'DELETE' }); }

  async getGroups(tid) { return await this.request(`/api/groups?tenantId=${tid}`); }
  async createGroup(data) { return await this.request('/api/groups', { method: 'POST', body: JSON.stringify(data) }); }
  async deleteGroup(id) { return await this.request(`/api/groups/${id}`, { method: 'DELETE' }); }

  async getWhatsAppStatus(tid) { return await this.request(`/api/whatsapp/status?tenantId=${tid}`); }
  async connectWhatsApp(tid, token) { return await this.request('/api/whatsapp/connect', { method: 'POST', body: JSON.stringify({ tenantId: tid, instanceToken: token }) }); }
  async disconnectWhatsApp(tid) { return await this.request('/api/whatsapp/disconnect', { method: 'POST', body: JSON.stringify({ tenantId: tid }) }); }
  async sendWhatsAppMessage(number, message, tid, chatId) { return await this.request('/api/whatsapp/send', { method: 'POST', body: JSON.stringify({ number, message, tenantId: tid, chatId }) }); }
  async syncWhatsAppGroups() { return await this.request('/api/whatsapp/sync-groups', { method: 'POST' }); }
async deleteChat(id) { return await this.request(`/api/chats/${id}`, { method: 'DELETE' }); }
  async getChats(tid) { return await this.request(`/api/chats?tenantId=${tid}`); }
  async getChatMessages(chatId, limit = 50, offset = 0) { return await this.request(`/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`); }

  async createKnowledge(data) { return await this.request('/api/knowledge', { method: 'POST', body: JSON.stringify(data) }); }
  async deleteKnowledge(id) { return await this.request(`/api/knowledge/${id}`, { method: 'DELETE' }); }

  async getUsers(tid) { return await this.request(`/api/users?tenantId=${tid}`); }
  async createUser(data) { return await this.request('/api/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id, data) { return await this.request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteUser(id) { return await this.request(`/api/users/${id}`, { method: 'DELETE' }); }
}

export const api = new ApiService();
export default api;

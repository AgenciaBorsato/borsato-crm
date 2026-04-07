class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this._onAuthError = null;
    this._sessionId = sessionStorage.getItem('borsato_session_id') || null;
  }

  onAuthError(cb) { this._onAuthError = cb; }

  _tokenKey() { return this._sessionId ? `token_${this._sessionId}` : 'token'; }
  _userDataKey() { return this._sessionId ? `userData_${this._sessionId}` : 'userData'; }

  getToken() { return localStorage.getItem(this._tokenKey()); }
  getUserData() { try { return JSON.parse(localStorage.getItem(this._userDataKey())); } catch { return null; } }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    };
    const response = await fetch(`${this.baseUrl}${endpoint}`, { ...options, headers });
    let data = null;
    try { data = await response.json(); } catch (e) { data = null; }
    if (response.status === 401 || response.status === 403) {
      if (this._onAuthError) this._onAuthError();
      throw new Error('Sessao expirada');
    }
    if (!response.ok) throw new Error(data?.error || 'Erro');
    return data;
  }

  async login(email, password) {
    const d = await this.request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (d.token && d.user) {
      // Cada aba/sessão do navegador recebe um ID isolado
      this._sessionId = `${d.user.id}_${Date.now()}`;
      sessionStorage.setItem('borsato_session_id', this._sessionId);
      localStorage.setItem(this._tokenKey(), d.token);
      localStorage.setItem(this._userDataKey(), JSON.stringify(d.user));
    }
    return d;
  }

  logout() {
    localStorage.removeItem(this._tokenKey());
    localStorage.removeItem(this._userDataKey());
    sessionStorage.removeItem('borsato_session_id');
    this._sessionId = null;
  }

  // TENANTS
  async getTenants() { return await this.request('/api/tenants'); }
  async getTenant(id) { return await this.request(`/api/tenants/${id}`); }
  async createTenant(data) { return await this.request('/api/tenants', { method: 'POST', body: JSON.stringify(data) }); }
  async updateTenant(id, data) { return await this.request(`/api/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteTenant(id) { return await this.request(`/api/tenants/${id}`, { method: 'DELETE' }); }

  // AI CONTROLS
  async setTenantAI(id, enabled) { return await this.request(`/api/tenants/${id}/ai`, { method: 'PUT', body: JSON.stringify({ enabled }) }); }
  async setLeadAI(id, enabled) { return await this.request(`/api/leads/${id}/ai`, { method: 'PUT', body: JSON.stringify({ enabled }) }); }

  // LEADS
  async getLeads(tid) { return await this.request(`/api/leads?tenantId=${encodeURIComponent(tid)}`); }
  async createLead(data) { return await this.request('/api/leads', { method: 'POST', body: JSON.stringify(data) }); }
  async updateLead(id, data) { return await this.request(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async updateLeadStage(id, stage) { return await this.request(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify({ stage }) }); }
  async deleteLead(id) { return await this.request(`/api/leads/${id}`, { method: 'DELETE' }); }
  async getLeadByPhone(phone, tid) { return await this.request(`/api/leads/by-phone/${encodeURIComponent(phone)}?tenantId=${encodeURIComponent(tid)}`); }
  async refreshLeadContext(leadId) { return await this.request(`/api/leads/${leadId}/refresh-context`, { method: 'POST' }); }

  // KANBAN
  async getKanbanColumns(tid) { return await this.request(`/api/kanban-columns?tenantId=${encodeURIComponent(tid)}`); }
  async createKanbanColumn(data) { return await this.request('/api/kanban-columns', { method: 'POST', body: JSON.stringify(data) }); }
  async updateKanbanColumn(id, data) { return await this.request(`/api/kanban-columns/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteKanbanColumn(id) { return await this.request(`/api/kanban-columns/${id}`, { method: 'DELETE' }); }

  // WHATSAPP
  async getWhatsAppStatus(tid) { return await this.request(`/api/whatsapp/status?tenantId=${encodeURIComponent(tid)}`); }
  async connectWhatsApp(tid, token) { return await this.request('/api/whatsapp/connect', { method: 'POST', body: JSON.stringify({ tenantId: tid, instanceToken: token }) }); }
  async disconnectWhatsApp(tid) { return await this.request('/api/whatsapp/disconnect', { method: 'POST', body: JSON.stringify({ tenantId: tid }) }); }
  async sendWhatsAppMessage(number, message, tid, chatId, quotedMessageId = null) { return await this.request('/api/whatsapp/send', { method: 'POST', body: JSON.stringify({ number, message, tenantId: tid, chatId, quotedMessageId }) }); }
  async forwardMessage(messageId, targetChatId, tid) { return await this.request('/api/whatsapp/forward', { method: 'POST', body: JSON.stringify({ messageId, targetChatId, tenantId: tid }) }); }
  async sendWhatsAppMedia(data) { return await this.request('/api/whatsapp/send-media', { method: 'POST', body: JSON.stringify(data) }); }
  async fetchMedia(tenantId, messageKey) { return await this.request('/api/whatsapp/media', { method: 'POST', body: JSON.stringify({ tenantId, messageKey }) }); }
  async fetchProfilePic(phone, tenantId) { return await this.request(`/api/whatsapp/profile-pic/${encodeURIComponent(phone)}?tenantId=${encodeURIComponent(tenantId)}`); }
  async syncProfilePics(tenantId) { return await this.request('/api/whatsapp/sync-profile-pics', { method: 'POST', body: JSON.stringify({ tenantId }) }); }
  async getGroupParticipants(tenantId, groupJid) { return await this.request(`/api/whatsapp/group-participants?tenantId=${encodeURIComponent(tenantId)}&groupJid=${encodeURIComponent(groupJid)}`); }
  async sendReaction(tenantId, chatId, messageId, remoteJid, emoji) { return await this.request('/api/whatsapp/react', { method: 'POST', body: JSON.stringify({ tenantId, chatId, messageId, remoteJid, emoji }) }); }
  async searchContacts(tid, search) { return await this.request(`/api/whatsapp/contacts?tenantId=${encodeURIComponent(tid)}&search=${encodeURIComponent(search)}`); }
  async syncContacts(tid) { return await this.request('/api/whatsapp/sync-contacts', { method: 'POST', body: JSON.stringify({ tenantId: tid }) }); }
  async startChat(phone, name, tid) { return await this.request('/api/chats/start', { method: 'POST', body: JSON.stringify({ phone, name, tenantId: tid }) }); }

  // CHATS
  async getChats(tid) { return await this.request(`/api/chats?tenantId=${encodeURIComponent(tid)}`); }
  async getDeletedChats(tid) { return await this.request(`/api/chats/deleted?tenantId=${encodeURIComponent(tid)}`); }
  async getChatMessages(chatId, limit = 50, offset = 0) { return await this.request(`/api/chats/${encodeURIComponent(chatId)}/messages?limit=${limit}&offset=${offset}`); }
  async markChatRead(chatId) { return await this.request(`/api/chats/${encodeURIComponent(chatId)}/read`, { method: 'POST', body: '{}' }); }
  async markAllChatsRead(tid) { return await this.request('/api/chats/read-all', { method: 'POST', body: JSON.stringify({ tenantId: tid }) }); }
  async deleteChat(id) { return await this.request(`/api/chats/${id}`, { method: 'DELETE' }); }
  async restoreChat(id) { return await this.request(`/api/chats/${id}/restore`, { method: 'POST' }); }

  // KNOWLEDGE
  async createKnowledge(data) { return await this.request('/api/knowledge', { method: 'POST', body: JSON.stringify(data) }); }
  async updateKnowledge(id, data) { return await this.request(`/api/knowledge/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteKnowledge(id) { return await this.request(`/api/knowledge/${id}`, { method: 'DELETE' }); }

  // ANALYTICS
  async getAnalytics(tid, days = 30) { return await this.request(`/api/analytics?tenantId=${encodeURIComponent(tid)}&days=${days}`); }
  async getAnalyticsInsights(tid) { return await this.request(`/api/analytics/insights?tenantId=${encodeURIComponent(tid)}`); }

  // USERS
  async getUsers(tid) { return await this.request(`/api/users?tenantId=${encodeURIComponent(tid)}`); }
  async sendHeartbeat(status = 'online') { return await this.request('/api/users/heartbeat', { method: 'POST', body: JSON.stringify({ status }) }); }
  async getOnlineUsers(tid) { return await this.request(`/api/users/online?tenantId=${encodeURIComponent(tid)}`); }
  async createUser(data) { return await this.request('/api/users', { method: 'POST', body: JSON.stringify(data) }); }
  async updateUser(id, data) { return await this.request(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteUser(id) { return await this.request(`/api/users/${id}`, { method: 'DELETE' }); }

  // FOLLOW-UPS
  async getFollowUps(tid) { return await this.request(`/api/follow-ups?tenantId=${encodeURIComponent(tid)}`); }
  async createFollowUp(data) { return await this.request('/api/follow-ups', { method: 'POST', body: JSON.stringify(data) }); }
  async updateFollowUp(id, data) { return await this.request(`/api/follow-ups/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteFollowUp(id) { return await this.request(`/api/follow-ups/${id}`, { method: 'DELETE' }); }
  async completeFollowUp(id) { return await this.request(`/api/follow-ups/${id}/complete`, { method: 'POST' }); }

  // SCHEDULED MESSAGES
  async getScheduledMessages(tid) { return await this.request(`/api/scheduled-messages?tenantId=${encodeURIComponent(tid)}`); }
  async createScheduledMessage(data) { return await this.request('/api/scheduled-messages', { method: 'POST', body: JSON.stringify(data) }); }
  async updateScheduledMessage(id, data) { return await this.request(`/api/scheduled-messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  async deleteScheduledMessage(id) { return await this.request(`/api/scheduled-messages/${id}`, { method: 'DELETE' }); }
}

export const api = new ApiService();
export default api;

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
async getLeadByPhone(phone, tenantId) {
    return await this.request(`/api/leads/by-phone/${phone}?tenantId=${tenantId}`);
  }

  async updateLeadStage(leadId, stage) {
    return await this.request(`/api/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify({ stage })
    });
  }
```

Commit com `feat: buscar lead por telefone e atualizar estagio`

---

**Agora o App.jsx**. Procura com Ctrl+F:
```
function ChatView({ tenant }) {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStage, setUpdatingStage] = useState(false);
  const messagesEndRef = useRef(null);

  const stages = [
    { id: 'novo', label: 'Novo', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'qualificado', label: 'Qualificado', color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'negociacao', label: 'Negociacao', color: 'bg-purple-500/20 text-purple-400' },
    { id: 'ganho', label: 'Ganho', color: 'bg-green-500/20 text-green-400' },
    { id: 'perdido', label: 'Perdido', color: 'bg-red-500/20 text-red-400' }
  ];

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
      loadLeadForChat(currentChat);
      const interval = setInterval(() => loadMessages(currentChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [currentChat?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await api.getChats(tenant.id);
      setChats(data);
      setLoadingChats(false);
    } catch (err) { setLoadingChats(false); }
  };

  const loadMessages = async (chatId) => {
    try {
      const data = await api.getChatMessages(chatId, 100, 0);
      setMessages(data);
    } catch (err) { console.error('Erro ao carregar mensagens:', err); }
  };

  const loadLeadForChat = async (chat) => {
    const phone = chat.contact_phone || chat.remote_jid?.split('@')[0];
    if (!phone) { setCurrentLead(null); return; }
    try {
      const lead = await api.getLeadByPhone(phone, tenant.id);
      setCurrentLead(lead);
    } catch (err) { setCurrentLead(null); }
  };

  const handleSelectChat = async (chat) => {
    setCurrentChat(chat);
    setCurrentLead(null);
    setLoadingMessages(true);
    try {
      const data = await api.getChatMessages(chat.id, 100, 0);
      setMessages(data);
      loadLeadForChat(chat);
    } catch (err) { console.error(err); }
    finally { setLoadingMessages(false); }
  };

  const handleChangeStage = async (newStage) => {
    if (!currentLead) return;
    setUpdatingStage(true);
    try {
      await api.updateLeadStage(currentLead.id, newStage);
      setCurrentLead({ ...currentLead, stage: newStage });
    } catch (err) { alert('Erro ao atualizar estagio: ' + err.message); }
    finally { setUpdatingStage(false); }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentChat) return;
    const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
    if (!phone) { alert('Numero nao encontrado'); return; }
    setSending(true);
    try {
      await api.sendWhatsAppMessage(phone, message, tenant.id, currentChat.id);
      setMessage('');
      await loadMessages(currentChat.id);
      await loadChats();
    } catch (err) { alert('Erro ao enviar: ' + err.message); }
    finally { setSending(false); }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchTerm) return true;
    const name = (chat.contact_name || chat.contact_phone || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const raw = String(timestamp);
    const date = new Date(raw.replace('Z', ''));
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-3 h-3 inline mr-1" />;
      case 'audio': return <Mic className="w-3 h-3 inline mr-1" />;
      case 'video': return <FileIcon className="w-3 h-3 inline mr-1" />;
      case 'document': return <FileText className="w-3 h-3 inline mr-1" />;
      case 'location': return <MapPin className="w-3 h-3 inline mr-1" />;
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-zinc-500" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-zinc-500" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default: return <Clock className="w-3 h-3 text-zinc-600" />;
    }
  };

  const getStageInfo = (stageId) => stages.find(s => s.id === stageId) || stages[0];

  return (
    <div className="flex gap-0 h-[calc(100vh-220px)] bg-zinc-900 rounded-xl overflow-hidden">
      {/* Lista de conversas */}
      <div className="w-96 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-bold text-lg mb-3">Conversas</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar conversa..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="text-center py-8 text-zinc-500 text-sm">Carregando conversas...</div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm px-4">
              {chats.length === 0 ? 'Nenhuma conversa ainda. As mensagens recebidas pelo WhatsApp aparecerao aqui automaticamente.' : 'Nenhuma conversa encontrada'}
            </div>
          ) : (
            filteredChats.map(chat => (
              <div key={chat.id} onClick={() => handleSelectChat(chat)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 ${currentChat?.id === chat.id ? 'bg-zinc-800' : ''}`}>
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">{(chat.contact_name || chat.contact_phone || '?').substring(0, 2).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">{chat.contact_name || chat.contact_phone || 'Desconhecido'}</h4>
                    <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">{formatTime(chat.last_message_time)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-400 truncate flex-1">{chat.last_message || 'Sem mensagens'}</p>
                    {chat.unread_count > 0 && (
                      <span className="ml-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">{chat.unread_count > 9 ? '9+' : chat.unread_count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Area de mensagens */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Header do chat com info do lead */}
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{(currentChat.contact_name || currentChat.contact_phone || '?').substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{currentChat.contact_name || currentChat.contact_phone || 'Desconhecido'}</h3>
                    <p className="text-xs text-zinc-400">{currentChat.contact_phone}</p>
                  </div>
                </div>
                {/* Seletor de estagio do lead */}
                {currentLead && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Estagio:</span>
                    <div className="flex gap-1">
                      {stages.map(stage => (
                        <button
                          key={stage.id}
                          onClick={() => handleChangeStage(stage.id)}
                          disabled={updatingStage}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            currentLead.stage === stage.id
                              ? stage.color + ' ring-1 ring-current'
                              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 p-4 overflow-y-auto bg-zinc-950/50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
              {loadingMessages ? (
                <div className="text-center py-8 text-zinc-500 text-sm">Carregando mensagens...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">Nenhuma mensagem nesta conversa ainda</div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        msg.is_from_me ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-800 border border-zinc-700'
                      }`}>
                        {msg.sender_name && (
                          <p className={`text-xs font-bold mb-1 ${msg.is_from_me ? 'text-amber-400' : 'text-blue-400'}`}>{msg.sender_name}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {getMessageTypeIcon(msg.message_type)}
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-zinc-500">{formatTime(msg.timestamp)}</span>
                          {msg.is_from_me && getStatusIcon(msg.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input de mensagem */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !sending) { e.preventDefault(); handleSend(); } }}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
                  disabled={sending}
                />
                <button onClick={handleSend} disabled={sending || !message.trim()} className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending ? <Clock className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-zinc-500 mb-2">Selecione uma conversa</h3>
              <p className="text-sm text-zinc-600">Escolha um contato na lista para ver as mensagens</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
  // Health check
  async healthCheck() {
    return await this.request('/api/health');
  }
}

export const api = new ApiService();
export default api;

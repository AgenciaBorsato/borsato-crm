import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import { 
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send, Bot, User, 
  Circle, Clock, Phone, Mail, MapPin, Tag, ChevronDown, X, Check, Zap,
  Filter, MoreVertical, Archive, Trash2, TrendingUp, Target, DollarSign,
  BarChart3, Activity, Flame, Snowflake, ThermometerSun, BookOpen, 
  FileText, FolderOpen, AlertCircle, CheckCircle2, XCircle, Calendar,
  Bell, Repeat, Sparkles, Brain, Database, Save, Edit2, ChevronRight,
  Building2, Shield, Key, LogOut, Eye, Trash, UserPlus, Copy, ExternalLink,
  GripVertical, ArrowLeft, Smartphone, Image, Mic, FileIcon, MapPinIcon,
  CheckCheck
} from 'lucide-react';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function BorsatoCRM() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        
        if (user.role === 'super_admin') {
          setCurrentView('superAdmin');
          loadTenants();
        } else {
          setCurrentView('clientDashboard');
          loadTenantData(user.tenantId);
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) {
      setError('Erro ao carregar clientes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantData = async (tenantId) => {
    setLoading(true);
    try {
      const data = await api.getTenant(tenantId);
      setCurrentTenant(data);
    } catch (err) {
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await api.login(credentials.email, credentials.password);
      setCurrentUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      if (user.role === 'super_admin') {
        setCurrentView('superAdmin');
        await loadTenants();
      } else {
        setCurrentView('clientDashboard');
        await loadTenantData(user.tenantId);
      }
    } catch (err) {
      setError('Login falhou: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setCurrentView('login');
    setCurrentTenant(null);
    setTenants([]);
  };

  const refreshTenantData = async () => {
    if (currentTenant) {
      const data = await api.getTenant(currentTenant.id);
      setCurrentTenant(data);
    }
  };

  if (currentView === 'login') return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  
  if (currentView === 'superAdmin') return (
    <SuperAdminPanel user={currentUser} tenants={tenants} onLogout={handleLogout} 
      onAccessTenant={(id) => { loadTenantData(id); setCurrentView('clientDashboard'); }} 
    />
  );

  if (currentView === 'clientDashboard' && currentTenant) return (
    <ClientDashboard user={currentUser} tenant={currentTenant} onLogout={handleLogout} 
      onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => setCurrentView('superAdmin') : null}
      onRefresh={refreshTenantData}
    />
  );

  return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
}

// ============================================================================
// DASHBOARD DO CLIENTE
// ============================================================================

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [columns, setColumns] = useState([]);
  const [loadingCols, setLoadingCols] = useState(true);

  const loadColumns = async () => {
    try {
      const data = await api.getKanbanColumns(tenant.id);
      setColumns(data);
    } catch (err) { console.error('Erro ao carregar colunas:', err); }
    finally { setLoadingCols(false); }
  };

  useEffect(() => { loadColumns(); }, [tenant.id]);

  const handleRefreshAll = async () => {
    await loadColumns();
    await onRefresh();
  };

  const leads = tenant.leads || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 bg-zinc-900/50 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black">
            {tenant.name.substring(0,2).toUpperCase()}
          </div>
          <h1 className="text-xl font-bold">{tenant.name}</h1>
        </div>
        <div className="flex gap-2 text-sm">
          {onBackToSuperAdmin && <button onClick={onBackToSuperAdmin} className="px-4 py-2 bg-zinc-800 rounded-lg">Voltar</button>}
          <button onClick={onLogout} className="px-4 py-2 bg-zinc-800 rounded-lg">Sair</button>
        </div>
      </div>

      <div className="border-b border-zinc-800 bg-zinc-900/30 px-6 flex gap-4 overflow-x-auto">
        {[
          { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'leads', label: 'Leads', icon: Users },
          { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className={`py-4 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-400'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'kanban' && <KanbanView leads={leads} columns={columns} tenant={tenant} onRefresh={handleRefreshAll} />}
        {activeTab === 'chat' && <ChatView tenant={tenant} columns={columns} onRefresh={handleRefreshAll} />}
        {activeTab === 'leads' && <LeadsView leads={leads} columns={columns} onRefresh={handleRefreshAll} />}
        {activeTab === 'whatsapp' && <WhatsAppView tenant={tenant} onRefresh={onRefresh} />}
      </div>
    </div>
  );
}

// ============================================================================
// TELA DE LOGIN (FIX: COR DA FONTE E LAYOUT)
// ============================================================================

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 p-10 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-3xl font-black text-black mb-6 shadow-xl">BR</div>
          <h1 className="text-2xl font-black tracking-tight text-white">BORSATO CRM</h1>
          <p className="text-zinc-500 text-sm mt-1 uppercase tracking-widest font-bold">Gestão Inteligente de Clientes</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({email, password}); }} className="space-y-5">
          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">E-mail de acesso</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Senha secreta</label>
            <input 
              type="password" 
              placeholder="********" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-all" 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/10">
            {loading ? 'AUTENTICANDO...' : 'ACESSAR AGORA'}
          </button>
          {error && <p className="text-red-500 text-xs text-center font-bold bg-red-500/10 p-3 rounded-lg">{error}</p>}
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// CHAT VIEW (Sincronizado e Genérico)
// ============================================================================

function ChatView({ tenant, columns, onRefresh }) {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { loadChats(); }, [tenant.id]);
  useEffect(() => { 
    if (currentChat) { 
      loadMessages(currentChat.id); 
      loadLeadForChat(currentChat);
    }
  }, [currentChat]);

  const loadChats = async () => {
    const data = await api.getChats(tenant.id);
    setChats(data);
  };

  const loadMessages = async (chatId) => {
    const data = await api.getChatMessages(chatId);
    setMessages(data);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadLeadForChat = async (chat) => {
    const phone = chat.contact_phone || chat.remote_jid?.split('@')[0];
    try {
      const lead = await api.getLeadByPhone(phone, tenant.id);
      setCurrentLead(lead);
    } catch (err) { setCurrentLead(null); }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
    await api.sendWhatsAppMessage(phone, message, tenant.id, currentChat.id);
    setMessage('');
    await loadMessages(currentChat.id);
    setSending(false);
  };

  const handleChangeStage = async (stageId) => {
    if (!currentLead) return;
    try {
      await api.updateLead(currentLead.id, { ...currentLead, stage: stageId });
      await loadLeadForChat(currentChat);
      await onRefresh();
    } catch (err) { alert('Erro ao atualizar estágio'); }
  };

  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400', yellow: 'bg-yellow-500/20 text-yellow-400', 
    purple: 'bg-purple-500/20 text-purple-400', green: 'bg-green-500/20 text-green-400', 
    red: 'bg-red-500/20 text-red-400', zinc: 'bg-zinc-500/20 text-zinc-400'
  };

  return (
    <div className="flex h-[70vh] bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
      <div className="w-80 border-r border-zinc-800 overflow-y-auto">
        {chats.map(chat => (
          <div key={chat.id} onClick={() => setCurrentChat(chat)} 
            className={`p-4 cursor-pointer hover:bg-zinc-800 border-b border-zinc-800/50 ${currentChat?.id === chat.id ? 'bg-zinc-800' : ''}`}>
            <p className="font-medium truncate">{chat.contact_name || chat.contact_phone}</p>
            <p className="text-xs text-zinc-500 truncate">{chat.last_message}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-900/50">
              <p className="font-bold">{currentChat.contact_name || currentChat.contact_phone}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {columns.map(col => {
                  const isActive = currentLead?.stage === col.id || currentLead?.stage === col.name.toLowerCase();
                  return (
                    <button key={col.id} onClick={() => handleChangeStage(col.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${
                        isActive 
                        ? 'border-white ' + colorClasses[col.color].replace('20', '80')
                        : 'border-transparent opacity-40 hover:opacity-100 ' + colorClasses[col.color]
                      }`}>
                      {col.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-3 rounded-lg ${msg.is_from_me ? 'bg-amber-500 text-black shadow-md' : 'bg-zinc-800 text-white border border-zinc-700'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Digite sua resposta..." className="flex-1 bg-zinc-800 border-none rounded-lg px-4 text-sm text-white" />
              <button onClick={handleSend} disabled={sending} className="p-3 bg-amber-500 rounded-lg text-black hover:bg-amber-600 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// KANBAN VIEW
// ============================================================================

function KanbanView({ leads, columns, tenant, onRefresh }) {
  const [draggedLead, setDraggedLead] = useState(null);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumn, setNewColumn] = useState({ name: '', color: 'blue' });

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    await api.createKanbanColumn({ tenantId: tenant.id, name: newColumn.name, color: newColumn.color, position: columns.length });
    setNewColumn({ name: '', color: 'blue' });
    setShowColumnModal(false);
    onRefresh();
  };

  const handleDrop = async (stageId) => {
    if (!draggedLead) return;
    await api.updateLead(draggedLead.id, { ...draggedLead, stage: stageId });
    setDraggedLead(null);
    onRefresh();
  };

  const colorClasses = {
    blue: 'bg-blue-500', yellow: 'bg-yellow-500', purple: 'bg-purple-500',
    green: 'bg-green-500', red: 'bg-red-500', zinc: 'bg-zinc-500'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Pipeline de Vendas</h2>
        <button onClick={() => setShowColumnModal(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Etapa
        </button>
      </div>

      {columns.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <LayoutGrid className="w-12 h-12 mx-auto text-zinc-800 mb-4" />
          <p className="text-zinc-500 mb-6">Crie as etapas do seu funil de vendas (ex: Prospecção, Negociação, Fechado).</p>
          <button onClick={() => setShowColumnModal(true)} className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl shadow-lg hover:bg-amber-600 transition-all">Criar Primeira Coluna</button>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {columns.map(col => {
            const stageLeads = leads.filter(l => l.stage === col.id || l.stage === col.name.toLowerCase());
            return (
              <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(col.id)}
                className="w-80 bg-zinc-900/40 rounded-xl p-4 flex-shrink-0 min-h-[500px] border border-zinc-800/50">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorClasses[col.color]}`}></div>
                    <h3 className="font-bold text-sm tracking-wide">{col.name}</h3>
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>
                  <button onClick={async () => { if(confirm('Excluir esta etapa?')) { await api.deleteKanbanColumn(col.id); onRefresh(); } }}>
                    <X className="w-3.5 h-3.5 text-zinc-700 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <div className="space-y-3">
                  {stageLeads.map(lead => (
                    <div key={lead.id} draggable onDragStart={() => setDraggedLead(lead)}
                      className="bg-zinc-800 p-3 rounded-lg cursor-move border border-zinc-700/50 hover:border-amber-500/40 transition-all shadow-sm">
                      <p className="font-bold text-xs mb-1">{lead.name}</p>
                      <p className="text-[10px] text-zinc-500">{lead.phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showColumnModal && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md border border-zinc-800 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-white">Nova Etapa do Funil</h2>
            <form onSubmit={handleCreateColumn} className="space-y-5">
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Nome da Coluna</label>
                <input type="text" placeholder="Ex: Proposta Enviada" value={newColumn.name} 
                  onChange={e => setNewColumn({...newColumn, name: e.target.value})} className="w-full bg-zinc-800 border-zinc-700 rounded-xl text-sm p-3 text-white focus:ring-amber-500" required />
              </div>
              <div>
                <label className="text-xs text-zinc-500 font-bold uppercase mb-2 block">Cor</label>
                <div className="flex justify-between p-2 bg-zinc-800 rounded-xl">
                  {['blue', 'yellow', 'purple', 'green', 'red', 'zinc'].map(c => (
                    <button key={c} type="button" onClick={() => setNewColumn({...newColumn, color: c})}
                      className={`w-8 h-8 rounded-full ${colorClasses[c]} transition-transform ${newColumn.color === c ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-40 hover:opacity-100'}`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setShowColumnModal(false)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold text-sm text-white">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl text-sm hover:bg-amber-600 transition-colors">Criar Etapa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LEADS VIEW
// ============================================================================

function LeadsView({ leads, columns, onRefresh }) {
  const getStageName = (stageId) => {
    const col = columns.find(c => c.id === stageId || c.name.toLowerCase() === stageId);
    return col ? col.name : stageId;
  };
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xl">
      <table className="w-full text-left">
        <thead className="bg-zinc-800/80 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4">Contato</th>
            <th className="p-4">Estágio</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {leads.map(lead => (
            <tr key={lead.id} className="hover:bg-zinc-800/20 transition-colors">
              <td className="p-4 font-bold text-sm text-white">{lead.name}</td>
              <td className="p-4 text-xs text-zinc-400 font-mono">{lead.phone}</td>
              <td className="p-4">
                <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 border border-zinc-700">{getStageName(lead.stage)}</span>
              </td>
              <td className="p-4 text-right">
                <button onClick={async () => { if(confirm('Deletar lead?')) { await api.deleteLead(lead.id); onRefresh(); } }} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// WHATSAPP E SUPER ADMIN
// ============================================================================

function WhatsAppView({ tenant, onRefresh }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  useEffect(() => { check(); }, []);
  const check = async () => { try { const s = await api.getWhatsAppStatus(tenant.id); setStatus(s); } catch(e){} };
  const handleConnect = async () => { await api.connectWhatsApp(tenant.id, token); setToken(''); check(); };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl">
        <h3 className="text-xl font-bold mb-6 text-white">Conexão WhatsApp (Evolution)</h3>
        {status?.connected ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-green-500 font-bold">WhatsApp Conectado</p>
            <p className="text-xs text-zinc-500 mt-2">Pronto para receber mensagens e qualificar leads.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-zinc-400 text-sm">Insira o token da sua instância no Evolution Manager:</p>
            <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Instance Token" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white font-mono" />
            <button onClick={handleConnect} className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-600 transition-all">Ativar Agora</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SuperAdminPanel({ user, tenants, onLogout, onAccessTenant }) {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black tracking-tighter">PAINEL ADMINISTRATIVO</h1>
        <button onClick={onLogout} className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-full font-bold text-xs hover:bg-zinc-800">SAIR</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tenants.map(t => (
          <div key={t.id} className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 hover:border-amber-500/50 transition-all group">
            <h3 className="text-2xl font-black mb-1 group-hover:text-amber-500 transition-colors">{t.name}</h3>
            <p className="text-zinc-500 text-sm font-mono mb-8">{t.email}</p>
            <button onClick={() => onAccessTenant(t.id)} className="w-full py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-amber-500 hover:text-black transition-all uppercase text-xs tracking-widest">Acessar CRM</button>
          </div>
        ))}
      </div>
    </div>
  );
}

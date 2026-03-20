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
        localStorage.clear();
      }
    }
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const data = await api.getTenants();
      setTenants(data);
    } catch (err) { setError('Falha ao carregar clientes.'); }
    finally { setLoading(false); }
  };

  const loadTenantData = async (tenantId) => {
    setLoading(true);
    try {
      const data = await api.getTenant(tenantId);
      setCurrentTenant(data);
    } catch (err) { setError('Erro ao carregar CRM.'); }
    finally { setLoading(false); }
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
    } catch (err) { setError('E-mail ou senha incorretos.'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    api.logout();
    localStorage.clear();
    setCurrentUser(null);
    setCurrentView('login');
    setCurrentTenant(null);
  };

  const refreshData = async () => {
    if (currentView === 'superAdmin') await loadTenants();
    if (currentTenant) await loadTenantData(currentTenant.id);
  };

  if (currentView === 'login') return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  
  if (currentView === 'superAdmin') return (
    <SuperAdminPanel user={currentUser} tenants={tenants} onLogout={handleLogout} onRefresh={refreshData}
      onAccessTenant={(id) => { loadTenantData(id); setCurrentView('clientDashboard'); }} 
    />
  );

  if (currentView === 'clientDashboard' && currentTenant) return (
    <ClientDashboard user={currentUser} tenant={currentTenant} onLogout={handleLogout} 
      onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => { loadTenants(); setCurrentView('superAdmin'); } : null}
      onRefresh={refreshData}
    />
  );

  return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Carregando...</div>;
}

// ============================================================================
// LOGIN (FIX: TEXTO VISÍVEL E LAYOUT ORIGINAL)
// ============================================================================

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold text-black mb-4">BR</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Borsato CRM</h1>
          <p className="text-zinc-500 text-sm">Customer Relationship Management</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({email, password}); }} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">E-mail</label>
            <input 
              type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-700 outline-none focus:border-amber-500 transition-all" 
              required 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Senha</label>
            <input 
              type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-700 outline-none focus:border-amber-500 transition-all" 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all">
            {loading ? 'Acessando...' : 'Entrar no Sistema'}
          </button>
          {error && <p className="text-red-500 text-xs text-center font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUPER ADMIN (GOOGLE STYLE METRICS)
// ============================================================================

function SuperAdminPanel({ user, tenants, onLogout, onAccessTenant, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const totalRevenue = tenants.reduce((acc, t) => acc + (parseFloat(t.monthly_value) || 0), 0);
  const totalLeads = tenants.reduce((acc, t) => acc + (t.leadCount || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Painel de Controle Mestre</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400">
            <Plus className="w-4 h-4" /> Novo Cliente
          </button>
          <button onClick={onLogout} className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm font-medium hover:bg-zinc-800">Sair</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Receita Mensal (MRR)</p>
          <p className="text-3xl font-bold">R$ {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Total de Leads Gerados</p>
          <p className="text-3xl font-bold">{totalLeads}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Clientes Ativos</p>
          <p className="text-3xl font-bold">{tenants.length}</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 text-zinc-500 text-[11px] font-bold uppercase">
            <tr>
              <th className="p-4">Empresa / CRM</th>
              <th className="p-4">Faturamento</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-zinc-800/30">
                <td className="p-4 font-bold">{t.name}</td>
                <td className="p-4 text-green-500 font-mono text-sm">R$ {parseFloat(t.monthly_value || 0).toFixed(2)}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded uppercase">Ativo</span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => onAccessTenant(t.id)} className="p-2 bg-amber-500 text-black rounded-lg hover:scale-105" title="Acessar"><Eye className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <TenantManagerModal onClose={() => setShowModal(false)} onRefresh={onRefresh} />}
    </div>
  );
}

// ============================================================================
// DASHBOARD CLIENTE (RESTORE LAYOUT ORIGINAL)
// ============================================================================

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [columns, setColumns] = useState([]);

  useEffect(() => { 
    api.getKanbanColumns(tenant.id).then(setColumns).catch(e => {}); 
  }, [tenant.id]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 bg-zinc-900/50 p-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-bold text-black text-sm">
            {tenant.name.substring(0,2).toUpperCase()}
          </div>
          <h1 className="text-lg font-bold">{tenant.name}</h1>
        </div>
        <div className="flex gap-2">
          {onBackToSuperAdmin && <button onClick={onBackToSuperAdmin} className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold">MESTRE</button>}
          <button onClick={onLogout} className="px-4 py-2 bg-zinc-800 rounded-lg text-xs font-bold">Sair</button>
        </div>
      </div>

      <div className="border-b border-zinc-800 bg-zinc-900/20 px-6 flex gap-6 overflow-x-auto">
        {[
          { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
          { id: 'chat', label: 'Conversas', icon: MessageSquare },
          { id: 'leads', label: 'Lista de Leads', icon: Users },
          { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
            className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'kanban' && <KanbanView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={onRefresh} />}
        {activeTab === 'chat' && <ChatView tenant={tenant} columns={columns} onRefresh={onRefresh} />}
        {activeTab === 'leads' && <LeadsView leads={tenant.leads || []} columns={columns} onRefresh={onRefresh} />}
        {activeTab === 'whatsapp' && <WhatsAppView tenant={tenant} onRefresh={onRefresh} />}
        {activeTab === 'analytics' && <AnalyticsView leads={tenant.leads || []} />}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES DE VISTA (ORIGINAIS & FUNCIONAIS)
// ============================================================================

function ChatView({ tenant, columns, onRefresh }) {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { 
    api.getChats(tenant.id).then(setChats);
    const interval = setInterval(() => api.getChats(tenant.id).then(setChats), 5000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  useEffect(() => { 
    if (currentChat) { 
      api.getChatMessages(currentChat.id).then(setMessages);
      const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
      api.getLeadByPhone(phone, tenant.id).then(setCurrentLead).catch(() => setCurrentLead(null));
    }
  }, [currentChat]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
    await api.sendWhatsAppMessage(phone, message, tenant.id, currentChat.id);
    setMessage('');
    api.getChatMessages(currentChat.id).then(setMessages);
  };

  return (
    <div className="flex h-[72vh] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="w-80 border-r border-zinc-800 overflow-y-auto">
        {chats.map(chat => (
          <div key={chat.id} onClick={() => setCurrentChat(chat)} 
            className={`p-4 cursor-pointer border-b border-zinc-800/50 hover:bg-zinc-800 transition-all ${currentChat?.id === chat.id ? 'bg-zinc-800' : ''}`}>
            <p className="font-bold text-sm truncate">{chat.contact_name || chat.contact_phone}</p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">{chat.last_message}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col bg-zinc-950/40">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <p className="font-bold text-white">{currentChat.contact_name || currentChat.contact_phone}</p>
              <div className="flex gap-1 overflow-x-auto max-w-sm">
                {columns.map(col => (
                  <button key={col.id} onClick={async () => { await api.updateLead(currentLead.id, { ...currentLead, stage: col.id }); onRefresh(); }}
                    className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${currentLead?.stage === col.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.is_from_me ? 'bg-amber-500 text-black font-medium' : 'bg-zinc-800 text-white border border-zinc-700'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 flex gap-3 border-t border-zinc-800">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Resposta rápida..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-white focus:border-amber-500 outline-none" />
              <button onClick={handleSend} className="p-3 bg-amber-500 rounded-xl text-black"><Send className="w-5 h-5"/></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-700 text-sm font-bold uppercase">Selecione uma conversa</div>
        )}
      </div>
    </div>
  );
}

function KanbanView({ leads, columns, tenant, onRefresh }) {
  const [draggedLead, setDraggedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', color: 'blue' });

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.createKanbanColumn({ tenantId: tenant.id, name: newCol.name, color: newCol.color, position: columns.length });
    setNewCol({ name: '', color: 'blue' }); setShowModal(false); onRefresh();
  };

  const colorMap = { blue: 'bg-blue-500', yellow: 'bg-amber-500', purple: 'bg-purple-500', green: 'bg-green-500', red: 'bg-red-500', zinc: 'bg-zinc-500' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Pipeline de Vendas</h2>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-700"><Plus className="w-4 h-4 inline mr-1"/> Nova Etapa</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={async () => { if(draggedLead){ await api.updateLead(draggedLead.id, { ...draggedLead, stage: col.id }); setDraggedLead(null); onRefresh(); } }}
            className="w-72 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-shrink-0 min-h-[500px]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${colorMap[col.color]}`}></div>
                <h3 className="font-bold text-xs uppercase">{col.name}</h3>
              </div>
              <button onClick={async () => { if(confirm('Excluir?')) { await api.deleteKanbanColumn(col.id); onRefresh(); } }}><X className="w-3 h-3 text-zinc-600"/></button>
            </div>
            <div className="space-y-3">
              {leads.filter(l => l.stage === col.id).map(lead => (
                <div key={lead.id} draggable onDragStart={() => setDraggedLead(lead)} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 cursor-grab hover:border-amber-500 transition-all">
                  <p className="text-sm font-bold">{lead.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{lead.phone}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-6">Nova Etapa do Funil</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input type="text" placeholder="Nome da etapa" value={newCol.name} onChange={e => setNewCol({...newCol, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
              <div className="flex justify-between p-2 bg-zinc-950 rounded-xl">
                {['blue', 'yellow', 'purple', 'green', 'red', 'zinc'].map(c => (
                  <button key={c} type="button" onClick={() => setNewCol({...newCol, color: c})} className={`w-7 h-7 rounded-full ${colorMap[c]} ${newCol.color === c ? 'ring-2 ring-white scale-110' : 'opacity-40'}`} />
                ))}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODAIS E AFINS
// ============================================================================

function TenantManagerModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({ name: '', email: '', value: 497 });
  const handleSave = async (e) => {
    e.preventDefault();
    await api.createTenant({ name: formData.name, adminEmail: formData.email, monthlyValue: formData.value, adminPassword: '123' });
    onRefresh(); onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-6 text-white">Novo Contrato</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <input type="text" placeholder="Nome da Empresa" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="email" placeholder="E-mail admin" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="number" placeholder="Valor Mensal" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <button type="submit" className="w-full py-3.5 bg-amber-500 text-black font-bold rounded-xl">Criar Acesso</button>
          <button onClick={onClose} className="w-full py-2 text-zinc-500 text-sm">Cancelar</button>
        </form>
      </div>
    </div>
  );
}

function LeadsView({ leads, columns, onRefresh }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <tr><th className="p-4">Lead</th><th className="p-4">Contato</th><th className="p-4">Estágio</th><th className="p-4 text-right">Ações</th></tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {leads.map(l => (
            <tr key={l.id} className="hover:bg-zinc-800/20 transition-all">
              <td className="p-4 font-bold text-white text-sm">{l.name}</td>
              <td className="p-4 text-xs text-zinc-400 font-mono">{l.phone}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-zinc-800 text-zinc-500 text-[10px] font-bold rounded border border-zinc-700">
                  {columns.find(c => c.id === l.stage)?.name || 'Sem etapa'}
                </span>
              </td>
              <td className="p-4 text-right">
                <button onClick={async () => { if(confirm('Deletar?')) { await api.deleteLead(l.id); onRefresh(); } }} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AnalyticsView({ leads }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
        <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Total de Leads</p>
        <p className="text-2xl font-bold">{leads.length}</p>
      </div>
    </div>
  );
}

function WhatsAppView({ tenant, onRefresh }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  useEffect(() => { api.getWhatsAppStatus(tenant.id).then(setStatus); }, []);
  return (
    <div className="max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
      <h3 className="text-lg font-bold mb-4">Conexão WhatsApp</h3>
      {status?.connected ? (
        <div className="text-center py-4"><CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2"/><p className="text-green-500 font-bold">Conectado com Sucesso</p></div>
      ) : (
        <div className="space-y-4">
          <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Instance Token Evolution" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono text-xs" />
          <button onClick={async () => { await api.connectWhatsApp(tenant.id, token); onRefresh(); }} className="w-full py-3 bg-amber-500 text-black font-bold rounded-xl">Vincular Instância</button>
        </div>
      )}
    </div>
  );
}

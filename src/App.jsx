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
  CheckCheck, PieChart, BarChart
} from 'lucide-react';

// ============================================================================
// COMPONENTE PRINCIPAL (Roteamento de Vistas)
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
    } catch (err) { setError('Falha ao carregar dados mestres.'); }
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
    } catch (err) { setError('Credenciais inválidas ou erro de conexão.'); }
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
    <SuperAdminPanel 
      user={currentUser} 
      tenants={tenants} 
      onLogout={handleLogout} 
      onRefresh={refreshData}
      onAccessTenant={(id) => { loadTenantData(id); setCurrentView('clientDashboard'); }} 
    />
  );

  if (currentView === 'clientDashboard' && currentTenant) return (
    <ClientDashboard 
      user={currentUser} 
      tenant={currentTenant} 
      onLogout={handleLogout} 
      onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => { loadTenants(); setCurrentView('superAdmin'); } : null}
      onRefresh={refreshData}
    />
  );

  return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Iniciando sistema...</div>;
}

// ============================================================================
// TELA DE LOGIN (CORREÇÃO DE CORES E VISIBILIDADE)
// ============================================================================

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-10 rounded-[2rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-4xl font-black text-black mb-6">BR</div>
          <h1 className="text-2xl font-black text-white tracking-tighter">BORSATO CRM</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Customer Relationship Management</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({email, password}); }} className="space-y-6">
          <div>
            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1 mb-2 block">Identificação</label>
            <input 
              type="email" placeholder="E-mail profissional" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white placeholder-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
              required 
            />
          </div>
          <div>
            <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-1 mb-2 block">Chave de Acesso</label>
            <input 
              type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white placeholder-zinc-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10">
            {loading ? 'AUTENTICANDO...' : 'ACESSAR AGORA'}
          </button>
          {error && <div className="bg-red-500/10 text-red-500 text-[10px] font-bold p-3 rounded-xl text-center border border-red-500/20">{error}</div>}
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUPER ADMIN PANEL (GOOGLE MODE)
// ============================================================================

function SuperAdminPanel({ user, tenants, onLogout, onAccessTenant, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState('month');

  // Cálculos de Métricas
  const totalRevenue = tenants.reduce((acc, t) => acc + (parseFloat(t.monthly_value) || 0), 0);
  const totalLeads = tenants.reduce((acc, t) => acc + (t.leadCount || 0), 0);
  const totalUsers = tenants.reduce((acc, t) => acc + (t.userCount || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter">PAINEL MESTRE</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Controle Global Borsato Agência</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-black rounded-xl hover:bg-amber-400 transition-all">
            <Plus className="w-4 h-4" /> Novo Contrato
          </button>
          <button onClick={onLogout} className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl font-bold text-xs hover:bg-zinc-800">Sair</button>
        </div>
      </div>

      {/* Métricas Estilo Google Cloud */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <MetricCard icon={DollarSign} label="Receita Recorrente" value={`R$ ${totalRevenue.toLocaleString()}`} color="text-green-500" />
        <MetricCard icon={Users} label="Total de Leads" value={totalLeads} color="text-blue-500" />
        <MetricCard icon={UserPlus} label="Usuários Ativos" value={totalUsers} color="text-purple-500" />
        <MetricCard icon={Target} label="Ticket Médio" value={`R$ ${(totalRevenue / (tenants.length || 1)).toFixed(2)}`} color="text-amber-500" />
      </div>

      {/* Tabela de Gestão de CRM's */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-black text-lg">Contratos Ativos</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-zinc-800 rounded-lg text-[10px] font-bold">DIA</button>
            <button className="px-3 py-1 bg-amber-500 text-black rounded-lg text-[10px] font-bold">MÊS</button>
            <button className="px-3 py-1 bg-zinc-800 rounded-lg text-[10px] font-bold">ANO</button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-900/80">
            <tr>
              <th className="p-6">Nome do CRM / Empresa</th>
              <th className="p-6">Contrato</th>
              <th className="p-6">Métricas (Leads/Users)</th>
              <th className="p-6">Funcionalidades</th>
              <th className="p-6 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-zinc-800/30 transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-amber-500">{t.name.substring(0,2).toUpperCase()}</div>
                    <div>
                      <p className="font-bold text-white">{t.name}</p>
                      <p className="text-[10px] text-zinc-500">{t.email || 'admin@cliente.com'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-sm font-mono text-green-500">R$ {parseFloat(t.monthly_value || 0).toFixed(2)}</td>
                <td className="p-6">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-xs text-zinc-400"><Users className="w-3 h-3"/> {t.leadCount || 0}</div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400"><User className="w-3 h-3"/> {t.userCount || 0}</div>
                  </div>
                </td>
                <td className="p-6">
                   <div className="flex gap-1">
                      {JSON.parse(t.modules || '["kanban", "chat"]').map(m => (
                        <span key={m} className="px-2 py-0.5 bg-zinc-800 text-[8px] font-black uppercase rounded text-zinc-500">{m}</span>
                      ))}
                   </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onAccessTenant(t.id)} className="p-2 bg-amber-500 text-black rounded-lg hover:scale-110 transition-all" title="Acessar CRM"><Eye className="w-4 h-4"/></button>
                    <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-all"><Settings className="w-4 h-4"/></button>
                    <button className="p-2 bg-zinc-800 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4"/></button>
                  </div>
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
// DASHBOARD DO CLIENTE (DINÂMICO)
// ============================================================================

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [columns, setColumns] = useState([]);
  
  // Módulos permitidos pelo Super Admin
  const allowedModules = JSON.parse(tenant.modules || '["kanban", "chat", "leads", "whatsapp"]');

  const loadColumns = async () => {
    try {
      const data = await api.getKanbanColumns(tenant.id);
      setColumns(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadColumns(); }, [tenant.id]);

  const tabs = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'chat', label: 'Conversas', icon: MessageSquare },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'whatsapp', label: 'Conexão WA', icon: Smartphone },
    { id: 'analytics', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ].filter(t => allowedModules.includes(t.id) || t.id === 'settings');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Estilo Google */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 p-4 px-8 flex justify-between items-center sticky top-0 z-40 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-black">{tenant.name.substring(0,2).toUpperCase()}</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase">{tenant.name}</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{user.name} • {user.role}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {onBackToSuperAdmin && (
            <button onClick={onBackToSuperAdmin} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl transition-all border border-zinc-700">
              <ArrowLeft className="w-4 h-4" /> MESTRE
            </button>
          )}
          <button onClick={onLogout} className="px-4 py-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-xs font-bold rounded-xl transition-all border border-zinc-700">SAIR</button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Mini */}
        <div className="w-20 border-r border-zinc-800 flex flex-col items-center py-6 gap-6 sticky top-20 h-[calc(100vh-80px)]">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label}
              className={`p-3 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-600 hover:bg-zinc-900 hover:text-white'}`}>
              <tab.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10">
          {activeTab === 'kanban' && <KanbanView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={onRefresh} />}
          {activeTab === 'chat' && <ChatView tenant={tenant} columns={columns} onRefresh={onRefresh} />}
          {activeTab === 'leads' && <LeadsView leads={tenant.leads || []} columns={columns} onRefresh={onRefresh} />}
          {activeTab === 'whatsapp' && <WhatsAppView tenant={tenant} onRefresh={onRefresh} />}
          {activeTab === 'analytics' && <AnalyticsView leads={tenant.leads || []} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES AUXILIARES UI
// ============================================================================

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] hover:border-zinc-700 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl bg-black border border-zinc-800 ${color}`}><Icon className="w-5 h-5"/></div>
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-3xl font-black text-white">{value}</p>
    </div>
  );
}

function TenantManagerModal({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({ name: '', email: '', value: 497, modules: ['kanban', 'chat', 'leads', 'whatsapp'] });

  const toggleModule = (mod) => {
    setFormData(prev => ({ ...prev, modules: prev.modules.includes(mod) ? prev.modules.filter(m => m !== mod) : [...prev.modules, mod] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.createTenant({
        name: formData.name,
        adminEmail: formData.email,
        monthlyValue: formData.value,
        modules: JSON.stringify(formData.modules),
        adminPassword: '123' // Senha padrão inicial
      });
      alert('Contrato Criado! Senha padrão: 123');
      onRefresh();
      onClose();
    } catch (err) { alert('Erro ao criar contrato.'); }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6 backdrop-blur-xl">
      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-2xl shadow-2xl">
        <h2 className="text-2xl font-black mb-8">Novo Contrato de CRM</h2>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">Nome da Empresa / Projeto</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border-zinc-800 rounded-2xl p-4 text-white" required />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">E-mail Administrativo</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black border-zinc-800 rounded-2xl p-4 text-white" required />
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-500 uppercase mb-2 block">Valor Mensal (R$)</label>
            <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-black border-zinc-800 rounded-2xl p-4 text-white" required />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase mb-4 block">Módulos do Contrato (Funcionalidades)</label>
            <div className="flex flex-wrap gap-3">
              {['kanban', 'chat', 'leads', 'whatsapp', 'analytics', 'knowledge'].map(m => (
                <button type="button" key={m} onClick={() => toggleModule(m)} 
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${formData.modules.includes(m) ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2 flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-zinc-800 text-white font-black rounded-2xl">CANCELAR</button>
            <button type="submit" className="flex-1 py-4 bg-amber-500 text-black font-black rounded-2xl">CADASTRAR E ATIVAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTES DE VISTA DO CLIENTE (MANTENDO AS FUNCIONALIDADES DINÂMICAS)
// ============================================================================

function ChatView({ tenant, columns, onRefresh }) {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { 
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  useEffect(() => { 
    if (currentChat) { 
      loadMessages(currentChat.id); 
      loadLeadForChat(currentChat);
    }
  }, [currentChat]);

  const loadChats = async () => {
    try {
      const data = await api.getChats(tenant.id);
      setChats(data);
    } catch (e) {}
  };

  const loadMessages = async (chatId) => {
    try {
      const data = await api.getChatMessages(chatId);
      setMessages(data);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {}
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
    const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
    await api.sendWhatsAppMessage(phone, message, tenant.id, currentChat.id);
    setMessage('');
    await loadMessages(currentChat.id);
  };

  return (
    <div className="flex h-[75vh] bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden">
      <div className="w-80 border-r border-zinc-800 overflow-y-auto p-4 space-y-2">
        <div className="p-2 mb-4"><h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Conversas Recentes</h3></div>
        {chats.map(chat => (
          <div key={chat.id} onClick={() => setCurrentChat(chat)} 
            className={`p-4 rounded-2xl cursor-pointer transition-all border ${currentChat?.id === chat.id ? 'bg-amber-500 text-black border-amber-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}>
            <p className="font-bold truncate text-sm">{chat.contact_name || chat.contact_phone}</p>
            <p className={`text-[10px] truncate ${currentChat?.id === chat.id ? 'text-black/60' : 'text-zinc-500'}`}>{chat.last_message}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col bg-zinc-950/20">
        {currentChat ? (
          <>
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
              <div>
                <p className="font-black text-white">{currentChat.contact_name || currentChat.contact_phone}</p>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1"><Circle className="w-2 h-2 fill-current"/> WhatsApp Ativo</p>
              </div>
              <div className="flex gap-1 overflow-x-auto max-w-md">
                {columns.map(col => (
                  <button key={col.id} onClick={async () => { await api.updateLead(currentLead.id, { ...currentLead, stage: col.id }); await loadLeadForChat(currentChat); onRefresh(); }}
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${currentLead?.stage === col.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                    {col.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-3xl text-sm ${msg.is_from_me ? 'bg-amber-500 text-black font-medium rounded-tr-none' : 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex gap-4">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escreva sua mensagem aqui..." className="flex-1 bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:border-amber-500 outline-none" />
              <button onClick={handleSend} className="p-4 bg-amber-500 rounded-2xl text-black hover:scale-110 transition-all"><Send className="w-6 h-6"/></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-700">
            <MessageSquare className="w-20 h-20 mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-xs opacity-20">Selecione um cliente para interagir</p>
          </div>
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
    setNewCol({ name: '', color: 'blue' });
    setShowModal(false);
    onRefresh();
  };

  const handleDrop = async (stageId) => {
    if (!draggedLead) return;
    await api.updateLead(draggedLead.id, { ...draggedLead, stage: stageId });
    setDraggedLead(null);
    onRefresh();
  };

  const colorMap = { blue: 'bg-blue-500', yellow: 'bg-amber-500', purple: 'bg-purple-500', green: 'bg-green-500', red: 'bg-red-500', zinc: 'bg-zinc-500' };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div><h2 className="text-2xl font-black tracking-tighter">PIPELINE DE VENDAS</h2><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Gestão de Fluxo Comercial</p></div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 font-bold text-xs"><Plus className="w-4 h-4"/> Adicionar Etapa</button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8">
        {columns.map(col => (
          <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(col.id)}
            className="w-80 bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-6 flex-shrink-0 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${colorMap[col.color]}`}></div>
                <h3 className="font-black text-xs uppercase tracking-widest">{col.name}</h3>
              </div>
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-lg text-zinc-500 font-black">{leads.filter(l => l.stage === col.id).length}</span>
            </div>
            <div className="flex-1 space-y-4">
              {leads.filter(l => l.stage === col.id).map(lead => (
                <div key={lead.id} draggable onDragStart={() => setDraggedLead(lead)}
                  className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl cursor-grab active:cursor-grabbing hover:border-amber-500/50 transition-all shadow-xl group">
                  <p className="font-bold text-sm mb-1">{lead.name}</p>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{lead.phone}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
          <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black mb-6 uppercase tracking-tighter">Nova Etapa do Funil</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <input type="text" placeholder="Nome da Etapa (Ex: Negociação)" value={newCol.name} onChange={e => setNewCol({...newCol, name: e.target.value})} className="w-full bg-black border-zinc-800 rounded-2xl p-4 text-white" required />
              <div className="flex justify-between p-2 bg-black rounded-2xl">
                {['blue', 'yellow', 'purple', 'green', 'red', 'zinc'].map(c => (
                  <button key={c} type="button" onClick={() => setNewCol({...newCol, color: c})} className={`w-8 h-8 rounded-full ${colorMap[c]} ${newCol.color === c ? 'ring-2 ring-white scale-125' : 'opacity-40'}`} />
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-zinc-800 font-black rounded-2xl">CANCELAR</button>
                <button type="submit" className="flex-1 py-4 bg-amber-500 text-black font-black rounded-2xl">CRIAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadsView({ leads, columns, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-black tracking-tighter">BASE DE LEADS</h2><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Gestão de contatos e prospecção</p></div>
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"/>
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nome ou fone..." className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm" />
        </div>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-900/80">
            <tr><th className="p-6">Nome Completo</th><th className="p-6">WhatsApp</th><th className="p-6">Estágio Comercial</th><th className="p-6 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-zinc-800/30">
                <td className="p-6 font-bold text-white">{l.name}</td>
                <td className="p-6 text-xs text-zinc-400 font-mono">{l.phone}</td>
                <td className="p-6">
                   <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                     {columns.find(c => c.id === l.stage)?.name || 'Sem Estágio'}
                   </span>
                </td>
                <td className="p-6 text-right">
                  <button onClick={async () => { if(confirm('Excluir lead?')) { await api.deleteLead(l.id); onRefresh(); } }} className="p-2 text-zinc-700 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView({ leads }) {
  return (
    <div className="space-y-10">
       <div><h2 className="text-2xl font-black tracking-tighter">ANALYTICS E PERFORMANCE</h2><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Relatórios gerenciais e métricas de conversão</p></div>
       <div className="grid grid-cols-3 gap-8">
          <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
             <div className="flex items-center gap-2 mb-4 text-amber-500"><Activity className="w-5 h-5"/><span className="text-[10px] font-black uppercase tracking-widest">Conversas Hoje</span></div>
             <p className="text-4xl font-black">128</p>
             <p className="text-[10px] text-green-500 font-bold mt-2">+12% em relação a ontem</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
             <div className="flex items-center gap-2 mb-4 text-blue-500"><BarChart className="w-5 h-5"/><span className="text-[10px] font-black uppercase tracking-widest">Total de Leads</span></div>
             <p className="text-4xl font-black">{leads.length}</p>
             <p className="text-[10px] text-zinc-500 font-bold mt-2">Média de 4.2 leads/dia</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800">
             <div className="flex items-center gap-2 mb-4 text-purple-500"><PieChart className="w-5 h-5"/><span className="text-[10px] font-black uppercase tracking-widest">Taxa de Conversão</span></div>
             <p className="text-4xl font-black">18.4%</p>
             <p className="text-[10px] text-zinc-500 font-bold mt-2">Fechamentos vs Prospecção</p>
          </div>
       </div>
    </div>
  );
}

function WhatsAppView({ tenant, onRefresh }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  useEffect(() => { check(); const i = setInterval(check, 10000); return () => clearInterval(i); }, []);
  const check = async () => { try { const s = await api.getWhatsAppStatus(tenant.id); setStatus(s); } catch(e){} };

  const handleConnect = async () => {
    try {
      await api.connectWhatsApp(tenant.id, token);
      setToken('');
      check();
    } catch(e) { alert('Falha ao validar Token Evolution.'); }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div><h2 className="text-2xl font-black tracking-tighter">CONEXÃO EVOLUTION</h2><p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Vincular API de WhatsApp com o CRM</p></div>
      <div className="bg-zinc-900 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl">
        {status?.connected ? (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
            <p className="text-xl font-black">INSTÂNCIA CONECTADA</p>
            <p className="text-zinc-500 text-sm">O robô está ativo e capturando todas as conversas agora.</p>
            <button onClick={async () => { if(confirm('Desconectar WhatsApp?')) { await api.disconnectWhatsApp(tenant.id); check(); } }} className="mt-8 px-6 py-2 bg-red-500/10 text-red-500 font-bold rounded-xl text-[10px] hover:bg-red-500 hover:text-white transition-all">DESCONECTAR INSTÂNCIA</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 items-center">
              <AlertCircle className="text-amber-500 w-10 h-10" />
              <p className="text-xs text-amber-500 font-medium">Sua instância no Evolution Manager está offline. Cole o Token abaixo para reativar.</p>
            </div>
            <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Insira o Instance Token do Evolution" className="w-full bg-black border-zinc-800 rounded-2xl p-4 text-white font-mono text-sm" />
            <button onClick={handleConnect} className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 shadow-lg shadow-amber-500/20">VINCULAR WHATSAPP</button>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import {
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send,
  Circle, Clock, Phone, Mail, X, Check, Zap,
  Trash2, TrendingUp, Target, DollarSign,
  BarChart3, CheckCircle2,
  Brain, Edit2, Building2, LogOut, Eye, UserPlus,
  ArrowLeft, Smartphone, Image, Mic, FileText, MapPin, CheckCheck, FileIcon
} from 'lucide-react';

// ============================================================================
// APP PRINCIPAL
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
        if (user.role === 'super_admin') { setCurrentView('superAdmin'); loadTenants(); }
        else { setCurrentView('clientDashboard'); loadTenantData(user.tenantId); }
      } catch (err) { localStorage.clear(); }
    }
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try { setTenants(await api.getTenants()); } catch (err) { setError('Erro ao carregar clientes'); }
    finally { setLoading(false); }
  };

  const loadTenantData = async (tenantId) => {
    setLoading(true);
    try { setCurrentTenant(await api.getTenant(tenantId)); } catch (err) { setError('Erro ao carregar dados'); }
    finally { setLoading(false); }
  };

  const handleLogin = async (creds) => {
    setLoading(true); setError(null);
    try {
      const { user } = await api.login(creds.email, creds.password);
      setCurrentUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      if (user.role === 'super_admin') { setCurrentView('superAdmin'); await loadTenants(); }
      else { setCurrentView('clientDashboard'); await loadTenantData(user.tenantId); }
    } catch (err) { setError('E-mail ou senha incorretos'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { api.logout(); localStorage.clear(); setCurrentUser(null); setCurrentView('login'); setCurrentTenant(null); };

  const refreshData = async () => {
    if (currentView === 'superAdmin') await loadTenants();
    if (currentTenant) await loadTenantData(currentTenant.id);
  };

  if (currentView === 'login') return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;

  if (currentView === 'superAdmin') return (
    <SuperAdminPanel user={currentUser} tenants={tenants} onLogout={handleLogout} onRefresh={refreshData}
      onAccessTenant={(id) => { loadTenantData(id); setCurrentView('clientDashboard'); }} />
  );

  if (currentView === 'clientDashboard' && currentTenant) return (
    <ClientDashboard user={currentUser} tenant={currentTenant} onLogout={handleLogout}
      onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => { setCurrentTenant(null); loadTenants(); setCurrentView('superAdmin'); } : null}
      onRefresh={refreshData} />
  );

  return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Carregando...</div>;
}

// ============================================================================
// LOGIN
// ============================================================================

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-3xl font-bold text-black mb-4">BR</div>
          <h1 className="text-2xl font-bold text-white">Borsato CRM</h1>
          <p className="text-zinc-500 text-sm mt-1">Sistema de Gestao Inteligente</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({ email, password }); }} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 outline-none focus:border-amber-500" required />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 outline-none focus:border-amber-500" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all disabled:opacity-50">
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUPER ADMIN (MODO DEUS)
// ============================================================================

function SuperAdminPanel({ user, tenants, onLogout, onAccessTenant, onRefresh }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');

  const totalRevenue = tenants.reduce((acc, t) => acc + (parseFloat(t.monthly_value) || 0), 0);
  const totalLeads = tenants.reduce((acc, t) => acc + (t.leadCount || 0), 0);
  const totalUsers = tenants.reduce((acc, t) => acc + (t.userCount || 0), 0);
  const activeClients = tenants.filter(t => t.active !== false).length;

  const filtered = tenants.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = filterPlan === 'all' || t.plan === filterPlan;
    return matchSearch && matchPlan;
  });

  const handleDelete = async (tenant) => {
    if (!window.confirm(`Deletar "${tenant.name}"? TODOS os dados serao perdidos.`)) return;
    if (window.prompt('Digite SIM para confirmar:') !== 'SIM') return;
    try { await api.deleteTenant(tenant.id); onRefresh(); } catch (err) { alert('Erro: ' + err.message); }
  };

  const handleToggleActive = async (tenant) => {
    const action = tenant.active === false ? 'reativar' : 'suspender';
    if (!window.confirm(`${action} "${tenant.name}"?`)) return;
    try {
      await api.updateTenant(tenant.id, { ...tenant, monthlyValue: tenant.monthly_value, active: tenant.active === false });
      onRefresh();
    } catch (err) { alert('Erro: ' + err.message); }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-black">BR</div>
            <div>
              <h1 className="text-xl font-bold">Painel Mestre</h1>
              <p className="text-xs text-zinc-500">{user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metricas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2"><DollarSign className="w-5 h-5 text-green-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Receita Mensal</span></div>
            <p className="text-3xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2"><Building2 className="w-5 h-5 text-amber-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Clientes</span></div>
            <p className="text-3xl font-bold">{activeClients}</p>
            <p className="text-xs text-zinc-600 mt-1">{tenants.length} total</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-blue-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Leads Gerados</span></div>
            <p className="text-3xl font-bold">{totalLeads}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-purple-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Ticket Medio</span></div>
            <p className="text-3xl font-bold">R$ {tenants.length > 0 ? (totalRevenue / tenants.length).toFixed(2) : '0.00'}</p>
          </div>
        </div>

        {/* Tabela de clientes */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Gerenciar Clientes</h2>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg">
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar cliente..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white" />
            </div>
            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)} className="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-white">
              <option value="all">Todos os Planos</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.map(tenant => (
              <div key={tenant.id} className={`bg-zinc-800/50 border border-zinc-800 rounded-xl p-5 ${tenant.active === false ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{tenant.name}</h3>
                      <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 text-[10px] font-bold rounded uppercase">{tenant.plan || 'Pro'}</span>
                      {tenant.active === false && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded">SUSPENSO</span>}
                    </div>
                    <div className="flex gap-6 text-sm text-zinc-400">
                      <span>Valor: <strong className="text-green-400">R$ {parseFloat(tenant.monthly_value || 0).toFixed(2)}/mes</strong></span>
                      <span>Leads: <strong className="text-white">{tenant.leadCount || 0}</strong></span>
                      <span>Usuarios: <strong className="text-white">{tenant.userCount || 0}</strong></span>
                      <span>Grupos: <strong className="text-white">{tenant.groupCount || 0}</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleActive(tenant)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold ${tenant.active === false ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'}`}>
                      {tenant.active === false ? 'Reativar' : 'Suspender'}
                    </button>
                    <button onClick={() => { setEditingTenant(tenant); setShowEditModal(true); }}
                      className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onAccessTenant(tenant.id)}
                      className="p-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(tenant)}
                      className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-8 text-zinc-500">Nenhum cliente encontrado</div>}
          </div>
        </div>
      </div>

      {showCreateModal && <CreateTenantModal onClose={() => setShowCreateModal(false)} onRefresh={onRefresh} />}
      {showEditModal && editingTenant && <EditTenantModal tenant={editingTenant} onClose={() => { setShowEditModal(false); setEditingTenant(null); }} onRefresh={onRefresh} />}
    </div>
  );
}

function CreateTenantModal({ onClose, onRefresh }) {
  const [form, setForm] = useState({ name: '', adminName: '', adminEmail: '', adminPassword: '', plan: 'Pro', monthlyValue: 497 });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.createTenant(form); onRefresh(); onClose(); } catch (err) { alert('Erro: ' + err.message); }
  };
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-6">Novo Cliente</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome da empresa" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="text" placeholder="Nome do admin" value={form.adminName} onChange={e => setForm({ ...form, adminName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="email" placeholder="E-mail do admin" value={form.adminEmail} onChange={e => setForm({ ...form, adminEmail: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="password" placeholder="Senha do admin" value={form.adminPassword} onChange={e => setForm({ ...form, adminPassword: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white">
              <option value="Basic">Basic</option><option value="Pro">Pro</option><option value="Enterprise">Enterprise</option>
            </select>
            <input type="number" placeholder="Valor mensal" value={form.monthlyValue} onChange={e => setForm({ ...form, monthlyValue: parseFloat(e.target.value) })} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl text-white">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTenantModal({ tenant, onClose, onRefresh }) {
  const [form, setForm] = useState({ name: tenant.name, plan: tenant.plan || 'Pro', monthlyValue: parseFloat(tenant.monthly_value) || 497, aiPrompt: tenant.ai_prompt || '', active: tenant.active !== false });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.updateTenant(tenant.id, { ...form, customFields: JSON.parse(tenant.custom_fields || '[]') }); onRefresh(); onClose(); } catch (err) { alert('Erro: ' + err.message); }
  };
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-6">Editar: {tenant.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white">
              <option value="Basic">Basic</option><option value="Pro">Pro</option><option value="Enterprise">Enterprise</option>
            </select>
            <input type="number" step="0.01" value={form.monthlyValue} onChange={e => setForm({ ...form, monthlyValue: parseFloat(e.target.value) })} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" />
          </div>
          <textarea value={form.aiPrompt} onChange={e => setForm({ ...form, aiPrompt: e.target.value })} rows={3} placeholder="Prompt da IA..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" />
          <div className="flex items-center gap-3"><input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="w-4 h-4" /><label className="text-sm text-zinc-300">Cliente Ativo</label></div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl text-white">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// CLIENT DASHBOARD
// ============================================================================

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [columns, setColumns] = useState([]);

  useEffect(() => { loadColumns(); }, [tenant.id]);

  const loadColumns = async () => {
    try { setColumns(await api.getKanbanColumns(tenant.id)); } catch (e) { }
  };

  const refreshAll = async () => { await onRefresh(); await loadColumns(); };

  const tabs = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'chat', label: 'Conversas', icon: MessageSquare },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'knowledge', label: 'Base de Conhecimento', icon: Brain },
    { id: 'team', label: 'Equipe', icon: UserPlus },
    { id: 'settings', label: 'Configuracoes', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-black text-sm">{tenant.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <h1 className="text-lg font-bold">{tenant.name}</h1>
              <p className="text-xs text-zinc-500">{user.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onBackToSuperAdmin && <button onClick={onBackToSuperAdmin} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold flex items-center gap-2"><ArrowLeft className="w-3 h-3" /> MESTRE</button>}
            <button onClick={onLogout} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold">Sair</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 bg-zinc-900/20">
        <div className="max-w-[1600px] mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-amber-500 text-amber-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {activeTab === 'kanban' && <KanbanView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'chat' && <ChatView tenant={tenant} columns={columns} onRefresh={refreshAll} />}
        {activeTab === 'leads' && <LeadsView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'whatsapp' && <WhatsAppView tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'analytics' && <AnalyticsView leads={tenant.leads || []} columns={columns} />}
        {activeTab === 'knowledge' && <KnowledgeView knowledge={tenant.knowledgeBase || []} tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'team' && <TeamView users={tenant.users || []} tenant={tenant} currentUser={user} onRefresh={refreshAll} />}
        {activeTab === 'settings' && <SettingsView tenant={tenant} onRefresh={refreshAll} />}
      </div>
    </div>
  );
}

// ============================================================================
// KANBAN (CUSTOMIZAVEL)
// ============================================================================

function KanbanView({ leads, columns, tenant, onRefresh }) {
  const [draggedLead, setDraggedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', color: 'blue' });

  const colorMap = { blue: 'bg-blue-500', yellow: 'bg-amber-500', purple: 'bg-purple-500', green: 'bg-green-500', red: 'bg-red-500', zinc: 'bg-zinc-500' };

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    try {
      await api.createKanbanColumn({ tenantId: tenant.id, name: newCol.name, color: newCol.color, position: columns.length });
      setNewCol({ name: '', color: 'blue' }); setShowModal(false); onRefresh();
    } catch (err) { alert('Erro: ' + err.message); }
  };

  const handleDrop = async (colId) => {
    if (!draggedLead) return;
    try { await api.updateLead(draggedLead.id, { ...draggedLead, stage: colId }); setDraggedLead(null); onRefresh(); }
    catch (err) { alert('Erro ao mover lead'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Pipeline de Vendas</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-700">
          <Plus className="w-4 h-4" /> Nova Etapa
        </button>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-bold mb-2">Nenhuma etapa criada</p>
          <p className="text-sm">Clique em "Nova Etapa" para montar seu funil de vendas</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(col => (
            <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(col.id)}
              className="w-72 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex-shrink-0 min-h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${colorMap[col.color] || 'bg-zinc-500'}`}></div>
                  <h3 className="font-bold text-xs uppercase">{col.name}</h3>
                  <span className="text-xs text-zinc-600">{leads.filter(l => l.stage === col.id).length}</span>
                </div>
                <button onClick={async () => { if (confirm('Excluir etapa?')) { await api.deleteKanbanColumn(col.id); onRefresh(); } }}>
                  <X className="w-3 h-3 text-zinc-600 hover:text-red-400" />
                </button>
              </div>
              <div className="space-y-3">
                {leads.filter(l => l.stage === col.id).map(lead => (
                  <div key={lead.id} draggable onDragStart={() => setDraggedLead(lead)}
                    className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 cursor-grab hover:border-amber-500/50 transition-all">
                    <p className="text-sm font-bold">{lead.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono">{lead.phone}</p>
                    {lead.last_message && <p className="text-[10px] text-zinc-600 mt-2 truncate">{lead.last_message}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-6 text-white">Nova Etapa do Funil</h2>
            <form onSubmit={handleCreateColumn} className="space-y-4">
              <input type="text" placeholder="Nome da etapa" value={newCol.name} onChange={e => setNewCol({ ...newCol, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
              <div className="flex justify-between p-3 bg-zinc-950 rounded-xl">
                {Object.keys(colorMap).map(c => (
                  <button key={c} type="button" onClick={() => setNewCol({ ...newCol, color: c })}
                    className={`w-8 h-8 rounded-full ${colorMap[c]} transition-all ${newCol.color === c ? 'ring-2 ring-white scale-110' : 'opacity-40'}`} />
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl text-white">Cancelar</button>
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
// CHAT (COM QUALIFICACAO DE LEAD)
// ============================================================================

function ChatView({ tenant, columns, onRefresh }) {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [currentLead, setCurrentLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 4000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
      loadLead(currentChat);
      const interval = setInterval(() => loadMessages(currentChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [currentChat?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadChats = async () => { try { setChats(await api.getChats(tenant.id)); } catch (e) { } };
  const loadMessages = async (chatId) => { try { setMessages(await api.getChatMessages(chatId, 100, 0)); } catch (e) { } };
  const loadLead = async (chat) => {
    const phone = chat.contact_phone || chat.remote_jid?.split('@')[0];
    try { setCurrentLead(await api.getLeadByPhone(phone, tenant.id)); } catch (e) { setCurrentLead(null); }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentChat) return;
    const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
    setSending(true);
    try {
      await api.sendWhatsAppMessage(phone, message, tenant.id, currentChat.id);
      setMessage('');
      await loadMessages(currentChat.id);
      await loadChats();
    } catch (err) { alert('Erro ao enviar: ' + err.message); }
    finally { setSending(false); }
  };

  const handleChangeStage = async (stageId) => {
    if (!currentLead) return;
    try { await api.updateLead(currentLead.id, { ...currentLead, stage: stageId }); setCurrentLead({ ...currentLead, stage: stageId }); onRefresh(); }
    catch (err) { alert('Erro: ' + err.message); }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(String(ts).replace('Z', ''));
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const filtered = chats.filter(c => {
    if (!searchTerm) return true;
    return (c.contact_name || c.contact_phone || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-200px)] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      {/* Lista */}
      <div className="w-96 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar conversa..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-zinc-600 text-sm">Nenhuma conversa</div>
          ) : filtered.map(chat => (
            <div key={chat.id} onClick={() => setCurrentChat(chat)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800 transition-all border-b border-zinc-800/50 ${currentChat?.id === chat.id ? 'bg-zinc-800' : ''}`}>
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">{(chat.contact_name || chat.contact_phone || '?').substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-sm truncate">{chat.contact_name || chat.contact_phone || 'Desconhecido'}</p>
                  <span className="text-[10px] text-zinc-500 flex-shrink-0 ml-2">{formatTime(chat.last_message_time)}</span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className="text-xs text-zinc-500 truncate">{chat.last_message || ''}</p>
                  {chat.unread_count > 0 && <span className="ml-2 bg-amber-500 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{chat.unread_count > 9 ? '9+' : chat.unread_count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col bg-zinc-950/40">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-zinc-700 rounded-full flex items-center justify-center"><span className="text-xs font-bold">{(currentChat.contact_name || '?').substring(0, 2).toUpperCase()}</span></div>
                <div>
                  <p className="font-bold text-sm">{currentChat.contact_name || currentChat.contact_phone}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{currentChat.contact_phone}</p>
                </div>
              </div>
              {currentLead && columns.length > 0 && (
                <div className="flex gap-1 overflow-x-auto max-w-lg">
                  {columns.map(col => (
                    <button key={col.id} onClick={() => handleChangeStage(col.id)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${currentLead.stage === col.id ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                      {col.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.is_from_me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-xl px-3 py-2 ${msg.is_from_me ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-800 border border-zinc-700'}`}>
                    {msg.sender_name && <p className={`text-[10px] font-bold mb-0.5 ${msg.is_from_me ? 'text-amber-400' : 'text-blue-400'}`}>{msg.sender_name}</p>}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-zinc-500">{formatTime(msg.timestamp)}</span>
                      {msg.is_from_me && (msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-400" /> : msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-zinc-500" /> : <Check className="w-3 h-3 text-zinc-500" />)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-zinc-800 flex gap-3">
              <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !sending) { e.preventDefault(); handleSend(); } }}
                placeholder="Digite sua mensagem..." disabled={sending}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500" />
              <button onClick={handleSend} disabled={sending || !message.trim()}
                className="p-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-zinc-600">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold">Selecione uma conversa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LEADS VIEW
// ============================================================================

function LeadsView({ leads, columns, tenant, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const filtered = leads.filter(l => (l.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.phone || '').includes(searchTerm));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar leads..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white" />
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] font-bold uppercase">
            <tr><th className="p-4">Nome</th><th className="p-4">Telefone</th><th className="p-4">Estagio</th><th className="p-4">Origem</th><th className="p-4">Ultima Mensagem</th><th className="p-4 text-right">Acoes</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-zinc-800/20">
                <td className="p-4 font-bold text-sm">{lead.name}</td>
                <td className="p-4 text-xs text-zinc-400 font-mono">{lead.phone}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded border border-zinc-700">
                    {columns.find(c => c.id === lead.stage)?.name || lead.stage || 'Sem etapa'}
                  </span>
                </td>
                <td className="p-4 text-xs text-zinc-500">{lead.source || '-'}</td>
                <td className="p-4 text-xs text-zinc-500 max-w-[200px] truncate">{lead.last_message || '-'}</td>
                <td className="p-4 text-right">
                  <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteLead(lead.id); onRefresh(); } }} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-zinc-500 text-sm">Nenhum lead encontrado</div>}
      </div>

      {showModal && <LeadModal tenant={tenant} columns={columns} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}

function LeadModal({ tenant, columns, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', stage: columns[0]?.id || 'novo' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.createLead({ ...form, tenantId: tenant.id }); onSuccess(); } catch (err) { alert('Erro: ' + err.message); }
  };
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-6">Novo Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="text" placeholder="Telefone (ex: 5514999999999)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="email" placeholder="E-mail (opcional)" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" />
          {columns.length > 0 && (
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white">
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl text-white">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// WHATSAPP VIEW
// ============================================================================

function WhatsAppView({ tenant, onRefresh }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const instanceName = `tenant_${tenant.id}`;

  useEffect(() => { checkStatus(); const i = setInterval(checkStatus, 5000); return () => clearInterval(i); }, []);
  const checkStatus = async () => { try { setStatus(await api.getWhatsAppStatus(tenant.id)); } catch (e) { } };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Conexao WhatsApp</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Status</h3>
          {status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="text-green-400 font-bold">Conectado</span></div>
              {status.instance?.connected_at && <p className="text-xs text-zinc-500">Desde: {new Date(status.instance.connected_at).toLocaleString('pt-BR')}</p>}
              <button onClick={async () => { await api.disconnectWhatsApp(tenant.id); checkStatus(); }} className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30">Desconectar</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="w-3 h-3 bg-zinc-600 rounded-full"></div><span className="text-zinc-400">Desconectado</span></div>
              <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Cole o token da instancia..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white font-mono text-xs" />
              <button onClick={async () => { setLoading(true); try { await api.connectWhatsApp(tenant.id, token); setToken(''); checkStatus(); } catch (e) { alert('Erro: ' + e.message); } finally { setLoading(false); } }}
                disabled={loading || !token.trim()} className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-xl disabled:opacity-50">
                {loading ? 'Salvando...' : 'Salvar Token'}
              </button>
              <button onClick={checkStatus} className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold">Verificar Conexao</button>
            </div>
          )}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Instancia</h3>
          <div className="bg-zinc-950 rounded-lg p-3 mb-3 flex justify-between items-center">
            <code className="text-amber-400 text-sm">{instanceName}</code>
            <button onClick={() => { navigator.clipboard.writeText(instanceName); alert('Copiado!'); }} className="text-xs text-zinc-500 hover:text-white">Copiar</button>
          </div>
          <p className="text-xs text-zinc-500">Use este nome ao criar a instancia no Evolution Manager.</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS
// ============================================================================

function AnalyticsView({ leads, columns }) {
  const total = leads.length;
  const bySource = { whatsapp: leads.filter(l => l.source === 'whatsapp').length, manual: leads.filter(l => l.source === 'manual' || !l.source).length };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-blue-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Total Leads</span></div>
          <p className="text-3xl font-bold">{total}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2"><Smartphone className="w-5 h-5 text-green-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Via WhatsApp</span></div>
          <p className="text-3xl font-bold">{bySource.whatsapp}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2"><UserPlus className="w-5 h-5 text-amber-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Manual</span></div>
          <p className="text-3xl font-bold">{bySource.manual}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2"><Target className="w-5 h-5 text-purple-500" /><span className="text-xs text-zinc-500 font-bold uppercase">Etapas</span></div>
          <p className="text-3xl font-bold">{columns.length}</p>
        </div>
      </div>

      {columns.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="font-bold mb-4">Leads por Etapa</h3>
          <div className="space-y-4">
            {columns.map(col => {
              const count = leads.filter(l => l.stage === col.id).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={col.id}>
                  <div className="flex justify-between mb-1"><span className="text-sm font-bold">{col.name}</span><span className="text-xs text-zinc-500">{count} ({pct.toFixed(0)}%)</span></div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// BASE DE CONHECIMENTO
// ============================================================================

function KnowledgeView({ knowledge, tenant, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const categories = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Base de Conhecimento</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400"><Plus className="w-4 h-4" /> Novo</button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {categories.map(cat => {
          const items = knowledge.filter(k => k.category === cat);
          return (
            <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">{cat}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm">{item.question}</p>
                      <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteKnowledge(item.id); onRefresh(); } }} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                    <p className="text-xs text-zinc-400">{item.answer}</p>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-zinc-600 text-center py-4">Nenhum item</p>}
              </div>
            </div>
          );
        })}
      </div>
      {showModal && <KnowledgeModal tenant={tenant} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}

function KnowledgeModal({ tenant, onClose, onSuccess }) {
  const [form, setForm] = useState({ category: 'FAQ', question: '', answer: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.createKnowledge({ ...form, tenantId: tenant.id }); onSuccess(); } catch (err) { alert('Erro: ' + err.message); }
  };
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-6">Novo Conhecimento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white">
            <option value="Produtos/Servicos">Produtos/Servicos</option><option value="Precos">Precos</option><option value="Agendamento">Agendamento</option><option value="FAQ">FAQ</option>
          </select>
          <input type="text" placeholder="Pergunta" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <textarea placeholder="Resposta" value={form.answer} onChange={e => setForm({ ...form, answer: e.target.value })} rows={4} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl text-white">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EQUIPE
// ============================================================================

function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Equipe</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400"><Plus className="w-4 h-4" /> Novo Usuario</button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] font-bold uppercase">
            <tr><th className="p-4">Nome</th><th className="p-4">E-mail</th><th className="p-4">Funcao</th><th className="p-4 text-right">Acoes</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-zinc-800/20">
                <td className="p-4 font-bold text-sm">{user.name}</td>
                <td className="p-4 text-xs text-zinc-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : user.role === 'client_admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'client_admin' ? 'Admin' : 'Usuario'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {user.id !== currentUser.id && <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteUser(user.id); onRefresh(); } }} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <UserModal tenant={tenant} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}

function UserModal({ tenant, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client_user' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { await api.createUser({ ...form, tenantId: tenant.id }); onSuccess(); } catch (err) { alert('Erro: ' + err.message); }
  };
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-6">Novo Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="email" placeholder="E-mail" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <input type="password" placeholder="Senha" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white" required />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white">
            <option value="client_user">Usuario</option><option value="client_admin">Admin</option>
          </select>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-zinc-800 font-bold rounded-xl text-white">Cancelar</button>
            <button type="submit" className="flex-1 py-3 bg-amber-500 text-black font-bold rounded-xl">Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// CONFIGURACOES
// ============================================================================

function SettingsView({ tenant, onRefresh }) {
  const [aiPrompt, setAiPrompt] = useState(tenant.ai_prompt || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: tenant.active });
      alert('Configuracoes salvas!'); onRefresh();
    } catch (err) { alert('Erro: ' + err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Configuracoes</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="font-bold mb-2">Prompt da IA</h3>
        <p className="text-xs text-zinc-500 mb-4">Configure como a IA deve se comportar ao responder mensagens dos seus leads.</p>
        <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={8} placeholder="Ex: Voce e assistente virtual da Clinica XYZ. Seja cordial e profissional..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white mb-4" />
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar Configuracoes'}
        </button>
      </div>
    </div>
  );
}

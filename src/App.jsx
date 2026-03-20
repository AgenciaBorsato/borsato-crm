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
      const { user, token } = await api.login(credentials.email, credentials.password);
      
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

  const handleCreateTenant = async (tenantData) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.createTenant(tenantData);
      await loadTenants();
      alert('Cliente criado com sucesso!');
    } catch (err) {
      setError('Erro ao criar cliente: ' + err.message);
      alert('Erro ao criar cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessTenant = async (tenantId) => {
    setLoading(true);
    try {
      const data = await api.getTenant(tenantId);
      setCurrentTenant(data);
      setCurrentView('clientDashboard');
    } catch (err) {
      setError('Erro ao acessar cliente: ' + err.message);
      alert('Erro ao acessar cliente: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSuperAdmin = () => {
    setCurrentTenant(null);
    setCurrentView('superAdmin');
  };

  const refreshTenantData = async () => {
    if (currentTenant) {
      await loadTenantData(currentTenant.id);
    }
  };

  if (currentView === 'login') {
    return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  }

  if (currentView === 'superAdmin') {
    return (
      <SuperAdminPanel 
        user={currentUser}
        tenants={tenants}
        onLogout={handleLogout}
        onCreateTenant={handleCreateTenant}
        onAccessTenant={handleAccessTenant}
        loading={loading}
        error={error}
      />
    );
  }

  if (currentView === 'clientDashboard' && currentTenant) {
    return (
      <ClientDashboard 
        user={currentUser}
        tenant={currentTenant}
        onLogout={handleLogout}
        onBackToSuperAdmin={currentUser?.role === 'super_admin' ? handleBackToSuperAdmin : null}
        onRefresh={refreshTenantData}
        loading={loading}
        error={error}
      />
    );
  }

  return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
}

// ============================================================================
// TELA DE LOGIN
// ============================================================================

function LoginScreen({ onLogin, loading, error }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(credentials);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-black">BR</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Borsato CRM</h1>
          <p className="text-zinc-400">Sistema de gestao inteligente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500"
              placeholder="*********"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// PAINEL SUPER ADMIN
// ============================================================================
function SuperAdminPanel({ user, tenants, onLogout, onCreateTenant, onAccessTenant, loading, error }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [newTenant, setNewTenant] = useState({
    name: '',
    plan: 'Pro',
    monthlyValue: 497,
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleCreate = (e) => {
    e.preventDefault();
    onCreateTenant(newTenant);
    setShowCreateModal(false);
    setNewTenant({ name: '', plan: 'Pro', monthlyValue: 497, adminName: '', adminEmail: '', adminPassword: '' });
  };

  const handleEdit = (tenant) => {
    setEditingTenant(tenant);
    setShowEditModal(true);
  };

  const handleUpdateTenant = async (updatedData) => {
    try {
      await api.updateTenant(editingTenant.id, updatedData);
      setShowEditModal(false);
      setEditingTenant(null);
      window.location.reload();
    } catch (err) {
      alert('Erro ao atualizar cliente: ' + err.message);
    }
  };

  const handleDelete = async (tenant) => {
    if (!window.confirm(`Deletar "${tenant.name}"? Esta acao nao pode ser desfeita.`)) return;
    const confirmText = window.prompt('Digite "SIM" para confirmar:');
    if (confirmText !== 'SIM') return;

    try {
      await api.deleteTenant(tenant.id);
      window.location.reload();
    } catch (err) {
      alert('Erro ao deletar cliente: ' + err.message);
    }
  };

  const handleToggleActive = async (tenant) => {
    const newStatus = !tenant.active;
    const action = newStatus ? 'reativar' : 'suspender';
    if (!window.confirm(`${action} "${tenant.name}"?`)) return;

    try {
      await api.updateTenant(tenant.id, {
        name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value,
        aiPrompt: tenant.ai_prompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: newStatus
      });
      window.location.reload();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const filteredTenants = tenants.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = filterPlan === 'all' || t.plan === filterPlan;
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && t.active !== false) ||
      (filterStatus === 'suspended' && t.active === false);
    return matchSearch && matchPlan && matchStatus;
  });

  const totalRevenue = tenants.reduce((sum, t) => sum + (parseFloat(t.monthly_value || t.monthlyValue) || 0), 0);
  const activeClients = tenants.filter(t => t.active !== false).length;
  const suspendedClients = tenants.filter(t => t.active === false).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-black">BR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Super Admin</h1>
              <p className="text-sm text-zinc-400">{user.name}</p>
            </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>}

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2"><Building2 className="w-5 h-5 text-amber-500" /><span className="text-sm text-zinc-400">Total de Clientes</span></div>
            <p className="text-3xl font-bold">{tenants.length}</p>
            <p className="text-xs text-zinc-500 mt-1">{activeClients} ativos, {suspendedClients} suspensos</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2"><DollarSign className="w-5 h-5 text-green-500" /><span className="text-sm text-zinc-400">Receita Mensal</span></div>
            <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2"><TrendingUp className="w-5 h-5 text-blue-500" /><span className="text-sm text-zinc-400">Ticket Medio</span></div>
            <p className="text-3xl font-bold">R$ {tenants.length > 0 ? (totalRevenue / tenants.length).toFixed(2) : '0.00'}</p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-purple-500" /><span className="text-sm text-zinc-400">Total de Usuarios</span></div>
            <p className="text-3xl font-bold">{tenants.reduce((sum, t) => sum + (t.userCount || 0), 0)}</p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Gerenciar Clientes</h2>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Novo Cliente
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar cliente..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2" />
            </div>
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2">
              <option value="all">Todos os Planos</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2">
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="suspended">Suspensos</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-400">Carregando...</div>
          ) : filteredTenants.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">Nenhum cliente encontrado</div>
          ) : (
            <div className="space-y-3">
              {filteredTenants.map(tenant => (
                <div key={tenant.id} className={`rounded-lg p-4 ${tenant.active === false ? 'bg-zinc-800/50 opacity-60' : 'bg-zinc-800'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{tenant.name}</h3>
                        {tenant.active === false && <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">SUSPENSO</span>}
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                        <div><span className="text-zinc-500">Plano:</span><span className="ml-2 font-medium">{tenant.plan}</span></div>
                        <div><span className="text-zinc-500">Valor:</span><span className="ml-2 font-medium text-green-400">R$ {parseFloat(tenant.monthly_value || tenant.monthlyValue || 0).toFixed(2)}/mes</span></div>
                        <div><span className="text-zinc-500">Leads:</span><span className="ml-2 font-medium">{tenant.leadCount || 0}</span></div>
                        <div><span className="text-zinc-500">Usuarios:</span><span className="ml-2 font-medium">{tenant.userCount || 0}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleActive(tenant)} className={`px-3 py-2 rounded-lg transition-colors ${tenant.active === false ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'}`}>
                        {tenant.active === false ? 'Reativar' : 'Suspender'}
                      </button>
                      <button onClick={() => handleEdit(tenant)} className="px-3 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onAccessTenant(tenant.id)} className="px-3 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(tenant)} className="px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Novo Cliente</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="block text-sm font-medium mb-2">Nome do Cliente</label><input type="text" value={newTenant.name} onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-2">Plano</label><select value={newTenant.plan} onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"><option value="Basic">Basic</option><option value="Pro">Pro</option><option value="Enterprise">Enterprise</option></select></div>
                <div><label className="block text-sm font-medium mb-2">Valor Mensal</label><input type="number" value={newTenant.monthlyValue} onChange={(e) => setNewTenant({ ...newTenant, monthlyValue: parseFloat(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
              </div>
              <div><label className="block text-sm font-medium mb-2">Nome do Admin</label><input type="text" value={newTenant.adminName} onChange={(e) => setNewTenant({ ...newTenant, adminName: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
              <div><label className="block text-sm font-medium mb-2">Email do Admin</label><input type="email" value={newTenant.adminEmail} onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
              <div><label className="block text-sm font-medium mb-2">Senha do Admin</label><input type="password" value={newTenant.adminPassword} onChange={(e) => setNewTenant({ ...newTenant, adminPassword: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">Criar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingTenant && (
        <EditTenantModal tenant={editingTenant} onClose={() => { setShowEditModal(false); setEditingTenant(null); }} onSave={handleUpdateTenant} />
      )}
    </div>
  );
}

function EditTenantModal({ tenant, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: tenant.name, plan: tenant.plan, monthlyValue: parseFloat(tenant.monthly_value || tenant.monthlyValue),
    aiPrompt: tenant.ai_prompt || '', active: tenant.active !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name: formData.name, plan: formData.plan, monthlyValue: formData.monthlyValue, aiPrompt: formData.aiPrompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: formData.active });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Editar: {tenant.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Nome</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Plano</label><select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"><option value="Basic">Basic</option><option value="Pro">Pro</option><option value="Enterprise">Enterprise</option></select></div>
            <div><label className="block text-sm font-medium mb-2">Valor (R$)</label><input type="number" step="0.01" value={formData.monthlyValue} onChange={(e) => setFormData({ ...formData, monthlyValue: parseFloat(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-2">Prompt da IA</label><textarea value={formData.aiPrompt} onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" placeholder="Ex: Voce e assistente virtual da Clinica..." /></div>
          <div className="flex items-center gap-3"><input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="w-4 h-4" /><label className="text-sm">Cliente Ativo</label></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD DO CLIENTE
// ============================================================================

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh, loading, error }) {
  const [activeTab, setActiveTab] = useState('kanban');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);

  const leads = tenant.leads || [];
  const groups = tenant.groups || [];
  const knowledge = tenant.knowledgeBase || [];
  const users = tenant.users || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-black">{tenant.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{tenant.name}</h1>
              <p className="text-sm text-zinc-400">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onBackToSuperAdmin && (
              <button onClick={onBackToSuperAdmin} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'groups', label: 'Grupos', icon: MessageSquare },
              { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
              { id: 'chat', label: 'Chat', icon: Send },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'knowledge', label: 'Base de Conhecimento', icon: Brain },
              { id: 'team', label: 'Equipe', icon: UserPlus },
              { id: 'settings', label: 'Configuracoes', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? 'text-amber-500 border-b-2 border-amber-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>}

        {activeTab === 'kanban' && <KanbanView leads={leads} tenant={tenant} onRefresh={onRefresh} onSelectLead={setSelectedLead} />}
        {activeTab === 'leads' && <LeadsView leads={leads} tenant={tenant} onRefresh={onRefresh} onAdd={() => setShowLeadModal(true)} />}
        {activeTab === 'groups' && <GroupsView groups={groups} tenant={tenant} onRefresh={onRefresh} onAdd={() => setShowGroupModal(true)} />}
        {activeTab === 'whatsapp' && <WhatsAppView tenant={tenant} onRefresh={onRefresh} />}
        {activeTab === 'chat' && <ChatView tenant={tenant} />}
        {activeTab === 'analytics' && <AnalyticsView leads={leads} groups={groups} />}
        {activeTab === 'knowledge' && <KnowledgeView knowledge={knowledge} tenant={tenant} onRefresh={onRefresh} onAdd={() => setShowKnowledgeModal(true)} />}
        {activeTab === 'team' && <TeamView users={users} tenant={tenant} currentUser={user} onRefresh={onRefresh} />}
        {activeTab === 'settings' && <SettingsView tenant={tenant} onRefresh={onRefresh} />}
      </div>

      {showLeadModal && <LeadModal tenant={tenant} onClose={() => setShowLeadModal(false)} onSuccess={() => { setShowLeadModal(false); onRefresh(); }} />}
      {showGroupModal && <GroupModal tenant={tenant} onClose={() => setShowGroupModal(false)} onSuccess={() => { setShowGroupModal(false); onRefresh(); }} />}
      {showKnowledgeModal && <KnowledgeModal tenant={tenant} onClose={() => setShowKnowledgeModal(false)} onSuccess={() => { setShowKnowledgeModal(false); onRefresh(); }} />}
    </div>
  );
}

// ============================================================================
// WHATSAPP VIEW
// ============================================================================

function WhatsAppView({ tenant, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [instanceToken, setInstanceToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const instanceName = `tenant_${tenant.id}`;

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const data = await api.getWhatsAppStatus(tenant.id);
      setStatus(data);
      if (data.needsToken) setShowTokenInput(true);
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
  };

  const handleSaveToken = async () => {
    if (!instanceToken.trim()) { alert('Insira o token!'); return; }
    setLoading(true);
    try {
      const data = await api.connectWhatsApp(tenant.id, instanceToken);
      alert(data.message || 'Token salvo!');
      setShowTokenInput(false);
      setInstanceToken('');
      checkStatus();
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally { setLoading(false); }
  };

  const handleCheckConnection = async () => {
    setLoading(true);
    try {
      await checkStatus();
      if (status?.connected) alert('WhatsApp conectado!');
      else alert('WhatsApp nao conectado. Verifique o QR Code no Evolution Manager.');
    } catch (err) { alert('Erro: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleDisconnect = async () => {
    if (!confirm('Desconectar WhatsApp?')) return;
    setLoading(true);
    try {
      await api.disconnectWhatsApp(tenant.id);
      setStatus(null);
      checkStatus();
    } catch (err) { alert('Erro: ' + err.message); }
    finally { setLoading(false); }
  };

  const handleSyncGroups = async () => {
    setSyncing(true);
    try {
      const data = await api.syncWhatsAppGroups();
      alert(`${data.imported} grupos importados!`);
      onRefresh();
    } catch (err) { alert('Erro: ' + err.message); }
    finally { setSyncing(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Conexao WhatsApp</h2>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-zinc-900 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Status da Conexao</h3>
          {status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">Conectado</span>
              </div>
              {status.instance?.connected_at && <div className="text-sm text-zinc-400">Conectado desde: {new Date(status.instance.connected_at).toLocaleString('pt-BR')}</div>}
              <div className="pt-4 space-y-3">
                <button onClick={handleSyncGroups} disabled={syncing} className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-50">{syncing ? 'Sincronizando...' : 'Sincronizar Grupos'}</button>
                <button onClick={handleDisconnect} disabled={loading} className="w-full px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50">Desconectar</button>
                <button onClick={() => setShowTokenInput(true)} className="w-full px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors text-sm">Atualizar Token</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><div className="w-3 h-3 bg-zinc-600 rounded-full"></div><span className="text-zinc-400 font-medium">Desconectado</span></div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-400">
                <p className="font-medium mb-2">Instancia nao conectada</p>
                <p>Siga as instrucoes ao lado para conectar o WhatsApp.</p>
              </div>
              {showTokenInput && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-300">Token da Instancia</label>
                    <input type="text" value={instanceToken} onChange={(e) => setInstanceToken(e.target.value)} placeholder="Cole aqui o token..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm font-mono" />
                  </div>
                  <button onClick={handleSaveToken} disabled={loading} className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar Token'}</button>
                </div>
              )}
              {!showTokenInput && <button onClick={() => setShowTokenInput(true)} className="w-full px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg transition-colors disabled:opacity-50">Configurar Token</button>}
              <button onClick={handleCheckConnection} disabled={loading} className="w-full px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors disabled:opacity-50">{loading ? 'Verificando...' : 'Verificar Conexao'}</button>
            </div>
          )}
        </div>
        <div className="bg-zinc-900 rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4">Nome da Instancia</h3>
          <div className="bg-zinc-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <code className="text-amber-400 font-mono text-sm">{instanceName}</code>
              <button onClick={() => { navigator.clipboard.writeText(instanceName); alert('Copiado!'); }} className="text-zinc-400 hover:text-white">Copiar</button>
            </div>
          </div>
          <p className="text-sm text-zinc-400">Use este nome ao criar a instancia no Evolution Manager.</p>
          <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-400 font-medium mb-2">Onde encontrar o token:</p>
            <p className="text-xs text-zinc-400">No Evolution Manager, apos criar a instancia, o token aparece na tela principal.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHAT VIEW - SISTEMA COMPLETO COM MENSAGENS REAIS
// ============================================================================

function ChatView({ tenant }) {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Carregar lista de chats
  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [tenant.id]);

  // Carregar mensagens quando selecionar um chat
  useEffect(() => {
    if (currentChat) {
      loadMessages(currentChat.id);
      const interval = setInterval(() => loadMessages(currentChat.id), 3000);
      return () => clearInterval(interval);
    }
  }, [currentChat?.id]);

  // Scroll para ultima mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChats = async () => {
    try {
      const data = await api.getChats(tenant.id);
      setChats(data);
      setLoadingChats(false);
    } catch (err) {
      console.error('Erro ao carregar chats:', err);
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const data = await api.getChatMessages(chatId, 100, 0);
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  const handleSelectChat = async (chat) => {
    setCurrentChat(chat);
    setLoadingMessages(true);
    try {
      const data = await api.getChatMessages(chat.id, 100, 0);
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentChat) return;

    const phone = currentChat.contact_phone || currentChat.remote_jid?.split('@')[0];
    if (!phone) {
      alert('Numero de telefone nao encontrado');
      return;
    }

    setSending(true);
    try {
      await api.sendWhatsAppMessage(phone, message, tenant.id, currentChat.id);
      setMessage('');
      // Recarregar mensagens imediatamente
      await loadMessages(currentChat.id);
      await loadChats();
    } catch (err) {
      alert('Erro ao enviar: ' + err.message);
    } finally {
      setSending(false);
    }
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
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
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

  return (
    <div className="flex gap-0 h-[calc(100vh-220px)] bg-zinc-900 rounded-xl overflow-hidden">
      {/* Lista de conversas */}
      <div className="w-96 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-bold text-lg mb-3">Conversas</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingChats ? (
            <div className="text-center py-8 text-zinc-500 text-sm">Carregando conversas...</div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm px-4">
              {chats.length === 0 
                ? 'Nenhuma conversa ainda. As mensagens recebidas pelo WhatsApp aparecerao aqui automaticamente.'
                : 'Nenhuma conversa encontrada'
              }
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 ${
                  currentChat?.id === chat.id ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium">
                    {(chat.contact_name || chat.contact_phone || '?').substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm truncate">
                      {chat.contact_name || chat.contact_phone || 'Desconhecido'}
                    </h4>
                    <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                      {formatTime(chat.last_message_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-zinc-400 truncate flex-1">
                      {chat.last_message || 'Sem mensagens'}
                    </p>
                    {chat.unread_count > 0 && (
                      <span className="ml-2 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {chat.unread_count > 9 ? '9+' : chat.unread_count}
                      </span>
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
            {/* Header do chat */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {(currentChat.contact_name || currentChat.contact_phone || '?').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{currentChat.contact_name || currentChat.contact_phone || 'Desconhecido'}</h3>
                <p className="text-xs text-zinc-400">{currentChat.contact_phone}</p>
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
                        msg.is_from_me
                          ? 'bg-amber-500/20 border border-amber-500/30'
                          : 'bg-zinc-800 border border-zinc-700'
                      }`}>
                        {!msg.is_from_me && msg.sender_name && (
                          <p className="text-xs font-medium text-amber-400 mb-1">{msg.sender_name}</p>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {getMessageTypeIcon(msg.message_type)}
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-zinc-500">
                            {formatTime(msg.timestamp)}
                          </span>
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
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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

// ============================================================================
// KANBAN VIEW
// ============================================================================

function KanbanView({ leads, tenant, onRefresh, onSelectLead }) {
  const [draggedLead, setDraggedLead] = useState(null);

  const stages = [
    { id: 'novo', label: 'Novo', color: 'blue' },
    { id: 'qualificado', label: 'Qualificado', color: 'yellow' },
    { id: 'negociacao', label: 'Negociacao', color: 'purple' },
    { id: 'ganho', label: 'Ganho', color: 'green' },
    { id: 'perdido', label: 'Perdido', color: 'red' }
  ];

  const handleDragStart = (lead) => setDraggedLead(lead);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (stageId) => {
    if (!draggedLead) return;
    try {
      await api.updateLead(draggedLead.id, { ...draggedLead, stage: stageId });
      onRefresh();
    } catch (err) { alert('Erro ao atualizar lead'); }
    setDraggedLead(null);
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {stages.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.id);
        return (
          <div key={stage.id} className="bg-zinc-900 rounded-xl p-4" onDragOver={handleDragOver} onDrop={() => handleDrop(stage.id)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{stage.label}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium bg-${stage.color}-500/20 text-${stage.color}-400`}>{stageLeads.length}</span>
            </div>
            <div className="space-y-3">
              {stageLeads.map(lead => (
                <div key={lead.id} draggable onDragStart={() => handleDragStart(lead)} onClick={() => onSelectLead(lead)} className="bg-zinc-800 rounded-lg p-3 cursor-move hover:bg-zinc-700 transition-colors">
                  <h4 className="font-medium text-sm mb-1">{lead.name}</h4>
                  <p className="text-xs text-zinc-400">{lead.phone}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// LEADS VIEW
// ============================================================================

function LeadsView({ leads, tenant, onRefresh, onAdd }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredLeads = leads.filter(lead => lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || (lead.phone || '').includes(searchTerm));

  const handleDelete = async (leadId) => {
    if (!confirm('Deletar este lead?')) return;
    try { await api.deleteLead(leadId); onRefresh(); } catch (err) { alert('Erro ao deletar lead'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar leads..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2" />
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" /> Novo Lead</button>
      </div>
      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Nome</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Telefone</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Estagio</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, idx) => (
              <tr key={lead.id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'}>
                <td className="px-6 py-4">{lead.name}</td>
                <td className="px-6 py-4 text-zinc-400">{lead.phone}</td>
                <td className="px-6 py-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${lead.stage === 'novo' ? 'bg-blue-500/20 text-blue-400' : lead.stage === 'qualificado' ? 'bg-yellow-500/20 text-yellow-400' : lead.stage === 'negociacao' ? 'bg-purple-500/20 text-purple-400' : lead.stage === 'ganho' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{lead.stage}</span></td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// GROUPS VIEW
// ============================================================================

function GroupsView({ groups, tenant, onRefresh, onAdd }) {
  const handleDelete = async (groupId) => {
    if (!confirm('Deletar este grupo?')) return;
    try { await api.deleteGroup(groupId); onRefresh(); } catch (err) { alert('Erro'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Grupos WhatsApp</h2>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" /> Novo Grupo</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {groups.map(group => (
          <div key={group.id} className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div><h3 className="font-medium text-lg mb-1">{group.name}</h3><p className="text-sm text-zinc-400">{group.participant_count || 0} participantes</p></div>
              <button onClick={() => handleDelete(group.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {groups.length === 0 && <div className="col-span-2 text-center py-12 text-zinc-400">Nenhum grupo cadastrado</div>}
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS VIEW
// ============================================================================

function AnalyticsView({ leads, groups }) {
  const totalLeads = leads.length;
  const leadsByStage = { novo: leads.filter(l => l.stage === 'novo').length, qualificado: leads.filter(l => l.stage === 'qualificado').length, negociacao: leads.filter(l => l.stage === 'negociacao').length, ganho: leads.filter(l => l.stage === 'ganho').length, perdido: leads.filter(l => l.stage === 'perdido').length };
  const conversionRate = totalLeads > 0 ? ((leadsByStage.ganho / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 rounded-xl p-6"><div className="flex items-center gap-3 mb-2"><Users className="w-5 h-5 text-blue-500" /><span className="text-sm text-zinc-400">Total de Leads</span></div><p className="text-3xl font-bold">{totalLeads}</p></div>
        <div className="bg-zinc-900 rounded-xl p-6"><div className="flex items-center gap-3 mb-2"><MessageSquare className="w-5 h-5 text-purple-500" /><span className="text-sm text-zinc-400">Grupos</span></div><p className="text-3xl font-bold">{groups.length}</p></div>
        <div className="bg-zinc-900 rounded-xl p-6"><div className="flex items-center gap-3 mb-2"><CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm text-zinc-400">Conversoes</span></div><p className="text-3xl font-bold">{leadsByStage.ganho}</p></div>
        <div className="bg-zinc-900 rounded-xl p-6"><div className="flex items-center gap-3 mb-2"><Target className="w-5 h-5 text-amber-500" /><span className="text-sm text-zinc-400">Taxa de Conversao</span></div><p className="text-3xl font-bold">{conversionRate}%</p></div>
      </div>
      <div className="bg-zinc-900 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Leads por Estagio</h3>
        <div className="space-y-4">
          {Object.entries(leadsByStage).map(([stage, count]) => {
            const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            return (
              <div key={stage}>
                <div className="flex items-center justify-between mb-2"><span className="capitalize">{stage}</span><span className="text-sm text-zinc-400">{count} ({pct.toFixed(0)}%)</span></div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full ${stage === 'novo' ? 'bg-blue-500' : stage === 'qualificado' ? 'bg-yellow-500' : stage === 'negociacao' ? 'bg-purple-500' : stage === 'ganho' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KNOWLEDGE VIEW
// ============================================================================

function KnowledgeView({ knowledge, tenant, onRefresh, onAdd }) {
  const categories = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];
  const handleDelete = async (id) => { if (!confirm('Deletar?')) return; try { await api.deleteKnowledge(id); onRefresh(); } catch (err) { alert('Erro'); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Base de Conhecimento</h2>
        <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" /> Novo</button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {categories.map(category => {
          const items = knowledge.filter(k => k.category === category);
          return (
            <div key={category} className="bg-zinc-900 rounded-xl p-6">
              <h3 className="font-medium text-lg mb-4">{category}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2"><h4 className="font-medium text-sm">{item.question}</h4><button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button></div>
                    <p className="text-sm text-zinc-400">{item.answer}</p>
                  </div>
                ))}
                {items.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">Nenhum item</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TEAM VIEW
// ============================================================================

function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const handleDelete = async (userId) => { if (!confirm('Deletar?')) return; try { await api.deleteUser(userId); onRefresh(); } catch (err) { alert('Erro'); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Equipe</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" /> Novo Usuario</button>
      </div>
      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800"><tr><th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Nome</th><th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Email</th><th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Funcao</th><th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">Acoes</th></tr></thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user.id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'}>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                <td className="px-6 py-4"><span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : user.role === 'client_admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{user.role === 'super_admin' ? 'Super Admin' : user.role === 'client_admin' ? 'Admin' : 'Usuario'}</span></td>
                <td className="px-6 py-4 text-right">{user.id !== currentUser.id && <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && <UserModal tenant={tenant} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}

// ============================================================================
// SETTINGS VIEW
// ============================================================================

function SettingsView({ tenant, onRefresh }) {
  const [aiPrompt, setAiPrompt] = useState(tenant.ai_prompt || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt, customFields: JSON.parse(tenant.custom_fields || '[]') });
      alert('Salvo!');
      onRefresh();
    } catch (err) { alert('Erro: ' + err.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Configuracoes</h2>
      <div className="bg-zinc-900 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Prompt da IA</h3>
        <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={8} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 mb-4" placeholder="Ex: Voce e assistente virtual da Clinica..." />
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </div>
  );
}

// ============================================================================
// MODAIS
// ============================================================================

function LeadModal({ tenant, lead, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: lead?.name || '', phone: lead?.phone || '', stage: lead?.stage || 'novo', aiEnabled: lead?.ai_enabled !== false });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (lead) { await api.updateLead(lead.id, formData); } else { await api.createLead({ ...formData, tenantId: tenant.id }); } onSuccess(); } catch (err) { alert('Erro: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{lead ? 'Editar' : 'Novo'} Lead</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Nome</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div><label className="block text-sm font-medium mb-2">Telefone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div><label className="block text-sm font-medium mb-2">Estagio</label><select value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"><option value="novo">Novo</option><option value="qualificado">Qualificado</option><option value="negociacao">Negociacao</option><option value="ganho">Ganho</option><option value="perdido">Perdido</option></select></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupModal({ tenant, group, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: group?.name || '', groupId: group?.group_id || '', stage: group?.stage || 'novo' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (group) { await api.updateGroup(group.id, formData); } else { await api.createGroup({ ...formData, tenantId: tenant.id, participants: [] }); } onSuccess(); } catch (err) { alert('Erro: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{group ? 'Editar' : 'Novo'} Grupo</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Nome</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div><label className="block text-sm font-medium mb-2">ID do Grupo (WhatsApp)</label><input type="text" value={formData.groupId} onChange={(e) => setFormData({ ...formData, groupId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KnowledgeModal({ tenant, knowledge, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ category: knowledge?.category || 'Produtos/Servicos', question: knowledge?.question || '', answer: knowledge?.answer || '', active: knowledge?.active !== false });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (knowledge) { await api.updateKnowledge(knowledge.id, formData); } else { await api.createKnowledge({ ...formData, tenantId: tenant.id }); } onSuccess(); } catch (err) { alert('Erro: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{knowledge ? 'Editar' : 'Novo'} Conhecimento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Categoria</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"><option value="Produtos/Servicos">Produtos/Servicos</option><option value="Precos">Precos</option><option value="Agendamento">Agendamento</option><option value="FAQ">FAQ</option></select></div>
          <div><label className="block text-sm font-medium mb-2">Pergunta</label><input type="text" value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div><label className="block text-sm font-medium mb-2">Resposta</label><textarea value={formData.answer} onChange={(e) => setFormData({ ...formData, answer: e.target.value })} rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserModal({ tenant, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', password: '', confirmPassword: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user && formData.password !== formData.confirmPassword) { alert('Senhas nao coincidem!'); return; }
    try {
      if (user) { await api.updateUser(user.id, { name: formData.name, email: formData.email, ...(formData.password && { password: formData.password }) }); }
      else { await api.createUser({ name: formData.name, email: formData.email, password: formData.password, role: 'client_user', tenantId: tenant.id }); }
      onSuccess();
    } catch (err) { alert('Erro: ' + err.message); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{user ? 'Editar' : 'Novo'} Usuario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-2">Nome</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div><label className="block text-sm font-medium mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>
          <div><label className="block text-sm font-medium mb-2">{user ? 'Nova Senha (vazio = manter)' : 'Senha'}</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required={!user} /></div>
          {!user && <div><label className="block text-sm font-medium mb-2">Confirmar Senha</label><input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2" required /></div>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

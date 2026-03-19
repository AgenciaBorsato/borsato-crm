import React, { useState, useEffect } from 'react';
import api from './api';
import { 
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send, Bot, User, 
  Circle, Clock, Phone, Mail, MapPin, Tag, ChevronDown, X, Check, Zap,
  Filter, MoreVertical, Archive, Trash2, TrendingUp, Target, DollarSign,
  BarChart3, Activity, Flame, Snowflake, ThermometerSun, BookOpen, 
  FileText, FolderOpen, AlertCircle, CheckCircle2, XCircle, Calendar,
  Bell, Repeat, Sparkles, Brain, Database, Save, Edit2, ChevronRight,
  Building2, Shield, Key, LogOut, Eye, Trash, UserPlus, Copy, ExternalLink,
  GripVertical, ArrowLeft
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

  // Verificar se já tem token salvo ao carregar
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
          <p className="text-zinc-400">Sistema de gestão inteligente</p>
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
              placeholder="••••••••••"
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

          <div className="text-xs text-zinc-500 space-y-1">
            <p>Logins de teste:</p>
            <p>Super Admin: wlad@borsato.com / borsato123</p>
            <p>Cliente: roberto@clinicasilva.com / silva123</p>
          </div>
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
    setNewTenant({
      name: '',
      plan: 'Pro',
      monthlyValue: 497,
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    });
  };

  const totalRevenue = tenants.reduce((sum, t) => sum + (parseFloat(t.monthly_value || t.monthlyValue) || 0), 0);

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
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-zinc-400">Total de Clientes</span>
            </div>
            <p className="text-3xl font-bold">{tenants.length}</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-zinc-400">Receita Mensal</span>
            </div>
            <p className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-zinc-400">Ticket Médio</span>
            </div>
            <p className="text-3xl font-bold">
              R$ {tenants.length > 0 ? (totalRevenue / tenants.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Gerenciar Clientes</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-400">Carregando...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">Nenhum cliente ainda</div>
          ) : (
            <div className="space-y-3">
              {tenants.map(tenant => (
                <div key={tenant.id} className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{tenant.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <span>{tenant.plan}</span>
                      <span>R$ {parseFloat(tenant.monthly_value || tenant.monthlyValue || 0).toFixed(2)}/mês</span>
                      <span>{tenant.active !== false ? '✅ Ativo' : '❌ Inativo'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAccessTenant(tenant.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Acessar
                  </button>
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
              <div>
                <label className="block text-sm font-medium mb-2">Nome do Cliente</label>
                <input
                  type="text"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Plano</label>
                  <select
                    value={newTenant.plan}
                    onChange={(e) => setNewTenant({ ...newTenant, plan: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Mensal</label>
                  <input
                    type="number"
                    value={newTenant.monthlyValue}
                    onChange={(e) => setNewTenant({ ...newTenant, monthlyValue: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome do Admin</label>
                <input
                  type="text"
                  value={newTenant.adminName}
                  onChange={(e) => setNewTenant({ ...newTenant, adminName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email do Admin</label>
                <input
                  type="email"
                  value={newTenant.adminEmail}
                  onChange={(e) => setNewTenant({ ...newTenant, adminEmail: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Senha do Admin</label>
                <input
                  type="password"
                  value={newTenant.adminPassword}
                  onChange={(e) => setNewTenant({ ...newTenant, adminPassword: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
                >
                  Criar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD DO CLIENTE (VERSÃO COMPLETA)
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

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-black">
                {tenant.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{tenant.name}</h1>
              <p className="text-sm text-zinc-400">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onBackToSuperAdmin && (
              <button
                onClick={onBackToSuperAdmin}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
              { id: 'leads', label: 'Leads', icon: Users },
              { id: 'groups', label: 'Grupos', icon: MessageSquare },
              { id: 'chat', label: 'Chat', icon: Send },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'knowledge', label: 'Base de Conhecimento', icon: Brain },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {activeTab === 'kanban' && (
          <KanbanView 
            leads={leads} 
            tenant={tenant}
            onRefresh={onRefresh}
            onSelectLead={setSelectedLead}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsView 
            leads={leads}
            tenant={tenant}
            onRefresh={onRefresh}
            onAdd={() => setShowLeadModal(true)}
          />
        )}

        {activeTab === 'groups' && (
          <GroupsView 
            groups={groups}
            tenant={tenant}
            onRefresh={onRefresh}
            onAdd={() => setShowGroupModal(true)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView 
            leads={leads}
            groups={groups}
            selectedLead={selectedLead}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView 
            leads={leads}
            groups={groups}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeView 
            knowledge={knowledge}
            tenant={tenant}
            onRefresh={onRefresh}
            onAdd={() => setShowKnowledgeModal(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView 
            tenant={tenant}
            onRefresh={onRefresh}
          />
        )}
      </div>

      {/* Modais */}
      {showLeadModal && (
        <LeadModal
          tenant={tenant}
          onClose={() => setShowLeadModal(false)}
          onSuccess={() => {
            setShowLeadModal(false);
            onRefresh();
          }}
        />
      )}

      {showGroupModal && (
        <GroupModal
          tenant={tenant}
          onClose={() => setShowGroupModal(false)}
          onSuccess={() => {
            setShowGroupModal(false);
            onRefresh();
          }}
        />
      )}

      {showKnowledgeModal && (
        <KnowledgeModal
          tenant={tenant}
          onClose={() => setShowKnowledgeModal(false)}
          onSuccess={() => {
            setShowKnowledgeModal(false);
            onRefresh();
          }}
        />
      )}
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
    { id: 'negociacao', label: 'Negociação', color: 'purple' },
    { id: 'ganho', label: 'Ganho', color: 'green' },
    { id: 'perdido', label: 'Perdido', color: 'red' }
  ];

  const handleDragStart = (lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (stageId) => {
    if (!draggedLead) return;

    try {
      await api.updateLead(draggedLead.id, {
        ...draggedLead,
        stage: stageId
      });
      onRefresh();
    } catch (err) {
      alert('Erro ao atualizar lead');
    }

    setDraggedLead(null);
  };

  return (
    <div className="grid grid-cols-5 gap-4">
      {stages.map(stage => {
        const stageLeads = leads.filter(l => l.stage === stage.id);
        
        return (
          <div 
            key={stage.id}
            className="bg-zinc-900 rounded-xl p-4"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{stage.label}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium bg-${stage.color}-500/20 text-${stage.color}-400`}>
                {stageLeads.length}
              </span>
            </div>

            <div className="space-y-3">
              {stageLeads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  onClick={() => onSelectLead(lead)}
                  className="bg-zinc-800 rounded-lg p-3 cursor-move hover:bg-zinc-700 transition-colors"
                >
                  <h4 className="font-medium text-sm mb-1">{lead.name}</h4>
                  <p className="text-xs text-zinc-400">{lead.phone}</p>
                  {lead.last_message && (
                    <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{lead.last_message}</p>
                  )}
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

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const handleDelete = async (leadId) => {
    if (!confirm('Deletar este lead?')) return;

    try {
      await api.deleteLead(leadId);
      onRefresh();
    } catch (err) {
      alert('Erro ao deletar lead');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar leads..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2"
            />
          </div>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Nome</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Telefone</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">Estágio</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-zinc-400">IA</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-zinc-400">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, idx) => (
              <tr key={lead.id} className={idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-900/50'}>
                <td className="px-6 py-4">{lead.name}</td>
                <td className="px-6 py-4 text-zinc-400">{lead.phone}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    lead.stage === 'novo' ? 'bg-blue-500/20 text-blue-400' :
                    lead.stage === 'qualificado' ? 'bg-yellow-500/20 text-yellow-400' :
                    lead.stage === 'negociacao' ? 'bg-purple-500/20 text-purple-400' :
                    lead.stage === 'ganho' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {lead.stage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {lead.ai_enabled ? '✅' : '❌'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
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

    try {
      await api.deleteGroup(groupId);
      onRefresh();
    } catch (err) {
      alert('Erro ao deletar grupo');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Grupos WhatsApp</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Grupo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {groups.map(group => (
          <div key={group.id} className="bg-zinc-900 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium text-lg mb-1">{group.name}</h3>
                <p className="text-sm text-zinc-400">
                  {JSON.parse(group.participants || '[]').length} participantes
                </p>
              </div>
              <button
                onClick={() => handleDelete(group.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                group.stage === 'novo' ? 'bg-blue-500/20 text-blue-400' :
                group.stage === 'qualificado' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-zinc-700 text-zinc-400'
              }`}>
                {group.stage}
              </span>
              <span className="text-sm text-zinc-400">
                IA: {group.ai_enabled ? '✅' : '❌'}
              </span>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-2 text-center py-12 text-zinc-400">
            Nenhum grupo cadastrado ainda
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CHAT VIEW
// ============================================================================

function ChatView({ leads, groups, selectedLead }) {
  const [currentChat, setCurrentChat] = useState(selectedLead || leads[0] || null);
  const [message, setMessage] = useState('');

  const allChats = [...leads, ...groups];

  const handleSend = () => {
    if (!message.trim()) return;
    // Aqui futuramente vai salvar no banco
    setMessage('');
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-300px)]">
      {/* Lista de conversas */}
      <div className="w-80 bg-zinc-900 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="font-medium">Conversas</h3>
        </div>
        <div className="overflow-y-auto h-full">
          {allChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className={`p-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors ${
                currentChat?.id === chat.id ? 'bg-zinc-800' : ''
              }`}
            >
              <h4 className="font-medium text-sm mb-1">{chat.name}</h4>
              <p className="text-xs text-zinc-400 truncate">
                {chat.last_message || 'Sem mensagens'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat atual */}
      <div className="flex-1 bg-zinc-900 rounded-xl flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-zinc-800">
              <h3 className="font-medium">{currentChat.name}</h3>
              <p className="text-sm text-zinc-400">{currentChat.phone}</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              <div className="text-center text-zinc-500 text-sm py-8">
                Chat em desenvolvimento. Funcionalidade completa após integração com Evolution API.
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
                />
                <button
                  onClick={handleSend}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS VIEW
// ============================================================================

function AnalyticsView({ leads, groups }) {
  const totalLeads = leads.length;
  const totalGroups = groups.length;

  const leadsByStage = {
    novo: leads.filter(l => l.stage === 'novo').length,
    qualificado: leads.filter(l => l.stage === 'qualificado').length,
    negociacao: leads.filter(l => l.stage === 'negociacao').length,
    ganho: leads.filter(l => l.stage === 'ganho').length,
    perdido: leads.filter(l => l.stage === 'perdido').length
  };

  const conversionRate = totalLeads > 0 ? ((leadsByStage.ganho / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-zinc-400">Total de Leads</span>
          </div>
          <p className="text-3xl font-bold">{totalLeads}</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-zinc-400">Grupos WhatsApp</span>
          </div>
          <p className="text-3xl font-bold">{totalGroups}</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-zinc-400">Conversões</span>
          </div>
          <p className="text-3xl font-bold">{leadsByStage.ganho}</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-zinc-400">Taxa de Conversão</span>
          </div>
          <p className="text-3xl font-bold">{conversionRate}%</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Leads por Estágio</h3>
        <div className="space-y-4">
          {Object.entries(leadsByStage).map(([stage, count]) => {
            const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            
            return (
              <div key={stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="capitalize">{stage}</span>
                  <span className="text-sm text-zinc-400">{count} ({percentage.toFixed(0)}%)</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      stage === 'novo' ? 'bg-blue-500' :
                      stage === 'qualificado' ? 'bg-yellow-500' :
                      stage === 'negociacao' ? 'bg-purple-500' :
                      stage === 'ganho' ? 'bg-green-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
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
  const categories = ['Produtos/Serviços', 'Preços', 'Agendamento', 'FAQ'];

  const handleDelete = async (knowledgeId) => {
    if (!confirm('Deletar este conhecimento?')) return;

    try {
      await api.deleteKnowledge(knowledgeId);
      onRefresh();
    } catch (err) {
      alert('Erro ao deletar conhecimento');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Base de Conhecimento</h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Conhecimento
        </button>
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
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{item.question}</h4>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-400">{item.answer}</p>
                    <div className="mt-2 text-xs text-zinc-500">
                      {item.active ? '✅ Ativo' : '❌ Inativo'}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-4">
                    Nenhum item nesta categoria
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
      await api.updateTenant(tenant.id, {
        aiPrompt,
        customFields: JSON.parse(tenant.custom_fields || '[]')
      });
      alert('Configurações salvas!');
      onRefresh();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Configurações</h2>

      <div className="bg-zinc-900 rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Prompt da IA</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Este prompt será usado pela IA para responder seus leads
        </p>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={8}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 mb-4"
          placeholder="Ex: Você é assistente virtual da Clínica XYZ..."
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MODAIS
// ============================================================================

function LeadModal({ tenant, lead, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    phone: lead?.phone || '',
    stage: lead?.stage || 'novo',
    aiEnabled: lead?.ai_enabled !== false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (lead) {
        await api.updateLead(lead.id, formData);
      } else {
        await api.createLead({
          ...formData,
          tenantId: tenant.id
        });
      }
      onSuccess();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{lead ? 'Editar' : 'Novo'} Lead</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estágio</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
            >
              <option value="novo">Novo</option>
              <option value="qualificado">Qualificado</option>
              <option value="negociacao">Negociação</option>
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.aiEnabled}
              onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">IA habilitada</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupModal({ tenant, group, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    groupId: group?.group_id || '',
    stage: group?.stage || 'novo',
    aiEnabled: group?.ai_enabled !== false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (group) {
        await api.updateGroup(group.id, formData);
      } else {
        await api.createGroup({
          ...formData,
          tenantId: tenant.id,
          participants: []
        });
      }
      onSuccess();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{group ? 'Editar' : 'Novo'} Grupo</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome do Grupo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ID do Grupo (WhatsApp)</label>
            <input
              type="text"
              value={formData.groupId}
              onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estágio</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
            >
              <option value="novo">Novo</option>
              <option value="qualificado">Qualificado</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.aiEnabled}
              onChange={(e) => setFormData({ ...formData, aiEnabled: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">IA habilitada</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KnowledgeModal({ tenant, knowledge, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    category: knowledge?.category || 'Produtos/Serviços',
    question: knowledge?.question || '',
    answer: knowledge?.answer || '',
    active: knowledge?.active !== false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (knowledge) {
        await api.updateKnowledge(knowledge.id, formData);
      } else {
        await api.createKnowledge({
          ...formData,
          tenantId: tenant.id
        });
      }
      onSuccess();
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-6">{knowledge ? 'Editar' : 'Novo'} Conhecimento</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
            >
              <option value="Produtos/Serviços">Produtos/Serviços</option>
              <option value="Preços">Preços</option>
              <option value="Agendamento">Agendamento</option>
              <option value="FAQ">FAQ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pergunta</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resposta</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">Ativo</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

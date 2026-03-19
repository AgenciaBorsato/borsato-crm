import React, { useState, useEffect } from 'react';
import api from './api';
import { 
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send, Bot, User, 
  Circle, Clock, Phone, Mail, MapPin, Tag, ChevronDown, X, Check, Zap,
  Filter, MoreVertical, Archive, Trash2, TrendingUp, Target, DollarSign,
  BarChart3, Activity, Flame, Snowflake, ThermometerSun, BookOpen, 
  FileText, FolderOpen, AlertCircle, CheckCircle2, XCircle, Calendar,
  Bell, Repeat, Sparkles, Brain, Database, Save, Edit2, ChevronRight,
  Building2, Shield, Key, LogOut, Eye, Trash, UserPlus, Copy, ExternalLink
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
        // Token inválido, limpar
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }, []);

  // Carregar lista de tenants (Super Admin)
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

  // Carregar dados de um tenant específico
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

  // Login
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

  // Logout
  const handleLogout = () => {
    api.logout();
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setCurrentView('login');
    setCurrentTenant(null);
    setTenants([]);
  };

  // Criar novo tenant (Super Admin)
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

  // Acessar painel de um tenant (modo God)
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

  // Voltar pro painel super admin
  const handleBackToSuperAdmin = () => {
    setCurrentTenant(null);
    setCurrentView('superAdmin');
  };

  // Renderizar componentes
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
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-black">BR</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Borsato CRM</h1>
          <p className="text-zinc-400">Sistema de gestão inteligente</p>
        </div>

        {/* Form */}
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

          {/* Logins de teste */}
          <div className="text-xs text-zinc-500 space-y-1">
            <p>Logins de teste:</p>
            <p>Super Admin: wlad@borsato.com / borsato123</p>
            <p>Cliente Admin: roberto@clinicasilva.com / silva123</p>
            <p>Usuário: maria@clinicasilva.com / maria123</p>
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

  const totalRevenue = tenants.reduce((sum, t) => sum + (t.monthly_value || t.monthlyValue || 0), 0);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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

        {/* Métricas */}
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

        {/* Lista de Clientes */}
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
                      <span>R$ {(tenant.monthly_value || tenant.monthlyValue).toFixed(2)}/mês</span>
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

      {/* Modal Criar Cliente */}
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
// DASHBOARD DO CLIENTE (Versão Simplificada)
// ============================================================================

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, loading, error }) {
  const [activeTab, setActiveTab] = useState('leads');

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
                <ChevronRight className="w-4 h-4 rotate-180" />
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'leads'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Leads Individuais
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'groups'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Grupos WhatsApp
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Conteúdo */}
        <div className="bg-zinc-900 rounded-xl p-8">
          {loading ? (
            <div className="text-center py-12 text-zinc-400">Carregando dados...</div>
          ) : activeTab === 'leads' ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Leads Individuais</h2>
              {tenant.leads && tenant.leads.length > 0 ? (
                <div className="space-y-3">
                  {tenant.leads.map(lead => (
                    <div key={lead.id} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{lead.name}</h3>
                          <p className="text-sm text-zinc-400">{lead.phone}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            lead.stage === 'novo' ? 'bg-blue-500/20 text-blue-400' :
                            lead.stage === 'qualificado' ? 'bg-yellow-500/20 text-yellow-400' :
                            lead.stage === 'negociacao' ? 'bg-purple-500/20 text-purple-400' :
                            lead.stage === 'ganho' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {lead.stage}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-8">Nenhum lead ainda</p>
              )}
            </div>
          ) : activeTab === 'groups' ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Grupos WhatsApp</h2>
              {tenant.groups && tenant.groups.length > 0 ? (
                <div className="space-y-3">
                  {tenant.groups.map(group => (
                    <div key={group.id} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-zinc-400">
                            {JSON.parse(group.participants || '[]').length} participantes
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            group.stage === 'novo' ? 'bg-blue-500/20 text-blue-400' :
                            group.stage === 'qualificado' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-zinc-700 text-zinc-400'
                          }`}>
                            {group.stage}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 text-center py-8">Nenhum grupo ainda</p>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="text-sm text-zinc-400 mb-2">Total de Leads</div>
                  <div className="text-3xl font-bold">{tenant.leads?.length || 0}</div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="text-sm text-zinc-400 mb-2">Grupos Ativos</div>
                  <div className="text-3xl font-bold">{tenant.groups?.length || 0}</div>
                </div>
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="text-sm text-zinc-400 mb-2">Taxa de Conversão</div>
                  <div className="text-3xl font-bold">0%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import SuperAdminPanel from './pages/SuperAdminPanel';
import {
  MessageSquare, LayoutGrid, Users, Settings, UserPlus, ArrowLeft,
  Smartphone, BarChart3, Brain, AlertTriangle, X
} from 'lucide-react';
import ChatView from './components/ChatView';
import KanbanView from './components/KanbanView';
import LeadsView from './components/LeadsView';
import { WhatsAppView, AnalyticsView, KnowledgeView, TeamView, SettingsView } from './components/MiscViews';

export default function BorsatoCRM() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doLogout = useCallback(() => {
    api.logout(); localStorage.clear();
    setCurrentUser(null); setCurrentView('login'); setCurrentTenant(null); setTenants([]);
  }, []);

  useEffect(() => { api.onAuthError(doLogout); }, [doLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ud = localStorage.getItem('userData');
    if (!token || !ud) return;
    try {
      const u = JSON.parse(ud);
      setCurrentUser(u);
      const savedView = localStorage.getItem('currentView') || null;
      const savedTenantId = localStorage.getItem('currentTenantId') || null;
      if (u.role === 'super_admin') {
        loadTenants();
        if (savedView === 'clientDashboard' && savedTenantId) loadTenantData(savedTenantId).then(() => setCurrentView('clientDashboard'));
        else setCurrentView('superAdmin');
      } else {
        loadTenantData(u.tenantId).then(() => setCurrentView('clientDashboard'));
      }
    } catch (e) { localStorage.clear(); }
  }, []);

  useEffect(() => { if (currentView !== 'login') localStorage.setItem('currentView', currentView); }, [currentView]);
  useEffect(() => { if (currentTenant?.id) localStorage.setItem('currentTenantId', currentTenant.id); }, [currentTenant]);

  const loadTenants = async () => {
    setLoading(true);
    try { setTenants(await api.getTenants()); }
    catch (e) { if (e.message !== 'Sessao expirada') setError('Erro ao carregar'); }
    finally { setLoading(false); }
  };

  const loadTenantData = async (id) => {
    setLoading(true);
    try { setCurrentTenant(await api.getTenant(id)); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogin = async (c) => {
    setLoading(true); setError(null);
    try {
      const { user } = await api.login(c.email, c.password);
      setCurrentUser(user);
      localStorage.setItem('userData', JSON.stringify(user));
      if (user.role === 'super_admin') {
        setCurrentView('superAdmin'); localStorage.setItem('currentView', 'superAdmin'); localStorage.removeItem('currentTenantId');
        await loadTenants();
      } else {
        await loadTenantData(user.tenantId); setCurrentView('clientDashboard');
      }
    } catch (e) { setError('E-mail ou senha incorretos'); }
    finally { setLoading(false); }
  };

  const handleEnterTenant = useCallback(async (tid) => {
    await loadTenantData(tid); setCurrentView('clientDashboard');
    localStorage.setItem('currentView', 'clientDashboard'); localStorage.setItem('currentTenantId', tid);
  }, []);

  const refreshData = useCallback(async () => {
    if (currentView === 'superAdmin') await loadTenants();
    if (currentTenant) await loadTenantData(currentTenant.id);
  }, [currentView, currentTenant]);

  if (currentView === 'login') return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  if (currentView === 'superAdmin') return (
    <SuperAdminPanel user={currentUser} tenants={tenants} onLogout={doLogout} onRefresh={refreshData} onEnterTenant={handleEnterTenant} />
  );
  if (currentView === 'clientDashboard' && currentTenant) return (
    <ClientDashboard user={currentUser} tenant={currentTenant} onLogout={doLogout} onRefresh={refreshData}
      onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => {
        setCurrentTenant(null); localStorage.setItem('currentView', 'superAdmin'); localStorage.removeItem('currentTenantId');
        loadTenants(); setCurrentView('superAdmin');
      } : null} />
  );
  return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Carregando...</div>;
}

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-2xl font-black text-[#075e54] mb-3 shadow-lg">BR</div>
          <h1 className="text-2xl font-bold text-white">Borsato CRM</h1>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin({ email, password: pw }); }} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-600 text-xs">{error}</div>}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#25d366]" required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Senha</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#25d366]" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50">
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh }) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem(`activeTab_${tenant.id}`) || 'kanban');
  const [columns, setColumns] = useState([]);
  const [requestedPhone, setRequestedPhone] = useState(null);
  const [whatsappConnected, setWhatsappConnected] = useState(true);
  const [waBannerDismissed, setWaBannerDismissed] = useState(false);

  useEffect(() => { localStorage.setItem(`activeTab_${tenant.id}`, activeTab); }, [activeTab, tenant.id]);
  useEffect(() => { loadCols(); }, [tenant.id]);
  useEffect(() => {
    const checkWA = async () => {
      try { const status = await api.getWhatsAppStatus(tenant.id); const connected = status?.connected === true; setWhatsappConnected(connected); if (connected) setWaBannerDismissed(false); } catch {}
    };
    checkWA(); const i = setInterval(checkWA, 60000); return () => clearInterval(i);
  }, [tenant.id]);

  const loadCols = async () => { try { setColumns(await api.getKanbanColumns(tenant.id)); } catch {} };
  const refreshAll = useCallback(async () => { await onRefresh(); await loadCols(); }, [onRefresh, tenant.id]);
  const openChatByPhone = useCallback((phone) => { setRequestedPhone(phone); setActiveTab('chat'); }, []);

  const allTabs = [
    { id: 'kanban',    label: 'Kanban',       icon: LayoutGrid },
    { id: 'chat',      label: 'Conversas',    icon: MessageSquare },
    { id: 'leads',     label: 'Leads',        icon: Users },
    { id: 'whatsapp',  label: 'WhatsApp',     icon: Smartphone },
    { id: 'analytics', label: 'Analytics',    icon: BarChart3 },
    { id: 'knowledge', label: 'Conhecimento', icon: Brain },
    { id: 'team',      label: 'Equipe',       icon: UserPlus },
    { id: 'settings',  label: 'Config',       icon: Settings },
  ];

  const userPerms = (() => { try { return JSON.parse(user.permissions || '[]'); } catch { return []; } })();
  const isAdmin = user.role === 'super_admin' || user.role === 'client_admin';
  const tabs = isAdmin ? allTabs : allTabs.filter(t => userPerms.includes(t.id));

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-800">
      <div className="bg-[#075e54] text-white px-6 py-2.5 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xs">{tenant.name.substring(0, 2).toUpperCase()}</div>
          <div><h1 className="font-bold text-sm">{tenant.name}</h1><p className="text-[10px] text-white/50">{user.name}</p></div>
        </div>
        <div className="flex gap-2">
          {onBackToSuperAdmin && <button onClick={onBackToSuperAdmin} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> MESTRE</button>}
          <button onClick={onLogout} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold">Sair</button>
        </div>
      </div>

      {!whatsappConnected && !waBannerDismissed && (
        <div className="bg-red-500 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 flex-shrink-0" /><span className="text-xs font-bold">WhatsApp desconectado — mensagens nao estao sendo recebidas nem enviadas</span></div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setActiveTab('whatsapp')} className="bg-white text-red-600 hover:bg-red-50 px-3 py-1 rounded text-[10px] font-bold transition-all">Reconectar</button>
            <button onClick={() => setWaBannerDismissed(true)} className="text-white/70 hover:text-white p-0.5"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      <div className="bg-[#075e54]/90 px-6 flex gap-0.5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3 flex items-center gap-1.5 text-[11px] font-bold border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}>
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
            {tab.id === 'whatsapp' && !whatsappConnected && <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />}
          </button>
        ))}
      </div>

      <div className={activeTab === 'chat' ? '' : 'max-w-[1800px] mx-auto px-4 py-4'}>
        {activeTab === 'kanban'    && <KanbanView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} onOpenChat={openChatByPhone} />}
        {activeTab === 'chat'      && <ChatView tenant={tenant} columns={columns} onRefresh={refreshAll} requestedPhone={requestedPhone} onPhoneHandled={() => setRequestedPhone(null)} currentUser={user} />}
        {activeTab === 'leads'     && <LeadsView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} onOpenChat={openChatByPhone} />}
        {activeTab === 'whatsapp'  && <WhatsAppView tenant={tenant} />}
        {activeTab === 'analytics' && <AnalyticsView leads={tenant.leads || []} columns={columns} />}
        {activeTab === 'knowledge' && <KnowledgeView knowledge={tenant.knowledgeBase || []} tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'team'      && <TeamView users={tenant.users || []} tenant={tenant} currentUser={user} onRefresh={refreshAll} />}
        {activeTab === 'settings'  && <SettingsView tenant={tenant} onRefresh={refreshAll} />}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import api from './api';
import {
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send,
  X, Check, Trash2, TrendingUp, Target, DollarSign,
  BarChart3, CheckCircle2, Brain, Edit2, Building2, LogOut, Eye, UserPlus,
  ArrowLeft, Smartphone, Image, Mic, FileText, MapPin, CheckCheck, FileIcon,
  Paperclip, Clock
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

  const loadTenants = async () => { setLoading(true); try { setTenants(await api.getTenants()); } catch (err) { setError('Erro ao carregar'); } finally { setLoading(false); } };
  const loadTenantData = async (id) => { setLoading(true); try { setCurrentTenant(await api.getTenant(id)); } catch (err) { setError('Erro ao carregar'); } finally { setLoading(false); } };

  const handleLogin = async (creds) => {
    setLoading(true); setError(null);
    try {
      const { user } = await api.login(creds.email, creds.password);
      setCurrentUser(user); localStorage.setItem('userData', JSON.stringify(user));
      if (user.role === 'super_admin') { setCurrentView('superAdmin'); await loadTenants(); }
      else { setCurrentView('clientDashboard'); await loadTenantData(user.tenantId); }
    } catch (err) { setError('E-mail ou senha incorretos'); } finally { setLoading(false); }
  };

  const handleLogout = () => { api.logout(); localStorage.clear(); setCurrentUser(null); setCurrentView('login'); setCurrentTenant(null); };
  const refreshData = async () => { if (currentView === 'superAdmin') await loadTenants(); if (currentTenant) await loadTenantData(currentTenant.id); };

  if (currentView === 'login') return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  if (currentView === 'superAdmin') return <SuperAdminPanel user={currentUser} tenants={tenants} onLogout={handleLogout} onRefresh={refreshData} onAccessTenant={(id) => { loadTenantData(id); setCurrentView('clientDashboard'); }} />;
  if (currentView === 'clientDashboard' && currentTenant) return <ClientDashboard user={currentUser} tenant={currentTenant} onLogout={handleLogout} onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => { setCurrentTenant(null); loadTenants(); setCurrentView('superAdmin'); } : null} onRefresh={refreshData} />;
  return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Carregando...</div>;
}

// ============================================================================
// LOGIN
// ============================================================================

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-2xl font-black text-[#075e54] mb-3 shadow-lg">BR</div>
          <h1 className="text-2xl font-bold text-white">Borsato CRM</h1>
          <p className="text-white/60 text-xs mt-1">Sistema de Gestao Inteligente</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onLogin({ email, password }); }} className="bg-white rounded-2xl p-6 shadow-2xl space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-600 text-xs font-medium">{error}</div>}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 text-sm outline-none focus:border-[#25d366] focus:ring-1 focus:ring-[#25d366]/30" required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 text-sm outline-none focus:border-[#25d366] focus:ring-1 focus:ring-[#25d366]/30" required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#25d366] text-white font-bold rounded-xl hover:bg-[#128c7e] transition-all disabled:opacity-50 text-sm">
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SUPER ADMIN
// ============================================================================

function SuperAdminPanel({ user, tenants, onLogout, onAccessTenant, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const totalRevenue = tenants.reduce((a, t) => a + (parseFloat(t.monthly_value) || 0), 0);
  const totalLeads = tenants.reduce((a, t) => a + (t.leadCount || 0), 0);
  const filtered = tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-800">
      <div className="bg-[#075e54] text-white px-6 py-3 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">BR</div>
          <div><h1 className="font-bold text-sm">Painel Mestre</h1><p className="text-[10px] text-white/60">{user.name}</p></div>
        </div>
        <button onClick={onLogout} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium">Sair</button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Receita Mensal', value: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-600' },
            { label: 'Clientes Ativos', value: tenants.filter(t => t.active !== false).length, icon: Building2, color: 'text-[#075e54]' },
            { label: 'Leads Gerados', value: totalLeads, icon: Users, color: 'text-blue-600' },
            { label: 'Ticket Medio', value: `R$ ${tenants.length > 0 ? (totalRevenue / tenants.length).toFixed(2) : '0.00'}`, icon: TrendingUp, color: 'text-purple-600' }
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1"><m.icon className={`w-4 h-4 ${m.color}`} /><span className="text-[10px] text-gray-400 font-bold uppercase">{m.label}</span></div>
              <p className="text-2xl font-bold text-gray-800">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Clientes</h2>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg hover:bg-[#128c7e]"><Plus className="w-3 h-3" /> Novo</button>
          </div>
          <div className="mb-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            {filtered.map(t => (
              <div key={t.id} className={`bg-gray-50 border border-gray-100 rounded-lg p-4 flex justify-between items-center ${t.active === false ? 'opacity-50' : ''}`}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold">{t.name}</p>
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[9px] font-bold rounded">{t.plan || 'Pro'}</span>
                    {t.active === false && <span className="px-1.5 py-0.5 bg-red-100 text-red-500 text-[9px] font-bold rounded">SUSPENSO</span>}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>R$ {parseFloat(t.monthly_value || 0).toFixed(2)}/mes</span>
                    <span>{t.leadCount || 0} leads</span>
                    <span>{t.userCount || 0} usuarios</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing(t); setShowEdit(true); }} className="p-1.5 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onAccessTenant(t.id)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><Eye className="w-3.5 h-3.5" /></button>
                  <button onClick={async () => { if (confirm('Deletar?') && prompt('Digite SIM:') === 'SIM') { await api.deleteTenant(t.id); onRefresh(); } }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showCreate && <CreateTenantModal onClose={() => setShowCreate(false)} onRefresh={onRefresh} />}
      {showEdit && editing && <EditTenantModal tenant={editing} onClose={() => { setShowEdit(false); setEditing(null); }} onRefresh={onRefresh} />}
    </div>
  );
}

function CreateTenantModal({ onClose, onRefresh }) {
  const [f, setF] = useState({ name: '', adminName: '', adminEmail: '', adminPassword: '', plan: 'Pro', monthlyValue: 497 });
  const save = async (e) => { e.preventDefault(); try { await api.createTenant(f); onRefresh(); onClose(); } catch (err) { alert('Erro: ' + err.message); } };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold text-lg mb-4">Novo Cliente</h2>
        <form onSubmit={save} className="space-y-3">
          <input type="text" placeholder="Empresa" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="text" placeholder="Nome admin" value={f.adminName} onChange={e => setF({ ...f, adminName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail admin" value={f.adminEmail} onChange={e => setF({ ...f, adminEmail: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="password" placeholder="Senha" value={f.adminPassword} onChange={e => setF({ ...f, adminPassword: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <div className="grid grid-cols-2 gap-3">
            <select value={f.plan} onChange={e => setF({ ...f, plan: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option>Basic</option><option>Pro</option><option>Enterprise</option></select>
            <input type="number" value={f.monthlyValue} onChange={e => setF({ ...f, monthlyValue: parseFloat(e.target.value) })} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl text-sm text-gray-600">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white font-bold rounded-xl text-sm">Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTenantModal({ tenant, onClose, onRefresh }) {
  const [f, setF] = useState({ name: tenant.name, plan: tenant.plan || 'Pro', monthlyValue: parseFloat(tenant.monthly_value) || 497, aiPrompt: tenant.ai_prompt || '', active: tenant.active !== false });
  const save = async (e) => { e.preventDefault(); try { await api.updateTenant(tenant.id, { ...f, customFields: JSON.parse(tenant.custom_fields || '[]') }); onRefresh(); onClose(); } catch (err) { alert('Erro: ' + err.message); } };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold text-lg mb-4">Editar: {tenant.name}</h2>
        <form onSubmit={save} className="space-y-3">
          <input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <div className="grid grid-cols-2 gap-3">
            <select value={f.plan} onChange={e => setF({ ...f, plan: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option>Basic</option><option>Pro</option><option>Enterprise</option></select>
            <input type="number" step="0.01" value={f.monthlyValue} onChange={e => setF({ ...f, monthlyValue: parseFloat(e.target.value) })} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          </div>
          <textarea value={f.aiPrompt} onChange={e => setF({ ...f, aiPrompt: e.target.value })} rows={3} placeholder="Prompt IA..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} /> Ativo</label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 font-bold rounded-xl text-sm text-gray-600">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white font-bold rounded-xl text-sm">Salvar</button>
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

  useEffect(() => { loadCols(); }, [tenant.id]);
  const loadCols = async () => { try { setColumns(await api.getKanbanColumns(tenant.id)); } catch (e) { } };
  const refreshAll = async () => { await onRefresh(); await loadCols(); };

  const tabs = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'chat', label: 'Conversas', icon: MessageSquare },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'knowledge', label: 'Conhecimento', icon: Brain },
    { id: 'team', label: 'Equipe', icon: UserPlus },
    { id: 'settings', label: 'Config', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-800">
      <div className="bg-[#075e54] text-white px-6 py-2.5 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xs">{tenant.name.substring(0, 2).toUpperCase()}</div>
          <div><h1 className="font-bold text-sm">{tenant.name}</h1><p className="text-[10px] text-white/50">{user.name}</p></div>
        </div>
        <div className="flex gap-2">
          {onBackToSuperAdmin && <button onClick={onBackToSuperAdmin} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold hover:bg-white/20 flex items-center gap-1"><ArrowLeft className="w-3 h-3" />MESTRE</button>}
          <button onClick={onLogout} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold hover:bg-white/20">Sair</button>
        </div>
      </div>

      <div className="bg-[#075e54]/90 px-6 flex gap-0.5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3 flex items-center gap-1.5 text-[11px] font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'}`}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-4">
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
// KANBAN
// ============================================================================

function KanbanView({ leads, columns, tenant, onRefresh }) {
  const [dragged, setDragged] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', color: 'blue' });
  const colors = { blue: 'bg-blue-500', yellow: 'bg-amber-500', purple: 'bg-purple-500', green: 'bg-green-500', red: 'bg-red-500', zinc: 'bg-gray-400' };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Pipeline</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm"><Plus className="w-3 h-3" /> Etapa</button>
      </div>
      {columns.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-bold text-sm">Crie sua primeira etapa</p></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map(col => (
            <div key={col.id} onDragOver={e => e.preventDefault()} onDrop={async () => { if (dragged) { await api.updateLead(dragged.id, { ...dragged, stage: col.id }); setDragged(null); onRefresh(); } }}
              className="w-64 bg-white border border-gray-200 rounded-xl p-3 flex-shrink-0 min-h-[350px] shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5"><div className={`w-2 h-2 rounded-full ${colors[col.color] || 'bg-gray-400'}`}></div><span className="font-bold text-[11px] uppercase text-gray-600">{col.name}</span><span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{leads.filter(l => l.stage === col.id).length}</span></div>
                <button onClick={async () => { if (confirm('Excluir?')) { await api.deleteKanbanColumn(col.id); onRefresh(); } }}><X className="w-3 h-3 text-gray-300 hover:text-red-400" /></button>
              </div>
              <div className="space-y-2">
                {leads.filter(l => l.stage === col.id).map(lead => (
                  <div key={lead.id} draggable onDragStart={() => setDragged(lead)} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 cursor-grab hover:border-[#25d366]/50 hover:shadow-sm transition-all">
                    <p className="text-xs font-bold text-gray-700">{lead.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{lead.phone}</p>
                    {lead.last_message && <p className="text-[10px] text-gray-400 mt-1 truncate">{lead.last_message}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold mb-4">Nova Etapa</h2>
            <form onSubmit={async (e) => { e.preventDefault(); await api.createKanbanColumn({ tenantId: tenant.id, name: newCol.name, color: newCol.color, position: columns.length }); setNewCol({ name: '', color: 'blue' }); setShowModal(false); onRefresh(); }} className="space-y-3">
              <input type="text" placeholder="Nome" value={newCol.name} onChange={e => setNewCol({ ...newCol, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
              <div className="flex gap-2 p-2 bg-gray-50 rounded-xl justify-center">
                {Object.keys(colors).map(c => (<button key={c} type="button" onClick={() => setNewCol({ ...newCol, color: c })} className={`w-7 h-7 rounded-full ${colors[c]} transition-all ${newCol.color === c ? 'ring-2 ring-gray-800 scale-110' : 'opacity-40'}`} />))}
              </div>
              <div className="flex gap-2"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Criar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHAT (WHATSAPP STYLE)
// ============================================================================

function ChatView({ tenant, columns, onRefresh }) {
  const [chats, setChats] = useState([]);
  const [cur, setCur] = useState(null);
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [file, setFile] = useState(null);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { load(); const i = setInterval(load, 4000); return () => clearInterval(i); }, [tenant.id]);
  useEffect(() => { if (cur) { loadMsgs(cur.id); loadLead(cur); const i = setInterval(() => loadMsgs(cur.id), 3000); return () => clearInterval(i); } }, [cur?.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const load = async () => { try { setChats(await api.getChats(tenant.id)); } catch (e) { } };
  const loadMsgs = async (id) => { try { setMsgs(await api.getChatMessages(id, 100, 0)); } catch (e) { } };
  const loadLead = async (c) => { try { setLead(await api.getLeadByPhone(c.contact_phone || c.remote_jid?.split('@')[0], tenant.id)); } catch (e) { setLead(null); } };

  const send = async () => {
    if (!msg.trim() || !cur) return;
    const phone = cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try { await api.sendWhatsAppMessage(phone, msg, tenant.id, cur.id); setMsg(''); await loadMsgs(cur.id); await load(); } catch (e) { alert('Erro: ' + e.message); }
    finally { setSending(false); }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert('Arquivo muito grande. Maximo 2MB.'); return; }
    setFile(f);
  };

  const sendFile = async () => {
    if (!file || !cur) return;
    const phone = cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try {
      const type = file.type.startsWith('image') ? 'Imagem' : file.type.startsWith('video') ? 'Video' : 'Arquivo';
      await api.sendWhatsAppMessage(phone, `[${type}: ${file.name}]`, tenant.id, cur.id);
      setFile(null); await loadMsgs(cur.id); await load();
    } catch (e) { alert('Erro: ' + e.message); }
    finally { setSending(false); }
  };

  const fmt = (ts) => { if (!ts) return ''; const d = new Date(String(ts).replace('Z', '')); const n = new Date(); if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }); };

  const filtered = chats.filter(c => { if (!search) return true; return (c.contact_name || c.contact_phone || '').toLowerCase().includes(search.toLowerCase()); });

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <div key={c.id} onClick={() => setCur(c)} className={`flex items-center gap-2.5 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${cur?.id === c.id ? 'bg-[#f0f2f5]' : ''}`}>
              <div className="w-9 h-9 bg-[#dfe5e7] rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-bold text-[#075e54]">{(c.contact_name || c.contact_phone || '?').substring(0, 2).toUpperCase()}</span></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between"><p className="font-bold text-xs truncate text-gray-700">{c.contact_name || c.contact_phone}</p><span className="text-[9px] text-gray-400 flex-shrink-0">{fmt(c.last_message_time)}</span></div>
                <div className="flex justify-between mt-0.5"><p className="text-[10px] text-gray-400 truncate">{c.last_message}</p>{c.unread_count > 0 && <span className="ml-1 bg-[#25d366] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">{c.unread_count > 9 ? '9+' : c.unread_count}</span>}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {cur ? (
          <>
            {/* Header */}
            <div className="bg-[#f0f2f5] px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#dfe5e7] rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-[#075e54]">{(cur.contact_name || '?').substring(0, 2).toUpperCase()}</span></div>
                <div><p className="font-bold text-sm text-gray-700">{cur.contact_name || cur.contact_phone}</p><p className="text-[10px] text-gray-400 font-mono">{cur.contact_phone}</p></div>
              </div>
              {lead && columns.length > 0 && (
                <div className="flex gap-1">
                  {columns.map(col => (
                    <button key={col.id} onClick={async () => { await api.updateLead(lead.id, { ...lead, stage: col.id }); setLead({ ...lead, stage: col.id }); onRefresh(); }}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${lead.stage === col.id ? 'bg-[#25d366] text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>{col.name}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'300\' height=\'300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'a\' patternUnits=\'userSpaceOnUse\' width=\'40\' height=\'40\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'%23d4d4d8\' fill-opacity=\'0.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23eae6df\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23a)\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }}>
              {msgs.map(m => (
                <div key={m.id} className={`flex ${m.is_from_me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm ${m.is_from_me ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                    {m.sender_name && <p className={`text-[10px] font-bold mb-0.5 ${m.is_from_me ? 'text-[#075e54]' : 'text-[#6b7280]'}`}>{m.sender_name}</p>}
                    <p className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{m.content}</p>
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      <span className="text-[9px] text-gray-500">{fmt(m.timestamp)}</span>
                      {m.is_from_me && (m.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-500" /> : m.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-gray-400" /> : <Check className="w-3 h-3 text-gray-400" />)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* File preview */}
            {file && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span><span className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)}KB</span></div>
                <div className="flex gap-2"><button onClick={() => setFile(null)} className="text-xs text-red-500 font-bold">Cancelar</button><button onClick={sendFile} disabled={sending} className="px-3 py-1 bg-[#25d366] text-white text-xs font-bold rounded-lg disabled:opacity-50">Enviar</button></div>
              </div>
            )}

            {/* Input */}
            <div className="bg-[#f0f2f5] px-3 py-2.5 flex items-center gap-2 border-t border-gray-200">
              <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
              <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-gray-200 rounded-full transition-all"><Paperclip className="w-4 h-4 text-gray-500" /></button>
              <input type="text" value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !sending) { e.preventDefault(); send(); } }} disabled={sending} placeholder="Mensagem..."
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-[#25d366]" />
              <button onClick={send} disabled={sending || !msg.trim()} className="p-2 bg-[#25d366] text-white rounded-full hover:bg-[#128c7e] disabled:opacity-40 transition-all"><Send className="w-4 h-4" /></button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm font-bold text-gray-400">Selecione uma conversa</p></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LEADS
// ============================================================================

function LeadsView({ leads, columns, tenant, onRefresh }) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const filtered = leads.filter(l => (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm shadow-sm" />
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg hover:bg-[#128c7e]"><Plus className="w-3 h-3" /> Lead</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase"><tr><th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Etapa</th><th className="p-3">Origem</th><th className="p-3">Ultima msg</th><th className="p-3 text-right">Acao</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-bold text-xs text-gray-700">{l.name}</td>
                <td className="p-3 text-xs text-gray-400 font-mono">{l.phone}</td>
                <td className="p-3"><span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded">{columns.find(c => c.id === l.stage)?.name || l.stage || '-'}</span></td>
                <td className="p-3 text-[10px] text-gray-400">{l.source || '-'}</td>
                <td className="p-3 text-[10px] text-gray-400 max-w-[150px] truncate">{l.last_message || '-'}</td>
                <td className="p-3 text-right"><button onClick={async () => { if (confirm('Deletar?')) { await api.deleteLead(l.id); onRefresh(); } }} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-xs">Nenhum lead</div>}
      </div>
      {showModal && <LeadModal tenant={tenant} columns={columns} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}

function LeadModal({ tenant, columns, onClose, onSuccess }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', stage: columns[0]?.id || 'novo' });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">Novo Lead</h2>
        <form onSubmit={async (e) => { e.preventDefault(); try { await api.createLead({ ...f, tenantId: tenant.id }); onSuccess(); } catch (err) { alert('Erro: ' + err.message); } }} className="space-y-3">
          <input type="text" placeholder="Nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="text" placeholder="Telefone (5514999...)" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail (opcional)" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          {columns.length > 0 && <select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">{columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Criar</button></div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// WHATSAPP
// ============================================================================

function WhatsAppView({ tenant, onRefresh }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const name = `tenant_${tenant.id}`;
  useEffect(() => { check(); const i = setInterval(check, 5000); return () => clearInterval(i); }, []);
  const check = async () => { try { setStatus(await api.getWhatsAppStatus(tenant.id)); } catch (e) { } };

  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-lg mb-4">Conexao WhatsApp</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Status</h3>
          {status?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#25d366] rounded-full animate-pulse"></div><span className="text-[#25d366] font-bold text-sm">Conectado</span></div>
              <button onClick={async () => { await api.disconnectWhatsApp(tenant.id); check(); }} className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Desconectar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div><span className="text-gray-400 text-sm">Desconectado</span></div>
              <input type="text" value={token} onChange={e => setToken(e.target.value)} placeholder="Token..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono" />
              <button onClick={async () => { setLoading(true); try { await api.connectWhatsApp(tenant.id, token); setToken(''); check(); } catch (e) { alert('Erro'); } finally { setLoading(false); } }} disabled={loading || !token.trim()} className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50">{loading ? 'Salvando...' : 'Salvar Token'}</button>
              <button onClick={check} className="w-full py-2 bg-gray-50 text-[#075e54] rounded-lg text-xs font-bold border border-gray-200">Verificar</button>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Instancia</h3>
          <div className="bg-gray-50 rounded-lg p-2.5 flex justify-between items-center mb-2"><code className="text-[#075e54] text-xs font-bold">{name}</code><button onClick={() => { navigator.clipboard.writeText(name); alert('Copiado!'); }} className="text-[10px] text-gray-400">Copiar</button></div>
          <p className="text-[10px] text-gray-400">Use este nome no Evolution Manager</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS (ESPELHA KANBAN)
// ============================================================================

function AnalyticsView({ leads, columns }) {
  const total = leads.length;
  const bySrc = { whatsapp: leads.filter(l => l.source === 'whatsapp').length, manual: leads.filter(l => l.source !== 'whatsapp').length };
  const colors = { blue: '#3b82f6', yellow: '#f59e0b', purple: '#a855f7', green: '#22c55e', red: '#ef4444', zinc: '#71717a' };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Analytics</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: total, icon: Users, color: 'text-blue-600' },
          { label: 'Via WhatsApp', value: bySrc.whatsapp, icon: Smartphone, color: 'text-green-600' },
          { label: 'Manual', value: bySrc.manual, icon: UserPlus, color: 'text-amber-600' },
          { label: 'Etapas', value: columns.length, icon: LayoutGrid, color: 'text-purple-600' }
        ].map((m, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1"><m.icon className={`w-4 h-4 ${m.color}`} /><span className="text-[10px] text-gray-400 font-bold uppercase">{m.label}</span></div>
            <p className="text-2xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {columns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-sm mb-4">Funil de Conversao</h3>
          <div className="space-y-3">
            {columns.map(col => {
              const count = leads.filter(l => l.stage === col.id).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={col.id}>
                  <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-600">{col.name}</span><span className="text-[10px] text-gray-400">{count} leads ({pct.toFixed(0)}%)</span></div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: colors[col.color] || '#71717a' }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Origem dos Leads</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">WhatsApp</span><span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded">{bySrc.whatsapp}</span></div>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-500">Manual</span><span className="text-xs font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded">{bySrc.manual}</span></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Resumo</h3>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-xs text-gray-500">Total leads</span><span className="font-bold text-sm">{total}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Etapas criadas</span><span className="font-bold text-sm">{columns.length}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gray-500">Taxa conversao</span><span className="font-bold text-sm text-green-600">{total > 0 ? ((leads.filter(l => l.stage === columns[columns.length - 1]?.id).length / total) * 100).toFixed(1) : 0}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONHECIMENTO
// ============================================================================

function KnowledgeView({ knowledge, tenant, onRefresh }) {
  const [show, setShow] = useState(false);
  const cats = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Base de Conhecimento</h2>
        <button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Novo</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cats.map(cat => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">{cat}</h3>
            {knowledge.filter(k => k.category === cat).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex justify-between mb-1"><p className="font-bold text-xs">{item.question}</p><button onClick={async () => { if (confirm('Deletar?')) { await api.deleteKnowledge(item.id); onRefresh(); } }}><Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" /></button></div>
                <p className="text-[10px] text-gray-500">{item.answer}</p>
              </div>
            ))}
            {knowledge.filter(k => k.category === cat).length === 0 && <p className="text-[10px] text-gray-300 text-center py-3">Vazio</p>}
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <KnowledgeForm tenant={tenant} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh(); }} />
        </div>
      )}
    </div>
  );
}

function KnowledgeForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ category: 'FAQ', question: '', answer: '' });
  return (
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <h2 className="font-bold mb-4">Novo Conhecimento</h2>
      <form onSubmit={async (e) => { e.preventDefault(); await api.createKnowledge({ ...f, tenantId: tenant.id }); onSuccess(); }} className="space-y-3">
        <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option>Produtos/Servicos</option><option>Precos</option><option>Agendamento</option><option>FAQ</option></select>
        <input type="text" placeholder="Pergunta" value={f.question} onChange={e => setF({ ...f, question: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
        <textarea placeholder="Resposta" value={f.answer} onChange={e => setF({ ...f, answer: e.target.value })} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
        <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Criar</button></div>
      </form>
    </div>
  );
}

// ============================================================================
// EQUIPE
// ============================================================================

function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Equipe</h2>
        <button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Usuario</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase"><tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Funcao</th><th className="p-3 text-right">Acao</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-bold text-xs">{u.name}</td>
                <td className="p-3 text-xs text-gray-400">{u.email}</td>
                <td className="p-3"><span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${u.role === 'super_admin' ? 'bg-purple-50 text-purple-500' : u.role === 'client_admin' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-500'}`}>{u.role === 'super_admin' ? 'Mestre' : u.role === 'client_admin' ? 'Admin' : 'Usuario'}</span></td>
                <td className="p-3 text-right">{u.id !== currentUser.id && <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteUser(u.id); onRefresh(); } }} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold mb-4">Novo Usuario</h2>
            <UserForm tenant={tenant} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh(); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function UserForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'client_user' });
  return (
    <form onSubmit={async (e) => { e.preventDefault(); await api.createUser({ ...f, tenantId: tenant.id }); onSuccess(); }} className="space-y-3">
      <input type="text" placeholder="Nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
      <input type="email" placeholder="E-mail" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
      <input type="password" placeholder="Senha" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
      <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option value="client_user">Usuario</option><option value="client_admin">Admin</option></select>
      <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Criar</button></div>
    </form>
  );
}

// ============================================================================
// CONFIGURACOES
// ============================================================================

function SettingsView({ tenant, onRefresh }) {
  const [prompt, setPrompt] = useState(tenant.ai_prompt || '');
  const [saving, setSaving] = useState(false);
  const save = async () => { setSaving(true); try { await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt: prompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: tenant.active }); alert('Salvo!'); onRefresh(); } catch (e) { alert('Erro'); } finally { setSaving(false); } };

  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-lg mb-4">Configuracoes</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1">Prompt da IA</h3>
        <p className="text-[10px] text-gray-400 mb-3">Define como a IA responde mensagens dos leads.</p>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={6} placeholder="Ex: Voce e assistente da Clinica XYZ..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3" />
        <button onClick={save} disabled={saving} className="px-5 py-2 bg-[#25d366] text-white font-bold rounded-xl text-sm hover:bg-[#128c7e] disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';
import SuperAdminPanel from './pages/SuperAdminPanel';
import {
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send, X, Check,
  Trash2, BarChart3, Brain, Edit2, UserPlus, ArrowLeft, Smartphone, Image,
  Mic, FileText, MapPin, CheckCheck, Paperclip, Users2, Download, Play, Pause,
  MessageCircle, Phone, Clock, Zap, Bot
} from 'lucide-react';

const POLL_INTERVAL = 4000;

const CM = {
  blue:   { bg: 'bg-blue-500',   ring: 'ring-blue-300',   light: 'bg-blue-50',   text: 'text-blue-700'   },
  yellow: { bg: 'bg-amber-500',  ring: 'ring-amber-300',  light: 'bg-amber-50',  text: 'text-amber-700'  },
  purple: { bg: 'bg-purple-500', ring: 'ring-purple-300', light: 'bg-purple-50', text: 'text-purple-700' },
  green:  { bg: 'bg-green-500',  ring: 'ring-green-300',  light: 'bg-green-50',  text: 'text-green-700'  },
  red:    { bg: 'bg-red-500',    ring: 'ring-red-300',    light: 'bg-red-50',    text: 'text-red-700'    },
  zinc:   { bg: 'bg-gray-400',   ring: 'ring-gray-300',   light: 'bg-gray-50',   text: 'text-gray-600'   },
};

function daysAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function MediaBubble({ msg, tenantId }) {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const loadMedia = async () => {
    if (!msg.media_url || msg.media_url === 'undefined' || loading || media) return;
    try {
      let key; try { key = JSON.parse(msg.media_url); } catch (e) { return; }
      setLoading(true);
      const data = await api.fetchMedia(tenantId, key);
      if (data.base64) {
        let src = data.base64;
        if (!src.startsWith('data:')) {
          const mm = { image: 'image/jpeg', audio: 'audio/ogg', video: 'video/mp4', document: 'application/pdf' };
          src = `data:${mm[msg.message_type] || 'application/octet-stream'};base64,${src}`;
        }
        setMedia(src);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  if (msg.message_type === 'image') return (
    <div className="mb-1">
      {media ? (
        <a href={media} download={`img_${msg.id}.jpg`} target="_blank" rel="noopener noreferrer">
          <img src={media} alt="" className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90" />
        </a>
      ) : (
        <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200">
          <Image className="w-5 h-5 text-[#25d366]" />
          <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Ver imagem'}</span>
        </button>
      )}
    </div>
  );
  if (msg.message_type === 'audio') return (
    <div className="mb-1">
      {media ? (
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 min-w-[180px]">
          <button onClick={toggleAudio} className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center flex-shrink-0">
            {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
          </button>
          <div className="flex-1 h-1 bg-gray-300 rounded-full" />
          <audio ref={audioRef} src={media} onEnded={() => setPlaying(false)} />
        </div>
      ) : (
        <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-full px-3 py-2 flex items-center gap-2 hover:bg-gray-200">
          <Mic className="w-4 h-4 text-[#25d366]" />
          <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Ouvir audio'}</span>
        </button>
      )}
    </div>
  );
  if (msg.message_type === 'video') return (
    <div className="mb-1">
      {media
        ? <video src={media} controls className="max-w-[250px] rounded-lg" />
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Play className="w-5 h-5 text-[#25d366]" /><span className="text-xs">{loading ? 'Carregando...' : 'Ver video'}</span></button>}
    </div>
  );
  if (msg.message_type === 'document') return (
    <div className="mb-1">
      {media
        ? <a href={media} download={msg.content || 'doc'} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Download className="w-5 h-5 text-[#25d366]" /><span className="text-xs">Baixar</span></a>
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><FileText className="w-5 h-5 text-gray-400" /><span className="text-xs">{loading ? 'Carregando...' : 'Baixar'}</span></button>}
    </div>
  );
  if (msg.message_type === 'sticker') return <div className="mb-1 text-2xl">{String.fromCodePoint(0x1F3A8)}</div>;
  if (msg.message_type === 'location') return (
    <div className="mb-1 bg-gray-100 rounded-lg p-2 flex items-center gap-2">
      <MapPin className="w-4 h-4 text-red-500" />
      <span className="text-xs">Localizacao</span>
    </div>
  );
  return null;
}

function ProfilePic({ phone, tenantId, name, size = 'w-9 h-9', textSize = 'text-[10px]', isGroup = false }) {
  const [pic, setPic] = useState(null);
  const [tried, setTried] = useState(false);
  useEffect(() => {
    if (!phone || tried || isGroup) return;
    setTried(true);
    api.fetchProfilePic(phone, tenantId).then(d => {
      const url = d?.profilePictureUrl || d?.wpiUrl || d?.picture || d?.url || null;
      if (url) setPic(url);
    }).catch(() => {});
  }, [phone, tenantId, tried, isGroup]);
  if (isGroup) return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#128c7e]/10 flex-shrink-0`}>
      <Users2 className="w-4 h-4 text-[#128c7e]" />
    </div>
  );
  if (pic) return <img src={pic} alt="" className={`${size} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#dfe5e7] flex-shrink-0`}>
      <span className={`${textSize} font-bold text-[#075e54]`}>{(name || phone || '?').substring(0, 2).toUpperCase()}</span>
    </div>
  );
}

export default function BorsatoCRM() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const doLogout = useCallback(() => {
    api.logout();
    localStorage.clear();
    setCurrentUser(null);
    setCurrentView('login');
    setCurrentTenant(null);
    setTenants([]);
  }, []);

  useEffect(() => { api.onAuthError(doLogout); }, [doLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const ud = localStorage.getItem('userData');
    if (token && ud) {
      try {
        const u = JSON.parse(ud);
        setCurrentUser(u);
        if (u.role === 'super_admin') { setCurrentView('superAdmin'); loadTenants(); }
        else { setCurrentView('clientDashboard'); loadTenantData(u.tenantId); }
      } catch (e) { localStorage.clear(); }
    }
  }, []);

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
      if (user.role === 'super_admin') { setCurrentView('superAdmin'); await loadTenants(); }
      else { setCurrentView('clientDashboard'); await loadTenantData(user.tenantId); }
    } catch (e) { setError('E-mail ou senha incorretos'); }
    finally { setLoading(false); }
  };

  const handleEnterTenant = useCallback(async (tid) => {
    await loadTenantData(tid);
    setCurrentView('clientDashboard');
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
    <ClientDashboard
      user={currentUser}
      tenant={currentTenant}
      onLogout={doLogout}
      onRefresh={refreshData}
      onBackToSuperAdmin={currentUser?.role === 'super_admin' ? () => {
        setCurrentTenant(null);
        loadTenants();
        setCurrentView('superAdmin');
      } : null}
    />
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

  useEffect(() => { localStorage.setItem(`activeTab_${tenant.id}`, activeTab); }, [activeTab, tenant.id]);
  useEffect(() => { loadCols(); }, [tenant.id]);

  const loadCols = async () => {
    try { setColumns(await api.getKanbanColumns(tenant.id)); } catch (e) {}
  };
  const refreshAll = useCallback(async () => {
    await onRefresh();
    await loadCols();
  }, [onRefresh, tenant.id]);
  const openChatByPhone = useCallback((phone) => {
    setRequestedPhone(phone);
    setActiveTab('chat');
  }, []);

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
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-xs">
            {tenant.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="font-bold text-sm">{tenant.name}</h1>
            <p className="text-[10px] text-white/50">{user.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onBackToSuperAdmin && (
            <button onClick={onBackToSuperAdmin} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> MESTRE
            </button>
          )}
          <button onClick={onLogout} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold">Sair</button>
        </div>
      </div>
      <div className="bg-[#075e54]/90 px-6 flex gap-0.5 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3 flex items-center gap-1.5 text-[11px] font-bold border-b-2 whitespace-nowrap ${
              activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />{tab.label}
          </button>
        ))}
      </div>
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        {activeTab === 'kanban'    && <KanbanView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} onOpenChat={openChatByPhone} />}
        {activeTab === 'chat'      && <ChatView tenant={tenant} columns={columns} onRefresh={refreshAll} requestedPhone={requestedPhone} onPhoneHandled={() => setRequestedPhone(null)} />}
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

function KanbanView({ leads, columns, tenant, onRefresh, onOpenChat }) {
  const [dragged, setDragged] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', color: 'blue' });
  const [filter, setFilter] = useState('');

  const getLeadsForColumn = (col, colIdx) => {
    const f = filter
      ? leads.filter(l => (l.name || '').toLowerCase().includes(filter.toLowerCase()) || (l.phone || '').includes(filter))
      : leads;
    return f.filter(l => l.stage === col.id || (colIdx === 0 && (l.stage === 'novo' || l.stage === 'new' || !l.stage)));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg">Pipeline</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar leads..." className="bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs w-48" />
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50">
          <Plus className="w-3 h-3" /> Etapa
        </button>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-bold text-sm mb-1">Nenhuma etapa criada</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 items-start">
          {columns.map((col, colIdx) => {
            const colLeads = getLeadsForColumn(col, colIdx);
            const c = CM[col.color] || CM.zinc;
            return (
              <div
                key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={async () => {
                  if (dragged) { await api.updateLead(dragged.id, { stage: col.id }); setDragged(null); onRefresh(); }
                  setDragOver(null);
                }}
                className={`w-72 flex-shrink-0 rounded-xl border bg-white shadow-sm transition-all ${dragOver === col.id ? 'border-2 shadow-lg' : 'border-gray-200'}`}
              >
                <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                      <span className="font-bold text-[11px] uppercase tracking-wide text-gray-600">{col.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.light} ${c.text}`}>{colLeads.length}</span>
                    </div>
                    <button onClick={async () => { if (confirm('Excluir etapa?')) { await api.deleteKanbanColumn(col.id); onRefresh(); } }}>
                      <X className="w-3 h-3 text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="p-2 space-y-2 min-h-[100px]">
                  {colLeads.map(l => (
                    <KanbanCard
                      key={l.id}
                      lead={l}
                      col={col}
                      columns={columns}
                      onDragStart={() => setDragged(l)}
                      onDragEnd={() => setDragged(null)}
                      onOpenChat={onOpenChat}
                      onStageChange={async (s) => { await api.updateLead(l.id, { stage: s }); onRefresh(); }}
                      onRefresh={onRefresh}
                    />
                  ))}
                  {colLeads.length === 0 && (
                    <div className="py-6 text-center">
                      <p className="text-[10px] text-gray-300">Arraste leads aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold mb-4">Nova Etapa</h2>
            <form
              onSubmit={async e => {
                e.preventDefault();
                await api.createKanbanColumn({ tenantId: tenant.id, name: newCol.name, color: newCol.color, position: columns.length });
                setNewCol({ name: '', color: 'blue' });
                setShowModal(false);
                onRefresh();
              }}
              className="space-y-3"
            >
              <input
                placeholder="Nome da etapa"
                value={newCol.name}
                onChange={e => setNewCol({ ...newCol, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
                required
              />
              <div className="flex gap-2 p-2 bg-gray-50 rounded-xl justify-center">
                {Object.keys(CM).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCol({ ...newCol, color: c })}
                    className={`w-7 h-7 rounded-full ${CM[c].bg} ${newCol.color === c ? 'ring-2 ring-gray-800 scale-110' : 'opacity-40'}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KanbanCard({ lead, col, columns, onDragStart, onDragEnd, onOpenChat, onStageChange, onRefresh }) {
  const [hover, setHover] = useState(false);
  const days = daysAgo(lead.updated_at);
  const c = CM[col.color] || CM.zinc;

  const renderSourceBadge = () => {
    if (lead.source === 'whatsapp') {
      return (
        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-700 bg-green-100 rounded px-1.5 py-0.5">
          <Zap className="w-2.5 h-2.5" /> WhatsApp
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
        <Plus className="w-2.5 h-2.5" /> Manual
      </span>
    );
  };

  const renderDaysBadge = () => {
    if (days > 7) return <span className="text-[9px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {days}d</span>;
    if (days > 2) return <span className="text-[9px] font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {days}d</span>;
    if (days > 0) return <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {days}d</span>;
    return <span className="text-[9px] text-[#25d366] font-bold">Hoje</span>;
  };

  const otherCols = columns.filter(c2 => c2.id !== col.id);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`bg-white border rounded-lg cursor-grab select-none transition-all ${hover ? 'border-gray-300 shadow-md -translate-y-0.5' : 'border-gray-100 shadow-sm'}`}
    >
      <div className={`h-0.5 rounded-t-lg ${c.bg} opacity-60`} />
      <div className="p-2.5">
        <div className="flex justify-between items-center mb-1.5">
          {renderSourceBadge()}
          {renderDaysBadge()}
        </div>
        <p className="font-bold text-[13px] text-gray-800 leading-tight mb-0.5 truncate">{lead.name || '\u2014'}</p>
        {lead.phone && (
          <p className="text-[10px] text-gray-400 font-mono mb-2 flex items-center gap-1">
            <Phone className="w-2.5 h-2.5" />{lead.phone}
          </p>
        )}
        {lead.notes && <p className="text-[10px] text-gray-500 line-clamp-1 mb-2 italic">{lead.notes}</p>}
        {hover && (
          <div className="flex gap-1 mt-1 pt-2 border-t border-gray-100">
            {lead.phone && (
              <button
                onClick={() => onOpenChat(lead.phone)}
                className="flex-1 flex items-center justify-center gap-1 py-1 bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#075e54] rounded text-[10px] font-bold"
              >
                <MessageCircle className="w-3 h-3" /> Conversar
              </button>
            )}
            <button
              onClick={async () => { if (confirm('Deletar?')) { await api.deleteLead(lead.id); onRefresh(); } }}
              className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-400 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
        {hover && otherCols.length > 0 && (
          <div className="mt-1.5 flex gap-1 flex-wrap">
            {otherCols.map(c2 => (
              <button
                key={c2.id}
                onClick={() => onStageChange(c2.id)}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${(CM[c2.color] || CM.zinc).light} ${(CM[c2.color] || CM.zinc).text}`}
              >
                {'\u2192'} {c2.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({ tenant, columns, onRefresh, requestedPhone, onPhoneHandled }) {
  const [chats, setChats] = useState([]);
  const [cur, setCur] = useState(() => {
    const s = localStorage.getItem(`currentChat_${tenant.id}`);
    return s ? JSON.parse(s) : null;
  });
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState('all');
  const [file, setFile] = useState(null);
  const curRef = useRef(cur);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => {
    if (cur) localStorage.setItem(`currentChat_${tenant.id}`, JSON.stringify(cur));
    else localStorage.removeItem(`currentChat_${tenant.id}`);
  }, [cur, tenant.id]);
  useEffect(() => { load(); const i = setInterval(load, POLL_INTERVAL); return () => clearInterval(i); }, [tenant.id]);
  useEffect(() => {
    if (cur) {
      loadMsgs(cur.id);
      loadLead(cur);
      const i = setInterval(() => loadMsgs(cur.id), POLL_INTERVAL);
      return () => clearInterval(i);
    }
  }, [cur?.id]);
  useEffect(() => {
    if (!requestedPhone || chats.length === 0) return;
    const clean = requestedPhone.replace(/\D/g, '');
    const match = chats.find(c =>
      (c.contact_phone || '').replace(/\D/g, '') === clean ||
      (c.remote_jid || '').replace(/[^0-9]/g, '').includes(clean)
    );
    if (match) { selectChat(match); onPhoneHandled?.(); }
  }, [requestedPhone, chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const load = async () => {
    try {
      const chatList = await api.getChats(tenant.id);
      setChats(chatList);
      const ac = curRef.current;
      if (ac) { const upd = chatList.find(c => c.id === ac.id); if (upd) setCur(upd); }
    } catch (e) {}
  };
  const loadMsgs = async (id) => { try { setMsgs(await api.getChatMessages(id, 100, 0)); } catch (e) {} };
  const loadLead = async (c) => {
    if (isGrp(c)) { setLead(null); return; }
    const ph = c.contact_phone || c.remote_jid?.split('@')[0];
    if (!ph) { setLead(null); return; }
    try { setLead(await api.getLeadByPhone(ph, tenant.id)); } catch (e) { setLead(null); }
  };

  const isGrp = c => Number(c.is_group) === 1 || c.is_group === true;
  const chatDisplayName = c => {
    if (c.contact_name) return c.contact_name;
    if (!isGrp(c)) return c.contact_phone || c.remote_jid || '';
    return c.remote_jid?.replace('@g.us', '') || 'Grupo';
  };
  const selectChat = c => { setCur(c); setSearch(''); };

  const send = async () => {
    if (!msg.trim() || !cur) return;
    const ph = cur.remote_jid && (isGrp(cur) || cur.remote_jid.includes('@lid'))
      ? cur.remote_jid
      : cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try { await api.sendWhatsAppMessage(ph, msg, tenant.id, cur.id); setMsg(''); await loadMsgs(cur.id); await load(); }
    catch (e) { alert(e.message || 'Erro ao enviar'); } finally { setSending(false); }
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    setFile(f);
  };

  const sendFile = async () => {
    if (!file || !cur) return;
    const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const mt = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
        await api.sendWhatsAppMedia({ number: ph, base64, fileName: file.name, mediaType: mt, caption: '', tenantId: tenant.id, chatId: cur.id });
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
        await loadMsgs(cur.id);
        await load();
        setSending(false);
      };
      reader.readAsDataURL(file);
    } catch (e) { alert('Erro: ' + e.message); setSending(false); }
  };

  const deleteChat = async id => {
    if (!confirm('Apagar conversa?')) return;
    try {
      await api.deleteChat(id);
      if (cur?.id === id) { setCur(null); setLead(null); setMsgs([]); }
      await load();
    } catch { alert('Erro'); }
  };

  const fmt = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    const n = new Date();
    if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const filtered = chats.filter(c => {
    if (filter === 'individual' && isGrp(c)) return false;
    if (filter === 'group' && !isGrp(c)) return false;
    if (!search) return true;
    return chatDisplayName(c).toLowerCase().includes(search.toLowerCase());
  });

  const getStatus = s => {
    if (s === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (s === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  const tenantAIOn = Number(tenant.ai_enabled) === 1 || tenant.ai_enabled === true;
  const leadAIOn = lead ? (Number(lead.ai_enabled) === 1 || lead.ai_enabled === true) : false;

  const toggleLeadAI = async () => {
    if (!lead) return;
    const newVal = !leadAIOn;
    try { await api.setLeadAI(lead.id, newVal); setLead({ ...lead, ai_enabled: newVal ? 1 : 0 }); }
    catch { alert('Erro ao alterar IA'); }
  };

  const renderStageButtons = () => {
    if (!cur || isGrp(cur) || columns.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
        {columns.map(col => {
          const cc = CM[col.color] || CM.zinc;
          const isActive = lead?.stage === col.id;
          const handleClick = async () => {
            if (lead) {
              await api.updateLead(lead.id, { stage: col.id });
              setLead({ ...lead, stage: col.id });
            } else {
              const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
              if (ph) {
                try {
                  const nl = await api.createLead({ tenantId: tenant.id, name: chatDisplayName(cur), phone: ph, source: 'whatsapp', stage: col.id });
                  setLead(nl);
                } catch (err) { console.error(err); }
              }
            }
            onRefresh();
          };
          return (
            <button
              key={col.id}
              onClick={handleClick}
              className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${isActive ? `${cc.bg} text-white shadow-sm` : `${cc.light} ${cc.text} hover:opacity-80`}`}
            >
              {col.name}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs" />
          </div>
          <div className="flex gap-1">
            {[{ id: 'all', l: 'Todos' }, { id: 'individual', l: 'Contatos' }, { id: 'group', l: 'Grupos' }].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 py-1 text-[9px] font-bold rounded ${filter === f.id ? 'bg-[#25d366] text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <div
              key={c.id}
              className={`flex items-center gap-2.5 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${cur?.id === c.id ? 'bg-[#f0f2f5]' : ''}`}
            >
              <div onClick={() => selectChat(c)} className="flex items-center gap-2.5 flex-1 min-w-0">
                <ProfilePic phone={c.contact_phone || c.remote_jid} tenantId={tenant.id} name={chatDisplayName(c)} isGroup={isGrp(c)} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-bold text-xs truncate">
                      {chatDisplayName(c)}
                      {isGrp(c) && <span className="ml-1 text-[8px] bg-gray-100 text-gray-400 px-1 rounded">GRUPO</span>}
                    </p>
                    <span className="text-[9px] text-gray-400">{fmt(c.last_message_time)}</span>
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <p className="text-[10px] text-gray-400 truncate">{c.last_message}</p>
                    {Number(c.unread_count) > 0 && (
                      <span className="ml-1 bg-[#25d366] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {Number(c.unread_count) > 9 ? '9+' : c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteChat(c.id); }} className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {cur ? (
          <>
            <div className="bg-[#f0f2f5] px-4 py-2.5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <ProfilePic phone={cur.contact_phone || cur.remote_jid} tenantId={tenant.id} name={chatDisplayName(cur)} size="w-8 h-8" isGroup={isGrp(cur)} />
                  <div>
                    <p className="font-bold text-sm">{chatDisplayName(cur)}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{cur.contact_phone}</p>
                  </div>
                  {lead && (
                    <button onClick={() => setShowEdit(true)} className="ml-2 p-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-100">
                      <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                  {!isGrp(cur) && lead && tenantAIOn && (
                    <button
                      onClick={toggleLeadAI}
                      title={leadAIOn ? 'IA ativa - clique para pausar' : 'IA pausada - clique para ativar'}
                      className={`ml-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${leadAIOn ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                      <Bot className={`w-3 h-3 ${leadAIOn ? '' : 'opacity-40'}`} />
                      {leadAIOn ? 'IA ativa' : 'IA pausada'}
                    </button>
                  )}
                  {!isGrp(cur) && lead && !tenantAIOn && (
                    <span className="ml-1 flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-[9px] font-bold">
                      <Bot className="w-3 h-3 opacity-40" /> IA desligada
                    </span>
                  )}
                </div>
                {renderStageButtons()}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ backgroundColor: '#eae6df' }}>
              {msgs.map(m => {
                const fromMe = Number(m.is_from_me) === 1 || m.is_from_me === true;
                const hasMedia = m.media_url && m.message_type !== 'text';
                const isPlaceholder = ['[Imagem]','[Audio]','[Video]','[Documento]','[Sticker]','[Localizacao]','[Contato]','[Mensagem]','[Reacao]'].includes(m.content);
                const isAI = m.sender_name === 'IA';
                return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm ${fromMe ? (isAI ? 'bg-purple-50 border border-purple-100' : 'bg-[#d9fdd3]') : 'bg-white'}`}>
                      {m.sender_name && (
                        <p className={`text-[10px] font-bold mb-0.5 flex items-center gap-1 ${isAI ? 'text-purple-600' : fromMe ? 'text-[#075e54]' : 'text-[#6b7280]'}`}>
                          {isAI && <Bot className="w-2.5 h-2.5" />}{m.sender_name}
                        </p>
                      )}
                      {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} />}
                      {m.content && !isPlaceholder && <p className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{m.content}</p>}
                      {m.content && isPlaceholder && !hasMedia && <p className="text-[13px] text-gray-500 italic">{m.content}</p>}
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        <span className="text-[9px] text-gray-500">{fmt(m.timestamp)}</span>
                        {fromMe && getStatus(m.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {file && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-red-500 font-bold">Cancelar</button>
                  <button onClick={sendFile} disabled={sending} className="px-3 py-1 bg-[#25d366] text-white text-xs font-bold rounded-lg disabled:opacity-50">Enviar</button>
                </div>
              </div>
            )}

            <div className="bg-[#f0f2f5] px-3 py-2.5 flex items-center gap-2 border-t border-gray-200">
              <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
              <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-gray-200 rounded-full">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !sending) { e.preventDefault(); send(); } }}
                disabled={sending}
                placeholder="Mensagem..."
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-[#25d366]"
              />
              <button onClick={send} disabled={sending || !msg.trim()} className="p-2 bg-[#25d366] text-white rounded-full disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-400">Selecione uma conversa</p>
            </div>
          </div>
        )}
      </div>

      {showEdit && lead && (
        <EditLeadModal
          lead={lead}
          columns={columns}
          onClose={() => setShowEdit(false)}
          onSave={async data => { await api.updateLead(lead.id, data); setLead({ ...lead, ...data }); setShowEdit(false); onRefresh(); }}
        />
      )}
    </div>
  );
}

function EditLeadModal({ lead, columns, onClose, onSave }) {
  const [f, setF] = useState({ name: lead.name || '', phone: lead.phone || '', email: lead.email || '', stage: lead.stage || '', notes: lead.notes || '' });
  const [custom, setCustom] = useState(() => { try { return JSON.parse(lead.custom_data || '{}'); } catch { return {}; } });
  const [nf, setNf] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Editar Lead</h2>
        <div className="space-y-3">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Telefone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          {columns.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Etapa</label>
              <select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">
                {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Observacoes</label><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Campos Personalizados</p>
            {Object.entries(custom).map(([k, v]) => (
              <div key={k} className="flex gap-2 mb-2 items-center">
                <span className="text-xs text-gray-500 w-28 truncate">{k}</span>
                <input value={v} onChange={e => setCustom({ ...custom, [k]: e.target.value })} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs" />
                <button onClick={() => { const c = { ...custom }; delete c[k]; setCustom(c); }}><X className="w-3 h-3 text-red-400" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={nf} onChange={e => setNf(e.target.value)} placeholder="Novo campo..." className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs" onKeyDown={e => { if (e.key === 'Enter' && nf.trim()) { setCustom({ ...custom, [nf.trim()]: '' }); setNf(''); } }} />
              <button onClick={() => { if (nf.trim()) { setCustom({ ...custom, [nf.trim()]: '' }); setNf(''); } }} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button>
            <button onClick={() => onSave({ ...f, customData: custom })} className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsView({ leads, columns, tenant, onRefresh, onOpenChat }) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [stageFilter, setStageFilter] = useState('all');

  const filtered = leads.filter(l => {
    if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
    return (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search);
  });

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm shadow-sm w-56" />
          </div>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs shadow-sm">
            <option value="all">Todas as etapas</option>
            {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg">
          <Plus className="w-3 h-3" /> Lead
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Telefone</th>
              <th className="p-3">Etapa</th>
              <th className="p-3">Origem</th>
              <th className="p-3">Tempo</th>
              <th className="p-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(l => {
              const colInfo = columns.find(c => c.id === l.stage);
              const c = CM[colInfo?.color] || CM.zinc;
              const days = daysAgo(l.updated_at);
              return (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-bold text-xs">{l.name}</td>
                  <td className="p-3 text-xs text-gray-400 font-mono">{l.phone}</td>
                  <td className="p-3">
                    {colInfo
                      ? <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${c.light} ${c.text}`}>{colInfo.name}</span>
                      : <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded">{l.stage || '-'}</span>}
                  </td>
                  <td className="p-3">
                    {l.source === 'whatsapp'
                      ? <span className="text-[9px] font-bold text-green-700 bg-green-50 rounded px-1.5 py-0.5 flex items-center gap-0.5 w-fit"><Zap className="w-2.5 h-2.5" /> WhatsApp</span>
                      : <span className="text-[9px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{l.source || 'manual'}</span>}
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] ${days > 7 ? 'text-red-600 font-bold' : days > 2 ? 'text-amber-600' : 'text-gray-400'}`}>{days}d</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end items-center">
                      {l.phone && (
                        <button onClick={() => onOpenChat(l.phone)} className="flex items-center gap-1 px-2 py-1 bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#075e54] rounded text-[9px] font-bold">
                          <MessageCircle className="w-3 h-3" /> Conversar
                        </button>
                      )}
                      <button onClick={() => setEditLead(l)} className="text-blue-400 p-1"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteLead(l.id); onRefresh(); } }} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-xs">Nenhum lead</div>}
      </div>
      {showCreate && <LeadCreateModal tenant={tenant} columns={columns} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); onRefresh(); }} />}
      {editLead && <EditLeadModal lead={editLead} columns={columns} onClose={() => setEditLead(null)} onSave={async data => { await api.updateLead(editLead.id, data); setEditLead(null); onRefresh(); }} />}
    </div>
  );
}

function LeadCreateModal({ tenant, columns, onClose, onSuccess }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', stage: columns[0]?.id || '' });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">Novo Lead</h2>
        <form onSubmit={async e => { e.preventDefault(); await api.createLead({ ...f, tenantId: tenant.id }); onSuccess(); }} className="space-y-3">
          <input placeholder="Nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input placeholder="Telefone" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          {columns.length > 0 && (
            <select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">
              {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Criar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WhatsAppView({ tenant }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [ld, setLd] = useState(false);
  const nm = `tenant_${tenant.id}`;
  useEffect(() => { ck(); const i = setInterval(ck, 5000); return () => clearInterval(i); }, []);
  const ck = async () => { try { setStatus(await api.getWhatsAppStatus(tenant.id)); } catch {} };
  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-lg mb-4">WhatsApp</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Status</h3>
          {status?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-[#25d366] rounded-full animate-pulse" />
                <span className="text-[#25d366] font-bold text-sm">Conectado</span>
              </div>
              <button onClick={async () => { await api.disconnectWhatsApp(tenant.id); ck(); }} className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Desconectar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                <span className="text-gray-400 text-sm">Desconectado</span>
              </div>
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="Token..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono" />
              <button
                onClick={async () => { setLd(true); try { await api.connectWhatsApp(tenant.id, token); setToken(''); ck(); } catch { alert('Erro'); } finally { setLd(false); } }}
                disabled={ld || !token.trim()}
                className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {ld ? 'Salvando...' : 'Salvar'}
              </button>
              <button onClick={ck} className="w-full py-2 bg-gray-50 text-[#075e54] rounded-lg text-xs font-bold border border-gray-200">Verificar</button>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Instancia</h3>
          <div className="bg-gray-50 rounded-lg p-2.5 flex justify-between items-center">
            <code className="text-[#075e54] text-xs font-bold">{nm}</code>
            <button onClick={() => navigator.clipboard.writeText(nm)} className="text-[10px] text-gray-400">Copiar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ leads, columns }) {
  const t = leads.length;
  const bySource = { w: leads.filter(l => l.source === 'whatsapp').length };
  const byStage = columns.map(col => ({ ...col, count: leads.filter(l => l.stage === col.id).length }));
  const lostCount = leads.filter(l => { const col = columns.find(c => c.id === l.stage); return col?.color === 'red'; }).length;
  const wonCount = leads.filter(l => { const col = columns.find(c => c.id === l.stage); return col?.color === 'green'; }).length;
  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Analytics</h2>
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { l: 'Total', v: t, color: 'text-blue-600', bg: 'bg-blue-50' },
          { l: 'WhatsApp', v: bySource.w, color: 'text-green-600', bg: 'bg-green-50' },
          { l: 'Clientes', v: wonCount, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { l: 'Perdidos', v: lostCount, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((m, i) => (
          <div key={i} className={`${m.bg} border border-gray-100 rounded-xl p-4 shadow-sm`}>
            <p className={`text-[10px] font-bold uppercase mb-1 ${m.color}`}>{m.l}</p>
            <p className={`text-3xl font-black ${m.color}`}>{m.v}</p>
          </div>
        ))}
      </div>
      {columns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Por Etapa</h3>
          <div className="space-y-3">
            {byStage.map(col => {
              const p = t > 0 ? (col.count / t) * 100 : 0;
              const c = CM[col.color] || CM.zinc;
              return (
                <div key={col.id}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.bg}`} />
                      <span className="text-xs font-bold text-gray-600">{col.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">{col.count} ({p.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.bg}`} style={{ width: `${Math.max(p, 1)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= KNOWLEDGE =================
// O campo 'question' no banco e usado internamente como titulo/categoria da entrada.
// Na UI exibimos apenas o conteudo (answer) — a IA avalia qual parte usar com base na mensagem recebida.

function KnowledgeView({ knowledge, tenant, onRefresh }) {
  const [show, setShow] = useState(false);
  const cats = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Conhecimento</h2>
        <button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg">
          <Plus className="w-3 h-3" /> Novo
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {cats.map(cat => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">{cat}</h3>
            {knowledge.filter(k => k.category === cat).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2 flex justify-between items-start gap-2">
                <p className="text-xs text-gray-700 leading-relaxed flex-1">{item.answer}</p>
                <button
                  onClick={async () => { if (confirm('Deletar?')) { await api.deleteKnowledge(item.id); onRefresh(); } }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" />
                </button>
              </div>
            ))}
            {knowledge.filter(k => k.category === cat).length === 0 && (
              <p className="text-[10px] text-gray-300 text-center py-3">Vazio</p>
            )}
          </div>
        ))}
      </div>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold mb-1">Novo conteudo</h2>
            <p className="text-[11px] text-gray-400 mb-4">Escreva qualquer informacao sobre o seu negocio. A IA decide o que usar em cada conversa.</p>
            <KnowledgeForm tenant={tenant} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh(); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function KnowledgeForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ category: 'FAQ', content: '' });
  return (
    <form
      onSubmit={async e => {
        e.preventDefault();
        // question armazena a categoria como identificador interno; answer e o conteudo real
        await api.createKnowledge({ category: f.category, question: f.category, answer: f.content, tenantId: tenant.id });
        onSuccess();
      }}
      className="space-y-3"
    >
      <select
        value={f.category}
        onChange={e => setF({ ...f, category: e.target.value })}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
      >
        <option>Produtos/Servicos</option>
        <option>Precos</option>
        <option>Agendamento</option>
        <option>FAQ</option>
      </select>
      <textarea
        placeholder="Ex: Atendemos de segunda a sexta das 8h as 18h. Agendamentos pelo WhatsApp ou pelo site..."
        value={f.content}
        onChange={e => setF({ ...f, content: e.target.value })}
        rows={5}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
        required
      />
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button>
        <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button>
      </div>
    </form>
  );
}

function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Equipe</h2>
        <button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg">
          <Plus className="w-3 h-3" /> Usuario
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Funcao</th>
              <th className="p-3">Permissoes</th>
              <th className="p-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const perms = (() => { try { return JSON.parse(u.permissions || '[]'); } catch { return []; } })();
              return (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-xs">{u.name}</td>
                  <td className="p-3 text-xs text-gray-400">{u.email}</td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                      u.role === 'super_admin' ? 'bg-purple-50 text-purple-500' :
                      u.role === 'client_admin' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {u.role === 'super_admin' ? 'Mestre' : u.role === 'client_admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="p-3 text-[9px] text-gray-400">{u.role === 'client_user' ? perms.join(', ') || 'Nenhuma' : ''}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {u.role === 'client_user' && (
                        <button onClick={() => setEditing(u)} className="text-blue-400"><Edit2 className="w-3.5 h-3.5" /></button>
                      )}
                      {u.id !== currentUser.id && (
                        <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteUser(u.id); onRefresh(); } }} className="text-gray-300 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(show || editing) && (
        <UserModal
          user={editing}
          tenant={tenant}
          onClose={() => { setShow(false); setEditing(null); }}
          onSuccess={() => { setShow(false); setEditing(null); onRefresh(); }}
        />
      )}
    </div>
  );
}

function UserModal({ user, tenant, onClose, onSuccess }) {
  const allT = ['kanban', 'chat', 'leads', 'whatsapp', 'analytics', 'knowledge', 'team', 'settings'];
  const [f, setF] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'client_user',
    permissions: (() => { try { return JSON.parse(user?.permissions || '[]'); } catch { return []; } })(),
  });
  const tp = p => setF({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p] });
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">{user ? 'Editar' : 'Novo'} Usuario</h2>
        <form
          onSubmit={async e => {
            e.preventDefault();
            try {
              if (user) {
                await api.updateUser(user.id, { name: f.name, email: f.email, role: f.role, permissions: f.permissions, ...(f.password ? { password: f.password } : {}) });
              } else {
                await api.createUser({ ...f, tenantId: tenant.id });
              }
              onSuccess();
            } catch (err) { alert('Erro: ' + err.message); }
          }}
          className="space-y-3"
        >
          <input placeholder="Nome" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="password" placeholder={user ? 'Nova senha (vazio=manter)' : 'Senha'} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm p-2.5" required={!user} />
          <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">
            <option value="client_user">Usuario</option>
            <option value="client_admin">Admin</option>
          </select>
          {f.role === 'client_user' && (
            <div className="border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Permissoes</p>
              <div className="grid grid-cols-2 gap-1.5">
                {allT.map(tab => (
                  <label key={tab} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer ${f.permissions.includes(tab) ? 'bg-[#25d366]/10 text-[#075e54] font-bold' : 'bg-gray-50 text-gray-400'}`}>
                    <input type="checkbox" checked={f.permissions.includes(tab)} onChange={() => tp(tab)} className="w-3 h-3" />{tab}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsView({ tenant, onRefresh }) {
  const [prompt, setPrompt] = useState(tenant.ai_prompt || '');
  const [aiEnabled, setAiEnabled] = useState(Number(tenant.ai_enabled) === 1 || tenant.ai_enabled === true);
  const [saving, setSaving] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);

  const savePrompt = async () => {
    setSaving(true);
    try {
      await api.updateTenant(tenant.id, {
        name: tenant.name,
        plan: tenant.plan,
        monthlyValue: tenant.monthly_value,
        aiPrompt: prompt,
        customFields: JSON.parse(tenant.custom_fields || '[]'),
        active: tenant.active,
      });
      alert('Salvo!');
      onRefresh();
    } catch { alert('Erro'); }
    finally { setSaving(false); }
  };

  const toggleAI = async () => {
    setTogglingAI(true);
    try { await api.setTenantAI(tenant.id, !aiEnabled); setAiEnabled(!aiEnabled); onRefresh(); }
    catch { alert('Erro ao alterar IA'); }
    finally { setTogglingAI(false); }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="font-bold text-lg">Configuracoes</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm">Assistente IA</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${aiEnabled ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                {aiEnabled ? 'ATIVO' : 'DESLIGADO'}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Quando ativo, a IA responde automaticamente mensagens recebidas de leads usando a base de conhecimento.
              Voce pode pausar individualmente por contato na tela de Conversas.
            </p>
          </div>
          <button
            onClick={toggleAI}
            disabled={togglingAI}
            className={`flex-shrink-0 w-12 h-6 rounded-full transition-all relative ${aiEnabled ? 'bg-purple-500' : 'bg-gray-300'} disabled:opacity-50`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiEnabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
        {aiEnabled && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
            <Bot className="w-3 h-3 flex-shrink-0" />
            IA ativa - respondendo automaticamente a novos leads via WhatsApp
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
          <Brain className="w-4 h-4 text-gray-400" /> Personalidade da IA
        </h3>
        <p className="text-[10px] text-gray-400 mb-3">Defina como a IA deve se apresentar. Se vazio, usa atendimento padrao cordial.</p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={6}
          placeholder={"Exemplo:\nVoce e a assistente da Clinica Exemplo.\nSe apresente como Ana e seja sempre educada.\nNao marque consultas sem confirmar disponibilidade."}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3 font-mono text-xs leading-relaxed"
        />
        <button onClick={savePrompt} disabled={saving} className="px-5 py-2 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar prompt'}
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Como funciona</p>
        <div className="space-y-1 text-[11px] text-gray-500">
          <p>1. IA ligada aqui responde todos os leads automaticamente</p>
          <p>2. Base de Conhecimento e a fonte das respostas</p>
          <p>3. Em Conversas: botao IA ativa/pausada por contato individual</p>
          <p>4. Mensagens da IA aparecem com badge roxo na conversa</p>
        </div>
      </div>
    </div>
  );
}

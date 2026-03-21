import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';
import SuperAdminPanel from './pages/SuperAdminPanel';
import {
  MessageSquare,
  LayoutGrid,
  Users,
  Settings,
  Plus,
  Search,
  Send,
  X,
  Check,
  Trash2,
  TrendingUp,
  BarChart3,
  Brain,
  Edit2,
  UserPlus,
  ArrowLeft,
  Smartphone,
  Image,
  Mic,
  FileText,
  MapPin,
  CheckCheck,
  Paperclip,
  Users2,
  Download,
  Play,
  Pause
} from 'lucide-react';

// ============================================================================
// MEDIA MESSAGE COMPONENT
// ============================================================================
function MediaBubble({ msg, tenantId }) {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const loadMedia = async () => {
    if (!msg.media_url || msg.media_url === 'undefined' || loading || media) return;

    try {
      let key;
      try {
        key = JSON.parse(msg.media_url);
      } catch (e) {
        return;
      }

      setLoading(true);
      const data = await api.fetchMedia(tenantId, key);

      if (data.base64) {
        let src = data.base64;
        if (!src.startsWith('data:')) {
          const mimeMap = {
            image: 'image/jpeg',
            audio: 'audio/ogg',
            video: 'video/mp4',
            document: 'application/pdf'
          };
          src = `data:${mimeMap[msg.message_type] || 'application/octet-stream'};base64,${src}`;
        }
        setMedia(src);
      }
    } catch (e) {
      console.log('Media fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  if (msg.message_type === 'image') {
    return (
      <div className="mb-1">
        {media ? (
          <a href={media} download={`img_${msg.id}.jpg`} target="_blank" rel="noopener noreferrer">
            <img src={media} alt="Imagem" className="max-w-[250px] rounded-lg cursor-pointer hover:opacity-90" />
          </a>
        ) : (
          <button
            onClick={loadMedia}
            disabled={loading}
            className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200 transition-all"
          >
            <Image className="w-5 h-5 text-[#25d366]" />
            <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Ver imagem'}</span>
          </button>
        )}
      </div>
    );
  }

  if (msg.message_type === 'audio') {
    return (
      <div className="mb-1">
        {media ? (
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 min-w-[180px]">
            <button
              onClick={toggleAudio}
              className="w-8 h-8 bg-[#25d366] rounded-full flex items-center justify-center flex-shrink-0"
            >
              {playing ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
            </button>
            <div className="flex-1 h-1 bg-gray-300 rounded-full">
              <div className="h-1 bg-[#25d366] rounded-full w-0" />
            </div>
            <audio ref={audioRef} src={media} onEnded={() => setPlaying(false)} />
          </div>
        ) : (
          <button
            onClick={loadMedia}
            disabled={loading}
            className="bg-gray-100 rounded-full px-3 py-2 flex items-center gap-2 hover:bg-gray-200"
          >
            <Mic className="w-4 h-4 text-[#25d366]" />
            <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Ouvir audio'}</span>
          </button>
        )}
      </div>
    );
  }

  if (msg.message_type === 'video') {
    return (
      <div className="mb-1">
        {media ? (
          <video src={media} controls className="max-w-[250px] rounded-lg" />
        ) : (
          <button
            onClick={loadMedia}
            disabled={loading}
            className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"
          >
            <Play className="w-5 h-5 text-[#25d366]" />
            <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Ver video'}</span>
          </button>
        )}
      </div>
    );
  }

  if (msg.message_type === 'document') {
    return (
      <div className="mb-1">
        {media ? (
          <a href={media} download={msg.content || 'documento'} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200">
            <Download className="w-5 h-5 text-[#25d366]" />
            <span className="text-xs text-gray-600">Baixar documento</span>
          </a>
        ) : (
          <button
            onClick={loadMedia}
            disabled={loading}
            className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"
          >
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-xs text-gray-600">{loading ? 'Carregando...' : 'Baixar documento'}</span>
          </button>
        )}
      </div>
    );
  }

  if (msg.message_type === 'sticker') {
    return <div className="mb-1 text-2xl">🎨</div>;
  }

  if (msg.message_type === 'location') {
    return (
      <div className="mb-1 bg-gray-100 rounded-lg p-2 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-red-500" />
        <span className="text-xs">Localizacao</span>
      </div>
    );
  }

  return null;
}

// ============================================================================
// PROFILE PIC COMPONENT
// ============================================================================
function ProfilePic({ phone, tenantId, name, size = 'w-9 h-9', textSize = 'text-[10px]', isGroup = false }) {
  const [pic, setPic] = useState(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!phone || tried || isGroup) return;
    setTried(true);
    api.fetchProfilePic(phone, tenantId)
      .then(data => {
        const url =
          data?.profilePictureUrl ||
          data?.wpiUrl ||
          data?.picture ||
          data?.url ||
          null;
        if (url) setPic(url);
      })
      .catch(() => {});
  }, [phone, tenantId, tried, isGroup]);

  if (isGroup) {
    return (
      <div className={`${size} rounded-full flex items-center justify-center bg-[#128c7e]/10 flex-shrink-0`}>
        <Users2 className="w-4 h-4 text-[#128c7e]" />
      </div>
    );
  }

  if (pic) {
    return <img src={pic} alt="" className={`${size} rounded-full object-cover flex-shrink-0`} />;
  }

  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#dfe5e7] flex-shrink-0`}>
      <span className={`${textSize} font-bold text-[#075e54]`}>
        {(name || phone || '?').substring(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

// ============================================================================
// APP
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
    const ud = localStorage.getItem('userData');

    if (token && ud) {
      try {
        const u = JSON.parse(ud);
        setCurrentUser(u);

        if (u.role === 'super_admin') {
          setCurrentView('superAdmin');
          loadTenants();
        } else {
          setCurrentView('clientDashboard');
          loadTenantData(u.tenantId);
        }
      } catch (e) {
        localStorage.clear();
      }
    }
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    try {
      setTenants(await api.getTenants());
    } catch (e) {
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadTenantData = async (id) => {
    setLoading(true);
    try {
      setCurrentTenant(await api.getTenant(id));
    } catch (e) {
      setError('Erro ao carregar tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (c) => {
    setLoading(true);
    setError(null);

    try {
      const { user } = await api.login(c.email, c.password);
      setCurrentUser(user);
      localStorage.setItem('userData', JSON.stringify(user));

      if (user.role === 'super_admin') {
        setCurrentView('superAdmin');
        await loadTenants();
      } else {
        setCurrentView('clientDashboard');
        await loadTenantData(user.tenantId);
      }
    } catch (e) {
      setError('E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    localStorage.clear();
    setCurrentUser(null);
    setCurrentView('login');
    setCurrentTenant(null);
    setTenants([]);
  };

  const refreshData = useCallback(async () => {
    if (currentView === 'superAdmin') {
      await loadTenants();
    }
    if (currentTenant) {
      await loadTenantData(currentTenant.id);
    }
  }, [currentView, currentTenant]);

  if (currentView === 'login') {
    return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />;
  }

  if (currentView === 'superAdmin') {
    return (
      <SuperAdminPanel
        user={currentUser}
        tenants={tenants}
        onLogout={handleLogout}
        onRefresh={refreshData}
      />
    );
  }

  if (currentView === 'clientDashboard' && currentTenant) {
    return (
      <ClientDashboard
        user={currentUser}
        tenant={currentTenant}
        onLogout={handleLogout}
        onBackToSuperAdmin={
          currentUser?.role === 'super_admin'
            ? () => {
                setCurrentTenant(null);
                loadTenants();
                setCurrentView('superAdmin');
              }
            : null
        }
        onRefresh={refreshData}
      />
    );
  }

  return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Carregando...</div>;
}

// ============================================================================
// LOGIN
// ============================================================================
function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#075e54] via-[#128c7e] to-[#25d366] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center text-2xl font-black text-[#075e54] mb-3 shadow-lg">
            BR
          </div>
          <h1 className="text-2xl font-bold text-white">Borsato CRM</h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin({ email, password: pw });
          }}
          className="bg-white rounded-2xl p-6 shadow-2xl space-y-4"
        >
          {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-600 text-xs">{error}</div>}

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#25d366]"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Senha</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-[#25d366]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50"
          >
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// CLIENT DASHBOARD
// ============================================================================
function ClientDashboard({ user, tenant, onLogout, onBackToSuperAdmin, onRefresh }) {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem(`activeTab_${tenant.id}`) || 'kanban';
  });
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    localStorage.setItem(`activeTab_${tenant.id}`, activeTab);
  }, [activeTab, tenant.id]);

  useEffect(() => {
    loadCols();
  }, [tenant.id]);

  const loadCols = async () => {
    try {
      setColumns(await api.getKanbanColumns(tenant.id));
    } catch (e) {}
  };

  const refreshAll = useCallback(async () => {
    await onRefresh();
    await loadCols();
  }, [onRefresh, tenant.id]);

  const allTabs = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'chat', label: 'Conversas', icon: MessageSquare },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'whatsapp', label: 'WhatsApp', icon: Smartphone },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'knowledge', label: 'Conhecimento', icon: Brain },
    { id: 'team', label: 'Equipe', icon: UserPlus },
    { id: 'settings', label: 'Config', icon: Settings }
  ];

  const userPerms = (() => {
    try {
      return JSON.parse(user.permissions || '[]');
    } catch (e) {
      return [];
    }
  })();

  const isAdmin = user.role === 'super_admin' || user.role === 'client_admin';
  const tabs = isAdmin ? allTabs : allTabs.filter((t) => userPerms.includes(t.id));

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
            <button
              onClick={onBackToSuperAdmin}
              className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              MESTRE
            </button>
          )}
          <button onClick={onLogout} className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold">
            Sair
          </button>
        </div>
      </div>

      <div className="bg-[#075e54]/90 px-6 flex gap-0.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3 flex items-center gap-1.5 text-[11px] font-bold border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-white text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-4">
        {activeTab === 'kanban' && <KanbanView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'chat' && <ChatView tenant={tenant} columns={columns} onRefresh={refreshAll} />}
        {activeTab === 'leads' && <LeadsView leads={tenant.leads || []} columns={columns} tenant={tenant} onRefresh={refreshAll} />}
        {activeTab === 'whatsapp' && <WhatsAppView tenant={tenant} />}
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

  const cm = {
    blue: 'bg-blue-500',
    yellow: 'bg-amber-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    zinc: 'bg-gray-400'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Pipeline</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold shadow-sm"
        >
          <Plus className="w-3 h-3" />
          Etapa
        </button>
      </div>

      {columns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-sm">Crie sua primeira etapa</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={async () => {
                if (dragged) {
                  await api.updateLead(dragged.id, { stage: col.id });
                  setDragged(null);
                  onRefresh();
                }
              }}
              className="w-64 bg-white border border-gray-200 rounded-xl p-3 flex-shrink-0 min-h-[350px] shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${cm[col.color] || 'bg-gray-400'}`} />
                  <span className="font-bold text-[11px] uppercase text-gray-600">{col.name}</span>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 rounded-full">
                    {leads.filter((l) => l.stage === col.id).length}
                  </span>
                </div>

                <button
                  onClick={async () => {
                    if (confirm('Excluir?')) {
                      await api.deleteKanbanColumn(col.id);
                      onRefresh();
                    }
                  }}
                >
                  <X className="w-3 h-3 text-gray-300 hover:text-red-400" />
                </button>
              </div>

              <div className="space-y-2">
                {leads
                  .filter((l) => l.stage === col.id)
                  .map((l) => (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={() => setDragged(l)}
                      className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 cursor-grab hover:border-[#25d366]/50"
                    >
                      <p className="text-xs font-bold text-gray-700">{l.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{l.phone}</p>
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

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await api.createKanbanColumn({
                  tenantId: tenant.id,
                  name: newCol.name,
                  color: newCol.color,
                  position: columns.length
                });
                setNewCol({ name: '', color: 'blue' });
                setShowModal(false);
                onRefresh();
              }}
              className="space-y-3"
            >
              <input
                placeholder="Nome"
                value={newCol.name}
                onChange={(e) => setNewCol({ ...newCol, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
                required
              />

              <div className="flex gap-2 p-2 bg-gray-50 rounded-xl justify-center">
                {Object.keys(cm).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCol({ ...newCol, color: c })}
                    className={`w-7 h-7 rounded-full ${cm[c]} ${
                      newCol.color === c ? 'ring-2 ring-gray-800 scale-110' : 'opacity-40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">
                  Criar
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
// CHAT
// ============================================================================
function ChatView({ tenant, columns, onRefresh }) {
  const [chats, setChats] = useState([]);
  const [cur, setCur] = useState(() => {
    const saved = localStorage.getItem(`currentChat_${tenant.id}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState('all');
  const [file, setFile] = useState(null);

  // useRef keeps the latest cur value accessible inside stale setInterval closures
  const curRef = useRef(cur);
  useEffect(() => {
    curRef.current = cur;
  }, [cur]);

  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (cur) {
      localStorage.setItem(`currentChat_${tenant.id}`, JSON.stringify(cur));
    } else {
      localStorage.removeItem(`currentChat_${tenant.id}`);
    }
  }, [cur, tenant.id]);

  useEffect(() => {
    load();
    const i = setInterval(load, 1500);
    return () => clearInterval(i);
  }, [tenant.id]);

  useEffect(() => {
    if (cur) {
      loadMsgs(cur.id);
      loadLead(cur);
      const i = setInterval(() => loadMsgs(cur.id), 1500);
      return () => clearInterval(i);
    }
  }, [cur?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const load = async () => {
    try {
      const chatList = await api.getChats(tenant.id);
      setChats(chatList);

      const activeCur = curRef.current;
      if (activeCur) {
        const updatedCurrent = chatList.find((c) => c.id === activeCur.id);
        if (updatedCurrent) {
          setCur(updatedCurrent);
        }
      }
    } catch (e) {}
  };

  const loadMsgs = async (id) => {
    try {
      setMsgs(await api.getChatMessages(id, 100, 0));
    } catch (e) {}
  };

  const loadLead = async (c) => {
    if (isGrp(c)) {
      setLead(null);
      return;
    }

    const ph = c.contact_phone || c.remote_jid?.split('@')[0];
    if (!ph) {
      setLead(null);
      return;
    }

    try {
      setLead(await api.getLeadByPhone(ph, tenant.id));
    } catch (e) {
      setLead(null);
    }
  };

  const isGrp = (c) => Number(c.is_group) === 1 || c.is_group === true;

  const selectChat = (c) => {
    setCur(c);
    setSearch('');
  };

  const send = async () => {
    if (!msg.trim() || !cur) return;

    const ph =
      cur.remote_jid && (isGrp(cur) || cur.remote_jid.includes('@lid'))
        ? cur.remote_jid
        : cur.contact_phone || cur.remote_jid?.split('@')[0];

    setSending(true);

    try {
      await api.sendWhatsAppMessage(ph, msg, tenant.id, cur.id);
      setMsg('');
      await loadMsgs(cur.id);
      await load();
    } catch (e) {
      console.error('Erro ao enviar', e);
      alert(e.message || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > 2 * 1024 * 1024) {
      alert('Max 2MB');
      return;
    }

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
        const mt = file.type.startsWith('image')
          ? 'image'
          : file.type.startsWith('video')
          ? 'video'
          : 'document';

        await api.sendWhatsAppMedia({
          number: ph,
          base64,
          fileName: file.name,
          mediaType: mt,
          caption: '',
          tenantId: tenant.id,
          chatId: cur.id
        });

        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
        await loadMsgs(cur.id);
        await load();
        setSending(false);
      };

      reader.readAsDataURL(file);
    } catch (e) {
      alert('Erro: ' + e.message);
      setSending(false);
    }
  };

  const deleteChat = async (id) => {
    if (!confirm('Apagar conversa?')) return;

    try {
      await api.deleteChat(id);

      if (cur?.id === id) {
        setCur(null);
        setLead(null);
        setMsgs([]);
      }

      await load();
    } catch (e) {
      alert('Erro');
    }
  };

  // FIX: do NOT strip 'Z' from timestamps.
  // MySQL returns timestamps as "2026-03-21T02:00:06.000Z" (UTC).
  // Passing them directly to new Date() converts to local time correctly.
  // Stripping 'Z' made the browser treat UTC time as local → showed wrong date.
  const fmt = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const n = new Date();

    if (d.toDateString() === n.toDateString()) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const filtered = chats.filter((c) => {
    if (filter === 'individual' && isGrp(c)) return false;
    if (filter === 'group' && !isGrp(c)) return false;
    if (!search) return true;

    return (c.contact_name || c.contact_phone || '').toLowerCase().includes(search.toLowerCase());
  });

  const getStatus = (s) => {
    if (s === 'read') return <CheckCheck className="w-3 h-3 text-blue-500" />;
    if (s === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />;
    return <Check className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs"
            />
          </div>

          <div className="flex gap-1">
            {[
              { id: 'all', l: 'Todos' },
              { id: 'individual', l: 'Contatos' },
              { id: 'group', l: 'Grupos' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 py-1 text-[9px] font-bold rounded ${
                  filter === f.id ? 'bg-[#25d366] text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-2.5 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${
                cur?.id === c.id ? 'bg-[#f0f2f5]' : ''
              }`}
            >
              <div onClick={() => selectChat(c)} className="flex items-center gap-2.5 flex-1 min-w-0">
                <ProfilePic
                  phone={c.contact_phone || c.remote_jid}
                  tenantId={tenant.id}
                  name={c.contact_name || c.contact_phone}
                  isGroup={isGrp(c)}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-bold text-xs truncate">
                      {c.contact_name || c.contact_phone}
                      {isGrp(c) && (
                        <span className="ml-1 text-[8px] bg-gray-100 text-gray-400 px-1 rounded">GRUPO</span>
                      )}
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

              {!isGrp(c) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                  className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {cur ? (
          <>
            <div className="bg-[#f0f2f5] px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <ProfilePic
                  phone={cur.contact_phone || cur.remote_jid}
                  tenantId={tenant.id}
                  name={cur.contact_name || cur.contact_phone}
                  size="w-8 h-8"
                  isGroup={isGrp(cur)}
                />

                <div>
                  <p className="font-bold text-sm">{cur.contact_name || cur.contact_phone}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{cur.contact_phone}</p>
                </div>

                {lead && (
                  <button onClick={() => setShowEdit(true)} className="ml-2 p-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-100">
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {lead && columns.length > 0 && (
                <div className="flex gap-1">
                  {columns.map((col) => (
                    <button
                      key={col.id}
                      onClick={async () => {
                        await api.updateLead(lead.id, { stage: col.id });
                        setLead({ ...lead, stage: col.id });
                        onRefresh();
                      }}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        lead.stage === col.id
                          ? 'bg-[#25d366] text-white'
                          : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      }`}
                    >
                      {col.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ backgroundColor: '#eae6df' }}>
              {msgs.map((m) => {
                const fromMe = Number(m.is_from_me) === 1 || m.is_from_me === true;
                const hasMedia = m.media_url && m.message_type !== 'text';
                const isPlaceholder = [
                  '[Imagem]',
                  '[Audio]',
                  '[Video]',
                  '[Documento]',
                  '[Sticker]',
                  '[Localizacao]',
                  '[Contato]',
                  '[Mensagem]',
                  '[Reacao]'
                ].includes(m.content);

                return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm ${fromMe ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
                      {m.sender_name && (
                        <p className={`text-[10px] font-bold mb-0.5 ${fromMe ? 'text-[#075e54]' : 'text-[#6b7280]'}`}>
                          {m.sender_name}
                        </p>
                      )}

                      {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} />}

                      {m.content && !isPlaceholder && (
                        <p className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{m.content}</p>
                      )}

                      {m.content && isPlaceholder && !hasMedia && (
                        <p className="text-[13px] text-gray-500 italic">{m.content}</p>
                      )}

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
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="text-xs text-red-500 font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={sendFile}
                    disabled={sending}
                    className="px-3 py-1 bg-[#25d366] text-white text-xs font-bold rounded-lg disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#f0f2f5] px-3 py-2.5 flex items-center gap-2 border-t border-gray-200">
              <input
                type="file"
                ref={fileRef}
                onChange={handleFile}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
              <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-gray-200 rounded-full">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>

              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !sending) {
                    e.preventDefault();
                    send();
                  }
                }}
                disabled={sending}
                placeholder="Mensagem..."
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:border-[#25d366]"
              />

              <button
                onClick={send}
                disabled={sending || !msg.trim()}
                className="p-2 bg-[#25d366] text-white rounded-full disabled:opacity-40"
              >
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
          onSave={async (data) => {
            await api.updateLead(lead.id, data);
            setLead({ ...lead, ...data });
            setShowEdit(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// EDIT LEAD
// ============================================================================
function EditLeadModal({ lead, columns, onClose, onSave }) {
  const [f, setF] = useState({
    name: lead.name || '',
    phone: lead.phone || '',
    email: lead.email || '',
    stage: lead.stage || '',
    notes: lead.notes || ''
  });

  const [custom, setCustom] = useState(() => {
    try {
      return JSON.parse(lead.custom_data || '{}');
    } catch (e) {
      return {};
    }
  });

  const [nf, setNf] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Editar Lead</h2>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label>
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Telefone</label>
            <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label>
            <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          </div>

          {columns.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Etapa</label>
              <select value={f.stage} onChange={(e) => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase">Observacoes</label>
            <textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Campos Personalizados</p>

            {Object.entries(custom).map(([k, v]) => (
              <div key={k} className="flex gap-2 mb-2 items-center">
                <span className="text-xs text-gray-500 w-28 truncate">{k}</span>
                <input
                  value={v}
                  onChange={(e) => setCustom({ ...custom, [k]: e.target.value })}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                />
                <button
                  onClick={() => {
                    const c = { ...custom };
                    delete c[k];
                    setCustom(c);
                  }}
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                value={nf}
                onChange={(e) => setNf(e.target.value)}
                placeholder="Nome do campo..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nf.trim()) {
                    setCustom({ ...custom, [nf.trim()]: '' });
                    setNf('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (nf.trim()) {
                    setCustom({ ...custom, [nf.trim()]: '' });
                    setNf('');
                  }
                }}
                className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">
              Cancelar
            </button>
            <button onClick={() => onSave({ ...f, customData: custom })} className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEADS
// ============================================================================
function LeadsView({ leads, columns, tenant, onRefresh }) {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editLead, setEditLead] = useState(null);

  const filtered = leads.filter(
    (l) => (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 max-w-sm relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm shadow-sm"
          />
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"
        >
          <Plus className="w-3 h-3" />
          Lead
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
              <th className="p-3">Ultima msg</th>
              <th className="p-3 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-bold text-xs">{l.name}</td>
                <td className="p-3 text-xs text-gray-400 font-mono">{l.phone}</td>
                <td className="p-3">
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded">
                    {columns.find((c) => c.id === l.stage)?.name || l.stage || '-'}
                  </span>
                </td>
                <td className="p-3 text-[10px] text-gray-400">{l.source || '-'}</td>
                <td className="p-3 text-[10px] text-gray-400 max-w-[150px] truncate">{l.last_message || '-'}</td>
                <td className="p-3 text-right flex gap-1 justify-end">
                  <button onClick={() => setEditLead(l)} className="text-blue-400">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Deletar?')) {
                        await api.deleteLead(l.id);
                        onRefresh();
                      }
                    }}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-xs">Nenhum lead</div>}
      </div>

      {showCreate && (
        <LeadCreateModal
          tenant={tenant}
          columns={columns}
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
            setShowCreate(false);
            onRefresh();
          }}
        />
      )}

      {editLead && (
        <EditLeadModal
          lead={editLead}
          columns={columns}
          onClose={() => setEditLead(null)}
          onSave={async (data) => {
            await api.updateLead(editLead.id, data);
            setEditLead(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

function LeadCreateModal({ tenant, columns, onClose, onSuccess }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', stage: columns[0]?.id || 'novo' });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">Novo Lead</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await api.createLead({ ...f, tenantId: tenant.id });
            onSuccess();
          }}
          className="space-y-3"
        >
          <input
            placeholder="Nome"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required
          />
          <input
            placeholder="Telefone"
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
          />

          {columns.length > 0 && (
            <select
              value={f.stage}
              onChange={(e) => setF({ ...f, stage: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">
              Criar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// WHATSAPP / ANALYTICS / KNOWLEDGE / TEAM / SETTINGS
// ============================================================================
function WhatsAppView({ tenant }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [ld, setLd] = useState(false);

  const nm = `tenant_${tenant.id}`;

  useEffect(() => {
    ck();
    const i = setInterval(ck, 5000);
    return () => clearInterval(i);
  }, []);

  const ck = async () => {
    try {
      setStatus(await api.getWhatsAppStatus(tenant.id));
    } catch (e) {}
  };

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

              <button
                onClick={async () => {
                  await api.disconnectWhatsApp(tenant.id);
                  ck();
                }}
                className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold"
              >
                Desconectar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                <span className="text-gray-400 text-sm">Desconectado</span>
              </div>

              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono"
              />

              <button
                onClick={async () => {
                  setLd(true);
                  try {
                    await api.connectWhatsApp(tenant.id, token);
                    setToken('');
                    ck();
                  } catch (e) {
                    alert('Erro');
                  } finally {
                    setLd(false);
                  }
                }}
                disabled={ld || !token.trim()}
                className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                {ld ? 'Salvando...' : 'Salvar'}
              </button>

              <button onClick={ck} className="w-full py-2 bg-gray-50 text-[#075e54] rounded-lg text-xs font-bold border border-gray-200">
                Verificar
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Instancia</h3>
          <div className="bg-gray-50 rounded-lg p-2.5 flex justify-between items-center mb-2">
            <code className="text-[#075e54] text-xs font-bold">{nm}</code>
            <button onClick={() => navigator.clipboard.writeText(nm)} className="text-[10px] text-gray-400">
              Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ leads, columns }) {
  const t = leads.length;
  const s = {
    w: leads.filter((l) => l.source === 'whatsapp').length,
    m: leads.filter((l) => l.source !== 'whatsapp').length
  };

  const cm = {
    blue: '#3b82f6',
    yellow: '#f59e0b',
    purple: '#a855f7',
    green: '#22c55e',
    red: '#ef4444',
    zinc: '#71717a'
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Analytics</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { l: 'Total', v: t, i: Users, c: 'text-blue-600' },
          { l: 'WhatsApp', v: s.w, i: Smartphone, c: 'text-green-600' },
          { l: 'Manual', v: s.m, i: UserPlus, c: 'text-amber-600' }
        ].map((m, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <m.i className={`w-4 h-4 ${m.c}`} />
              <span className="text-[10px] text-gray-400 font-bold uppercase">{m.l}</span>
            </div>
            <p className="text-2xl font-bold">{m.v}</p>
          </div>
        ))}
      </div>

      {columns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
          <h3 className="font-bold text-sm mb-4">Por Etapa</h3>

          <div className="space-y-3">
            {columns.map((col) => {
              const c = leads.filter((l) => l.stage === col.id).length;
              const p = t > 0 ? (c / t) * 100 : 0;

              return (
                <div key={col.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-gray-600">{col.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {c} ({p.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(p, 2)}%`,
                        backgroundColor: cm[col.color] || '#71717a'
                      }}
                    />
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

function KnowledgeView({ knowledge, tenant, onRefresh }) {
  const [show, setShow] = useState(false);
  const cats = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Conhecimento</h2>
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"
        >
          <Plus className="w-3 h-3" />
          Novo
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cats.map((cat) => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">{cat}</h3>

            {knowledge
              .filter((k) => k.category === cat)
              .map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2">
                  <div className="flex justify-between mb-1">
                    <p className="font-bold text-xs">{item.question}</p>
                    <button
                      onClick={async () => {
                        if (confirm('Deletar?')) {
                          await api.deleteKnowledge(item.id);
                          onRefresh();
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3 text-gray-300" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-500">{item.answer}</p>
                </div>
              ))}

            {knowledge.filter((k) => k.category === cat).length === 0 && (
              <p className="text-[10px] text-gray-300 text-center py-3">Vazio</p>
            )}
          </div>
        ))}
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h2 className="font-bold mb-4">Novo</h2>
            <KnowledgeForm
              tenant={tenant}
              onClose={() => setShow(false)}
              onSuccess={() => {
                setShow(false);
                onRefresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function KnowledgeForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ category: 'FAQ', question: '', answer: '' });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await api.createKnowledge({ ...f, tenantId: tenant.id });
        onSuccess();
      }}
      className="space-y-3"
    >
      <select
        value={f.category}
        onChange={(e) => setF({ ...f, category: e.target.value })}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
      >
        <option>Produtos/Servicos</option>
        <option>Precos</option>
        <option>Agendamento</option>
        <option>FAQ</option>
      </select>

      <input
        placeholder="Pergunta"
        value={f.question}
        onChange={(e) => setF({ ...f, question: e.target.value })}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
        required
      />

      <textarea
        placeholder="Resposta"
        value={f.answer}
        onChange={(e) => setF({ ...f, answer: e.target.value })}
        rows={3}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
        required
      />

      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">
          Cancelar
        </button>
        <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">
          Criar
        </button>
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
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"
        >
          <Plus className="w-3 h-3" />
          Usuario
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
            {users.map((u) => {
              const perms = (() => {
                try {
                  return JSON.parse(u.permissions || '[]');
                } catch (e) {
                  return [];
                }
              })();

              return (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-xs">{u.name}</td>
                  <td className="p-3 text-xs text-gray-400">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                        u.role === 'super_admin'
                          ? 'bg-purple-50 text-purple-500'
                          : u.role === 'client_admin'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-blue-500'
                      }`}
                    >
                      {u.role === 'super_admin' ? 'Mestre' : u.role === 'client_admin' ? 'Admin' : 'Usuario'}
                    </span>
                  </td>
                  <td className="p-3 text-[9px] text-gray-400">
                    {u.role === 'client_user' ? perms.join(', ') || 'Nenhuma' : ''}
                  </td>
                  <td className="p-3 text-right flex gap-1 justify-end">
                    {u.role === 'client_user' && (
                      <button onClick={() => setEditing(u)} className="text-blue-400">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {u.id !== currentUser.id && (
                      <button
                        onClick={async () => {
                          if (confirm('Deletar?')) {
                            await api.deleteUser(u.id);
                            onRefresh();
                          }
                        }}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
          onClose={() => {
            setShow(false);
            setEditing(null);
          }}
          onSuccess={() => {
            setShow(false);
            setEditing(null);
            onRefresh();
          }}
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
    permissions: (() => {
      try {
        return JSON.parse(user?.permissions || '[]');
      } catch (e) {
        return [];
      }
    })()
  });

  const tp = (p) => {
    setF({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter((x) => x !== p)
        : [...f.permissions, p]
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">{user ? 'Editar' : 'Novo'} Usuario</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (user) {
                await api.updateUser(user.id, {
                  name: f.name,
                  email: f.email,
                  role: f.role,
                  permissions: f.permissions,
                  ...(f.password ? { password: f.password } : {})
                });
              } else {
                await api.createUser({ ...f, tenantId: tenant.id });
              }
              onSuccess();
            } catch (err) {
              alert('Erro: ' + err.message);
            }
          }}
          className="space-y-3"
        >
          <input
            placeholder="Nome"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required
          />

          <input
            type="password"
            placeholder={user ? 'Nova senha (vazio=manter)' : 'Senha'}
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required={!user}
          />

          <select
            value={f.role}
            onChange={(e) => setF({ ...f, role: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
          >
            <option value="client_user">Usuario</option>
            <option value="client_admin">Admin</option>
          </select>

          {f.role === 'client_user' && (
            <div className="border border-gray-200 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Permissoes</p>
              <div className="grid grid-cols-2 gap-1.5">
                {allT.map((tab) => (
                  <label
                    key={tab}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer ${
                      f.permissions.includes(tab)
                        ? 'bg-[#25d366]/10 text-[#075e54] font-bold'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={f.permissions.includes(tab)}
                      onChange={() => tp(tab)}
                      className="w-3 h-3"
                    />
                    {tab}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SettingsView({ tenant, onRefresh }) {
  const [prompt, setPrompt] = useState(tenant.ai_prompt || '');
  const [saving, setSaving] = useState(false);

  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-lg mb-4">Configuracoes</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1">Prompt da IA</h3>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          placeholder="Ex: Voce e assistente..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3"
        />

        <button
          onClick={async () => {
            setSaving(true);
            try {
              await api.updateTenant(tenant.id, {
                name: tenant.name,
                plan: tenant.plan,
                monthlyValue: tenant.monthly_value,
                aiPrompt: prompt,
                customFields: JSON.parse(tenant.custom_fields || '[]'),
                active: tenant.active
              });
              alert('Salvo!');
              onRefresh();
            } catch (e) {
              alert('Erro');
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="px-5 py-2 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
}

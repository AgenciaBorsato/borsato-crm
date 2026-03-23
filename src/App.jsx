import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from './api';
import SuperAdminPanel from './pages/SuperAdminPanel';
import {
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send, X, Check,
  Trash2, BarChart3, Brain, Edit2, UserPlus, ArrowLeft, Smartphone, Image,
  Mic, FileText, MapPin, CheckCheck, Paperclip, Users2, Download, Play, Pause,
  MessageCircle, Phone, Clock, Zap, Bot, RotateCcw, RefreshCw, ChevronDown, ChevronUp,
  AlertTriangle, AtSign, Crown, Shield
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

function renderText(text, myName = '') {
  if (!text) return null;
  const tokenRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+\.[a-z]{2,}[^\s<>"']*|@[\w\u00C0-\u024F]+)/gi;
  const parts = text.split(tokenRegex);
  if (parts.length === 1) {
    return <span className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{text}</span>;
  }
  return (
    <span className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (!part) return null;
        if (/^https?:\/\//i.test(part) || /^www\./i.test(part)) {
          const href = part.startsWith('http') ? part : 'https://' + part;
          return (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer"
               className="text-[#075e54] underline underline-offset-2 decoration-[#075e54]/40 hover:decoration-[#075e54] break-all"
               onClick={e => e.stopPropagation()}>
              {part}
            </a>
          );
        }
        if (/^@/.test(part)) {
          const mentionName = part.slice(1);
          const isMe = myName && mentionName.toLowerCase() === myName.toLowerCase();
          return (
            <span key={i} className={`font-bold rounded px-0.5 ${isMe ? 'bg-yellow-200 text-yellow-900' : 'text-[#075e54]'}`}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
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
          const mm = { image: 'image/jpeg', audio: 'audio/ogg', video: 'video/mp4', document: 'application/pdf', sticker: 'image/webp' };
          src = `data:${mm[msg.message_type] || 'application/octet-stream'};base64,${src}`;
        }
        setMedia(src);
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    const autoTypes = ['image', 'sticker'];
    if (autoTypes.includes(msg.message_type) && msg.media_url && msg.media_url !== 'undefined') {
      loadMedia();
    }
  }, [msg.id]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  if (msg.message_type === 'image') return (
    <div className="mb-1">
      {loading && !media && (
        <div className="w-[200px] h-[140px] bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {media ? (
        <img src={media} alt="" className="max-w-[260px] rounded-xl cursor-zoom-in shadow-sm hover:opacity-95 transition-opacity"
          onClick={() => { const w = window.open('', '_blank'); w.document.write(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="${media}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`); w.document.close(); }}
          onError={(e) => { e.currentTarget.style.display='none'; }} />
      ) : (!loading && (
        <button onClick={loadMedia} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200">
          <Image className="w-5 h-5 text-[#25d366]" />
          <span className="text-xs text-gray-600">Ver imagem</span>
        </button>
      ))}
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
      {media ? <video src={media} controls className="max-w-[250px] rounded-lg" />
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Play className="w-5 h-5 text-[#25d366]" /><span className="text-xs">{loading ? 'Carregando...' : 'Ver video'}</span></button>}
    </div>
  );
  if (msg.message_type === 'document') return (
    <div className="mb-1">
      {media ? <a href={media} download={msg.content || 'doc'} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><Download className="w-5 h-5 text-[#25d366]" /><span className="text-xs">Baixar</span></a>
        : <button onClick={loadMedia} disabled={loading} className="bg-gray-100 rounded-lg p-3 flex items-center gap-2 hover:bg-gray-200"><FileText className="w-5 h-5 text-gray-400" /><span className="text-xs">{loading ? 'Carregando...' : 'Baixar'}</span></button>}
    </div>
  );
  if (msg.message_type === 'sticker') return (
    <div className="mb-1">
      {media ? (
        <img src={media} alt="sticker" className="w-[140px] h-[140px] object-contain" />
      ) : loading ? (
        <div className="w-[80px] h-[80px] bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="text-2xl">{String.fromCodePoint(0x1F3A8)}</div>
      )}
    </div>
  );
  if (msg.message_type === 'location') return (
    <div className="mb-1 bg-gray-100 rounded-lg p-2 flex items-center gap-2">
      <MapPin className="w-4 h-4 text-red-500" />
      <span className="text-xs">Localizacao</span>
    </div>
  );
  return null;
}

function ParticipantAvatar({ name, phone, size = 'w-8 h-8', textSize = 'text-[10px]' }) {
  const display = name || phone || '?';
  return (
    <div className={`${size} rounded-full flex items-center justify-center bg-[#dfe5e7] flex-shrink-0`}>
      <span className={`${textSize} font-bold text-[#075e54]`}>{display.substring(0, 2).toUpperCase()}</span>
    </div>
  );
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

function LeadSummaryCard({ lead, onRefresh, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!lead?.conversation_summary && !lead?.structured_memory) return null;

  let memoryEntries = [];
  if (lead.structured_memory) {
    try {
      const mem = typeof lead.structured_memory === 'string' ? JSON.parse(lead.structured_memory) : lead.structured_memory;
      memoryEntries = Object.entries(mem).filter(([, v]) => v && v !== '' && !(Array.isArray(v) && v.length === 0));
    } catch {}
  }

  const handleRefresh = async (e) => {
    e.stopPropagation();
    setRefreshing(true);
    try { await api.refreshLeadContext(lead.id); onRefresh?.(); } catch {}
    finally { setRefreshing(false); }
  };

  const labelMap = {
    tipo_contato: 'Tipo', nome: 'Nome', empresa: 'Empresa', nicho: 'Segmento',
    objetivo_principal: 'Objetivo', dor_principal: 'Dor', interesse_servicos: 'Interesse',
    estagio_comercial: 'Estagio', interesse_reuniao: 'Reuniao', ultimo_assunto: 'Ultimo assunto'
  };

  const stageBadge = () => {
    try {
      const mem = typeof lead.structured_memory === 'string' ? JSON.parse(lead.structured_memory) : lead.structured_memory;
      const e = mem?.estagio_comercial;
      if (!e) return null;
      const map = { frio: 'bg-blue-50 text-blue-600', morno: 'bg-amber-50 text-amber-700', quente: 'bg-red-50 text-red-600' };
      return <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${map[e] || 'bg-gray-50 text-gray-500'}`}>{e.toUpperCase()}</span>;
    } catch { return null; }
  };

  if (compact) {
    return (
      <div className="px-4 py-1.5 border-b border-amber-100 bg-amber-50/70">
        <div className="flex items-start gap-2">
          <Brain className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Contexto da conversa</span>
              {stageBadge()}
              <button onClick={handleRefresh} disabled={refreshing} className="ml-auto p-0.5 text-amber-400 hover:text-amber-600 disabled:opacity-40" title="Atualizar resumo">
                <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-amber-400 hover:text-amber-600">
                {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              </button>
            </div>
            <p className={`text-[10px] text-amber-800 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{lead.conversation_summary}</p>
            {expanded && memoryEntries.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {memoryEntries.map(([k, v]) => (
                  <span key={k} className="text-[9px] bg-white border border-amber-200 text-amber-700 rounded px-1.5 py-0.5">
                    <span className="font-bold">{labelMap[k] || k}:</span> {Array.isArray(v) ? v.join(', ') : String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Historico Estrategico</span>
          {stageBadge()}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-1 text-[9px] text-amber-500 hover:text-amber-700 disabled:opacity-40 font-bold">
          <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} /> Atualizar
        </button>
      </div>
      {lead.conversation_summary && <p className="text-xs text-amber-900 leading-relaxed mb-2">{lead.conversation_summary}</p>}
      {memoryEntries.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {memoryEntries.map(([k, v]) => (
            <span key={k} className="text-[9px] bg-white border border-amber-200 text-amber-700 rounded px-1.5 py-0.5">
              <span className="font-bold">{labelMap[k] || k}:</span> {Array.isArray(v) ? v.join(', ') : String(v)}
            </span>
          ))}
        </div>
      )}
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
    if (!token || !ud) return;
    try {
      const u = JSON.parse(ud);
      setCurrentUser(u);
      const savedView = localStorage.getItem('currentView') || null;
      const savedTenantId = localStorage.getItem('currentTenantId') || null;
      if (u.role === 'super_admin') {
        loadTenants();
        if (savedView === 'clientDashboard' && savedTenantId) {
          loadTenantData(savedTenantId).then(() => setCurrentView('clientDashboard'));
        } else {
          setCurrentView('superAdmin');
        }
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
        setCurrentView('superAdmin');
        localStorage.setItem('currentView', 'superAdmin');
        localStorage.removeItem('currentTenantId');
        await loadTenants();
      } else {
        await loadTenantData(user.tenantId);
        setCurrentView('clientDashboard');
      }
    } catch (e) { setError('E-mail ou senha incorretos'); }
    finally { setLoading(false); }
  };

  const handleEnterTenant = useCallback(async (tid) => {
    await loadTenantData(tid);
    setCurrentView('clientDashboard');
    localStorage.setItem('currentView', 'clientDashboard');
    localStorage.setItem('currentTenantId', tid);
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
        localStorage.setItem('currentView', 'superAdmin');
        localStorage.removeItem('currentTenantId');
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
  const [whatsappConnected, setWhatsappConnected] = useState(true);
  const [waBannerDismissed, setWaBannerDismissed] = useState(false);

  useEffect(() => { localStorage.setItem(`activeTab_${tenant.id}`, activeTab); }, [activeTab, tenant.id]);
  useEffect(() => { loadCols(); }, [tenant.id]);

  useEffect(() => {
    const checkWA = async () => {
      try {
        const status = await api.getWhatsAppStatus(tenant.id);
        const connected = status?.connected === true;
        setWhatsappConnected(connected);
        if (connected) setWaBannerDismissed(false);
      } catch {}
    };
    checkWA();
    const i = setInterval(checkWA, 60000);
    return () => clearInterval(i);
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

      {!whatsappConnected && !waBannerDismissed && (
        <div className="bg-red-500 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs font-bold">WhatsApp desconectado — mensagens nao estao sendo recebidas nem enviadas</span>
          </div>
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
      <div className="max-w-[1800px] mx-auto px-4 py-4">
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

function KanbanView({ leads, columns, tenant, onRefresh, onOpenChat }) {
  const [dragged, setDragged] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', color: 'blue' });
  const [filter, setFilter] = useState('');

  const getLeadsForColumn = (col, colIdx) => {
    const f = filter ? leads.filter(l => (l.name || '').toLowerCase().includes(filter.toLowerCase()) || (l.phone || '').includes(filter)) : leads;
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
        <div className="text-center py-20 text-gray-400"><LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-20" /><p className="font-bold text-sm mb-1">Nenhuma etapa criada</p></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4 items-start">
          {columns.map((col, colIdx) => {
            const colLeads = getLeadsForColumn(col, colIdx);
            const c = CM[col.color] || CM.zinc;
            return (
              <div key={col.id} onDragOver={e => { e.preventDefault(); setDragOver(col.id); }} onDragLeave={() => setDragOver(null)}
                onDrop={async () => { if (dragged) { await api.updateLead(dragged.id, { stage: col.id }); setDragged(null); onRefresh(); } setDragOver(null); }}
                className={`w-72 flex-shrink-0 rounded-xl border bg-white shadow-sm transition-all ${dragOver === col.id ? 'border-2 shadow-lg' : 'border-gray-200'}`}>
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
                    <KanbanCard key={l.id} lead={l} col={col} columns={columns} onDragStart={() => setDragged(l)} onDragEnd={() => setDragged(null)}
                      onOpenChat={onOpenChat} onStageChange={async (s) => { await api.updateLead(l.id, { stage: s }); onRefresh(); }} onRefresh={onRefresh} />
                  ))}
                  {colLeads.length === 0 && <div className="py-6 text-center"><p className="text-[10px] text-gray-300">Arraste leads aqui</p></div>}
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
            <form onSubmit={async e => { e.preventDefault(); await api.createKanbanColumn({ tenantId: tenant.id, name: newCol.name, color: newCol.color, position: columns.length }); setNewCol({ name: '', color: 'blue' }); setShowModal(false); onRefresh(); }} className="space-y-3">
              <input placeholder="Nome da etapa" value={newCol.name} onChange={e => setNewCol({ ...newCol, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
              <div className="flex gap-2 p-2 bg-gray-50 rounded-xl justify-center">
                {Object.keys(CM).map(c => <button key={c} type="button" onClick={() => setNewCol({ ...newCol, color: c })} className={`w-7 h-7 rounded-full ${CM[c].bg} ${newCol.color === c ? 'ring-2 ring-gray-800 scale-110' : 'opacity-40'}`} />)}
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
  const otherCols = columns.filter(c2 => c2.id !== col.id);
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={`bg-white border rounded-lg cursor-grab select-none transition-all ${hover ? 'border-gray-300 shadow-md -translate-y-0.5' : 'border-gray-100 shadow-sm'}`}>
      <div className={`h-0.5 rounded-t-lg ${c.bg} opacity-60`} />
      <div className="p-2.5">
        <div className="flex justify-between items-center mb-1.5">
          {lead.source === 'whatsapp' ? <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-green-700 bg-green-100 rounded px-1.5 py-0.5"><Zap className="w-2.5 h-2.5" /> WhatsApp</span> : <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-gray-500 bg-gray-100 rounded px-1.5 py-0.5"><Plus className="w-2.5 h-2.5" /> Manual</span>}
          {days > 7 ? <span className="text-[9px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {days}d</span> : days > 2 ? <span className="text-[9px] font-bold text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {days}d</span> : days > 0 ? <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {days}d</span> : <span className="text-[9px] text-[#25d366] font-bold">Hoje</span>}
        </div>
        <p className="font-bold text-[13px] text-gray-800 leading-tight mb-0.5 truncate">{lead.name || '\u2014'}</p>
        {lead.phone && <p className="text-[10px] text-gray-400 font-mono mb-2 flex items-center gap-1"><Phone className="w-2.5 h-2.5" />{lead.phone}</p>}
        {lead.conversation_summary && <p className="text-[9px] text-amber-700 bg-amber-50 rounded px-1.5 py-1 mb-2 line-clamp-1 italic">{lead.conversation_summary}</p>}
        {!lead.conversation_summary && lead.notes && <p className="text-[10px] text-gray-500 line-clamp-1 mb-2 italic">{lead.notes}</p>}
        {hover && (
          <div className="flex gap-1 mt-1 pt-2 border-t border-gray-100">
            {lead.phone && <button onClick={() => onOpenChat(lead.phone)} className="flex-1 flex items-center justify-center gap-1 py-1 bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#075e54] rounded text-[10px] font-bold"><MessageCircle className="w-3 h-3" /> Conversar</button>}
            <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteLead(lead.id); onRefresh(); } }} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-400 rounded"><Trash2 className="w-3 h-3" /></button>
          </div>
        )}
        {hover && otherCols.length > 0 && (
          <div className="mt-1.5 flex gap-1 flex-wrap">
            {otherCols.map(c2 => <button key={c2.id} onClick={() => onStageChange(c2.id)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${(CM[c2.color] || CM.zinc).light} ${(CM[c2.color] || CM.zinc).text}`}>{'\u2192'} {c2.name}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatView({ tenant, columns, onRefresh, requestedPhone, onPhoneHandled, currentUser }) {
  const [chats, setChats] = useState([]);
  const [cur, setCur] = useState(() => { const s = localStorage.getItem(`currentChat_${tenant.id}`); return s ? JSON.parse(s) : null; });
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState('individual');
  const [file, setFile] = useState(null);
  const [showTrash, setShowTrash] = useState(false);
  const [deletedChats, setDeletedChats] = useState([]);
  const [loadingTrash, setLoadingTrash] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [loadingPart, setLoadingPart] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const mentionStartRef = useRef(-1);
  const inputRef = useRef(null);

  const curRef = useRef(cur);
  const endRef = useRef(null);
  const fileRef = useRef(null);
  const prevUnreadRef = useRef(0);
  const initialLoadRef = useRef(true);

  const myName = currentUser?.name || '';

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, []);

  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => {
    if (cur) localStorage.setItem(`currentChat_${tenant.id}`, JSON.stringify(cur));
    else localStorage.removeItem(`currentChat_${tenant.id}`);
  }, [cur, tenant.id]);
  useEffect(() => { load(); const i = setInterval(load, POLL_INTERVAL); return () => clearInterval(i); }, [tenant.id]);
  useEffect(() => {
    if (cur) { loadMsgs(cur.id); loadLead(cur); const i = setInterval(() => loadMsgs(cur.id), POLL_INTERVAL); return () => clearInterval(i); }
  }, [cur?.id]);

  useEffect(() => {
    if (cur && isGrp(cur)) {
      setShowParticipants(false);
      setMentionQuery(null);
      mentionStartRef.current = -1;
      loadParticipants(cur.remote_jid);
    } else {
      setParticipants([]);
      setShowParticipants(false);
      setMentionQuery(null);
    }
  }, [cur?.id]);

  const loadParticipants = async (groupJid) => {
    setLoadingPart(true);
    try { const d = await api.getGroupParticipants(tenant.id, groupJid); setParticipants(d?.participants || []); } catch {}
    finally { setLoadingPart(false); }
  };

  useEffect(() => {
    if (!requestedPhone || chats.length === 0) return;
    const clean = requestedPhone.replace(/\D/g, '');
    const match = chats.find(c => (c.contact_phone || '').replace(/\D/g, '') === clean || (c.remote_jid || '').replace(/[^0-9]/g, '').includes(clean));
    if (match) { selectChat(match); onPhoneHandled?.(); }
  }, [requestedPhone, chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        const total = chats.reduce((sum, c) => sum + (Number(c.unread_count) || 0), 0);
        document.title = total > 0 ? `(${total}) Borsato CRM` : 'Borsato CRM';
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { document.removeEventListener('visibilitychange', handleVisibility); document.title = 'Borsato CRM'; };
  }, [chats]);

  const load = async () => {
    try {
      const chatList = await api.getChats(tenant.id);
      setChats(chatList);
      const ac = curRef.current;
      if (ac) { const upd = chatList.find(c => c.id === ac.id); if (upd) setCur(upd); }
      const totalUnread = chatList.reduce((sum, c) => sum + (Number(c.unread_count) || 0), 0);
      if (!initialLoadRef.current && totalUnread > prevUnreadRef.current) playNotificationSound();
      document.title = totalUnread > 0 ? `(${totalUnread}) Borsato CRM` : 'Borsato CRM';
      prevUnreadRef.current = totalUnread;
      initialLoadRef.current = false;
    } catch {}
  };

  const loadMsgs = async (id) => { try { setMsgs(await api.getChatMessages(id, 100, 0)); } catch {} };
  const loadLead = async (c) => {
    if (isGrp(c)) { setLead(null); return; }
    const ph = c.contact_phone || c.remote_jid?.split('@')[0];
    if (!ph) { setLead(null); return; }
    try { setLead(await api.getLeadByPhone(ph, tenant.id)); } catch { setLead(null); }
  };
  const loadDeletedChats = async () => { setLoadingTrash(true); try { setDeletedChats(await api.getDeletedChats(tenant.id)); } catch {} finally { setLoadingTrash(false); } };
  const restoreChat = async (chatId) => {
    try { await api.restoreChat(chatId); setDeletedChats(prev => prev.filter(c => c.id !== chatId)); await load(); }
    catch { alert('Erro ao restaurar conversa'); }
  };

  const isGrp = c => Number(c.is_group) === 1 || c.is_group === true;
  const chatDisplayName = c => {
    const name = c.contact_name;
    if (name && !/^\d{10,}$/.test(name)) return name;
    if (!isGrp(c)) return c.contact_phone || c.remote_jid || '';
    return 'Grupo';
  };
  const selectChat = c => { setCur(c); setSearch(''); };

  const mentionsMe = useCallback((content) => {
    if (!myName || !content) return false;
    return content.toLowerCase().includes(`@${myName.toLowerCase()}`);
  }, [myName]);

  const mentionSuggestions = (mentionQuery !== null && isGrp(cur) && participants.length > 0)
    ? participants.filter(p => {
        const n = (p.name || p.phone || '').toLowerCase();
        return n.includes(mentionQuery.toLowerCase());
      }).slice(0, 8)
    : [];

  const selectMention = (p) => {
    const name = p.name || p.phone || 'Contato';
    const before = msg.slice(0, mentionStartRef.current);
    const after = msg.slice(mentionStartRef.current + 1 + (mentionQuery?.length || 0));
    setMsg(`${before}@${name} ${after}`);
    setMentionQuery(null);
    mentionStartRef.current = -1;
    setMentionIdx(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleMsgChange = (e) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setMsg(val);
    if (isGrp(cur) && participants.length > 0) {
      const before = val.slice(0, pos);
      const m = before.match(/@([\w\u00C0-\u024F]*)$/);
      if (m) {
        mentionStartRef.current = m.index;
        setMentionQuery(m[1]);
        setMentionIdx(0);
      } else {
        setMentionQuery(null);
        mentionStartRef.current = -1;
      }
    }
  };

  const send = async () => {
    if (!msg.trim() || !cur) return;
    const ph = cur.remote_jid && (isGrp(cur) || cur.remote_jid.includes('@lid')) ? cur.remote_jid : cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    setMentionQuery(null);
    try {
      await api.sendWhatsAppMessage(ph, msg, tenant.id, cur.id);
      setMsg('');
      // Reset altura do textarea
      if (inputRef.current) { inputRef.current.style.height = 'auto'; }
      await loadMsgs(cur.id); await load();
    }
    catch (e) { alert(e.message || 'Erro ao enviar'); } finally { setSending(false); }
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, mentionSuggestions.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') { e.preventDefault(); selectMention(mentionSuggestions[mentionIdx]); return; }
      if (e.key === 'Escape') { setMentionQuery(null); return; }
    }
    // Enter envia; Shift+Enter quebra linha (comportamento natural do textarea)
    if (e.key === 'Enter' && !e.shiftKey && !sending) { e.preventDefault(); send(); }
  };

  const handleFile = e => { const f = e.target.files[0]; if (!f) return; if (f.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; } setFile(f); };

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
        setFile(null); if (fileRef.current) fileRef.current.value = '';
        await loadMsgs(cur.id); await load(); setSending(false);
      };
      reader.readAsDataURL(file);
    } catch (e) { alert('Erro: ' + e.message); setSending(false); }
  };

  const deleteChat = async id => {
    if (!confirm('Apagar conversa? Ela vai para a lixeira e pode ser restaurada.')) return;
    try { await api.deleteChat(id); if (cur?.id === id) { setCur(null); setLead(null); setMsgs([]); } await load(); }
    catch { alert('Erro'); }
  };

  const fmt = ts => {
    if (!ts) return '';
    const d = new Date(ts), n = new Date();
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

  const handleLeadContextRefresh = async () => {
    if (!lead) return;
    try { const result = await api.refreshLeadContext(lead.id); if (result?.lead) setLead(prev => ({ ...prev, ...result.lead })); } catch {}
  };

  const renderStageButtons = () => {
    if (!cur || isGrp(cur) || columns.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 justify-end max-w-xs">
        {columns.map(col => {
          const cc = CM[col.color] || CM.zinc;
          const isActive = lead?.stage === col.id;
          const handleClick = async () => {
            if (lead) { await api.updateLead(lead.id, { stage: col.id }); setLead({ ...lead, stage: col.id }); }
            else { const ph = cur.contact_phone || cur.remote_jid?.split('@')[0]; if (ph) { try { const nl = await api.createLead({ tenantId: tenant.id, name: chatDisplayName(cur), phone: ph, source: 'whatsapp', stage: col.id }); setLead(nl); } catch (err) { console.error(err); } } }
            onRefresh();
          };
          return <button key={col.id} onClick={handleClick} className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${isActive ? `${cc.bg} text-white shadow-sm` : `${cc.light} ${cc.text} hover:opacity-80`}`}>{col.name}</button>;
        })}
      </div>
    );
  };

  // 6 emojis de reaction comuns
  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs" />
          </div>
          <div className="flex gap-1">
            {[{ id: 'individual', l: 'Contatos' }, { id: 'group', l: 'Grupos' }].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 py-1 text-[9px] font-bold rounded ${filter === f.id ? 'bg-[#25d366] text-white' : 'bg-gray-100 text-gray-500'}`}>{f.l}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => {
            const isMentionedInLast = isGrp(c) && myName && (c.last_message || '').toLowerCase().includes(`@${myName.toLowerCase()}`);
            return (
              <div key={c.id} className={`flex items-center gap-2.5 px-3 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 ${cur?.id === c.id ? 'bg-[#f0f2f5]' : ''}`}>
                <div onClick={() => selectChat(c)} className="flex items-center gap-2.5 flex-1 min-w-0">
                  <ProfilePic phone={c.contact_phone || c.remote_jid} tenantId={tenant.id} name={chatDisplayName(c)} isGroup={isGrp(c)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xs truncate">
                        {chatDisplayName(c)}
                        {isGrp(c) && <span className="ml-1 text-[8px] bg-gray-100 text-gray-400 px-1 rounded">GRUPO</span>}
                      </p>
                      <span className="text-[9px] text-gray-400 flex-shrink-0 ml-1">{fmt(c.last_message_time)}</span>
                    </div>
                    <div className="flex justify-between mt-0.5 items-center">
                      <p className="text-[10px] text-gray-400 truncate">{c.last_message}</p>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                        {isMentionedInLast && (
                          <span className="bg-teal-500 text-white text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5">
                            <AtSign className="w-2 h-2" />
                          </span>
                        )}
                        {Number(c.unread_count) > 0 && (
                          <span className="bg-[#25d366] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {Number(c.unread_count) > 9 ? '9+' : c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteChat(c.id); }} className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0"><Trash2 className="w-3 h-3" /></button>
              </div>
            );
          })}
        </div>
        <div className="p-2 border-t border-gray-100">
          <button onClick={() => { setShowTrash(true); loadDeletedChats(); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-all"><RotateCcw className="w-3.5 h-3.5" /> Lixeira</button>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {cur ? (
          <>
            <div className="bg-[#f0f2f5] px-4 py-2.5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <ProfilePic phone={cur.contact_phone || cur.remote_jid} tenantId={tenant.id} name={chatDisplayName(cur)} size="w-8 h-8" isGroup={isGrp(cur)} />
                  <div>
                    <p className="font-bold text-sm">{chatDisplayName(cur)}</p>
                    {isGrp(cur) ? (
                      <button onClick={() => setShowParticipants(v => !v)} className="text-[9px] text-[#25d366] font-bold hover:underline flex items-center gap-0.5 transition-all">
                        <Users2 className="w-2.5 h-2.5" />
                        {loadingPart ? 'Carregando...' : participants.length > 0 ? `${participants.length} participantes` : 'Ver participantes'}
                      </button>
                    ) : (
                      <p className="text-[10px] text-gray-400 font-mono">{cur.contact_phone}</p>
                    )}
                  </div>
                  {lead && <button onClick={() => setShowEdit(true)} className="ml-2 p-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-100"><Edit2 className="w-3 h-3" /></button>}
                  {!isGrp(cur) && lead && tenantAIOn && (
                    <button onClick={toggleLeadAI} title={leadAIOn ? 'IA ativa - clique para pausar' : 'IA pausada - clique para ativar'} className={`ml-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${leadAIOn ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      <Bot className={`w-3 h-3 ${leadAIOn ? '' : 'opacity-40'}`} /> {leadAIOn ? 'IA ativa' : 'IA pausada'}
                    </button>
                  )}
                  {!isGrp(cur) && lead && !tenantAIOn && <span className="ml-1 flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-400 rounded-lg text-[9px] font-bold"><Bot className="w-3 h-3 opacity-40" /> IA desligada</span>}
                </div>
                {renderStageButtons()}
              </div>
            </div>

            {!isGrp(cur) && lead && <LeadSummaryCard lead={lead} onRefresh={handleLeadContextRefresh} compact={true} />}

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ backgroundColor: '#eae6df' }}>
              {msgs.map(m => {
                const fromMe = Number(m.is_from_me) === 1 || m.is_from_me === true;
                const hasMedia = m.media_url && m.message_type !== 'text';
                const isPlaceholder = ['[Imagem]','[Audio]','[Video]','[Documento]','[Sticker]','[Localizacao]','[Contato]','[Mensagem]','[Reacao]'].includes(m.content);
                const isAI = m.sender_name === 'IA';
                const isMentionedMsg = !fromMe && mentionsMe(m.content);
                // Reaction real: emoji armazenado (nao placeholder)
                const isReaction = m.message_type === 'reaction' && m.content && !m.content.startsWith('[');
                if (isReaction) return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} my-0.5`}>
                    <div className="flex items-center gap-1.5 bg-white/80 border border-gray-200 rounded-full px-2.5 py-1 shadow-sm">
                      <span className="text-lg leading-none">{m.content}</span>
                      {m.sender_name && <span className="text-[9px] text-gray-400 font-bold">{m.sender_name}</span>}
                      <span className="text-[8px] text-gray-300">{fmt(m.timestamp)}</span>
                    </div>
                  </div>
                );
                return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group items-end gap-1`}>
                    {/* Emoji picker no lado oposto da bolha, visivel no hover */}
                    {fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1 py-0.5 shadow-sm mb-1 self-end">
                        {REACTION_EMOJIS.map(emoji => (
                          <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch {} }}
                            className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-100" title={`Reagir com ${emoji}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className={`max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm transition-all ${
                      fromMe
                        ? (isAI ? 'bg-purple-50 border border-purple-100' : 'bg-[#d9fdd3]')
                        : isMentionedMsg
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-white'
                    }`}>
                      {isMentionedMsg && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-[8px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded px-1 py-0.5 flex items-center gap-0.5">
                            <AtSign className="w-2 h-2" /> voce foi mencionado
                          </span>
                        </div>
                      )}
                      {m.sender_name && <p className={`text-[10px] font-bold mb-0.5 flex items-center gap-1 ${isAI ? 'text-purple-600' : fromMe ? 'text-[#075e54]' : 'text-[#6b7280]'}`}>{isAI && <Bot className="w-2.5 h-2.5" />}{m.sender_name}</p>}
                      {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} />}
                      {m.content && !isPlaceholder && renderText(m.content, myName)}
                      {m.content && isPlaceholder && !hasMedia && <p className="text-[13px] text-gray-500 italic">{m.content}</p>}
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        <span className="text-[9px] text-gray-500">{fmt(m.timestamp)}</span>
                        {fromMe && getStatus(m.status)}
                      </div>
                    </div>
                    {!fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1 py-0.5 shadow-sm mb-1 self-end">
                        {REACTION_EMOJIS.map(emoji => (
                          <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch {} }}
                            className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-100" title={`Reagir com ${emoji}`}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            {file && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2"><Paperclip className="w-4 h-4 text-gray-400" /><span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-red-500 font-bold">Cancelar</button>
                  <button onClick={sendFile} disabled={sending} className="px-3 py-1 bg-[#25d366] text-white text-xs font-bold rounded-lg disabled:opacity-50">Enviar</button>
                </div>
              </div>
            )}

            {/* Input area — textarea com Shift+Enter + dropdown @ */}
            <div className="bg-[#f0f2f5] px-3 py-2.5 flex items-end gap-2 border-t border-gray-200 relative">
              {mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20 max-h-52 overflow-y-auto">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1.5">
                    <AtSign className="w-3 h-3 text-[#25d366]" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Mencionar participante</span>
                  </div>
                  {mentionSuggestions.map((p, i) => (
                    <button key={p.jid || p.phone || i} onClick={() => selectMention(p)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${i === mentionIdx ? 'bg-[#f0f2f5]' : ''}`}>
                      <ParticipantAvatar name={p.name} phone={p.phone} size="w-7 h-7" textSize="text-[9px]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-gray-800 truncate">{p.name || p.phone || 'Contato'}</p>
                          {p.admin === 'superadmin' && <span className="text-[7px] bg-red-50 text-red-500 font-bold px-1 rounded flex items-center gap-0.5"><Crown className="w-1.5 h-1.5" />dono</span>}
                          {p.admin === 'admin' && <span className="text-[7px] bg-amber-50 text-amber-600 font-bold px-1 rounded flex items-center gap-0.5"><Shield className="w-1.5 h-1.5" />admin</span>}
                        </div>
                        {p.name && p.phone && <p className="text-[9px] text-gray-400 font-mono">{p.phone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
              <button onClick={() => fileRef.current?.click()} className="p-2 hover:bg-gray-200 rounded-full flex-shrink-0 mb-0.5"><Paperclip className="w-4 h-4 text-gray-500" /></button>
              {/* TEXTAREA: Enter envia, Shift+Enter quebra linha */}
              <textarea
                ref={inputRef}
                value={msg}
                onChange={handleMsgChange}
                onKeyDown={handleKeyDown}
                disabled={sending}
                rows={1}
                placeholder={isGrp(cur) ? 'Mensagem... (@ para mencionar)' : 'Mensagem...'}
                className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#25d366] resize-none overflow-y-auto leading-relaxed"
                style={{ maxHeight: '120px' }}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              />
              <button onClick={send} disabled={sending || !msg.trim()} className="p-2 bg-[#25d366] text-white rounded-full disabled:opacity-40 flex-shrink-0 mb-0.5"><Send className="w-4 h-4" /></button>
            </div>

            {/* Drawer de participantes */}
            {showParticipants && isGrp(cur) && (
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 z-10 flex flex-col shadow-2xl">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#f0f2f5]">
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1.5"><Users2 className="w-3.5 h-3.5 text-[#128c7e]" /> Participantes</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{participants.length} {participants.length === 1 ? 'pessoa' : 'pessoas'} no grupo</p>
                  </div>
                  <button onClick={() => setShowParticipants(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                {loadingPart ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : participants.length === 0 ? (
                  <div className="py-10 text-center text-gray-400">
                    <Users2 className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">Sem participantes</p>
                    <p className="text-[10px] mt-1">Nao foi possivel carregar</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    {participants.filter(p => p.admin).length > 0 && (
                      <div className="px-3 pt-3 pb-1">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Administradores</span>
                      </div>
                    )}
                    {participants.filter(p => p.admin).map((p, i) => (
                      <ParticipantRow key={p.jid || i} p={p} onMention={() => {
                        const name = p.name || p.phone || 'Contato';
                        setMsg(prev => prev + `@${name} `);
                        setShowParticipants(false);
                        setTimeout(() => inputRef.current?.focus(), 10);
                      }} />
                    ))}
                    {participants.filter(p => p.admin).length > 0 && participants.filter(p => !p.admin).length > 0 && (
                      <div className="px-3 pt-3 pb-1 border-t border-gray-100">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Membros</span>
                      </div>
                    )}
                    {participants.filter(p => !p.admin).map((p, i) => (
                      <ParticipantRow key={p.jid || i} p={p} onMention={() => {
                        const name = p.name || p.phone || 'Contato';
                        setMsg(prev => prev + `@${name} `);
                        setShowParticipants(false);
                        setTimeout(() => inputRef.current?.focus(), 10);
                      }} />
                    ))}
                  </div>
                )}
                <div className="p-2 border-t border-gray-100">
                  <button onClick={() => loadParticipants(cur.remote_jid)} disabled={loadingPart}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-gray-400 hover:text-[#075e54] hover:bg-gray-50 rounded-lg font-bold transition-all disabled:opacity-40">
                    <RefreshCw className={`w-3 h-3 ${loadingPart ? 'animate-spin' : ''}`} /> Atualizar lista
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm font-bold text-gray-400">Selecione uma conversa</p></div>
          </div>
        )}
      </div>

      {showEdit && lead && <EditLeadModal lead={lead} columns={columns} onClose={() => setShowEdit(false)} onSave={async data => { await api.updateLead(lead.id, data); setLead({ ...lead, ...data }); setShowEdit(false); onRefresh(); }} onRefresh={() => loadLead(cur)} />}
      {showTrash && <TrashModal chats={deletedChats} loading={loadingTrash} onClose={() => setShowTrash(false)} onRestore={restoreChat} chatDisplayName={chatDisplayName} isGrp={isGrp} fmt={fmt} />}
    </div>
  );
}

function ParticipantRow({ p, onMention }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <ParticipantAvatar name={p.name} phone={p.phone} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-bold text-xs truncate">{p.name || p.phone || 'Contato desconhecido'}</p>
          {p.admin === 'superadmin' && <Crown className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />}
          {p.admin === 'admin' && <Shield className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />}
        </div>
        {p.name && p.phone && <p className="text-[9px] text-gray-400 font-mono">{p.phone}</p>}
        {!p.name && !p.phone && p.jid && <p className="text-[9px] text-gray-300 font-mono truncate">{p.jid.split('@')[0]}</p>}
      </div>
      {hover && (
        <button onClick={onMention} title="Mencionar no chat"
          className="p-1 text-[#25d366] hover:bg-[#25d366]/10 rounded transition-all flex-shrink-0">
          <AtSign className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function TrashModal({ chats, loading, onClose, onRestore, chatDisplayName, isGrp, fmt }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-gray-400" /><h2 className="font-bold text-sm">Lixeira</h2>{chats.length > 0 && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full font-bold">{chats.length}</span>}</div>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? <div className="py-12 text-center text-gray-400 text-xs">Carregando...</div>
          : chats.length === 0 ? (
            <div className="py-12 text-center text-gray-400"><Trash2 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-xs font-bold">Lixeira vazia</p><p className="text-[10px] mt-1">Conversas excluidas aparecem aqui</p></div>
          ) : chats.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate">{chatDisplayName(c)}{isGrp(c) && <span className="ml-1 text-[8px] bg-gray-100 text-gray-400 px-1 rounded">GRUPO</span>}</p>
                <p className="text-[10px] text-gray-400 truncate">{c.last_message}</p>
                <p className="text-[9px] text-gray-300 mt-0.5">Excluido em {fmt(c.deleted_at)}</p>
              </div>
              <button onClick={() => onRestore(c.id)} className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-[#25d366]/10 text-[#075e54] rounded-lg text-[10px] font-bold hover:bg-[#25d366]/20 transition-all"><RotateCcw className="w-3 h-3" /> Restaurar</button>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100"><p className="text-[10px] text-gray-400 text-center">Conversas restauradas voltam para a lista principal com o historico intacto</p></div>
      </div>
    </div>
  );
}

function EditLeadModal({ lead, columns, onClose, onSave, onRefresh }) {
  const [f, setF] = useState({ name: lead.name || '', phone: lead.phone || '', email: lead.email || '', stage: lead.stage || '', notes: lead.notes || '' });
  const [custom, setCustom] = useState(() => { try { return JSON.parse(lead.custom_data || '{}'); } catch { return {}; } });
  const [nf, setNf] = useState('');
  const [localLead, setLocalLead] = useState(lead);
  const handleRefreshContext = async () => { try { const result = await api.refreshLeadContext(lead.id); if (result?.lead) { setLocalLead(prev => ({ ...prev, ...result.lead })); onRefresh?.(); } } catch {} };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Editar Lead</h2>
        <div className="space-y-3">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Telefone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          {columns.length > 0 && <div><label className="text-[10px] font-bold text-gray-400 uppercase">Etapa</label><select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">{columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Observacoes</label><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <LeadSummaryCard lead={localLead} onRefresh={handleRefreshContext} compact={false} />
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
  const filtered = leads.filter(l => { if (stageFilter !== 'all' && l.stage !== stageFilter) return false; return (l.name || '').toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search); });
  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative"><Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm shadow-sm w-56" /></div>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs shadow-sm"><option value="all">Todas as etapas</option>{columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Lead</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase"><tr><th className="p-3">Nome</th><th className="p-3">Telefone</th><th className="p-3">Contexto IA</th><th className="p-3">Etapa</th><th className="p-3">Origem</th><th className="p-3">Tempo</th><th className="p-3 text-right">Acoes</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(l => {
              const colInfo = columns.find(c => c.id === l.stage);
              const c = CM[colInfo?.color] || CM.zinc;
              const days = daysAgo(l.updated_at);
              return (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-bold text-xs">{l.name}</td>
                  <td className="p-3 text-xs text-gray-400 font-mono">{l.phone}</td>
                  <td className="p-3 max-w-[200px]">{l.conversation_summary ? <p className="text-[9px] text-amber-700 bg-amber-50 rounded px-1.5 py-1 line-clamp-2 italic">{l.conversation_summary}</p> : <span className="text-[9px] text-gray-300">Sem resumo</span>}</td>
                  <td className="p-3">{colInfo ? <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${c.light} ${c.text}`}>{colInfo.name}</span> : <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded">{l.stage || '-'}</span>}</td>
                  <td className="p-3">{l.source === 'whatsapp' ? <span className="text-[9px] font-bold text-green-700 bg-green-50 rounded px-1.5 py-0.5 flex items-center gap-0.5 w-fit"><Zap className="w-2.5 h-2.5" /> WhatsApp</span> : <span className="text-[9px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{l.source || 'manual'}</span>}</td>
                  <td className="p-3"><span className={`text-[10px] ${days > 7 ? 'text-red-600 font-bold' : days > 2 ? 'text-amber-600' : 'text-gray-400'}`}>{days}d</span></td>
                  <td className="p-3"><div className="flex gap-1 justify-end items-center">{l.phone && <button onClick={() => onOpenChat(l.phone)} className="flex items-center gap-1 px-2 py-1 bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#075e54] rounded text-[9px] font-bold"><MessageCircle className="w-3 h-3" /> Conversar</button>}<button onClick={() => setEditLead(l)} className="text-blue-400 p-1"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={async () => { if (confirm('Deletar?')) { await api.deleteLead(l.id); onRefresh(); } }} className="text-gray-300 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-xs">Nenhum lead</div>}
      </div>
      {showCreate && <LeadCreateModal tenant={tenant} columns={columns} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); onRefresh(); }} />}
      {editLead && <EditLeadModal lead={editLead} columns={columns} onClose={() => setEditLead(null)} onSave={async data => { await api.updateLead(editLead.id, data); setEditLead(null); onRefresh(); }} onRefresh={onRefresh} />}
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
          {columns.length > 0 && <select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">{columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
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
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#25d366] rounded-full animate-pulse" /><span className="text-[#25d366] font-bold text-sm">Conectado</span></div>
              <button onClick={async () => { await api.disconnectWhatsApp(tenant.id); ck(); }} className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Desconectar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-300 rounded-full" /><span className="text-gray-400 text-sm">Desconectado</span></div>
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="Token..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono" />
              <button onClick={async () => { setLd(true); try { await api.connectWhatsApp(tenant.id, token); setToken(''); ck(); } catch { alert('Erro'); } finally { setLd(false); } }} disabled={ld || !token.trim()} className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50">{ld ? 'Salvando...' : 'Salvar'}</button>
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
  const withSummary = leads.filter(l => l.conversation_summary).length;
  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Analytics</h2>
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[{l:'Total',v:t,color:'text-blue-600',bg:'bg-blue-50'},{l:'WhatsApp',v:bySource.w,color:'text-green-600',bg:'bg-green-50'},{l:'Clientes',v:wonCount,color:'text-emerald-700',bg:'bg-emerald-50'},{l:'Perdidos',v:lostCount,color:'text-red-600',bg:'bg-red-50'},{l:'Com Contexto',v:withSummary,color:'text-amber-700',bg:'bg-amber-50'}].map((m,i) => (
          <div key={i} className={`${m.bg} border border-gray-100 rounded-xl p-4 shadow-sm`}><p className={`text-[10px] font-bold uppercase mb-1 ${m.color}`}>{m.l}</p><p className={`text-3xl font-black ${m.color}`}>{m.v}</p></div>
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
                  <div className="flex justify-between mb-1"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${c.bg}`} /><span className="text-xs font-bold text-gray-600">{col.name}</span></div><span className="text-[10px] text-gray-400">{col.count} ({p.toFixed(0)}%)</span></div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.bg}`} style={{ width: `${Math.max(p, 1)}%` }} /></div>
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
      <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">Conhecimento</h2><button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Novo</button></div>
      <div className="grid grid-cols-2 gap-4">
        {cats.map(cat => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">{cat}</h3>
            {knowledge.filter(k => k.category === cat).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2 flex justify-between items-start gap-2">
                <p className="text-xs text-gray-700 leading-relaxed flex-1">{item.answer}</p>
                <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteKnowledge(item.id); onRefresh(); } }} className="flex-shrink-0 mt-0.5"><Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" /></button>
              </div>
            ))}
            {knowledge.filter(k => k.category === cat).length === 0 && <p className="text-[10px] text-gray-300 text-center py-3">Vazio</p>}
          </div>
        ))}
      </div>
      {show && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"><h2 className="font-bold mb-1">Novo conteudo</h2><p className="text-[11px] text-gray-400 mb-4">Escreva qualquer informacao sobre o seu negocio. A IA decide o que usar em cada conversa.</p><KnowledgeForm tenant={tenant} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh(); }} /></div></div>)}
    </div>
  );
}

function KnowledgeForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ category: 'FAQ', content: '' });
  return (
    <form onSubmit={async e => { e.preventDefault(); await api.createKnowledge({ category: f.category, question: f.category, answer: f.content, tenantId: tenant.id }); onSuccess(); }} className="space-y-3">
      <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option>Produtos/Servicos</option><option>Precos</option><option>Agendamento</option><option>FAQ</option></select>
      <textarea placeholder="Ex: Atendemos de segunda a sexta das 8h as 18h..." value={f.content} onChange={e => setF({ ...f, content: e.target.value })} rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
      <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button></div>
    </form>
  );
}

function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">Equipe</h2><button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Usuario</button></div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase"><tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Funcao</th><th className="p-3">Permissoes</th><th className="p-3 text-right">Acoes</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const perms = (() => { try { return JSON.parse(u.permissions || '[]'); } catch { return []; } })();
              return (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-xs">{u.name}</td>
                  <td className="p-3 text-xs text-gray-400">{u.email}</td>
                  <td className="p-3"><span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${u.role==='super_admin'?'bg-purple-50 text-purple-500':u.role==='client_admin'?'bg-amber-50 text-amber-600':'bg-blue-50 text-blue-500'}`}>{u.role==='super_admin'?'Mestre':u.role==='client_admin'?'Admin':'Usuario'}</span></td>
                  <td className="p-3 text-[9px] text-gray-400">{u.role==='client_user'?perms.join(', ')||'Nenhuma':''}</td>
                  <td className="p-3 text-right"><div className="flex gap-1 justify-end">{u.role==='client_user'&&<button onClick={()=>setEditing(u)} className="text-blue-400"><Edit2 className="w-3.5 h-3.5" /></button>}{u.id!==currentUser.id&&<button onClick={async()=>{if(confirm('Deletar?')){await api.deleteUser(u.id);onRefresh();}}} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(show||editing)&&<UserModal user={editing} tenant={tenant} onClose={()=>{setShow(false);setEditing(null);}} onSuccess={()=>{setShow(false);setEditing(null);onRefresh();}} />}
    </div>
  );
}

function UserModal({ user, tenant, onClose, onSuccess }) {
  const allT = ['kanban','chat','leads','whatsapp','analytics','knowledge','team','settings'];
  const [f, setF] = useState({ name: user?.name||'', email: user?.email||'', password: '', role: user?.role||'client_user', permissions: (()=>{try{return JSON.parse(user?.permissions||'[]')}catch{return[]}})() });
  const tp = p => setF({...f, permissions: f.permissions.includes(p)?f.permissions.filter(x=>x!==p):[...f.permissions,p]});
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">{user?'Editar':'Novo'} Usuario</h2>
        <form onSubmit={async e=>{e.preventDefault();try{if(user){await api.updateUser(user.id,{name:f.name,email:f.email,role:f.role,permissions:f.permissions,...(f.password?{password:f.password}:{})});}else{await api.createUser({...f,tenantId:tenant.id});}onSuccess();}catch(err){alert('Erro: '+err.message);}}} className="space-y-3">
          <input placeholder="Nome" value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="password" placeholder={user?'Nova senha (vazio=manter)':'Senha'} value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm p-2.5" required={!user} />
          <select value={f.role} onChange={e=>setF({...f,role:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option value="client_user">Usuario</option><option value="client_admin">Admin</option></select>
          {f.role==='client_user'&&(<div className="border border-gray-200 rounded-xl p-3"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Permissoes</p><div className="grid grid-cols-2 gap-1.5">{allT.map(tab=>(<label key={tab} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer ${f.permissions.includes(tab)?'bg-[#25d366]/10 text-[#075e54] font-bold':'bg-gray-50 text-gray-400'}`}><input type="checkbox" checked={f.permissions.includes(tab)} onChange={()=>tp(tab)} className="w-3 h-3" />{tab}</label>))}</div></div>)}
          <div className="flex gap-2 pt-1"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button></div>
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
    try { await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt: prompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: tenant.active }); alert('Salvo!'); onRefresh(); }
    catch { alert('Erro'); } finally { setSaving(false); }
  };

  const toggleAI = async () => {
    setTogglingAI(true);
    try { await api.setTenantAI(tenant.id, !aiEnabled); setAiEnabled(!aiEnabled); onRefresh(); }
    catch { alert('Erro ao alterar IA'); } finally { setTogglingAI(false); }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="font-bold text-lg">Configuracoes</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><Bot className="w-4 h-4 text-purple-600" /><h3 className="font-bold text-sm">Assistente IA</h3><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${aiEnabled?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-400'}`}>{aiEnabled?'ATIVO':'DESLIGADO'}</span></div>
            <p className="text-xs text-gray-400 leading-relaxed">Quando ativo, a IA responde automaticamente mensagens recebidas de leads usando a base de conhecimento e o historico da conversa. Voce pode pausar individualmente por contato na tela de Conversas.</p>
          </div>
          <button onClick={toggleAI} disabled={togglingAI} className={`flex-shrink-0 w-12 h-6 rounded-full transition-all relative ${aiEnabled?'bg-purple-500':'bg-gray-300'} disabled:opacity-50`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiEnabled?'left-6':'left-0.5'}`} /></button>
        </div>
        {aiEnabled&&<div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-purple-600 bg-purple-50 rounded-lg px-3 py-2"><Bot className="w-3 h-3 flex-shrink-0" />IA ativa — responde com memoria de sessao, resumo do lead e base de conhecimento</div>}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-gray-400" /> Personalidade da IA</h3>
        <p className="text-[10px] text-gray-400 mb-3">Defina como a IA deve se apresentar. Se vazio, usa atendimento padrao cordial.</p>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={6} placeholder={"Exemplo:\nVoce e a assistente da Clinica Exemplo.\nSe apresente como Ana e seja sempre educada.\nNao marque consultas sem confirmar disponibilidade."} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3 font-mono text-xs leading-relaxed" />
        <button onClick={savePrompt} disabled={saving} className="px-5 py-2 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50">{saving?'Salvando...':'Salvar prompt'}</button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-amber-700 uppercase mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> Memoria da IA</p>
        <div className="space-y-1 text-[11px] text-amber-800">
          <p>A IA mantem 3 camadas de contexto por lead:</p>
          <p>1. <b>Sessao ativa</b> — historico das ultimas mensagens (24h)</p>
          <p>2. <b>Resumo persistente</b> — contexto estrategico salvo no lead</p>
          <p>3. <b>Perfil estruturado</b> — objetivo, dor, estagio e interesse detectados automaticamente</p>
          <p className="mt-1 text-amber-600">O resumo aparece no modal do lead e no header do chat. Use o botao de atualizar para gerar um novo resumo manualmente.</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Como funciona</p>
        <div className="space-y-1 text-[11px] text-gray-500">
          <p>1. IA ligada aqui responde todos os leads automaticamente</p>
          <p>2. Base de Conhecimento e a fonte das respostas</p>
          <p>3. Em Conversas: botao IA ativa/pausada por contato individual</p>
          <p>4. Mensagens da IA aparecem com badge roxo na conversa</p>
          <p>5. Resumo atualizado automaticamente na 3a, 7a e 15a mensagem do lead</p>
        </div>
      </div>
    </div>
  );
}

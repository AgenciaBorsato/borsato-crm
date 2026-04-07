import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Search, Send, X, Check, Trash2, Edit2, Paperclip, Plus,
  Users2, CheckCheck, RotateCcw, RefreshCw, AtSign, Crown, Shield, Bot,
  Reply, Forward, CornerUpRight, Phone, Bell, CalendarClock, Clock, Volume2, VolumeX
} from 'lucide-react';
import { POLL_INTERVAL, CM } from '../constants';
import { renderText } from '../utils/renderText';
import api from '../api';
import ProfilePic, { ParticipantAvatar } from './ProfilePic';
import MediaBubble from './MediaBubble';
import LeadSummaryCard from './LeadSummaryCard';
import EditLeadModal from './EditLeadModal';

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
          className="p-1 text-blue-700 hover:bg-blue-50 rounded transition-all flex-shrink-0">
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
              <button onClick={() => onRestore(c.id)} className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-semibold hover:bg-blue-100 transition-all"><RotateCcw className="w-3 h-3" /> Restaurar</button>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100"><p className="text-[10px] text-gray-400 text-center">Conversas restauradas voltam para a lista principal com o historico intacto</p></div>
      </div>
    </div>
  );
}

export default function ChatView({ tenant, columns, onRefresh, requestedPhone, onPhoneHandled, currentUser }) {
  const [chats, setChats] = useState([]);
  const [cur, setCur] = useState(() => { const s = localStorage.getItem(`currentChat_${tenant.id}`); return s ? JSON.parse(s) : null; });
  const [lead, setLead] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [filter, setFilter] = useState('all');
  const [files, setFiles] = useState([]);
  const [showTrash, setShowTrash] = useState(false);
  const [deletedChats, setDeletedChats] = useState([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const localMediaCache = useRef({});
  const [participants, setParticipants] = useState([]);
  const [loadingPart, setLoadingPart] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [forwardSearch, setForwardSearch] = useState('');
  const [contactResults, setContactResults] = useState([]);
  const [searchingContacts, setSearchingContacts] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatName, setNewChatName] = useState('');
  const [showQuickFollowUp, setShowQuickFollowUp] = useState(false);
  const [showScheduleMsg, setShowScheduleMsg] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const mentionStartRef = useRef(-1);
  const inputRef = useRef(null);
  const curRef = useRef(cur);
  const endRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const userScrolledUpRef = useRef(false);
  const fileRef = useRef(null);
  const prevUnreadRef = useRef(0);
  const initialLoadRef = useRef(true);
  const myName = currentUser?.name || '';
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('borsato_sound') !== 'off');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('borsato_sound', next ? 'on' : 'off');
  };

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [soundEnabled]);

  useEffect(() => { curRef.current = cur; }, [cur]);
  useEffect(() => {
    if (cur) localStorage.setItem(`currentChat_${tenant.id}`, JSON.stringify(cur));
    else localStorage.removeItem(`currentChat_${tenant.id}`);
  }, [cur, tenant.id]);
  useEffect(() => {
    // Inicializar leituras para usuario que nunca abriu o CRM (evita historico como nao lido)
    const initKey = `chatReadsInit_${tenant.id}_${currentUser?.id || 'u'}`;
    if (!sessionStorage.getItem(initKey)) {
      api.markAllChatsRead(tenant.id).then(() => sessionStorage.setItem(initKey, '1')).catch(() => {});
    }
    load(); const i = setInterval(load, POLL_INTERVAL); return () => clearInterval(i);
  }, [tenant.id]);
  useEffect(() => {
    if (cur) { loadMsgs(cur.id); loadLead(cur); api.markChatRead(cur.id).catch(() => {}); const i = setInterval(() => loadMsgs(cur.id), POLL_INTERVAL); return () => clearInterval(i); }
  }, [cur?.id]);
  useEffect(() => {
    if (cur && isGrp(cur)) { setShowParticipants(false); setMentionQuery(null); mentionStartRef.current = -1; loadParticipants(cur.remote_jid); }
    else { setParticipants([]); setShowParticipants(false); setMentionQuery(null); }
  }, [cur?.id]);
  useEffect(() => {
    if (!requestedPhone || chats.length === 0) return;
    const clean = requestedPhone.replace(/\D/g, '');
    const match = chats.find(c => (c.contact_phone || '').replace(/\D/g, '') === clean || (c.remote_jid || '').replace(/[^0-9]/g, '').includes(clean));
    if (match) { selectChat(match); onPhoneHandled?.(); }
  }, [requestedPhone, chats]);
  // Scroll inteligente: so rola para o final se usuario nao estiver lendo mensagens antigas
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [msgs]);
  // Resetar scroll ao trocar de conversa
  useEffect(() => {
    userScrolledUpRef.current = false;
    endRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [cur?.id]);
  useEffect(() => {
    const handleVisibility = () => { if (!document.hidden) { const total = chats.reduce((sum, c) => sum + (Number(c.user_unread_count) || 0), 0); document.title = total > 0 ? `(${total}) Borsato CRM` : 'Borsato CRM'; } };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { document.removeEventListener('visibilitychange', handleVisibility); document.title = 'Borsato CRM'; };
  }, [chats]);

  const load = async () => {
    try {
      const chatList = await api.getChats(tenant.id); setChats(chatList);
      const ac = curRef.current;
      if (ac) { const upd = chatList.find(c => c.id === ac.id); if (upd) setCur(upd); }
      const totalUnread = chatList.reduce((sum, c) => sum + (Number(c.user_unread_count) || 0), 0);
      if (!initialLoadRef.current && totalUnread > prevUnreadRef.current) playNotificationSound();
      document.title = totalUnread > 0 ? `(${totalUnread}) Borsato CRM` : 'Borsato CRM';
      prevUnreadRef.current = totalUnread; initialLoadRef.current = false;
    } catch {}
  };
  const loadMsgs = async (id) => { try { setMsgs(await api.getChatMessages(id, 100, 0)); } catch {} };
  const loadLead = async (c) => {
    if (isGrp(c)) { setLead(null); return; }
    const ph = c.contact_phone || c.remote_jid?.split('@')[0];
    if (!ph) { setLead(null); return; }
    try { setLead(await api.getLeadByPhone(ph, tenant.id)); } catch { setLead(null); }
  };
  const loadParticipants = async (groupJid) => {
    setLoadingPart(true);
    try { const d = await api.getGroupParticipants(tenant.id, groupJid); setParticipants(d?.participants || []); } catch {}
    finally { setLoadingPart(false); }
  };
  const loadDeletedChats = async () => { setLoadingTrash(true); try { setDeletedChats(await api.getDeletedChats(tenant.id)); } catch {} finally { setLoadingTrash(false); } };
  const restoreChat = async (chatId) => {
    try { await api.restoreChat(chatId); setDeletedChats(prev => prev.filter(c => c.id !== chatId)); await load(); }
    catch { alert('Erro ao restaurar conversa'); }
  };

  const isGrp = c => Number(c.is_group) === 1 || c.is_group === true;
  const chatDisplayName = c => { const name = c.contact_name; if (name && !/^\d{10,}$/.test(name)) return name; if (!isGrp(c)) return c.contact_phone || c.remote_jid || ''; return 'Grupo'; };
  const selectChat = c => { setCur(c); setSearch(''); };
  const mentionsMe = useCallback((content) => { if (!myName || !content) return false; return content.toLowerCase().includes(`@${myName.toLowerCase()}`); }, [myName]);

  const mentionSuggestions = (mentionQuery !== null && isGrp(cur) && participants.length > 0)
    ? participants.filter(p => (p.name || p.phone || '').toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 8) : [];

  const selectMention = (p) => {
    const name = p.name || p.phone || 'Contato';
    const before = msg.slice(0, mentionStartRef.current);
    const after = msg.slice(mentionStartRef.current + 1 + (mentionQuery?.length || 0));
    setMsg(`${before}@${name} ${after}`); setMentionQuery(null); mentionStartRef.current = -1; setMentionIdx(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleMsgChange = (e) => {
    const val = e.target.value; const pos = e.target.selectionStart; setMsg(val);
    if (isGrp(cur) && participants.length > 0) {
      const m = val.slice(0, pos).match(/@([\w\u00C0-\u024F]*)$/);
      if (m) { mentionStartRef.current = m.index; setMentionQuery(m[1]); setMentionIdx(0); }
      else { setMentionQuery(null); mentionStartRef.current = -1; }
    }
  };

  const send = async () => {
    if (!msg.trim() || !cur) return;
    const ph = cur.remote_jid && (isGrp(cur) || cur.remote_jid.includes('@lid')) ? cur.remote_jid : cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true); setMentionQuery(null);
    try {
      await api.sendWhatsAppMessage(ph, msg, tenant.id, cur.id, replyTo?.id || null);
      setMsg(''); setReplyTo(null); if (inputRef.current) inputRef.current.style.height = 'auto';
      await loadMsgs(cur.id); await load();
    }
    catch (e) { alert(e.message || 'Erro ao enviar'); } finally { setSending(false); }
  };

  const handleForward = async (targetChat) => {
    if (!forwardMsg || !targetChat) return;
    try {
      await api.forwardMessage(forwardMsg.id, targetChat.id, tenant.id);
      setForwardMsg(null); setForwardSearch('');
      if (targetChat.id === cur?.id) await loadMsgs(cur.id);
      await load();
    } catch (e) { alert(e.message || 'Erro ao encaminhar'); }
  };

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx(i => Math.min(i + 1, mentionSuggestions.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') { e.preventDefault(); selectMention(mentionSuggestions[mentionIdx]); return; }
      if (e.key === 'Escape') { setMentionQuery(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !sending) { e.preventDefault(); send(); }
  };

  const handleFile = e => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const valid = [];
    for (const f of selected) {
      if (f.size > 10 * 1024 * 1024) { alert(`${f.name}: max 10MB`); continue; }
      valid.push(f);
    }
    if (valid.length) setFiles(prev => [...prev, ...valid]);
  };

  const handlePaste = e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles = [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const f = item.getAsFile();
        if (f && f.size <= 10 * 1024 * 1024) imageFiles.push(f);
        else if (f) alert('Imagem colada excede 10MB');
      }
    }
    if (imageFiles.length) setFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = idx => setFiles(prev => prev.filter((_, i) => i !== idx));

  const readFileAsDataURL = f => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(f);
  });

  const sendFiles = async () => {
    if (!files.length || !cur) return;
    const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try {
      for (const f of files) {
        const dataUrl = await readFileAsDataURL(f);
        const base64 = dataUrl.split(',')[1];
        const mt = f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'document';
        await api.sendWhatsAppMedia({ number: ph, base64, fileName: f.name, mediaType: mt, caption: '', tenantId: tenant.id, chatId: cur.id });
      }
      setFiles([]); if (fileRef.current) fileRef.current.value = '';
      const newMsgs = await api.getChatMessages(cur.id, 100, 0);
      setMsgs(newMsgs); await load();
    } catch (e) { alert('Erro: ' + e.message); }
    setSending(false);
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
    if (filter === 'unread' && !(Number(c.user_unread_count) > 0)) return false;
    if (!search) return true;
    return chatDisplayName(c).toLowerCase().includes(search.toLowerCase());
  });

  // Buscar contatos WhatsApp quando search tem 2+ chars e não encontra nos chats
  useEffect(() => {
    if (!search || search.length < 2 || filter === 'group') { setContactResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        setSearchingContacts(true);
        const results = await api.searchContacts(tenant.id, search);
        setContactResults(results || []);
      } catch { setContactResults([]); }
      finally { setSearchingContacts(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, tenant.id, filter]);

  const startNewChat = async (phone, name) => {
    try {
      const result = await api.startChat(phone, name, tenant.id);
      if (result?.chatId) {
        await load();
        setSearch(''); setContactResults([]); setShowNewChat(false); setNewChatPhone(''); setNewChatName('');
        // Selecionar o chat recém-criado
        setTimeout(() => {
          const newChat = chats.find(c => c.id === result.chatId) || { id: result.chatId, contact_phone: phone, contact_name: name, remote_jid: `${phone}@s.whatsapp.net`, is_group: 0 };
          selectChat(newChat);
        }, 500);
      }
    } catch (e) { alert(e.message || 'Erro ao criar conversa'); }
  };

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

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      <div className="w-[340px] min-w-[340px] border-r border-gray-200 flex flex-col bg-white">
        {/* Header da lista de chats */}
        <div className="bg-[#075e54] px-3 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-sm">Conversas</h2>
            <div className="flex items-center gap-1">
              <button onClick={toggleSound} className="w-8 h-8 bg-white/15 hover:bg-white/25 text-white rounded-lg flex items-center justify-center transition-colors" title={soundEnabled ? 'Desativar som' : 'Ativar som'}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
              </button>
              <button onClick={() => setShowNewChat(true)} className="w-8 h-8 bg-white/15 hover:bg-white/25 text-white rounded-lg flex items-center justify-center transition-colors" title="Nova conversa"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar conversa..." className="w-full bg-white/10 text-white placeholder-white/40 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:bg-white/15 transition-all" />
          </div>
          <div className="flex gap-1">
            {[{ id: 'all', l: 'Tudo' }, { id: 'individual', l: 'Contatos' }, { id: 'group', l: 'Grupos' }, { id: 'unread', l: 'Nao lidas' }].map(f => {
              const count = f.id === 'unread' ? chats.filter(c => Number(c.user_unread_count) > 0).length : null;
              return (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 py-1.5 text-[10px] font-semibold rounded-full transition-all flex items-center justify-center gap-1 ${filter === f.id ? 'bg-[#25d366] text-white shadow-sm' : 'bg-white/10 text-white/60 hover:bg-white/15 hover:text-white'}`}>
                  {f.l}
                  {count > 0 && <span className={`min-w-[14px] h-[14px] rounded-full text-[8px] font-bold flex items-center justify-center px-0.5 ${filter === f.id ? 'bg-white/25 text-white' : 'bg-red-500 text-white'}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => {
            const isMentionedInLast = isGrp(c) && myName && (c.last_message || '').toLowerCase().includes(`@${myName.toLowerCase()}`);
            const hasUnread = Number(c.user_unread_count) > 0;
            return (
              <div key={c.id} onClick={() => selectChat(c)} className={`group flex items-center gap-3 px-3 py-3 cursor-pointer transition-all border-b border-gray-100/60 ${cur?.id === c.id ? 'bg-[#075e54]/5 border-l-[3px] border-l-[#25d366]' : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}>
                <ProfilePic phone={c.contact_phone || c.remote_jid} tenantId={tenant.id} name={chatDisplayName(c)} isGroup={isGrp(c)} size="w-12 h-12" textSize="text-[11px]" cachedUrl={c.profile_pic_url} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-[13px] truncate ${hasUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{chatDisplayName(c)}{isGrp(c) && <span className="ml-1.5 text-[7px] bg-gray-100 text-gray-400 px-1 py-0.5 rounded font-medium align-middle">GRUPO</span>}</p>
                    <span className={`text-[10px] flex-shrink-0 ml-2 ${hasUnread ? 'text-[#25d366] font-semibold' : 'text-gray-400'}`}>{fmt(c.last_message_time)}</span>
                  </div>
                  <div className="flex justify-between mt-0.5 items-center">
                    <p className={`text-[11px] truncate ${hasUnread ? 'text-gray-600' : 'text-gray-400'}`}>{c.last_message}</p>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {Number(c.awaiting_response) === 1 && hasUnread && <span className="bg-red-500 text-white text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center" title="Aguardando resposta">!</span>}
                      {isMentionedInLast && <span className="bg-blue-600 text-white text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center"><AtSign className="w-2.5 h-2.5" /></span>}
                      {hasUnread && <span className="bg-[#25d366] text-white text-[9px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{Number(c.user_unread_count) > 9 ? '9+' : c.user_unread_count}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteChat(c.id); }} className="p-1 text-gray-300 hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
              </div>
            );
          })}
          {/* Contatos WhatsApp (resultados de busca) */}
          {search && contactResults.length > 0 && (
            <div className="border-t border-gray-200">
              <div className="px-3 py-2 bg-gray-50"><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Contatos WhatsApp</span></div>
              {contactResults.map(c => (
                <div key={c.id} onClick={() => startNewChat(c.phone, c.name || c.push_name || c.phone)}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-green-50/50 transition-colors border-b border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#25d366]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-[#075e54]">{(c.name || c.push_name || c.phone || '?').substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-gray-900 truncate">{c.name || c.push_name || c.phone}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{c.phone}</p>
                  </div>
                  <span className="text-[8px] text-[#075e54] font-bold bg-[#25d366]/10 px-2 py-0.5 rounded-full uppercase">Iniciar</span>
                </div>
              ))}
            </div>
          )}
          {search && search.length >= 2 && searchingContacts && (
            <div className="px-3 py-4 text-center text-[10px] text-gray-400">Buscando contatos...</div>
          )}
        </div>
        <div className="p-2 border-t border-gray-100">
          <button onClick={() => { setShowTrash(true); loadDeletedChats(); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg text-[11px] font-medium transition-all"><RotateCcw className="w-3 h-3" /> Lixeira</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {cur ? (
          <>
            <div className="bg-white px-4 py-3 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ProfilePic phone={cur.contact_phone || cur.remote_jid} tenantId={tenant.id} name={chatDisplayName(cur)} size="w-9 h-9" isGroup={isGrp(cur)} cachedUrl={cur.profile_pic_url} />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{chatDisplayName(cur)}</p>
                    {isGrp(cur) ? (
                      <button onClick={() => setShowParticipants(v => !v)} className="text-[10px] text-blue-700 font-medium hover:underline flex items-center gap-0.5">
                        <Users2 className="w-2.5 h-2.5" />{loadingPart ? 'Carregando...' : participants.length > 0 ? `${participants.length} participantes` : 'Ver participantes'}
                      </button>
                    ) : <p className="text-[11px] text-gray-400">{cur.contact_phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lead && (() => {
                    const activeCol = columns.find(col => col.id === lead.stage);
                    if (!activeCol) return null;
                    const cc = CM[activeCol.color] || CM.zinc;
                    return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${cc.light} ${cc.text}`}>{activeCol.name}</span>;
                  })()}
                  {!isGrp(cur) && lead && tenantAIOn && (
                    <button onClick={toggleLeadAI} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${leadAIOn ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                      <Bot className="w-4 h-4" /> {leadAIOn ? 'IA ativa' : 'IA pausada'}
                    </button>
                  )}
                  {lead && !isGrp(cur) && (
                    <div className="relative">
                      <button onClick={() => setShowQuickFollowUp(!showQuickFollowUp)} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-semibold transition-colors" title="Criar lembrete">
                        <Bell className="w-3.5 h-3.5" /> Follow Up
                      </button>
                      {showQuickFollowUp && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-56 py-1">
                          <p className="px-3 py-1.5 text-[9px] font-bold text-gray-400 uppercase">Lembrar de recontatar</p>
                          {[
                            { l: 'Em 1 hora', fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); return d; } },
                            { l: 'Em 3 horas', fn: () => { const d = new Date(); d.setHours(d.getHours() + 3); return d; } },
                            { l: 'Amanha as 9h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0); return d; } },
                            { l: 'Em 3 dias', fn: () => { const d = new Date(); d.setDate(d.getDate() + 3); d.setHours(9, 0, 0); return d; } },
                            { l: 'Em 1 semana', fn: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0); return d; } },
                          ].map(opt => (
                            <button key={opt.l} onClick={async () => {
                              const d = opt.fn();
                              try {
                                await api.createFollowUp({ tenantId: tenant.id, leadId: lead.id, leadName: lead.name || chatDisplayName(cur), leadPhone: lead.phone || cur.contact_phone, scheduledAt: d.toISOString(), note: '' });
                                setShowQuickFollowUp(false);
                              } catch { alert('Erro ao criar follow-up'); }
                            }} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                              <Clock className="w-3 h-3 text-gray-400" /> {opt.l}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {lead && (
                    <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Editar lead
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!isGrp(cur) && lead && <LeadSummaryCard lead={lead} onRefresh={handleLeadContextRefresh} compact={true} />}

            <div ref={scrollContainerRef} onScroll={() => {
              const el = scrollContainerRef.current;
              if (!el) return;
              userScrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 150;
            }} className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5 bg-[#efeae2]">
              {(() => {
                // Pre-process: marcar imagens agrupáveis (mesma direção, consecutivas, tipo image, sem caption real)
                const grouped = new Set();
                const imageGroups = [];
                for (let i = 0; i < msgs.length; i++) {
                  if (grouped.has(i)) continue;
                  const m = msgs[i];
                  const fromMe = Number(m.is_from_me) === 1;
                  const isImg = m.message_type === 'image' && (m.media_url || (fromMe && localMediaCache.current[m.id]));
                  const isPlaceholderContent = !m.content || m.content === '[image]' || m.content === '[Imagem]';
                  if (!isImg || !isPlaceholderContent) continue;
                  const group = [i];
                  for (let j = i + 1; j < msgs.length; j++) {
                    const n = msgs[j];
                    const nFromMe = Number(n.is_from_me) === 1;
                    if (nFromMe !== fromMe) break;
                    const nIsImg = n.message_type === 'image' && (n.media_url || (nFromMe && localMediaCache.current[n.id]));
                    const nIsPlaceholder = !n.content || n.content === '[image]' || n.content === '[Imagem]';
                    if (!nIsImg || !nIsPlaceholder) break;
                    // Dentro de 5 minutos
                    const timeDiff = Math.abs(new Date(n.timestamp) - new Date(m.timestamp));
                    if (timeDiff > 5 * 60 * 1000) break;
                    group.push(j);
                  }
                  if (group.length >= 2) {
                    group.forEach(idx => grouped.add(idx));
                    imageGroups.push({ startIdx: group[0], indices: group });
                  }
                }
                const groupStartMap = {};
                imageGroups.forEach(g => { groupStartMap[g.startIdx] = g; });

                return msgs.map((m, idx) => {
                  if (grouped.has(idx) && !groupStartMap[idx]) return null; // parte de grupo, renderizado pelo líder
                  if (groupStartMap[idx]) {
                    const g = groupStartMap[idx];
                    const gMsgs = g.indices.map(i => msgs[i]);
                    const fromMe = Number(gMsgs[0].is_from_me) === 1;
                    const lastMsg = gMsgs[gMsgs.length - 1];
                    return (
                      <div key={`group-${gMsgs[0].id}`} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-xl px-2 py-2 ${fromMe ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-100'}`}>
                          {gMsgs[0].sender_name && <p className="text-[10px] font-bold mb-1 text-gray-500">{gMsgs[0].sender_name}</p>}
                          <div className={`grid gap-1 ${gMsgs.length === 2 ? 'grid-cols-2' : gMsgs.length === 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                            {gMsgs.slice(0, 4).map((gm, gi) => (
                              <div key={gm.id} id={`msg-${gm.id}`} className={`relative overflow-hidden rounded-lg ${gMsgs.length === 3 && gi === 0 ? 'col-span-2' : ''}`}>
                                <MediaBubble msg={gm} tenantId={tenant.id} cachedSrc={fromMe ? (localMediaCache.current[gm.id] || null) : null} />
                                {gi === 3 && gMsgs.length > 4 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                    <span className="text-white text-2xl font-bold">+{gMsgs.length - 4}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-end gap-0.5 mt-1">
                            <span className="text-[9px] text-gray-400">{fmt(lastMsg.timestamp)}</span>
                            {fromMe && getStatus(lastMsg.status)}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  // Mensagem normal (não agrupada)
                const fromMe = Number(m.is_from_me) === 1 || m.is_from_me === true;
                const cachedSrc = fromMe ? (localMediaCache.current[m.id] || null) : null;
                const isMedia = ['image','video','document','audio','sticker'].includes(m.message_type);
                const hasMedia = isMedia && (m.media_url || cachedSrc);
                const isPlaceholder = ['[Imagem]','[Audio]','[Video]','[Documento]','[Sticker]','[Localizacao]','[Contato]','[Mensagem]','[Reacao]','[image]','[audio]','[video]','[document]','[sticker]','[location]','[contact]'].includes(m.content);
                const isAI = m.sender_name === 'IA';
                const isMentionedMsg = !fromMe && mentionsMe(m.content);
                const isReaction = m.message_type === 'reaction' && m.content && !m.content.startsWith('[');
                if (isReaction) return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} my-0.5`}>
                    <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-2.5 py-1">
                      <span className="text-lg leading-none">{m.content}</span>
                      {m.sender_name && <span className="text-[9px] text-gray-400 font-medium">{m.sender_name}</span>}
                      <span className="text-[8px] text-gray-300">{fmt(m.timestamp)}</span>
                    </div>
                  </div>
                );
                const isForwarded = m.content && m.content.startsWith('[Encaminhada]');
                return (
                  <div key={m.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'} group items-end gap-1`}>
                    {fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1 self-end">
                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm py-0.5 flex flex-col min-w-[110px]">
                          <button onClick={() => { setReplyTo(m); setTimeout(() => inputRef.current?.focus(), 50); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Reply className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Responder</span>
                          </button>
                          <button onClick={() => setForwardMsg(m)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Forward className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Encaminhar</span>
                          </button>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                          {REACTION_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch {} }}
                              className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-50">{emoji}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div id={`msg-${m.id}`} className={`max-w-[75%] rounded-xl px-3 py-2 transition-all ${
                      fromMe ? (isAI ? 'bg-purple-100/80 border border-purple-200' : (() => {
                          if (!m.sender_name) return 'bg-[#d9fdd3] border border-[#c5e8b7]';
                          const opColors = [
                            'bg-[#d9fdd3] border border-[#c5e8b7]',
                            'bg-blue-100 border border-blue-200',
                            'bg-indigo-100 border border-indigo-200',
                            'bg-teal-100 border border-teal-200',
                            'bg-cyan-100 border border-cyan-200',
                            'bg-emerald-100 border border-emerald-200',
                          ];
                          const h = Math.abs([...m.sender_name].reduce((a, c) => a + c.charCodeAt(0), 0));
                          return opColors[h % opColors.length];
                        })())
                      : isMentionedMsg ? 'bg-amber-50 border border-amber-200'
                      : 'bg-white border border-gray-100'
                    }`}>
                      {isForwarded && <div className="flex items-center gap-1 mb-0.5"><span className="text-[8px] font-medium text-gray-400 flex items-center gap-0.5"><CornerUpRight className="w-2 h-2" /> Encaminhada</span></div>}
                      {isMentionedMsg && <div className="flex items-center gap-1 mb-0.5"><span className="text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1 py-0.5 flex items-center gap-0.5"><AtSign className="w-2 h-2" /> mencionado</span></div>}
                      {m.sender_name && (() => {
                        const nameColors = [
                          { text: 'text-blue-600', bg: 'bg-blue-600' },
                          { text: 'text-emerald-600', bg: 'bg-emerald-600' },
                          { text: 'text-orange-600', bg: 'bg-orange-600' },
                          { text: 'text-pink-600', bg: 'bg-pink-600' },
                          { text: 'text-indigo-600', bg: 'bg-indigo-600' },
                          { text: 'text-red-600', bg: 'bg-red-600' },
                          { text: 'text-teal-600', bg: 'bg-teal-600' },
                          { text: 'text-purple-600', bg: 'bg-purple-600' },
                          { text: 'text-cyan-600', bg: 'bg-cyan-600' },
                          { text: 'text-amber-600', bg: 'bg-amber-600' },
                        ];
                        const hash = Math.abs([...m.sender_name].reduce((a, c) => a + c.charCodeAt(0), 0));
                        const color = nameColors[hash % nameColors.length];
                        const isCrmUser = fromMe && !isAI;
                        return (
                          <p className={`text-[11px] font-bold mb-1.5 pb-1 border-b border-black/5 flex items-center gap-1.5 ${isAI ? 'text-violet-600' : color.text}`}>
                            {isAI && <Bot className="w-2.5 h-2.5" />}
                            {isCrmUser && <span className={`w-2 h-2 rounded-full ${color.bg} flex-shrink-0`} />}
                            {m.sender_name}
                          </p>
                        );
                      })()}
                      {m.quoted_content || m.quoted_type ? (
                        <div className="mb-1.5 bg-black/5 border-l-2 border-gray-400 rounded-r-md px-2.5 py-1.5 cursor-pointer hover:bg-black/10 transition-colors"
                          onClick={() => { const el = document.getElementById(`msg-${m.quoted_message_id}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.add('ring-2','ring-blue-300'); setTimeout(() => el.classList.remove('ring-2','ring-blue-300'), 2000); } }}>
                          {m.quoted_sender && <p className="text-[9px] font-bold text-gray-600 mb-0.5">{m.quoted_sender}</p>}
                          {m.quoted_type && m.quoted_type !== 'text' && !m.quoted_content && (
                            <p className="text-[10px] text-gray-500 italic flex items-center gap-1">
                              {m.quoted_type === 'image' ? '📷 Foto' : m.quoted_type === 'video' ? '🎥 Vídeo' : m.quoted_type === 'audio' ? '🎵 Áudio' : m.quoted_type === 'document' ? '📄 Documento' : m.quoted_type}
                            </p>
                          )}
                          {m.quoted_content && <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{m.quoted_content}</p>}
                        </div>
                      ) : null}
                      {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} cachedSrc={cachedSrc} />}
                      {m.content && !isPlaceholder && renderText(m.content, myName)}
                      {m.content && isPlaceholder && !hasMedia && <p className="text-[13px] text-gray-500 italic">{m.content}</p>}
                      <div className="flex items-center justify-end gap-0.5 mt-0.5">
                        <span className="text-[9px] text-gray-400">{fmt(m.timestamp)}</span>
                        {fromMe && getStatus(m.status)}
                      </div>
                    </div>
                    {!fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mb-1 self-end">
                        <div className="bg-white border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                          {REACTION_EMOJIS.map(emoji => (
                            <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch {} }}
                              className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-50">{emoji}</button>
                          ))}
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm py-0.5 flex flex-col min-w-[110px]">
                          <button onClick={() => { setReplyTo(m); setTimeout(() => inputRef.current?.focus(), 50); }} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Reply className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Responder</span>
                          </button>
                          <button onClick={() => setForwardMsg(m)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 transition-colors text-left">
                            <Forward className="w-3 h-3 text-gray-400" /><span className="text-[10px] font-medium text-gray-600">Encaminhar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }).filter(Boolean);
              })()}
              <div ref={endRef} />
            </div>

            {files.length > 0 && (
              <div className="px-4 py-2.5 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {files.map((f, i) => (
                    <div key={i} className="relative group">
                      {f.type.startsWith('image') ? (
                        <img src={URL.createObjectURL(f)} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-12 h-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                          <Paperclip className="w-4 h-4 text-gray-400" />
                          <span className="text-[7px] text-gray-400 mt-0.5 truncate max-w-[40px]">{f.name.split('.').pop()}</span>
                        </div>
                      )}
                      <button onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors text-lg">+</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">{files.length} arquivo{files.length > 1 ? 's' : ''}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setFiles([]); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-gray-500 font-medium hover:text-red-500 transition-colors">Cancelar</button>
                    <button onClick={sendFiles} disabled={sending} className="px-3 py-1.5 bg-blue-700 text-white text-xs font-semibold rounded-lg disabled:opacity-50 hover:bg-blue-800 transition-colors">{sending ? 'Enviando...' : 'Enviar'}</button>
                  </div>
                </div>
              </div>
            )}

            {replyTo && (
              <div className="bg-white px-4 py-2 border-t border-gray-100 flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border-l-3 border-blue-500 rounded-r-lg px-3 py-2 min-w-0" style={{ borderLeftWidth: '3px' }}>
                  <p className="text-[10px] font-bold text-blue-700 mb-0.5">{replyTo.sender_name || (Number(replyTo.is_from_me) === 1 ? 'Você' : 'Contato')}</p>
                  <p className="text-[11px] text-gray-600 truncate">{replyTo.content || (replyTo.message_type !== 'text' ? `[${replyTo.message_type}]` : '')}</p>
                </div>
                <button onClick={() => setReplyTo(null)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            )}

            <div className="bg-white px-4 py-3 flex items-end gap-2.5 border-t border-gray-100 relative">
              {mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-4 right-4 mb-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-20 max-h-52 overflow-y-auto">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1.5"><AtSign className="w-3 h-3 text-blue-700" /><span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Mencionar participante</span></div>
                  {mentionSuggestions.map((p, i) => (
                    <button key={p.jid || p.phone || i} onClick={() => selectMention(p)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${i === mentionIdx ? 'bg-blue-50' : ''}`}>
                      <ParticipantAvatar name={p.name} phone={p.phone} size="w-7 h-7" textSize="text-[9px]" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-gray-800 truncate">{p.name || p.phone || 'Contato'}</p>
                          {p.admin === 'superadmin' && <span className="text-[7px] bg-red-50 text-red-500 font-bold px-1 rounded flex items-center gap-0.5"><Crown className="w-1.5 h-1.5" />dono</span>}
                          {p.admin === 'admin' && <span className="text-[7px] bg-amber-50 text-amber-600 font-bold px-1 rounded flex items-center gap-0.5"><Shield className="w-1.5 h-1.5" />admin</span>}
                        </div>
                        {p.name && p.phone && <p className="text-[9px] text-gray-400 font-mono">{p.phone}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <input type="file" ref={fileRef} onChange={handleFile} className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" multiple />
              <button onClick={() => fileRef.current?.click()} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg flex-shrink-0 mb-0.5 transition-colors"><Paperclip className="w-4 h-4" /></button>
              <textarea ref={inputRef} value={msg} onChange={handleMsgChange} onKeyDown={handleKeyDown} onPaste={handlePaste} disabled={sending} rows={2}
                placeholder={isGrp(cur) ? 'Mensagem... (@ para mencionar)' : 'Escreva uma mensagem...'}
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-blue-200 resize-none overflow-y-auto leading-relaxed transition-all"
                style={{ minHeight: '52px', maxHeight: '120px' }} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
              {/* Agendar mensagem */}
              <div className="relative flex-shrink-0 mb-0.5">
                <button onClick={() => setShowScheduleMsg(!showScheduleMsg)} disabled={!msg.trim()} title="Agendar envio"
                  className="p-2 text-[#25d366] hover:text-[#075e54] hover:bg-[#25d366]/10 rounded-lg disabled:opacity-30 transition-colors">
                  <CalendarClock className="w-4 h-4" />
                </button>
                {showScheduleMsg && msg.trim() && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 w-64 p-3 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Agendar envio desta mensagem</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#25d366]" />
                      <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#25d366]" />
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { l: '30min', fn: () => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); setScheduleDate(d.toISOString().split('T')[0]); setScheduleTime(d.toTimeString().slice(0, 5)); } },
                        { l: '1h', fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); setScheduleDate(d.toISOString().split('T')[0]); setScheduleTime(d.toTimeString().slice(0, 5)); } },
                        { l: 'Amanha 9h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); setScheduleDate(d.toISOString().split('T')[0]); setScheduleTime('09:00'); } },
                      ].map(s => (
                        <button key={s.l} type="button" onClick={s.fn} className="px-2 py-1 bg-gray-100 hover:bg-[#25d366]/10 text-gray-600 hover:text-[#075e54] rounded text-[9px] font-semibold transition-colors">{s.l}</button>
                      ))}
                    </div>
                    <button onClick={async () => {
                      if (!scheduleDate) { alert('Escolha uma data'); return; }
                      const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
                      try {
                        await api.createScheduledMessage({ tenantId: tenant.id, chatId: cur.id, contactName: chatDisplayName(cur), contactPhone: ph, remoteJid: cur.remote_jid, message: msg, scheduledAt: `${scheduleDate}T${scheduleTime}:00` });
                        setMsg(''); setShowScheduleMsg(false); setScheduleDate(''); setScheduleTime('09:00');
                      } catch { alert('Erro ao agendar'); }
                    }} disabled={!scheduleDate} className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50">
                      Agendar envio
                    </button>
                  </div>
                )}
              </div>
              <button onClick={send} disabled={sending || !msg.trim()} className="p-2.5 bg-[#075e54] text-white rounded-xl disabled:opacity-30 flex-shrink-0 mb-0.5 hover:bg-[#064a43] transition-colors"><Send className="w-4 h-4" /></button>
            </div>

            {showParticipants && isGrp(cur) && (
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white border-l border-gray-200 z-10 flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div><p className="font-semibold text-sm flex items-center gap-1.5"><Users2 className="w-3.5 h-3.5 text-blue-700" /> Participantes</p><p className="text-[10px] text-gray-400 mt-0.5">{participants.length} {participants.length === 1 ? 'pessoa' : 'pessoas'} no grupo</p></div>
                  <button onClick={() => setShowParticipants(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                {loadingPart ? <div className="flex items-center justify-center py-10"><div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" /></div>
                : participants.length === 0 ? <div className="py-10 text-center text-gray-400"><Users2 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-xs font-medium">Sem participantes</p></div>
                : (
                  <div className="flex-1 overflow-y-auto">
                    {participants.filter(p => p.admin).length > 0 && <div className="px-3 pt-3 pb-1"><span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Administradores</span></div>}
                    {participants.filter(p => p.admin).map((p, i) => <ParticipantRow key={p.jid || i} p={p} onMention={() => { setMsg(prev => prev + `@${p.name || p.phone || 'Contato'} `); setShowParticipants(false); setTimeout(() => inputRef.current?.focus(), 10); }} />)}
                    {participants.filter(p => p.admin).length > 0 && participants.filter(p => !p.admin).length > 0 && <div className="px-3 pt-3 pb-1 border-t border-gray-100"><span className="text-[8px] font-semibold text-gray-400 uppercase tracking-wider">Membros</span></div>}
                    {participants.filter(p => !p.admin).map((p, i) => <ParticipantRow key={p.jid || i} p={p} onMention={() => { setMsg(prev => prev + `@${p.name || p.phone || 'Contato'} `); setShowParticipants(false); setTimeout(() => inputRef.current?.focus(), 10); }} />)}
                  </div>
                )}
                <div className="p-2 border-t border-gray-100"><button onClick={() => loadParticipants(cur.remote_jid)} disabled={loadingPart} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-gray-400 hover:text-blue-700 hover:bg-gray-50 rounded-lg font-medium disabled:opacity-40 transition-colors"><RefreshCw className={`w-3 h-3 ${loadingPart ? 'animate-spin' : ''}`} /> Atualizar lista</button></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50"><div className="text-center"><MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" /><p className="text-sm font-medium text-gray-400">Selecione uma conversa</p><p className="text-xs text-gray-300 mt-1">Escolha um contato na lista ao lado</p></div></div>
        )}
      </div>

      {showEdit && lead && <EditLeadModal lead={lead} columns={columns} onClose={() => setShowEdit(false)} onSave={async data => { await api.updateLead(lead.id, data); setLead({ ...lead, ...data }); setShowEdit(false); onRefresh(); }} onRefresh={() => loadLead(cur)} />}
      {showTrash && <TrashModal chats={deletedChats} loading={loadingTrash} onClose={() => setShowTrash(false)} onRestore={restoreChat} chatDisplayName={chatDisplayName} isGrp={isGrp} fmt={fmt} />}

      {forwardMsg && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Encaminhar mensagem</h3>
              <button onClick={() => { setForwardMsg(null); setForwardSearch(''); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="bg-gray-50 border-b border-gray-100 px-3 py-2 mx-3 mt-2 mb-1 rounded-lg">
              <p className="text-[10px] text-gray-400 mb-0.5">Mensagem:</p>
              <p className="text-[11px] text-gray-600 truncate">{forwardMsg.content || `[${forwardMsg.message_type}]`}</p>
            </div>
            <div className="px-3 py-2">
              <input value={forwardSearch} onChange={e => setForwardSearch(e.target.value)} placeholder="Buscar conversa..." autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-200" />
            </div>
            <div className="max-h-64 overflow-y-auto px-1 pb-2">
              {chats.filter(c => c.id !== cur?.id && chatDisplayName(c).toLowerCase().includes(forwardSearch.toLowerCase())).slice(0, 15).map(c => (
                <button key={c.id} onClick={() => handleForward(c)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left">
                  <ProfilePic phone={c.contact_phone || c.remote_jid} tenantId={tenant.id} name={chatDisplayName(c)} size="w-8 h-8" textSize="text-[9px]" isGroup={isGrp(c)} cachedUrl={c.profile_pic_url} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{chatDisplayName(c)}</p>
                    {isGrp(c) && <span className="text-[9px] text-blue-600 font-medium">Grupo</span>}
                  </div>
                  <Forward className="w-3.5 h-3.5 text-gray-300" />
                </button>
              ))}
              {chats.filter(c => c.id !== cur?.id && chatDisplayName(c).toLowerCase().includes(forwardSearch.toLowerCase())).length === 0 && (
                <p className="text-center text-[11px] text-gray-400 py-6">Nenhuma conversa encontrada</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm">Nova conversa</h3>
              <button onClick={() => { setShowNewChat(false); setNewChatPhone(''); setNewChatName(''); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); if (newChatPhone.replace(/\D/g, '').length >= 10) startNewChat(newChatPhone.replace(/\D/g, ''), newChatName || newChatPhone); }}
              className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Telefone com DDD</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={newChatPhone} onChange={e => setNewChatPhone(e.target.value)} placeholder="5514999999999"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-200" autoFocus required />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nome (opcional)</label>
                <input value={newChatName} onChange={e => setNewChatName(e.target.value)} placeholder="Nome do contato"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-200" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowNewChat(false); setNewChatPhone(''); setNewChatName(''); }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={newChatPhone.replace(/\D/g, '').length < 10}
                  className="flex-1 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40">Iniciar conversa</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

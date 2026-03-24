import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Search, Send, X, Check, Trash2, Edit2, Paperclip,
  Users2, CheckCheck, RotateCcw, RefreshCw, AtSign, Crown, Shield, Bot
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

export default function ChatView({ tenant, columns, onRefresh, requestedPhone, onPhoneHandled, currentUser }) {
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
  const localMediaCache = useRef({});
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
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination); osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
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
    if (cur && isGrp(cur)) { setShowParticipants(false); setMentionQuery(null); mentionStartRef.current = -1; loadParticipants(cur.remote_jid); }
    else { setParticipants([]); setShowParticipants(false); setMentionQuery(null); }
  }, [cur?.id]);
  useEffect(() => {
    if (!requestedPhone || chats.length === 0) return;
    const clean = requestedPhone.replace(/\D/g, '');
    const match = chats.find(c => (c.contact_phone || '').replace(/\D/g, '') === clean || (c.remote_jid || '').replace(/[^0-9]/g, '').includes(clean));
    if (match) { selectChat(match); onPhoneHandled?.(); }
  }, [requestedPhone, chats]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  useEffect(() => {
    const handleVisibility = () => { if (!document.hidden) { const total = chats.reduce((sum, c) => sum + (Number(c.unread_count) || 0), 0); document.title = total > 0 ? `(${total}) Borsato CRM` : 'Borsato CRM'; } };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { document.removeEventListener('visibilitychange', handleVisibility); document.title = 'Borsato CRM'; };
  }, [chats]);

  const load = async () => {
    try {
      const chatList = await api.getChats(tenant.id); setChats(chatList);
      const ac = curRef.current;
      if (ac) { const upd = chatList.find(c => c.id === ac.id); if (upd) setCur(upd); }
      const totalUnread = chatList.reduce((sum, c) => sum + (Number(c.unread_count) || 0), 0);
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
    try { await api.sendWhatsAppMessage(ph, msg, tenant.id, cur.id); setMsg(''); if (inputRef.current) inputRef.current.style.height = 'auto'; await loadMsgs(cur.id); await load(); }
    catch (e) { alert(e.message || 'Erro ao enviar'); } finally { setSending(false); }
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

  const handleFile = e => { const f = e.target.files[0]; if (!f) return; if (f.size > 10 * 1024 * 1024) { alert('Max 10MB'); return; } setFile(f); };

  const sendFile = async () => {
    if (!file || !cur) return;
    const ph = cur.contact_phone || cur.remote_jid?.split('@')[0];
    setSending(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result; const base64 = dataUrl.split(',')[1];
        const mt = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document';
        await api.sendWhatsAppMedia({ number: ph, base64, fileName: file.name, mediaType: mt, caption: '', tenantId: tenant.id, chatId: cur.id });
        setFile(null); if (fileRef.current) fileRef.current.value = '';
        const newMsgs = await api.getChatMessages(cur.id, 100, 0);
        const lastSent = [...newMsgs].reverse().find(m => Number(m.is_from_me) === 1 && ['image','video','document'].includes(m.message_type));
        if (lastSent) localMediaCache.current[lastSent.id] = dataUrl;
        setMsgs(newMsgs); await load(); setSending(false);
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

  const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        <div className="p-3 border-b border-gray-100 space-y-2">
          <div className="relative"><Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs" /></div>
          <div className="flex gap-1">{[{ id: 'individual', l: 'Contatos' }, { id: 'group', l: 'Grupos' }].map(f => (<button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 py-1 text-[9px] font-bold rounded ${filter === f.id ? 'bg-[#25d366] text-white' : 'bg-gray-100 text-gray-500'}`}>{f.l}</button>))}</div>
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
                      <p className="font-bold text-xs truncate">{chatDisplayName(c)}{isGrp(c) && <span className="ml-1 text-[8px] bg-gray-100 text-gray-400 px-1 rounded">GRUPO</span>}</p>
                      <span className="text-[9px] text-gray-400 flex-shrink-0 ml-1">{fmt(c.last_message_time)}</span>
                    </div>
                    <div className="flex justify-between mt-0.5 items-center">
                      <p className="text-[10px] text-gray-400 truncate">{c.last_message}</p>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                        {isMentionedInLast && <span className="bg-teal-500 text-white text-[8px] font-bold px-1 py-0.5 rounded flex items-center gap-0.5"><AtSign className="w-2 h-2" /></span>}
                        {Number(c.unread_count) > 0 && <span className="bg-[#25d366] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{Number(c.unread_count) > 9 ? '9+' : c.unread_count}</span>}
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
                      <button onClick={() => setShowParticipants(v => !v)} className="text-[9px] text-[#25d366] font-bold hover:underline flex items-center gap-0.5">
                        <Users2 className="w-2.5 h-2.5" />{loadingPart ? 'Carregando...' : participants.length > 0 ? `${participants.length} participantes` : 'Ver participantes'}
                      </button>
                    ) : <p className="text-[10px] text-gray-400 font-mono">{cur.contact_phone}</p>}
                  </div>
                  {lead && <button onClick={() => setShowEdit(true)} className="ml-2 p-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-100"><Edit2 className="w-3 h-3" /></button>}
                  {!isGrp(cur) && lead && tenantAIOn && (
                    <button onClick={toggleLeadAI} className={`ml-1 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${leadAIOn ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
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
                const cachedSrc = fromMe ? (localMediaCache.current[m.id] || null) : null;
                const isMedia = ['image','video','document','audio','sticker'].includes(m.message_type);
                const hasMedia = isMedia && (m.media_url || cachedSrc);
                const isPlaceholder = ['[Imagem]','[Audio]','[Video]','[Documento]','[Sticker]','[Localizacao]','[Contato]','[Mensagem]','[Reacao]'].includes(m.content);
                const isAI = m.sender_name === 'IA';
                const isMentionedMsg = !fromMe && mentionsMe(m.content);
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
                    {fromMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1 py-0.5 shadow-sm mb-1 self-end">
                        {REACTION_EMOJIS.map(emoji => (
                          <button key={emoji} onClick={async () => { try { await api.sendReaction(tenant.id, cur?.id, m.id, m.remote_jid || cur?.remote_jid, emoji); await loadMsgs(cur.id); } catch {} }}
                            className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-100">{emoji}</button>
                        ))}
                      </div>
                    )}
                    <div className={`max-w-[65%] rounded-lg px-2.5 py-1.5 shadow-sm transition-all ${
                      fromMe ? (isAI ? 'bg-purple-50 border border-purple-100' : 'bg-[#d9fdd3]') : isMentionedMsg ? 'bg-yellow-50 border border-yellow-200' : 'bg-white'
                    }`}>
                      {isMentionedMsg && <div className="flex items-center gap-1 mb-0.5"><span className="text-[8px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded px-1 py-0.5 flex items-center gap-0.5"><AtSign className="w-2 h-2" /> voce foi mencionado</span></div>}
                      {m.sender_name && <p className={`text-[10px] font-bold mb-0.5 flex items-center gap-1 ${isAI ? 'text-purple-600' : fromMe ? 'text-[#075e54]' : 'text-[#6b7280]'}`}>{isAI && <Bot className="w-2.5 h-2.5" />}{m.sender_name}</p>}
                      {hasMedia && <MediaBubble msg={m} tenantId={tenant.id} cachedSrc={cachedSrc} />}
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
                            className="text-sm hover:scale-125 transition-transform p-0.5 rounded-full hover:bg-gray-100">{emoji}</button>
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
                <div className="flex items-center gap-2">
                  {file.type.startsWith('image') ? <img src={URL.createObjectURL(file)} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200" /> : <Paperclip className="w-4 h-4 text-gray-400" />}
                  <span className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-red-500 font-bold">Cancelar</button>
                  <button onClick={sendFile} disabled={sending} className="px-3 py-1 bg-[#25d366] text-white text-xs font-bold rounded-lg disabled:opacity-50">Enviar</button>
                </div>
              </div>
            )}

            <div className="bg-[#f0f2f5] px-3 py-2.5 flex items-end gap-2 border-t border-gray-200 relative">
              {mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-3 right-3 mb-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20 max-h-52 overflow-y-auto">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center gap-1.5"><AtSign className="w-3 h-3 text-[#25d366]" /><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Mencionar participante</span></div>
                  {mentionSuggestions.map((p, i) => (
                    <button key={p.jid || p.phone || i} onClick={() => selectMention(p)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${i === mentionIdx ? 'bg-[#f0f2f5]' : ''}`}>
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
              <textarea ref={inputRef} value={msg} onChange={handleMsgChange} onKeyDown={handleKeyDown} disabled={sending} rows={1}
                placeholder={isGrp(cur) ? 'Mensagem... (@ para mencionar)' : 'Mensagem...'}
                className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm outline-none focus:border-[#25d366] resize-none overflow-y-auto leading-relaxed"
                style={{ maxHeight: '120px' }} onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
              <button onClick={send} disabled={sending || !msg.trim()} className="p-2 bg-[#25d366] text-white rounded-full disabled:opacity-40 flex-shrink-0 mb-0.5"><Send className="w-4 h-4" /></button>
            </div>

            {showParticipants && isGrp(cur) && (
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 z-10 flex flex-col shadow-2xl">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#f0f2f5]">
                  <div><p className="font-bold text-sm flex items-center gap-1.5"><Users2 className="w-3.5 h-3.5 text-[#128c7e]" /> Participantes</p><p className="text-[9px] text-gray-400 mt-0.5">{participants.length} {participants.length === 1 ? 'pessoa' : 'pessoas'} no grupo</p></div>
                  <button onClick={() => setShowParticipants(false)} className="p-1 hover:bg-gray-200 rounded-full"><X className="w-4 h-4 text-gray-400" /></button>
                </div>
                {loadingPart ? <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-2 border-[#25d366] border-t-transparent rounded-full animate-spin" /></div>
                : participants.length === 0 ? <div className="py-10 text-center text-gray-400"><Users2 className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-xs font-bold">Sem participantes</p></div>
                : (
                  <div className="flex-1 overflow-y-auto">
                    {participants.filter(p => p.admin).length > 0 && <div className="px-3 pt-3 pb-1"><span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Administradores</span></div>}
                    {participants.filter(p => p.admin).map((p, i) => <ParticipantRow key={p.jid || i} p={p} onMention={() => { setMsg(prev => prev + `@${p.name || p.phone || 'Contato'} `); setShowParticipants(false); setTimeout(() => inputRef.current?.focus(), 10); }} />)}
                    {participants.filter(p => p.admin).length > 0 && participants.filter(p => !p.admin).length > 0 && <div className="px-3 pt-3 pb-1 border-t border-gray-100"><span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Membros</span></div>}
                    {participants.filter(p => !p.admin).map((p, i) => <ParticipantRow key={p.jid || i} p={p} onMention={() => { setMsg(prev => prev + `@${p.name || p.phone || 'Contato'} `); setShowParticipants(false); setTimeout(() => inputRef.current?.focus(), 10); }} />)}
                  </div>
                )}
                <div className="p-2 border-t border-gray-100"><button onClick={() => loadParticipants(cur.remote_jid)} disabled={loadingPart} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] text-gray-400 hover:text-[#075e54] hover:bg-gray-50 rounded-lg font-bold disabled:opacity-40"><RefreshCw className={`w-3 h-3 ${loadingPart ? 'animate-spin' : ''}`} /> Atualizar lista</button></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]"><div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm font-bold text-gray-400">Selecione uma conversa</p></div></div>
        )}
      </div>

      {showEdit && lead && <EditLeadModal lead={lead} columns={columns} onClose={() => setShowEdit(false)} onSave={async data => { await api.updateLead(lead.id, data); setLead({ ...lead, ...data }); setShowEdit(false); onRefresh(); }} onRefresh={() => loadLead(cur)} />}
      {showTrash && <TrashModal chats={deletedChats} loading={loadingTrash} onClose={() => setShowTrash(false)} onRestore={restoreChat} chatDisplayName={chatDisplayName} isGrp={isGrp} fmt={fmt} />}
    </div>
  );
}

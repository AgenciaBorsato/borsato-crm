import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Trash2, Clock, Send, X, Search, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

function timeUntil(dateStr) {
  if (!dateStr) return '';
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) return 'Atrasado';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `em ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `em ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `em ${days}d`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function NewScheduleModal({ chats, onClose, onSave }) {
  const [chatId, setChatId] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  const filteredChats = (chats || []).filter(c => {
    const name = c.contact_name || c.contact_phone || '';
    return name.toLowerCase().includes(chatSearch.toLowerCase());
  });

  const selectedChat = (chats || []).find(c => c.id === chatId);
  const chatName = (c) => {
    if (!c) return '';
    const name = c.contact_name;
    if (name && !/^\d{10,}$/.test(name)) return name;
    return c.contact_phone || '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatId || !message.trim() || !date) return;
    setSaving(true);
    try {
      await onSave({
        chatId,
        contactName: chatName(selectedChat),
        contactPhone: selectedChat?.contact_phone || '',
        remoteJid: selectedChat?.remote_jid || '',
        message: message.trim(),
        scheduledAt: new Date(`${date}T${time}:00`).toISOString(),
      });
      onClose();
    } catch (err) {
      alert('Erro: ' + (err.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#075e54]" />
            <h2 className="font-bold text-sm">Agendar Mensagem</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Selecionar contato */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Destinatario</label>
            {selectedChat ? (
              <div className="flex items-center justify-between bg-[#075e54]/5 border border-[#25d366]/30 rounded-xl px-3 py-2.5">
                <div>
                  <p className="font-bold text-sm text-gray-900">{chatName(selectedChat)}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{selectedChat.contact_phone}</p>
                </div>
                <button type="button" onClick={() => setChatId('')} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={chatSearch} onChange={e => setChatSearch(e.target.value)} placeholder="Buscar contato..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#25d366]" />
                </div>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {filteredChats.slice(0, 8).map(c => (
                    <button key={c.id} type="button" onClick={() => { setChatId(c.id); setChatSearch(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[#075e54]/10 flex items-center justify-center text-[9px] font-bold text-[#075e54]">
                        {chatName(c).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{chatName(c)}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{c.contact_phone}</p>
                      </div>
                    </button>
                  ))}
                  {filteredChats.length === 0 && <p className="text-center text-xs text-gray-400 py-3">Nenhum contato</p>}
                </div>
              </div>
            )}
          </div>

          {/* Mensagem */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Mensagem</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
              placeholder="Digite a mensagem que sera enviada..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366] resize-none" required />
          </div>

          {/* Data e hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366]" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Hora</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366]" required />
            </div>
          </div>

          {/* Atalhos */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Atalhos</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { l: 'Em 30min', fn: () => { const d = new Date(); d.setMinutes(d.getMinutes() + 30); setDate(d.toLocaleDateString('en-CA')); setTime(d.toTimeString().slice(0, 5)); } },
                { l: 'Em 1h', fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); setDate(d.toLocaleDateString('en-CA')); setTime(d.toTimeString().slice(0, 5)); } },
                { l: 'Amanha 9h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); setDate(d.toLocaleDateString('en-CA')); setTime('09:00'); } },
                { l: 'Amanha 14h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); setDate(d.toLocaleDateString('en-CA')); setTime('14:00'); } },
                { l: 'Segunda 9h', fn: () => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day)); setDate(d.toLocaleDateString('en-CA')); setTime('09:00'); } },
              ].map(s => (
                <button key={s.l} type="button" onClick={s.fn}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-[#25d366]/10 hover:text-[#075e54] text-gray-600 rounded-lg text-[10px] font-semibold transition-colors">
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold">Cancelar</button>
            <button type="submit" disabled={saving || !chatId || !message.trim() || !date} className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold disabled:opacity-50">
              {saving ? 'Agendando...' : 'Agendar envio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ScheduleView({ tenant, onRefresh }) {
  const [schedules, setSchedules] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [msgs, chatList] = await Promise.all([
        api.getScheduledMessages(tenant.id),
        api.getChats(tenant.id),
      ]);
      setSchedules(msgs || []);
      setChats(chatList.filter(c => !Number(c.is_group)));
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [tenant.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (data) => {
    await api.createScheduledMessage({ ...data, tenantId: tenant.id });
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancelar agendamento?')) return;
    try { await api.deleteScheduledMessage(id); await loadData(); }
    catch { alert('Erro ao cancelar'); }
  };

  const filtered = schedules.filter(s => {
    if (search && !(s.contactName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'sent') return s.status === 'sent';
    if (filter === 'failed') return s.status === 'failed';
    return true;
  }).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const pendingCount = schedules.filter(s => s.status === 'pending').length;
  const sentCount = schedules.filter(s => s.status === 'sent').length;

  const filters = [
    { id: 'pending', l: 'Pendentes', count: pendingCount },
    { id: 'sent', l: 'Enviadas', count: sentCount },
    { id: 'failed', l: 'Com erro' },
    { id: 'all', l: 'Todas' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#075e54]" />
            <h2 className="font-bold text-lg text-gray-900">Agendamentos</h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs shadow-sm w-48" />
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#25d366] text-white text-xs font-bold rounded-lg hover:bg-[#1fb958] transition shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Agendar mensagem
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-4">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-[#075e54] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            {f.l}
            {f.count > 0 && (
              <span className={`min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 ${
                filter === f.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
              }`}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">Nenhum agendamento {filter === 'sent' ? 'enviado' : 'encontrado'}</p>
          <p className="text-xs text-gray-300 mt-1">Programe mensagens para serem enviadas automaticamente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => {
            const isPending = s.status === 'pending';
            const isSent = s.status === 'sent';
            const isFailed = s.status === 'failed';
            return (
              <div key={s.id} className={`bg-white border rounded-xl p-4 transition-all ${
                isFailed ? 'border-red-200 bg-red-50/30' : isSent ? 'border-green-200 bg-green-50/20' : 'border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isSent ? 'bg-[#25d366]/10 text-[#25d366]' : isFailed ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'
                  }`}>
                    {isSent ? <CheckCircle className="w-4 h-4" /> : isFailed ? <AlertCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-gray-900">{s.contact_name || s.contactName || 'Contato'}</p>
                      {(s.contact_phone || s.contactPhone) && <span className="text-[10px] text-gray-400 font-mono">{s.contact_phone || s.contactPhone}</span>}
                      {isSent && <span className="text-[8px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full uppercase">Enviada</span>}
                      {isFailed && <span className="text-[8px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase">Erro</span>}
                    </div>
                    {/* Message preview */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-600 line-clamp-2">{s.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-[10px] font-semibold ${isPending ? 'text-blue-600' : 'text-gray-400'}`}>
                        <Clock className="w-3 h-3" />
                        {formatDateTime(s.scheduled_at)}
                        {isPending && <span className="text-[9px] ml-1 text-blue-400">({timeUntil(s.scheduled_at)})</span>}
                      </span>
                      {isSent && s.sent_at && (
                        <span className="flex items-center gap-1 text-[10px] text-green-600">
                          <Send className="w-3 h-3" /> Enviada {formatDateTime(s.sent_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isPending && (
                      <button onClick={() => handleDelete(s.id)} title="Cancelar"
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <NewScheduleModal chats={chats} onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Check, Trash2, MessageCircle, Phone, Clock, AlertTriangle, Calendar, Filter, X, Search } from 'lucide-react';
import api from '../api';

function timeUntil(dateStr) {
  if (!dateStr) return '';
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) {
    const mins = Math.abs(Math.floor(diff / 60000));
    if (mins < 60) return `${mins}min atrasado`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrasado`;
    const days = Math.floor(hrs / 24);
    return `${days}d atrasado`;
  }
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
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function isOverdue(dateStr) {
  return dateStr && new Date(dateStr) < new Date();
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

function isNext7Days(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const n = new Date();
  const diff = (d - n) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function NewFollowUpModal({ leads, onClose, onSave }) {
  const [leadId, setLeadId] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredLeads = leads.filter(l =>
    (l.name || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.phone || '').includes(leadSearch)
  );

  const selectedLead = leads.find(l => l.id === leadId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leadId || !date) return;
    setSaving(true);
    try {
      await onSave({
        leadId,
        leadName: selectedLead?.name || '',
        leadPhone: selectedLead?.phone || '',
        scheduledAt: `${date}T${time}:00`,
        note,
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
            <Bell className="w-4 h-4 text-[#075e54]" />
            <h2 className="font-bold text-sm">Novo Follow Up</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Selecionar lead */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Lead</label>
            {selectedLead ? (
              <div className="flex items-center justify-between bg-[#075e54]/5 border border-[#25d366]/30 rounded-xl px-3 py-2.5">
                <div>
                  <p className="font-bold text-sm text-gray-900">{selectedLead.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{selectedLead.phone}</p>
                </div>
                <button type="button" onClick={() => setLeadId('')} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={leadSearch} onChange={e => setLeadSearch(e.target.value)} placeholder="Buscar lead..." className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#25d366]" />
                </div>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                  {filteredLeads.slice(0, 8).map(l => (
                    <button key={l.id} type="button" onClick={() => { setLeadId(l.id); setLeadSearch(''); }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left transition-colors">
                      <div className="w-7 h-7 rounded-full bg-[#075e54]/10 flex items-center justify-center text-[9px] font-bold text-[#075e54]">
                        {(l.name || '?').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{l.name || 'Sem nome'}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{l.phone}</p>
                      </div>
                    </button>
                  ))}
                  {filteredLeads.length === 0 && <p className="text-center text-xs text-gray-400 py-3">Nenhum lead encontrado</p>}
                </div>
              </div>
            )}
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

          {/* Nota */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Nota (opcional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Ex: Confirmar interesse no plano Pro..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366] resize-none" />
          </div>

          {/* Atalhos rapidos */}
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Atalhos</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { l: 'Em 1h', fn: () => { const d = new Date(); d.setHours(d.getHours() + 1); setDate(d.toISOString().split('T')[0]); setTime(d.toTimeString().slice(0, 5)); } },
                { l: 'Em 3h', fn: () => { const d = new Date(); d.setHours(d.getHours() + 3); setDate(d.toISOString().split('T')[0]); setTime(d.toTimeString().slice(0, 5)); } },
                { l: 'Amanha 9h', fn: () => { const d = new Date(); d.setDate(d.getDate() + 1); setDate(d.toISOString().split('T')[0]); setTime('09:00'); } },
                { l: 'Em 3 dias', fn: () => { const d = new Date(); d.setDate(d.getDate() + 3); setDate(d.toISOString().split('T')[0]); setTime('09:00'); } },
                { l: 'Em 1 semana', fn: () => { const d = new Date(); d.setDate(d.getDate() + 7); setDate(d.toISOString().split('T')[0]); setTime('09:00'); } },
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
            <button type="submit" disabled={saving || !leadId || !date} className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold disabled:opacity-50">
              {saving ? 'Salvando...' : 'Criar lembrete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FollowUpView({ tenant, onRefresh, onOpenChat }) {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try { setFollowUps(await api.getFollowUps(tenant.id)); }
    catch { setFollowUps([]); }
    finally { setLoading(false); }
  }, [tenant.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (data) => {
    await api.createFollowUp({ ...data, tenantId: tenant.id });
    await loadData();
  };

  const handleComplete = async (id) => {
    try { await api.completeFollowUp(id); await loadData(); }
    catch { alert('Erro ao concluir'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover follow-up?')) return;
    try { await api.deleteFollowUp(id); await loadData(); }
    catch { alert('Erro ao remover'); }
  };

  const leads = tenant.leads || [];

  const filtered = followUps.filter(f => {
    if (search && !(f.leadName || '').toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'pending') return f.status !== 'completed';
    if (filter === 'overdue') return f.status !== 'completed' && isOverdue(f.scheduled_at);
    if (filter === 'today') return f.status !== 'completed' && isToday(f.scheduled_at);
    if (filter === 'week') return f.status !== 'completed' && isNext7Days(f.scheduled_at);
    if (filter === 'completed') return f.status === 'completed';
    return true;
  }).sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  const overdueCount = followUps.filter(f => f.status !== 'completed' && isOverdue(f.scheduled_at)).length;
  const todayCount = followUps.filter(f => f.status !== 'completed' && isToday(f.scheduled_at)).length;
  const pendingCount = followUps.filter(f => f.status !== 'completed').length;

  const filters = [
    { id: 'pending', l: 'Pendentes', count: pendingCount },
    { id: 'overdue', l: 'Atrasados', count: overdueCount, alert: true },
    { id: 'today', l: 'Hoje', count: todayCount },
    { id: 'week', l: 'Proximos 7d' },
    { id: 'completed', l: 'Concluidos' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#075e54]" />
            <h2 className="font-bold text-lg text-gray-900">Follow Up</h2>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lead..." className="bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs shadow-sm w-48" />
          </div>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#25d366] text-white text-xs font-bold rounded-lg hover:bg-[#1fb958] transition shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Novo follow-up
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
              filter === f.id
                ? f.alert && f.count > 0 ? 'bg-red-500 text-white' : 'bg-[#075e54] text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            {f.l}
            {f.count > 0 && (
              <span className={`min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 ${
                filter === f.id ? 'bg-white/20' : f.alert ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
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
          <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400">Nenhum follow-up {filter === 'completed' ? 'concluido' : 'encontrado'}</p>
          <p className="text-xs text-gray-300 mt-1">Crie lembretes para nao esquecer de recontatar seus leads</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => {
            const overdue = f.status !== 'completed' && isOverdue(f.scheduled_at);
            const today = isToday(f.scheduled_at);
            return (
              <div key={f.id} className={`bg-white border rounded-xl p-4 transition-all ${
                overdue ? 'border-red-200 bg-red-50/30' : today ? 'border-amber-200 bg-amber-50/20' : 'border-gray-200'
              } ${f.status === 'completed' ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  {/* Status indicator */}
                  <button onClick={() => f.status !== 'completed' && handleComplete(f.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      f.status === 'completed' ? 'bg-[#25d366] border-[#25d366] text-white' : 'border-gray-300 hover:border-[#25d366]'
                    }`}>
                    {f.status === 'completed' && <Check className="w-3 h-3" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold text-sm ${f.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {f.leadName || 'Lead'}
                      </p>
                      {f.leadPhone && <span className="text-[10px] text-gray-400 font-mono">{f.leadPhone}</span>}
                    </div>
                    {f.note && <p className="text-xs text-gray-500 mb-2">{f.note}</p>}
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 text-[10px] font-semibold ${
                        overdue ? 'text-red-600' : today ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {overdue && <AlertTriangle className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        {formatDateTime(f.scheduled_at)}
                        {f.status !== 'completed' && <span className="text-[9px] ml-1">({timeUntil(f.scheduled_at)})</span>}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {f.status !== 'completed' && f.leadPhone && (
                      <>
                        <button onClick={() => onOpenChat?.(f.leadPhone)} title="Abrir chat"
                          className="p-1.5 bg-[#25d366]/10 text-[#075e54] hover:bg-[#25d366]/20 rounded-lg transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <a href={`tel:+55${f.leadPhone?.replace(/\D/g, '')}`} title="Ligar"
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </>
                    )}
                    <button onClick={() => handleDelete(f.id)} title="Remover"
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <NewFollowUpModal leads={leads} onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
    </div>
  );
}

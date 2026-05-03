import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Edit2, Trash2, Zap } from 'lucide-react';
import { CM, daysAgo } from '../constants';
import api from '../api';
import EditLeadModal from './EditLeadModal';
import { StageBadge } from './LeadSummaryCard';

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

export default function LeadsView({ leads, columns, tenant, onRefresh, onOpenChat }) {
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
        <table className="w-full text-left table-fixed">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase">
            <tr>
              <th className="p-3 w-[14%]">Nome</th>
              <th className="p-3 w-[12%]">Telefone</th>
              <th className="p-3 w-[32%]">Contexto IA</th>
              <th className="p-3 w-[10%]">Etapa</th>
              <th className="p-3 w-[8%]">Origem</th>
              <th className="p-3 w-[5%]">Tempo</th>
              <th className="p-3 w-[19%] text-right">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(l => {
              const colInfo = columns.find(c => c.id === l.stage);
              const c = CM[colInfo?.color] || CM.zinc;
              const days = daysAgo(l.updated_at);
              const isLidPhone = l.phone && /^\d{14,}$/.test(l.phone);
              let adsCount = 0;
              try {
                const cd = typeof l.custom_data === 'string' ? JSON.parse(l.custom_data || '{}') : (l.custom_data || {});
                if (Array.isArray(cd.meta_ads_history)) adsCount = cd.meta_ads_history.length;
              } catch {}
              return (
                <tr key={l.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 font-bold text-xs truncate">{l.name}</td>
                  <td className="px-3 py-2.5 text-[11px] truncate">
                    {isLidPhone
                      ? <span className="text-[9px] font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">📣 ID Meta</span>
                      : <span className="text-gray-400 font-mono">{l.phone || '—'}</span>
                    }
                  </td>
                  <td className="px-3 py-2.5">
                    {l.conversation_summary ? (
                      <div className="space-y-1">
                        <StageBadge structured_memory={l.structured_memory} />
                        <p className="text-[9px] text-amber-700 bg-amber-50 rounded px-1.5 py-1 line-clamp-2 italic">
                          {l.conversation_summary}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[9px] text-gray-300">Sem resumo</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {colInfo
                      ? <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${c.light} ${c.text}`}>{colInfo.name}</span>
                      : <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold rounded">{l.stage || '-'}</span>
                    }
                  </td>
                  <td className="px-3 py-2.5">
                    {l.source === 'meta_ads'
                      ? <span className="text-[9px] font-bold text-blue-700 bg-blue-50 rounded px-1.5 py-0.5 inline-flex items-center gap-0.5" title={adsCount > 0 ? `${adsCount} anúncio(s) no histórico` : undefined}>📣 Ads{adsCount > 0 ? ` · ${adsCount}` : ''}</span>
                      : l.source === 'whatsapp'
                      ? <span className="text-[9px] font-bold text-green-700 bg-green-50 rounded px-1.5 py-0.5 inline-flex items-center gap-0.5"><Zap className="w-2.5 h-2.5" /> WA</span>
                      : <span className="text-[9px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{l.source || 'manual'}</span>
                    }
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`text-[10px] ${days > 7 ? 'text-red-600 font-bold' : days > 2 ? 'text-amber-600' : 'text-gray-400'}`}>{days}d</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1 justify-end items-center">
                      {l.phone && !isLidPhone && (
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

      {showCreate && (
        <LeadCreateModal tenant={tenant} columns={columns} onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); onRefresh(); }} />
      )}
      {editLead && (
        <EditLeadModal lead={editLead} columns={columns} onClose={() => setEditLead(null)} onSave={async data => { await api.updateLead(editLead.id, data); setEditLead(null); onRefresh(); }} onRefresh={onRefresh} />
      )}
    </div>
  );
}

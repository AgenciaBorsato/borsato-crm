import React, { useState } from 'react';
import { LayoutGrid, Search, Plus, X, MessageCircle, Phone, Clock, Zap, Trash2 } from 'lucide-react';
import { CM, daysAgo } from '../constants';
import api from '../api';

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
            {otherCols.map(c2 => <button key={c2.id} onClick={() => onStageChange(c2.id)} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${(CM[c2.color] || CM.zinc).light} ${(CM[c2.color] || CM.zinc).text}`}>{'→'} {c2.name}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanView({ leads, columns, tenant, onRefresh, onOpenChat }) {
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

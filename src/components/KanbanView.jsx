import React, { useState } from 'react';
import { Search, Plus, X, MessageCircle, Phone, Clock, Zap, Trash2, GripVertical } from 'lucide-react';
import { CM, daysAgo } from '../constants';
import api from '../api';

/* ─── Card do Lead ─── */
function KanbanCard({ lead, col, columns, onDragStart, onDragEnd, onOpenChat, onStageChange, onRefresh }) {
  const [hover, setHover] = useState(false);
  const days = daysAgo(lead.updated_at);
  const otherCols = columns.filter(c2 => c2.id !== col.id);

  const initials = (lead.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`bg-white rounded-lg cursor-grab select-none transition-all border ${
        hover ? 'border-gray-300 shadow-md -translate-y-0.5' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className="p-3">
        {/* Header: avatar + nome + tempo */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${(CM[col.color] || CM.zinc).bg}`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[13px] text-gray-800 leading-tight truncate">{lead.name || '\u2014'}</p>
            {lead.phone && (
              <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                <Phone className="w-2.5 h-2.5" />{lead.phone}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            {days === 0 ? (
              <span className="text-[9px] font-bold text-green-600">Hoje</span>
            ) : days <= 2 ? (
              <span className="text-[9px] text-gray-400">{days}d</span>
            ) : days <= 7 ? (
              <span className="text-[9px] font-medium text-amber-500">{days}d</span>
            ) : (
              <span className="text-[9px] font-bold text-red-500">{days}d</span>
            )}
          </div>
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {lead.source === 'whatsapp' ? (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-green-700 bg-green-50 rounded-full px-2 py-0.5">
              <Zap className="w-2.5 h-2.5" /> WhatsApp
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-gray-500 bg-gray-50 rounded-full px-2 py-0.5">
              Manual
            </span>
          )}
        </div>

        {/* Resumo IA */}
        {lead.conversation_summary && (
          <p className="text-[10px] text-amber-700 bg-amber-50/70 rounded px-2 py-1 line-clamp-2 leading-relaxed italic mt-1">
            {lead.conversation_summary}
          </p>
        )}
        {!lead.conversation_summary && lead.notes && (
          <p className="text-[10px] text-gray-400 line-clamp-1 italic mt-1">{lead.notes}</p>
        )}

        {/* Hover actions */}
        {hover && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
            <div className="flex gap-1">
              {lead.phone && (
                <button
                  onClick={() => onOpenChat(lead.phone)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-[10px] font-semibold transition-colors"
                >
                  <MessageCircle className="w-3 h-3" /> Conversar
                </button>
              )}
              <button
                onClick={async () => { if (confirm('Deletar lead?')) { await api.deleteLead(lead.id); onRefresh(); } }}
                className="p-1.5 hover:bg-red-50 text-gray-300 hover:text-red-400 rounded-md transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            {otherCols.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {otherCols.map(c2 => {
                  const cc = CM[c2.color] || CM.zinc;
                  return (
                    <button
                      key={c2.id}
                      onClick={() => onStageChange(c2.id)}
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${cc.light} ${cc.text} hover:opacity-80 transition-opacity`}
                    >
                      {'\u2192'} {c2.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Board Kanban ─── */
export default function KanbanView({ leads, columns, tenant, onRefresh, onOpenChat }) {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg text-gray-800">Pipeline</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Filtrar leads..."
              className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs w-48 focus:bg-white focus:ring-1 focus:ring-gray-300 focus:border-gray-300 transition-all outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Etapa
        </button>
      </div>

      {/* Board */}
      {columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <GripVertical className="w-5 h-5 text-gray-300" />
            </div>
            <p className="font-semibold text-sm mb-1">Nenhuma etapa criada</p>
            <p className="text-xs">Crie sua primeira etapa do pipeline</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-3 overflow-x-auto pb-2 items-stretch min-h-0">
          {columns.map((col, colIdx) => {
            const colLeads = getLeadsForColumn(col, colIdx);
            const c = CM[col.color] || CM.zinc;
            const isDragTarget = dragOver === col.id;

            return (
              <div
                key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={async () => {
                  if (dragged) {
                    await api.updateLead(dragged.id, { stage: col.id });
                    setDragged(null);
                    onRefresh();
                  }
                  setDragOver(null);
                }}
                className={`flex flex-col rounded-xl transition-all flex-1 min-w-[220px] max-w-[300px] ${
                  isDragTarget ? 'ring-2 ring-offset-1 shadow-lg ' + c.ring : ''
                }`}
                style={{ minHeight: 0 }}
              >
                {/* Barra de cor no topo */}
                <div className={`h-1 rounded-t-xl ${c.bg}`} />

                {/* Header da coluna */}
                <div className={`px-3 py-2.5 ${c.light} border-x border-gray-100`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-[11px] uppercase tracking-wider ${c.text}`}>{col.name}</span>
                      <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${c.bg} text-white`}>
                        {colLeads.length}
                      </span>
                    </div>
                    <button
                      onClick={async () => { if (confirm('Excluir etapa "' + col.name + '"?')) { await api.deleteKanbanColumn(col.id); onRefresh(); } }}
                      className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-0.5 rounded hover:bg-white/50 transition-all"
                      style={{ opacity: undefined }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.3}
                    >
                      <X className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 bg-gray-50/50 border-x border-b border-gray-100 rounded-b-xl p-2 space-y-2 overflow-y-auto">
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
                    <div className="py-8 text-center">
                      <p className="text-[10px] text-gray-300 font-medium">Arraste leads aqui</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Etapa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base">Nova Etapa</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                await api.createKanbanColumn({ tenantId: tenant.id, name: newCol.name, color: newCol.color, position: columns.length });
                setNewCol({ name: '', color: 'blue' });
                setShowModal(false);
                onRefresh();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nome da etapa</label>
                <input
                  placeholder="Ex: Qualificando, Negociando..."
                  value={newCol.name}
                  onChange={e => setNewCol({ ...newCol, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm focus:bg-white focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Cor da etapa</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.keys(CM).map(colorKey => (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => setNewCol({ ...newCol, color: colorKey })}
                      className={`w-8 h-8 rounded-full transition-all ${CM[colorKey].bg} ${
                        newCol.color === colorKey
                          ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                      title={colorKey}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              {newCol.name && (
                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <div className={`h-1 ${CM[newCol.color]?.bg || CM.zinc.bg}`} />
                  <div className={`px-3 py-2 ${CM[newCol.color]?.light || CM.zinc.light}`}>
                    <span className={`font-bold text-[11px] uppercase tracking-wider ${CM[newCol.color]?.text || CM.zinc.text}`}>
                      {newCol.name}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-sm font-semibold transition-colors">
                  Criar Etapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

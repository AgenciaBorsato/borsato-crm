import React, { useState } from 'react';
import { Brain, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

export default function LeadSummaryCard({ lead, onRefresh, compact = false }) {
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

import React, { useState } from 'react';
import { Brain, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

// Badge semaforo frio/morno/quente
export function StageBadge({ structured_memory, className = '' }) {
  try {
    const mem = typeof structured_memory === 'string' ? JSON.parse(structured_memory) : structured_memory;
    const e = mem?.estagio_comercial?.toLowerCase();
    if (!e) return null;
    const map = {
      frio:   { color: '#3b82f6', label: 'FRIO' },
      morno:  { color: '#d97706', label: 'MORNO' },
      quente: { color: '#dc2626', label: 'QUENTE' },
    };
    const s = map[e];
    if (!s) return null;
    return (
      <span
        className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded ${className}`}
        style={{ color: s.color, border: `1px solid ${s.color}22`, background: `${s.color}11` }}
      >
        {s.label}
      </span>
    );
  } catch { return null; }
}

export default function LeadSummaryCard({ lead, onRefresh, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!lead?.conversation_summary && !lead?.structured_memory) return null;

  let memoryEntries = [];
  if (lead.structured_memory) {
    try {
      const mem = typeof lead.structured_memory === 'string' ? JSON.parse(lead.structured_memory) : lead.structured_memory;
      memoryEntries = Object.entries(mem).filter(([k, v]) => k !== 'estagio_comercial' && v && v !== '' && !(Array.isArray(v) && v.length === 0));
    } catch (e) { console.error('LEAD_MEMORY_PARSE_ERROR:', e.message, 'leadId:', lead?.id); }
  }

  const handleRefresh = async (e) => {
    e.stopPropagation();
    setRefreshing(true);
    try { await api.refreshLeadContext(lead.id); onRefresh?.(); } catch (e) { console.error('LEAD_CARD_REFRESH_ERROR:', e.message, 'leadId:', lead?.id); }
    finally { setRefreshing(false); }
  };

  const labelMap = {
    tipo_contato: 'Tipo', nome: 'Nome', empresa: 'Empresa', nicho: 'Segmento',
    objetivo_principal: 'Objetivo', dor_principal: 'Dor', interesse_servicos: 'Interesse',
    interesse_reuniao: 'Reuniao', ultimo_assunto: 'Ultimo assunto',
    objecoes: 'Objeções', melhor_horario_contato: 'Melhor horário', perfil_comportamental: 'Perfil'
  };

  if (compact) {
    // Default colapsado: mostra so titulo + acoes. Resumo cresce on-demand.
    // Remove o StageBadge daqui — ele agora vive no header do chat ao lado do nome.
    if (!expanded) {
      return (
        <button onClick={() => setExpanded(true)}
          className="mx-4 mt-2 mb-1 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 hover:bg-violet-100/70 transition-colors flex items-center gap-2 w-[calc(100%-2rem)]">
          <Brain className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
          <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wide flex-shrink-0">Contexto IA</span>
          <span className="text-[11px] text-violet-700/80 truncate flex-1 text-left">{lead.conversation_summary}</span>
          <ChevronDown className="w-3 h-3 text-violet-400 flex-shrink-0" />
        </button>
      );
    }
    return (
      <div className="mx-4 mt-2 mb-1 px-3 py-2 rounded-lg bg-violet-50 border border-violet-100">
        <div className="flex items-start gap-2">
          <Brain className="w-3.5 h-3.5 text-violet-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wide">Contexto IA</span>
              <button onClick={handleRefresh} disabled={refreshing} className="ml-auto p-0.5 text-violet-400 hover:text-violet-600 disabled:opacity-40 transition-colors" title="Atualizar resumo">
                <RefreshCw className={`w-2.5 h-2.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setExpanded(false)} className="p-0.5 text-violet-400 hover:text-violet-600 transition-colors" title="Recolher">
                <ChevronUp className="w-2.5 h-2.5" />
              </button>
            </div>
            <p className="text-[11px] text-violet-900 leading-relaxed">{lead.conversation_summary}</p>
            {memoryEntries.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {memoryEntries.map(([k, v]) => (
                  <span key={k} className="text-[9px] bg-white/80 border border-violet-200 text-violet-700 rounded px-1.5 py-0.5">
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
          <StageBadge structured_memory={lead.structured_memory} />
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

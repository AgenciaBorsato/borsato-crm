// intelligence/HealthView.jsx — Módulo 3: saúde dos clientes (semáforo cross-CRM)
import React, { useEffect, useState } from 'react';
import { RefreshCw, Loader2, AlertCircle, CheckCircle2, MessageSquare, Users, Clock, Wifi, WifiOff, Brain } from 'lucide-react';
import intelApi from './api';

function humanTime(ms) {
  if (ms == null) return '—';
  const s = ms / 1000;
  if (s < 60) return `${Math.round(s)}s`;
  const m = s / 60;
  if (m < 60) return `${Math.round(m)}min`;
  const h = m / 60;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${Math.round(h / 24)}d`;
}

function humanIdle(h) {
  if (h == null) return 'nunca';
  if (h < 1) return `${Math.round(h * 60)}min`;
  if (h < 24) return `${Math.round(h)}h`;
  return `${Math.round(h / 24)}d`;
}

const STATUS_STYLE = {
  green:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'OK' },
  yellow: { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   dot: 'bg-amber-400',   text: 'text-amber-300',   label: 'ATENÇÃO' },
  red:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    dot: 'bg-rose-400',    text: 'text-rose-300',    label: 'CRÍTICO' },
};

export default function HealthView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await intelApi.healthOverview();
      setData(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 60000); // auto-refresh 60s
    return () => clearInterval(i);
  }, []);

  if (loading && !data) return <div className="text-center py-12 text-gray-500 text-sm">carregando semáforo…</div>;
  if (error) return <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 text-sm">{error}</div>;
  if (!data) return null;

  const tenants = data.tenants || [];
  const { summary } = data;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
          Semáforo em tempo real dos CRMs. Avalia WhatsApp, SLA de resposta, volume de mensagens
          e inatividade. Auto-refresh a cada 60s.
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          atualizar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">OK</div>
          <div className="text-2xl font-bold text-emerald-300 tabular-nums">{summary.green}</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Atenção</div>
          <div className="text-2xl font-bold text-amber-300 tabular-nums">{summary.yellow}</div>
        </div>
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Crítico</div>
          <div className="text-2xl font-bold text-rose-300 tabular-nums">{summary.red}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tenants.map(t => {
          const s = STATUS_STYLE[t.status] || STATUS_STYLE.yellow;
          return (
            <div key={t.id} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.dot} flex-shrink-0 ${t.status === 'red' ? 'animate-pulse' : ''}`} />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{t.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.niche && <span className="text-[10px] text-gray-500">{t.niche}</span>}
                      <span className={`text-[9px] uppercase tracking-wider font-bold ${s.text}`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {t.wa_connected === true && <Wifi className="w-3.5 h-3.5 text-emerald-400" title="WhatsApp conectado" />}
                  {t.wa_connected === false && <WifiOff className="w-3.5 h-3.5 text-rose-400" title="WhatsApp desconectado" />}
                  {t.ai_enabled && <Brain className="w-3.5 h-3.5 text-violet-400" title="IA ativa" />}
                </div>
              </div>

              {t.reasons && t.reasons.length > 0 && (
                <div className="mb-3 text-[11px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
                  {t.reasons.map((r, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <AlertCircle className={`w-3 h-3 ${s.text}`} />
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/[0.03] rounded-lg py-2">
                  <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                    <MessageSquare className="w-2.5 h-2.5" /> 24h
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                    {t.received_24h}
                    <span className="text-[10px] text-gray-500 font-normal">/{t.sent_24h}</span>
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-lg py-2">
                  <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                    <Users className="w-2.5 h-2.5" /> 7d
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">{t.leads_7d}</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg py-2">
                  <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                    <Clock className="w-2.5 h-2.5" /> SLA
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                    {humanTime(t.avg_response_ms)}
                  </div>
                </div>
                <div className="bg-white/[0.03] rounded-lg py-2">
                  <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                    idle
                  </div>
                  <div className="text-sm font-bold text-white tabular-nums mt-0.5">
                    {humanIdle(t.idle_hours)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-[10px] text-gray-600 text-right">
        atualizado {new Date(data.generated_at).toLocaleTimeString('pt-BR')}
      </div>
    </div>
  );
}

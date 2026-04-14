import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Bot, Plus, Trash2, Users2, TrendingUp, TrendingDown, BarChart3, Target, Sparkles, RefreshCw, Filter, ArrowRight, Zap, Users, MessageSquare, Eye, Edit2, Search, Megaphone, Contact2 } from 'lucide-react';
import { CM } from '../constants';
import api from '../api';

export function WhatsAppView({ tenant }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [ld, setLd] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const nm = `tenant_${tenant.id}`;
  useEffect(() => { ck(); const i = setInterval(ck, 5000); return () => clearInterval(i); }, []);
  const ck = async () => { try { setStatus(await api.getWhatsAppStatus(tenant.id)); } catch {} };
  const syncContacts = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const r = await api.syncContacts(tenant.id);
      setSyncResult({ ok: true, msg: `${r.saved || 0} contatos sincronizados` });
    } catch (e) {
      setSyncResult({ ok: false, msg: e.message || 'Erro ao sincronizar' });
    } finally {
      setSyncing(false);
    }
  };
  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-lg mb-4">WhatsApp</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Status</h3>
          {status?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#25d366] rounded-full animate-pulse" /><span className="text-[#25d366] font-bold text-sm">Conectado</span></div>
              <button onClick={async () => { await api.disconnectWhatsApp(tenant.id); ck(); }} className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Desconectar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-300 rounded-full" /><span className="text-gray-400 text-sm">Desconectado</span></div>
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="Token..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono" />
              <button onClick={async () => { setLd(true); try { await api.connectWhatsApp(tenant.id, token); setToken(''); ck(); } catch { alert('Erro'); } finally { setLd(false); } }} disabled={ld || !token.trim()} className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50">{ld ? 'Salvando...' : 'Salvar'}</button>
              <button onClick={ck} className="w-full py-2 bg-gray-50 text-[#075e54] rounded-lg text-xs font-bold border border-gray-200">Verificar</button>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm mb-3">Instancia</h3>
            <div className="bg-gray-50 rounded-lg p-2.5 flex justify-between items-center">
              <code className="text-[#075e54] text-xs font-bold">{nm}</code>
              <button onClick={() => navigator.clipboard.writeText(nm)} className="text-[10px] text-gray-400">Copiar</button>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-2">Contatos</h3>
            <p className="text-[10px] text-gray-400 mb-2">Importa nomes da agenda do celular para exibir nos chats.</p>
            <button onClick={syncContacts} disabled={syncing} className="w-full py-2 bg-[#075e54] text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2">
              {syncing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sincronizando...</> : <><Contact2 className="w-3.5 h-3.5" /> Sincronizar Contatos</>}
            </button>
            {syncResult && (
              <p className={`text-[10px] mt-1.5 font-bold ${syncResult.ok ? 'text-green-600' : 'text-red-500'}`}>{syncResult.msg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniChart({ data, color = '#3b82f6', height = 48 }) {
  if (!data || data.length === 0) return <div className="h-12 flex items-center justify-center text-[9px] text-gray-300">Sem dados</div>;
  const max = Math.max(...data.map(d => d.count), 1);
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 ${data.length * 10} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => (
        <rect key={i} x={i * 10 + 1} y={height - (d.count / max) * (height - 4)} width={8} height={Math.max((d.count / max) * (height - 4), 1)} rx={2} fill={color} opacity={0.8} />
      ))}
    </svg>
  );
}

function FunnelBar({ stages, total }) {
  if (!stages || stages.length === 0) return null;
  const nonZero = stages.filter(s => s.count > 0);
  if (nonZero.length === 0) return <p className="text-xs text-gray-300 text-center py-4">Nenhum lead nas etapas</p>;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => {
        const pct = total > 0 ? (s.count / total) * 100 : 0;
        const c = CM[s.color] || CM.zinc;
        if (s.count === 0) return null;
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className="w-28 text-right"><span className="text-[11px] font-bold text-gray-600 truncate">{s.name}</span></div>
            <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
              <div className={`h-full rounded-lg ${c.bg} transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">{s.count} ({pct.toFixed(0)}%)</span>
            </div>
            {i < stages.length - 1 && stages[i + 1]?.count > 0 && (
              <span className="text-[9px] text-gray-400 w-10 text-center">{s.count > 0 ? ((stages[i + 1].count / s.count) * 100).toFixed(0) : 0}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AnalyticsView({ leads, columns, tenant }) {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [days, setDays] = useState(30);
  const tid = tenant?.id;

  const loadData = useCallback(async () => {
    if (!tid) return;
    setLoading(true);
    try { setData(await api.getAnalytics(tid, days)); } catch { setData(null); }
    finally { setLoading(false); }
  }, [tid, days]);

  const loadInsights = async () => {
    if (!tid) return;
    setInsightsLoading(true);
    try { const r = await api.getAnalyticsInsights(tid); setInsights(r); } catch { setInsights({ insights: 'Erro ao gerar insights.' }); }
    finally { setInsightsLoading(false); }
  };

  useEffect(() => { loadData(); }, [loadData]);

  if (loading && !data) return <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Carregando analytics...</div>;

  const d = data || {};
  const leadsData = d.leads || {};
  const conv = d.conversion || {};
  const trendPositive = (leadsData.trend || 0) >= 0;

  return (
    <div className="space-y-5">
      {/* Header com filtro */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600" /> Analytics</h2>
          <p className="text-[11px] text-gray-400">Metricas de conversao, funil e insights da operacao</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[7, 30, 90].map(p => (
              <button key={p} onClick={() => setDays(p)} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${days === p ? 'bg-white shadow-sm text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}>{p}d</button>
            ))}
          </div>
          <button onClick={loadData} className="p-1.5 text-gray-400 hover:text-gray-600"><RefreshCw className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* KPI Cards - Linha 1 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase text-gray-400">Leads no periodo</p>
            {trendPositive ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
          </div>
          <p className="text-3xl font-black text-gray-800">{leadsData.period || 0}</p>
          <p className={`text-[10px] font-bold ${trendPositive ? 'text-green-600' : 'text-red-500'}`}>
            {trendPositive ? '+' : ''}{leadsData.trend || 0} vs periodo anterior
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase text-green-600">Taxa de Conversao</p>
            <Target className="w-3.5 h-3.5 text-green-600" />
          </div>
          <p className="text-3xl font-black text-green-700">{conv.rate || 0}%</p>
          <p className="text-[10px] text-green-600">{conv.won || 0} convertidos de {leadsData.total || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Perdidos</p>
          <p className="text-3xl font-black text-red-600">{conv.lost || 0}</p>
          <p className="text-[10px] text-red-400">{conv.lossRate || 0}% de perda</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold uppercase text-gray-400">Mensagens</p>
            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <p className="text-3xl font-black text-gray-800">{d.messages?.total || 0}</p>
          <p className="text-[10px] text-purple-500">{d.messages?.ai || 0} pela IA</p>
        </div>
      </div>

      {/* Trafego Pago — Meta Ads */}
      {(d.metaAds?.total > 0 || d.metaAds?.period > 0) && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-blue-600" /> Trafego Pago (Meta Ads)
          </h3>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-blue-500 mb-0.5">Leads no periodo</p>
              <p className="text-2xl font-black text-blue-700">{d.metaAds.period || 0}</p>
              <p className={`text-[10px] font-bold ${(d.metaAds.trend || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {(d.metaAds.trend || 0) >= 0 ? '+' : ''}{d.metaAds.trend || 0} vs anterior
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-blue-500 mb-0.5">Total acumulado</p>
              <p className="text-2xl font-black text-gray-800">{d.metaAds.total || 0}</p>
              <p className="text-[10px] text-gray-400">{leadsData.total ? ((d.metaAds.total / leadsData.total) * 100).toFixed(0) : 0}% dos leads</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-blue-500 mb-0.5">Convertidos</p>
              <p className="text-2xl font-black text-green-700">{d.metaAds.won || 0}</p>
              <p className="text-[10px] text-green-600">{d.metaAds.conversionRate || 0}% de conversao</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-bold uppercase text-blue-500 mb-0.5">Leads Meta Ads ({days}d)</p>
              <MiniChart data={d.metaAds.timeline || []} color="#4f46e5" height={50} />
            </div>
          </div>
        </div>
      )}

      {/* Linha 2 — Funil + Timeline */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Filter className="w-3.5 h-3.5 text-gray-400" /> Funil de Conversao</h3>
          <FunnelBar stages={d.stages || []} total={leadsData.total || 0} />
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Novos Leads ({days}d)</h3>
          <MiniChart data={d.timeline || []} color="#3b82f6" height={80} />
          <div className="flex justify-between text-[8px] text-gray-300 mt-1">
            <span>{d.timeline?.[0]?.day?.slice(5) || ''}</span>
            <span>{d.timeline?.[d.timeline.length - 1]?.day?.slice(5) || ''}</span>
          </div>
        </div>
      </div>

      {/* Linha 3 — Origem + Interesses + Estagio Comercial */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Por Origem</h3>
          {(d.bySource || []).length > 0 ? (
            <div className="space-y-2">
              {d.bySource.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 capitalize">{s.source}</span>
                  <span className="text-xs font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">{s.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[10px] text-gray-300 text-center py-4">Sem dados</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Eye className="w-3.5 h-3.5 text-blue-400" /> Mais Buscados</h3>
          {(d.topInterests || []).length > 0 ? (
            <div className="space-y-2">
              {d.topInterests.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 capitalize truncate flex-1">{item.name}</span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{item.count}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-[10px] text-gray-300 text-center py-4">Leads ainda sem perfil</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-500" /> Temperatura</h3>
          {d.stagesComercial ? (
            <div className="space-y-3">
              {[{k:'quente',l:'Quente',color:'bg-red-500',text:'text-red-700'},{k:'morno',l:'Morno',color:'bg-amber-400',text:'text-amber-700'},{k:'frio',l:'Frio',color:'bg-blue-400',text:'text-blue-700'}].map(({k,l,color,text}) => {
                const count = d.stagesComercial[k] || 0;
                const total = Object.values(d.stagesComercial).reduce((a, b) => a + b, 0) || 1;
                return (
                  <div key={k}>
                    <div className="flex justify-between mb-0.5"><span className={`text-[11px] font-bold ${text}`}>{l}</span><span className="text-[10px] text-gray-400">{count}</span></div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${color}`} style={{ width: `${(count / total) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[10px] text-gray-300 text-center py-4">Sem dados</p>}
        </div>
      </div>

      {/* Linha 4 — Performance da Equipe */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">👤 Mensagens por Operador</h3>
          {(d.userPerformance || []).length > 0 ? (
            <div className="space-y-2">
              {d.userPerformance.map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${['bg-blue-500','bg-emerald-500','bg-orange-500','bg-pink-500','bg-indigo-500'][i % 5]}`}>{(u.name||'?')[0]}</span>
                    <span className="text-xs text-gray-700 truncate">{u.name || 'Desconhecido'}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{u.chats} chats</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{u.sent}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-[10px] text-gray-300 text-center py-4">Sem dados no periodo</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">⏱️ Tempo de Resposta</h3>
          {(d.responseTime || []).length > 0 ? (
            <div className="space-y-2">
              {d.responseTime.map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 truncate flex-1">{u.responder || 'Desconhecido'}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{u.responses} respostas</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${Number(u.avg_minutes) <= 5 ? 'bg-green-50 text-green-700' : Number(u.avg_minutes) <= 30 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{u.avg_minutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-[10px] text-gray-300 text-center py-4">Sem dados no periodo</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">🔴 Fila de Atendimento</h3>
          <div className="text-center py-3">
            <p className={`text-4xl font-black ${(d.pendingChats || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>{d.pendingChats || 0}</p>
            <p className="text-[10px] text-gray-400 mt-1">{(d.pendingChats || 0) > 0 ? 'leads aguardando resposta' : 'nenhum lead esperando'}</p>
          </div>
        </div>
      </div>

      {/* Linha 5 — Insights da IA */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-2 text-purple-800"><Sparkles className="w-4 h-4 text-purple-500" /> Insights da IA</h3>
          <button onClick={loadInsights} disabled={insightsLoading} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
            {insightsLoading ? <><RefreshCw className="w-3 h-3 animate-spin" /> Analisando...</> : <><Sparkles className="w-3 h-3" /> Gerar Insights</>}
          </button>
        </div>
        {insights ? (
          <div className="bg-white/70 rounded-lg p-4 text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap">{insights.insights}</div>
        ) : (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-purple-300 mx-auto mb-2" />
            <p className="text-[11px] text-purple-400">Clique em "Gerar Insights" para a IA analisar seus dados e sugerir acoes para melhorar a conversao</p>
          </div>
        )}
        {insights?.generatedAt && <p className="text-[9px] text-purple-400 mt-2 text-right">Gerado em {new Date(insights.generatedAt).toLocaleString('pt-BR')}</p>}
      </div>

      {/* Info rodape */}
      <div className="flex items-center gap-4 text-[9px] text-gray-300">
        <span>Total geral: {leadsData.total || 0} leads</span>
        <span>Com contexto IA: {d.context?.withSummary || 0}</span>
        <span>IA ativa em: {d.context?.aiEnabled || 0} leads</span>
      </div>
    </div>
  );
}

const SCRIPT_COLORS = [
  'bg-blue-50 text-blue-700',
  'bg-violet-50 text-violet-700',
  'bg-emerald-50 text-emerald-700',
  'bg-amber-50 text-amber-700',
  'bg-rose-50 text-rose-700',
  'bg-cyan-50 text-cyan-700',
  'bg-orange-50 text-orange-700',
];

function ScriptModal({ tenant, item, onClose, onSuccess }) {
  const [name, setName] = useState(item?.category || '');
  const [content, setContent] = useState(item?.answer || '');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    try {
      if (item) {
        await api.updateKnowledge(item.id, { category: name.trim(), answer: content });
      } else {
        await api.createKnowledge({ category: name.trim(), question: name.trim(), answer: content, tenantId: tenant.id });
      }
      onSuccess();
    } catch { alert('Erro ao salvar'); } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-800">{item ? 'Editar script' : 'Novo script'}</h3>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">Nome de referência</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: FLUXO COMPRADOR, FAQ, OBJEÇÃO PREÇO" className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all" autoFocus />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Script</label>
              <span className="text-[10px] text-gray-300">{content.length} chars</span>
            </div>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} placeholder="Descreva o fluxo ou instrução específica para a IA usar nesse contexto..." className="w-full bg-gray-50 rounded-lg px-3 py-2.5 text-xs leading-relaxed resize-y focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-300 transition-all" />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">Cancelar</button>
          <button onClick={save} disabled={saving || !name.trim() || !content.trim()} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-gray-700 transition-colors">{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}

function ScriptItem({ item, tenant, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState(false);
  const isLong = (item.answer || '').length > 180;
  const ci = (item.category || ' ').charCodeAt(0) % SCRIPT_COLORS.length;
  return (
    <>
      <div className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0 group">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap mt-0.5 flex-shrink-0 ${SCRIPT_COLORS[ci]}`}>{item.category || 'SEM NOME'}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs text-gray-500 leading-relaxed ${!expanded && isLong ? 'line-clamp-2' : ''}`}>{item.answer}</p>
          {isLong && <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-gray-400 hover:text-gray-600 mt-0.5">{expanded ? 'ver menos' : 'ver mais'}</button>}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
          <button onClick={() => setModal(true)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 className="w-3.5 h-3.5 text-gray-400" /></button>
          <button onClick={async () => { if (confirm('Deletar este script?')) { await api.deleteKnowledge(item.id); onRefresh(); } }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-gray-300 hover:text-red-400" /></button>
        </div>
      </div>
      {modal && <ScriptModal item={item} tenant={tenant} onClose={() => setModal(false)} onSuccess={() => { setModal(false); onRefresh(); }} />}
    </>
  );
}

export function KnowledgeView({ knowledge, tenant, onRefresh }) {
  return <IAView knowledge={knowledge} tenant={tenant} onRefresh={onRefresh} />;
}

export function IAView({ knowledge, tenant, onRefresh }) {
  const [prompt, setPrompt] = useState(tenant.ai_prompt || '');
  const [aiEnabled, setAiEnabled] = useState(Number(tenant.ai_enabled) === 1 || tenant.ai_enabled === true);
  const [saving, setSaving] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [syncingPics, setSyncingPics] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const savePrompt = async () => {
    setSaving(true);
    try { await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt: prompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: tenant.active }); onRefresh(); }
    catch { alert('Erro'); } finally { setSaving(false); }
  };
  const toggleAI = async () => {
    setTogglingAI(true);
    try { await api.setTenantAI(tenant.id, !aiEnabled); setAiEnabled(!aiEnabled); onRefresh(); }
    catch { alert('Erro ao alterar IA'); } finally { setTogglingAI(false); }
  };
  const syncProfilePics = async () => {
    setSyncingPics(true); setSyncResult(null);
    try { const r = await api.syncProfilePics(tenant.id); setSyncResult(r); }
    catch { alert('Erro ao sincronizar fotos'); } finally { setSyncingPics(false); }
  };
  const filtered = search ? knowledge.filter(k => (k.answer || '').toLowerCase().includes(search.toLowerCase()) || (k.category || '').toLowerCase().includes(search.toLowerCase())) : knowledge;

  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {/* LEFT — AI Config */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-sm text-gray-800">Assistente IA</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${aiEnabled ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>{aiEnabled ? 'Ativo' : 'Desligado'}</span>
            </div>
            <button onClick={toggleAI} disabled={togglingAI} className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 disabled:opacity-50 ${aiEnabled ? 'bg-purple-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiEnabled ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">Personalidade</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={10} placeholder={"Ex: Você é a assistente da Clínica X. Se apresente como Ana, seja educada e não marque consultas sem confirmar disponibilidade."} className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-xs font-mono leading-relaxed resize-none focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all" />
            <div className="flex justify-end mt-2">
              <button onClick={savePrompt} disabled={saving} className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-gray-700 transition-colors">{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          </div>
        </div>

        {/* Fotos de Perfil */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-sm text-gray-800">Fotos de Perfil</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Busca fotos do WhatsApp para todos os contatos e grupos.</p>
          <button onClick={syncProfilePics} disabled={syncingPics} className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl text-sm disabled:opacity-50 hover:bg-gray-700 transition-colors">{syncingPics ? 'Sincronizando...' : 'Sincronizar fotos'}</button>
          {syncResult && <p className="text-xs text-gray-400 mt-2">{syncResult.updated} fotos atualizadas de {syncResult.total} contatos</p>}
        </div>
      </div>

      {/* RIGHT — Scripts */}
      <div className="flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-700">Scripts</span>
            <span className="text-[10px] text-gray-400">{knowledge.length} {knowledge.length === 1 ? 'item' : 'itens'}</span>
          </div>
          <div className="flex items-center gap-2">
            {knowledge.length > 0 && (
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-1.5 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-gray-200" />
              </div>
            )}
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-700 transition-colors">
              <Plus className="w-3 h-3" /> Novo script
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl px-4 flex-1 overflow-y-auto">
          {filtered.length === 0 && !search && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">Nenhum script criado</p>
              <p className="text-xs text-gray-300 mt-1">Scripts ensinam a IA a lidar com situações específicas</p>
            </div>
          )}
          {filtered.length === 0 && search && <p className="py-8 text-center text-sm text-gray-400">Nenhum resultado para "{search}"</p>}
          {filtered.map(item => <ScriptItem key={item.id} item={item} tenant={tenant} onRefresh={onRefresh} />)}
        </div>
      </div>

      {showModal && <ScriptModal tenant={tenant} item={null} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); onRefresh(); }} />}
    </div>
  );
}

function UserModal({ user, tenant, onClose, onSuccess }) {
  const allT = ['kanban','chat','leads','whatsapp','analytics','knowledge','team','settings'];
  const [f, setF] = useState({ name: user?.name||'', email: user?.email||'', password: '', role: user?.role||'client_user', permissions: (()=>{try{return JSON.parse(user?.permissions||'[]')}catch{return[]}})() });
  const tp = p => setF({...f, permissions: f.permissions.includes(p)?f.permissions.filter(x=>x!==p):[...f.permissions,p]});
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">{user?'Editar':'Novo'} Usuario</h2>
        <form onSubmit={async e=>{e.preventDefault();try{if(user){await api.updateUser(user.id,{name:f.name,email:f.email,role:f.role,permissions:f.permissions,...(f.password?{password:f.password}:{})});}else{await api.createUser({...f,tenantId:tenant.id});}onSuccess();}catch(err){alert('Erro: '+err.message);}}} className="space-y-3">
          <input placeholder="Nome" value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="password" placeholder={user?'Nova senha (vazio=manter)':'Senha'} value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm p-2.5" required={!user} />
          <select value={f.role} onChange={e=>setF({...f,role:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option value="client_user">Usuario</option><option value="client_admin">Admin</option></select>
          {f.role==='client_user'&&(<div className="border border-gray-200 rounded-xl p-3"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Permissoes</p><div className="grid grid-cols-2 gap-1.5">{allT.map(tab=>(<label key={tab} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer ${f.permissions.includes(tab)?'bg-[#25d366]/10 text-[#075e54] font-bold':'bg-gray-50 text-gray-400'}`}><input type="checkbox" checked={f.permissions.includes(tab)} onChange={()=>tp(tab)} className="w-3 h-3" />{tab}</label>))}</div></div>)}
          <div className="flex gap-2 pt-1"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button></div>
        </form>
      </div>
    </div>
  );
}

export function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [onlineIds, setOnlineIds] = useState([]);
  React.useEffect(() => {
    const load = async () => { try { const r = await api.getOnlineUsers(tenant.id); setOnlineIds(r.map(u => u.id)); } catch {} };
    load(); const i = setInterval(load, 10000); return () => clearInterval(i);
  }, [tenant.id]);
  const onlineCount = onlineIds.length;
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-lg">Equipe</h2>
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-[10px] font-bold text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {onlineCount} online
          </span>
        </div>
        <button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Usuario</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase"><tr><th className="p-3">Nome</th><th className="p-3">Status</th><th className="p-3">E-mail</th><th className="p-3">Funcao</th><th className="p-3">Permissoes</th><th className="p-3 text-right">Acoes</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const perms = (() => { try { return JSON.parse(u.permissions || '[]'); } catch { return []; } })();
              const isOn = onlineIds.includes(u.id);
              return (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-xs">{u.name}</td>
                  <td className="p-3"><span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${isOn ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}><span className={`w-1.5 h-1.5 rounded-full ${isOn ? 'bg-green-500' : 'bg-gray-300'}`} />{isOn ? 'Online' : 'Offline'}</span></td>
                  <td className="p-3 text-xs text-gray-400">{u.email}</td>
                  <td className="p-3"><span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${u.role==='super_admin'?'bg-purple-50 text-purple-500':u.role==='client_admin'?'bg-amber-50 text-amber-600':'bg-blue-50 text-blue-500'}`}>{u.role==='super_admin'?'Mestre':u.role==='client_admin'?'Admin':'Usuario'}</span></td>
                  <td className="p-3 text-[9px] text-gray-400">{u.role==='client_user'?perms.join(', ')||'Nenhuma':''}</td>
                  <td className="p-3 text-right"><div className="flex gap-1 justify-end">{u.role==='client_user'&&<button onClick={()=>setEditing(u)} className="text-blue-400"><Edit2 className="w-3.5 h-3.5" /></button>}{u.id!==currentUser.id&&<button onClick={async()=>{if(confirm('Deletar?')){await api.deleteUser(u.id);onRefresh();}}} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(show||editing)&&<UserModal user={editing} tenant={tenant} onClose={()=>{setShow(false);setEditing(null);}} onSuccess={()=>{setShow(false);setEditing(null);onRefresh();}} />}
    </div>
  );
}

export function SettingsView({ tenant, onRefresh }) {
  const [syncingPics, setSyncingPics] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const syncProfilePics = async () => {
    setSyncingPics(true); setSyncResult(null);
    try { const r = await api.syncProfilePics(tenant.id); setSyncResult(r); }
    catch { alert('Erro ao sincronizar fotos'); } finally { setSyncingPics(false); }
  };
  return (
    <div className="max-w-sm space-y-4">
      <h2 className="font-semibold text-sm text-gray-700">Configurações</h2>
      <div className="bg-white rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users2 className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-sm text-gray-800">Fotos de Perfil</span>
        </div>
        <p className="text-xs text-gray-400 mb-4">Busca fotos do WhatsApp para todos os contatos e grupos.</p>
        <button onClick={syncProfilePics} disabled={syncingPics} className="px-4 py-2 bg-gray-900 text-white font-semibold rounded-xl text-sm disabled:opacity-50 hover:bg-gray-700 transition-colors">{syncingPics ? 'Sincronizando...' : 'Sincronizar fotos'}</button>
        {syncResult && <p className="text-xs text-gray-400 mt-2">{syncResult.updated} fotos atualizadas de {syncResult.total} contatos</p>}
      </div>
    </div>
  );
}

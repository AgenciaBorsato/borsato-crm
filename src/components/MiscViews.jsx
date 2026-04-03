import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Bot, Plus, Trash2, Users2, TrendingUp, TrendingDown, BarChart3, Target, Sparkles, RefreshCw, Filter, ArrowRight, Zap, Users, MessageSquare, Eye } from 'lucide-react';
import { CM } from '../constants';
import api from '../api';

export function WhatsAppView({ tenant }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [ld, setLd] = useState(false);
  const nm = `tenant_${tenant.id}`;
  useEffect(() => { ck(); const i = setInterval(ck, 5000); return () => clearInterval(i); }, []);
  const ck = async () => { try { setStatus(await api.getWhatsAppStatus(tenant.id)); } catch {} };
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
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Instancia</h3>
          <div className="bg-gray-50 rounded-lg p-2.5 flex justify-between items-center">
            <code className="text-[#075e54] text-xs font-bold">{nm}</code>
            <button onClick={() => navigator.clipboard.writeText(nm)} className="text-[10px] text-gray-400">Copiar</button>
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

function KnowledgeForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ category: 'FAQ', content: '' });
  return (
    <form onSubmit={async e => { e.preventDefault(); await api.createKnowledge({ category: f.category, question: f.category, answer: f.content, tenantId: tenant.id }); onSuccess(); }} className="space-y-3">
      <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option>Produtos/Servicos</option><option>Precos</option><option>Agendamento</option><option>FAQ</option></select>
      <textarea placeholder="Ex: Atendemos de segunda a sexta das 8h as 18h..." value={f.content} onChange={e => setF({ ...f, content: e.target.value })} rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
      <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button></div>
    </form>
  );
}

export function KnowledgeView({ knowledge, tenant, onRefresh }) {
  const [show, setShow] = useState(false);
  const cats = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">Conhecimento</h2><button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Novo</button></div>
      <div className="grid grid-cols-2 gap-4">
        {cats.map(cat => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">{cat}</h3>
            {knowledge.filter(k => k.category === cat).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2 flex justify-between items-start gap-2">
                <p className="text-xs text-gray-700 leading-relaxed flex-1">{item.answer}</p>
                <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteKnowledge(item.id); onRefresh(); } }} className="flex-shrink-0 mt-0.5"><Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" /></button>
              </div>
            ))}
            {knowledge.filter(k => k.category === cat).length === 0 && <p className="text-[10px] text-gray-300 text-center py-3">Vazio</p>}
          </div>
        ))}
      </div>
      {show && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"><h2 className="font-bold mb-1">Novo conteudo</h2><p className="text-[11px] text-gray-400 mb-4">Escreva qualquer informacao sobre o seu negocio. A IA decide o que usar em cada conversa.</p><KnowledgeForm tenant={tenant} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh(); }} /></div></div>)}
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
  const [prompt, setPrompt] = useState(tenant.ai_prompt || '');
  const [aiEnabled, setAiEnabled] = useState(Number(tenant.ai_enabled) === 1 || tenant.ai_enabled === true);
  const [saving, setSaving] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [syncingPics, setSyncingPics] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const syncProfilePics = async () => {
    setSyncingPics(true); setSyncResult(null);
    try { const r = await api.syncProfilePics(tenant.id); setSyncResult(r); }
    catch { alert('Erro ao sincronizar fotos'); }
    finally { setSyncingPics(false); }
  };

  const savePrompt = async () => {
    setSaving(true);
    try { await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt: prompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: tenant.active }); alert('Salvo!'); onRefresh(); }
    catch { alert('Erro'); } finally { setSaving(false); }
  };

  const toggleAI = async () => {
    setTogglingAI(true);
    try { await api.setTenantAI(tenant.id, !aiEnabled); setAiEnabled(!aiEnabled); onRefresh(); }
    catch { alert('Erro ao alterar IA'); } finally { setTogglingAI(false); }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="font-bold text-lg">Configuracoes</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><Bot className="w-4 h-4 text-purple-600" /><h3 className="font-bold text-sm">Assistente IA</h3><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${aiEnabled?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-400'}`}>{aiEnabled?'ATIVO':'DESLIGADO'}</span></div>
            <p className="text-xs text-gray-400 leading-relaxed">Quando ativo, a IA responde automaticamente mensagens recebidas de leads usando a base de conhecimento e o historico da conversa. Voce pode pausar individualmente por contato na tela de Conversas.</p>
          </div>
          <button onClick={toggleAI} disabled={togglingAI} className={`flex-shrink-0 w-12 h-6 rounded-full transition-all relative ${aiEnabled?'bg-purple-500':'bg-gray-300'} disabled:opacity-50`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiEnabled?'left-6':'left-0.5'}`} /></button>
        </div>
        {aiEnabled&&<div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-purple-600 bg-purple-50 rounded-lg px-3 py-2"><Bot className="w-3 h-3 flex-shrink-0" />IA ativa — responde com memoria de sessao, resumo do lead e base de conhecimento</div>}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-gray-400" /> Personalidade da IA</h3>
        <p className="text-[10px] text-gray-400 mb-3">Defina como a IA deve se apresentar. Se vazio, usa atendimento padrao cordial.</p>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={6} placeholder={"Exemplo:\nVoce e a assistente da Clinica Exemplo.\nSe apresente como Ana e seja sempre educada.\nNao marque consultas sem confirmar disponibilidade."} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3 font-mono text-xs leading-relaxed" />
        <button onClick={savePrompt} disabled={saving} className="px-5 py-2 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50">{saving?'Salvando...':'Salvar prompt'}</button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-amber-700 uppercase mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> Memoria da IA</p>
        <div className="space-y-1 text-[11px] text-amber-800">
          <p>A IA mantem 3 camadas de contexto por lead:</p>
          <p>1. <b>Sessao ativa</b> — historico das ultimas mensagens (24h)</p>
          <p>2. <b>Resumo persistente</b> — contexto estrategico salvo no lead</p>
          <p>3. <b>Perfil estruturado</b> — objetivo, dor, estagio e interesse detectados automaticamente</p>
          <p className="mt-1 text-amber-600">O resumo aparece no modal do lead e no header do chat. Use o botao de atualizar para gerar um novo resumo manualmente.</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Users2 className="w-4 h-4 text-gray-400" /> Fotos de Perfil</h3>
        <p className="text-[10px] text-gray-400 mb-3">Busca fotos de perfil do WhatsApp para todos os contatos e grupos. Pode levar alguns minutos.</p>
        <button onClick={syncProfilePics} disabled={syncingPics} className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-xl text-sm disabled:opacity-50 hover:bg-blue-800 transition-colors">{syncingPics ? 'Sincronizando...' : 'Sincronizar fotos'}</button>
        {syncResult && <p className="text-[10px] text-gray-500 mt-2">{syncResult.updated} fotos atualizadas de {syncResult.total} contatos ({syncResult.failed} sem foto disponivel)</p>}
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Como funciona</p>
        <div className="space-y-1 text-[11px] text-gray-500">
          <p>1. IA ligada aqui responde todos os leads automaticamente</p>
          <p>2. Base de Conhecimento e a fonte das respostas</p>
          <p>3. Em Conversas: botao IA ativa/pausada por contato individual</p>
          <p>4. Mensagens da IA aparecem com badge roxo na conversa</p>
          <p>5. Resumo atualizado automaticamente na 3a, 7a e 15a mensagem do lead</p>
        </div>
      </div>
    </div>
  );
}

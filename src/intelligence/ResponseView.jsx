// intelligence/ResponseView.jsx — Módulo 4: tempo de resposta × conversão
import React, { useEffect, useState } from 'react';
import { Loader2, Timer, TrendingUp } from 'lucide-react';
import intelApi from './api';

export default function ResponseView() {
  const [options, setOptions] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [niche, setNiche] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [opts, list] = await Promise.all([
          intelApi.nichesOptions(),
          intelApi.nichesTenants(),
        ]);
        setOptions(opts);
        setTenants(list);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const r = await intelApi.responseConversion({ tenantId, niche, days });
      setData(r);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); }, []); // carga inicial (todos os tenants)

  const nicheLabel = (id) => options.find(o => o.id === id)?.label || id;
  const usedNiches = [...new Set(tenants.filter(t => t.niche).map(t => t.niche))];

  const maxConv = data ? Math.max(5, ...data.buckets.map(b => b.conversion_rate)) : 0;
  const maxTotal = data ? Math.max(1, ...data.buckets.map(b => b.total)) : 0;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed max-w-3xl">
        Agrupa leads por bucket de tempo da primeira resposta e calcula taxa de conversão
        (lead chegou na última coluna do kanban). Útil pra provar impacto do SLA na receita.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={tenantId}
          onChange={e => { setTenantId(e.target.value); if (e.target.value) setNiche(''); }}
          className="bg-[#0f1419] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-violet-500 outline-none"
        >
          <option value="">— todos tenants —</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={niche}
          onChange={e => { setNiche(e.target.value); if (e.target.value) setTenantId(''); }}
          className="bg-[#0f1419] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-violet-500 outline-none"
        >
          <option value="">— qualquer nicho —</option>
          {usedNiches.map(n => <option key={n} value={n}>{nicheLabel(n)}</option>)}
        </select>

        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="bg-[#0f1419] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-violet-500 outline-none"
        >
          <option value={7}>últimos 7 dias</option>
          <option value={30}>últimos 30 dias</option>
          <option value={90}>últimos 90 dias</option>
          <option value={180}>últimos 180 dias</option>
        </select>

        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-200 hover:bg-violet-500/25 disabled:opacity-40 text-sm transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Timer className="w-4 h-4" />}
          Analisar
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300 mb-4">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-4">
            <span>{data.total_leads} leads no período</span>
            <span>·</span>
            <span>{data.leads_with_response} com resposta medida</span>
          </div>

          <div className="bg-[#131920] border border-white/5 rounded-xl p-5">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-3 items-center">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Bucket</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Conversão</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold text-right">Leads</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold text-right">Conv%</div>

              {data.buckets.map(b => {
                const convPct = maxConv > 0 ? (b.conversion_rate / maxConv) * 100 : 0;
                const color = b.conversion_rate >= 20 ? 'bg-emerald-500'
                            : b.conversion_rate >= 10 ? 'bg-amber-500'
                            : 'bg-rose-500';
                const dim = b.total === 0;
                return (
                  <React.Fragment key={b.id}>
                    <div className={`text-xs font-medium ${dim ? 'text-gray-600' : 'text-gray-200'} whitespace-nowrap`}>
                      {b.label}
                    </div>
                    <div className="h-6 bg-white/[0.03] rounded-md overflow-hidden relative">
                      {b.total > 0 && (
                        <div
                          className={`h-full ${color} transition-all`}
                          style={{ width: `${Math.max(convPct, 2)}%` }}
                        />
                      )}
                    </div>
                    <div className={`text-xs tabular-nums text-right ${dim ? 'text-gray-600' : 'text-gray-400'}`}>
                      {b.converted}/{b.total}
                    </div>
                    <div className={`text-xs font-bold tabular-nums text-right ${dim ? 'text-gray-600' : 'text-white'}`}>
                      {b.total > 0 ? `${b.conversion_rate}%` : '—'}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="mt-4 bg-violet-500/5 border border-violet-500/20 rounded-lg p-4 flex items-start gap-3">
            <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-violet-100 leading-relaxed">
              <strong className="text-violet-300">Leitura:</strong> buckets mais rápidos tendem a ter
              maior taxa de conversão. Se a taxa cai a partir de 15min, significa que responder em
              até 15min é um diferencial de receita mensurável.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

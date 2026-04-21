// intelligence/ObjectionsView.jsx — Módulo 2: top objeções por nicho
import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, AlertCircle, Target } from 'lucide-react';
import intelApi from './api';

const CATEGORY_COLORS = {
  preco:       'bg-rose-500/15 text-rose-300 border-rose-500/30',
  prazo:       'bg-amber-500/15 text-amber-300 border-amber-500/30',
  confianca:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
  tecnica:     'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  localizacao: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  resultado:   'bg-violet-500/15 text-violet-300 border-violet-500/30',
  outro:       'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

export default function ObjectionsView() {
  const [options, setOptions] = useState([]);
  const [niches, setNiches] = useState([]); // niches com tenants classificados
  const [niche, setNiche] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [opts, tenants] = await Promise.all([
          intelApi.nichesOptions(),
          intelApi.nichesTenants(),
        ]);
        setOptions(opts);
        const used = [...new Set(tenants.filter(t => t.niche).map(t => t.niche))];
        setNiches(used);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoadingOptions(false);
      }
    })();
  }, []);

  async function run(force = false) {
    if (!niche) return;
    setLoading(true);
    setError(null);
    try {
      const r = await intelApi.topObjections(niche, { force });
      setData(r);
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const nicheLabel = (id) => options.find(o => o.id === id)?.label || id;

  if (loadingOptions) return <div className="text-center py-12 text-gray-500 text-sm">carregando…</div>;

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Agrupa mensagens de clientes dos tenants classificados no nicho e extrai as principais
        objeções/dores/dúvidas. Cada objeção vem com sugestão de ângulo pra copy de anúncio.
        Resultado cacheado por 24h.
      </p>

      <div className="flex items-center gap-3 mb-6">
        <select
          value={niche}
          onChange={e => { setNiche(e.target.value); setData(null); setError(null); }}
          className="bg-[#0f1419] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-violet-500 outline-none min-w-[240px]"
        >
          <option value="">— escolha um nicho —</option>
          {niches.map(id => (
            <option key={id} value={id}>{nicheLabel(id)}</option>
          ))}
        </select>
        <button
          onClick={() => run(false)}
          disabled={!niche || loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-200 hover:bg-violet-500/25 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
          Analisar
        </button>
        {data && (
          <button
            onClick={() => run(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-xs transition-colors"
            title="Ignora cache e recomputa"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            recomputar
          </button>
        )}
      </div>

      {niches.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Nenhum tenant classificado ainda. Volte ao módulo <strong>Nichos</strong> e classifique
            pelo menos 1 tenant antes de rodar a análise.
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300 mb-4">
          {error}
        </div>
      )}

      {data && (
        <div>
          <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-4">
            <span>{data.tenants?.length || 0} tenants</span>
            <span>·</span>
            <span>{data.sample_size} mensagens analisadas</span>
            <span>·</span>
            <span>{data.objections?.length || 0} objeções</span>
            {data.cached ? (
              <span className="ml-auto text-[10px] text-gray-600">
                cache · {new Date(data.computed_at).toLocaleString('pt-BR')}
              </span>
            ) : (
              <span className="ml-auto text-[10px] text-violet-400">
                computado agora · {data.elapsed_ms}ms
              </span>
            )}
          </div>

          <div className="space-y-3">
            {(data.objections || []).map((o, i) => {
              const cat = CATEGORY_COLORS[o.category] || CATEGORY_COLORS.outro;
              return (
                <div key={i} className="bg-[#131920] border border-white/5 rounded-xl p-5 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-2xl font-bold text-gray-600 tabular-nums w-8 flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-tight">{o.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${cat}`}>
                        {o.category}
                      </span>
                      <span className="text-[11px] text-gray-400 tabular-nums">
                        {o.percentage}% · {o.count}
                      </span>
                    </div>
                  </div>

                  {o.example && (
                    <div className="ml-11 mt-2 text-[12px] text-gray-400 italic leading-relaxed border-l-2 border-white/10 pl-3">
                      "{o.example}"
                    </div>
                  )}

                  {o.copy_angle && (
                    <div className="ml-11 mt-3 bg-violet-500/5 border border-violet-500/20 rounded-lg px-3 py-2">
                      <div className="text-[9px] font-bold text-violet-400 uppercase tracking-wider mb-1">
                        Ângulo de copy
                      </div>
                      <div className="text-[12px] text-violet-100 leading-relaxed">
                        {o.copy_angle}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

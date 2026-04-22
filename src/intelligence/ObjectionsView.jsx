// intelligence/ObjectionsView.jsx — Módulo 2: top objeções por nicho (visão cross-nicho)
import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, AlertCircle, Play, ChevronDown, ChevronRight } from 'lucide-react';
import intelApi from './api';

const CATEGORY_COLORS = {
  preco:       'bg-rose-500/15 text-rose-300',
  prazo:       'bg-amber-500/15 text-amber-300',
  confianca:   'bg-blue-500/15 text-blue-300',
  tecnica:     'bg-cyan-500/15 text-cyan-300',
  localizacao: 'bg-emerald-500/15 text-emerald-300',
  resultado:   'bg-violet-500/15 text-violet-300',
  outro:       'bg-gray-500/15 text-gray-300',
};

export default function ObjectionsView() {
  const [options, setOptions] = useState([]);
  const [niches, setNiches] = useState([]);       // ids de nichos em uso
  const [dataByNiche, setDataByNiche] = useState({});   // { niche: { loading, data, error, cached } }
  const [expanded, setExpanded] = useState({});   // { niche: bool }
  const [bootstrapping, setBootstrapping] = useState(true);

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
        // Expande todos por padrão
        const exp = {};
        used.forEach(n => { exp[n] = true; });
        setExpanded(exp);
        // Carrega todos em paralelo (cache 24h; quando não há cache, backend retorna erro se amostra < 20)
        await Promise.all(used.map(loadNiche));
      } catch (e) {
        // erro genérico
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  async function loadNiche(niche, force = false) {
    setDataByNiche(prev => ({ ...prev, [niche]: { ...(prev[niche] || {}), loading: true, error: null } }));
    try {
      const r = await intelApi.topObjections(niche, { force });
      setDataByNiche(prev => ({ ...prev, [niche]: { loading: false, data: r, error: null } }));
    } catch (e) {
      setDataByNiche(prev => ({ ...prev, [niche]: { loading: false, data: null, error: e.message } }));
    }
  }

  const nicheLabel = (id) => options.find(o => o.id === id)?.label || id;

  if (bootstrapping) {
    return <div className="text-center py-12 text-gray-500 text-sm">carregando nichos…</div>;
  }

  if (niches.length === 0) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-sm text-amber-200 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Nenhum tenant classificado ainda. Vá ao módulo <strong>Nichos</strong> e classifique pelo
          menos 1 tenant.
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed max-w-3xl">
        Top objeções por nicho, agregando mensagens de clientes de todos os tenants classificados.
        Cada linha traz a dor, categoria, frequência e um ângulo de copy pronto pra anúncio.
        Cache de 24h.
      </p>

      <div className="space-y-4">
        {niches.map(n => {
          const entry = dataByNiche[n] || {};
          const isOpen = expanded[n];
          const data = entry.data;
          const nicheTenants = data?.tenants || [];
          return (
            <div key={n} className="bg-[#131920] border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [n]: !prev[n] }))}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left"
              >
                {isOpen ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{nicheLabel(n)}</h3>
                    {data && (
                      <span className="text-[10px] text-gray-500">
                        {nicheTenants.length} {nicheTenants.length === 1 ? 'tenant' : 'tenants'} · {data.objections?.length || 0} objeções · {data.sample_size} msgs
                      </span>
                    )}
                  </div>
                  {data && nicheTenants.length > 0 && (
                    <div className="text-[10px] text-gray-600 mt-0.5 truncate">
                      {nicheTenants.map(t => t.name).join(' · ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {entry.loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />}
                  {data?.cached && <span className="text-[9px] uppercase tracking-wider text-gray-600">cache</span>}
                  {data && (
                    <button
                      onClick={(e) => { e.stopPropagation(); loadNiche(n, true); }}
                      title="Recomputar ignorando cache"
                      className="text-gray-500 hover:text-white p-1 rounded transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!data && !entry.loading && (
                    <button
                      onClick={(e) => { e.stopPropagation(); loadNiche(n); }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-violet-500/15 border border-violet-500/30 text-violet-200 hover:bg-violet-500/25 text-[11px] transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      analisar
                    </button>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/5">
                  {entry.error && (
                    <div className="px-4 py-3 text-xs text-red-300 bg-red-500/5 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {entry.error}
                    </div>
                  )}
                  {entry.loading && !data && (
                    <div className="px-4 py-8 text-center text-gray-500 text-xs">analisando mensagens…</div>
                  )}
                  {data && (
                    <table className="w-full text-sm">
                      <thead className="bg-white/[0.02] text-[10px] text-gray-500 uppercase tracking-wider">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium w-8">#</th>
                          <th className="text-left px-4 py-2 font-medium">Objeção</th>
                          <th className="text-left px-4 py-2 font-medium w-28">Categoria</th>
                          <th className="text-right px-4 py-2 font-medium w-20">%</th>
                          <th className="text-left px-4 py-2 font-medium">Ângulo de copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(data.objections || []).map((o, i) => {
                          const cat = CATEGORY_COLORS[o.category] || CATEGORY_COLORS.outro;
                          return (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors align-top">
                              <td className="px-4 py-3 text-gray-600 tabular-nums text-xs">{String(i + 1).padStart(2, '0')}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-white text-[13px] leading-tight">{o.title}</div>
                                {o.example && (
                                  <div className="text-[11px] text-gray-500 italic mt-1 leading-relaxed line-clamp-2">
                                    "{o.example}"
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${cat}`}>
                                  {o.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="text-white font-bold tabular-nums text-sm">{o.percentage}%</div>
                                <div className="text-[10px] text-gray-600 tabular-nums">{o.count}</div>
                              </td>
                              <td className="px-4 py-3 text-[12px] text-violet-200 leading-relaxed">
                                {o.copy_angle || '—'}
                              </td>
                            </tr>
                          );
                        })}
                        {(!data.objections || data.objections.length === 0) && (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-xs">
                              nenhuma objeção detectada
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

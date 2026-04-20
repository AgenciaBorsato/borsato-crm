// intelligence/NichesView.jsx — Módulo 1: classificação de tenants por nicho
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import intelApi from './api';

export default function NichesView() {
  const [tenants, setTenants] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inferring, setInferring] = useState({});
  const [toast, setToast] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [opts, list] = await Promise.all([
        intelApi.nichesOptions(),
        intelApi.nichesTenants(),
      ]);
      setOptions(opts);
      setTenants(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function flash(msg, kind = 'ok') {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleManualChange(tenantId, niche) {
    if (!niche) return;
    try {
      await intelApi.setTenantNiche(tenantId, niche);
      flash('Nicho atualizado.');
      await load();
    } catch (e) {
      flash(e.message, 'err');
    }
  }

  async function handleInfer(tenantId) {
    setInferring(prev => ({ ...prev, [tenantId]: true }));
    try {
      const r = await intelApi.inferTenantNiche(tenantId);
      flash(`IA classificou como "${r.niche}" (confiança ${Math.round((r.ai_confidence || 0) * 100)}%)`);
      await load();
    } catch (e) {
      flash(e.message, 'err');
    } finally {
      setInferring(prev => { const n = { ...prev }; delete n[tenantId]; return n; });
    }
  }

  const nicheLabel = (id) => options.find(o => o.id === id)?.label || id;

  if (loading) {
    return <div className="text-center py-12 text-gray-500 text-sm">carregando tenants…</div>;
  }
  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm flex items-center gap-2 border ${
          toast.kind === 'err'
            ? 'bg-red-500/10 border-red-500/30 text-red-300'
            : 'bg-green-500/10 border-green-500/30 text-green-300'
        }`}>
          {toast.kind === 'err' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Classificação de cada tenant por segmento. Usada pelos outros módulos (objeções, insights)
        para agrupar dados similares. Pode definir manualmente ou deixar a IA inferir a partir das
        mensagens recentes.
      </p>

      <div className="overflow-x-auto border border-white/5 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] text-[11px] text-gray-400 uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tenant</th>
              <th className="text-left px-4 py-3 font-medium">Nicho atual</th>
              <th className="text-left px-4 py-3 font-medium">Origem</th>
              <th className="text-right px-4 py-3 font-medium">Leads</th>
              <th className="text-right px-4 py-3 font-medium">Msgs</th>
              <th className="text-left px-4 py-3 font-medium">Classificar</th>
              <th className="text-right px-4 py-3 font-medium">IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tenants.map(t => {
              const conf = t.ai_confidence != null ? Math.round(Number(t.ai_confidence) * 100) : null;
              return (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="text-[10px] text-gray-600">{t.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    {t.niche ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 text-xs">
                        {nicheLabel(t.niche)}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-xs italic">sem classificação</span>
                    )}
                    {t.ai_reasoning && (
                      <div className="text-[10px] text-gray-500 mt-1 max-w-xs truncate" title={t.ai_reasoning}>
                        {t.ai_reasoning}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {t.source === 'manual' && (
                      <span className="text-[11px] text-gray-400">manual</span>
                    )}
                    {t.source === 'ai' && (
                      <span className="text-[11px] text-violet-300">IA · {conf}%</span>
                    )}
                    {!t.source && <span className="text-[11px] text-gray-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 tabular-nums">
                    {Number(t.lead_count || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 tabular-nums">
                    {Number(t.message_count || 0).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={t.niche || ''}
                      onChange={e => handleManualChange(t.id, e.target.value)}
                      className="bg-[#0f1419] border border-white/10 rounded px-2 py-1 text-xs text-gray-200 hover:border-violet-500/40 focus:border-violet-500 outline-none"
                    >
                      <option value="">— selecionar —</option>
                      {options.map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleInfer(t.id)}
                      disabled={inferring[t.id] || Number(t.message_count || 0) < 5}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-violet-500/10 border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title={Number(t.message_count || 0) < 5 ? 'Precisa de pelo menos 5 mensagens' : 'Inferir nicho via IA'}
                    >
                      {inferring[t.id] ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      inferir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {tenants.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">nenhum tenant encontrado.</div>
      )}
    </div>
  );
}

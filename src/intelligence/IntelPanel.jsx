// intelligence/IntelPanel.jsx — painel principal da Torre Intel
// Isolado: nao importa nada dos componentes do CRM principal.
// Ponto unico de entrada sera adicionado no SuperAdminPanel.

import React, { useState, useEffect } from 'react';
import { Brain, Tags, AlertTriangle, Timer, Sparkles, HeartPulse } from 'lucide-react';
import intelApi from './api';
import NichesView from './NichesView';
import ObjectionsView from './ObjectionsView';
import HealthView from './HealthView';
import ResponseView from './ResponseView';
import InsightsView from './InsightsView';

const MODULES = [
  { id: 'niches', label: 'Nichos', icon: Tags, desc: 'Classificacao dos clientes por segmento (manual + IA)' },
  { id: 'objections', label: 'Top Objeções', icon: AlertTriangle, desc: 'Principais dores por nicho — ouro pra copy de anuncio' },
  { id: 'health', label: 'Saúde dos clientes', icon: HeartPulse, desc: 'Semaforo em tempo real dos 8 CRMs' },
  { id: 'response', label: 'Tempo × Conversão', icon: Timer, desc: 'Impacto do SLA na conversao de leads' },
  { id: 'insights', label: 'Insights com IA', icon: Sparkles, desc: 'Pergunta livre ao Claude com dados de todos os CRMs' },
];

function readModuleFromHash() {
  const h = (window.location.hash || '').replace(/^#/, '');
  const parts = h.split('/');
  if (parts[0] === 'intel' && parts[1]) {
    if (MODULES.some(m => m.id === parts[1])) return parts[1];
  }
  return null;
}

export default function IntelPanel({ onBack }) {
  const [module, setModuleState] = useState(readModuleFromHash());
  const [health, setHealth] = useState(null);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState(null);

  // wrapper que sincroniza hash
  const setModule = (id) => {
    setModuleState(id);
    if (id) window.location.hash = `intel/${id}`;
    else window.location.hash = 'intel';
  };

  // Escuta mudanças externas (back/forward)
  useEffect(() => {
    const onHash = () => setModuleState(readModuleFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Se entrou no painel sem hash, seta #intel
  useEffect(() => {
    if (!window.location.hash.startsWith('#intel')) {
      window.location.hash = 'intel';
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const h = await intelApi.health();
        setHealth(h);
        await intelApi.ping(); // valida auth
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setConnecting(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1419] text-gray-100">
      <header className="border-b border-white/5 bg-[#131920] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Intel</h1>
            <p className="text-[11px] text-gray-400">Analise comportamental cross-CRM · acesso restrito</p>
          </div>
        </div>
        {onBack && (
          <button onClick={() => { window.location.hash = ''; onBack(); }} className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
            ← Voltar ao painel
          </button>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {connecting && (
          <div className="text-center py-12 text-gray-500 text-sm">conectando à torre Intel…</div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-4 text-sm">
            Erro ao conectar: {error}
          </div>
        )}

        {!connecting && !error && !module && (
          <>
            <div className="mb-6 flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-lg px-4 py-2.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-xs text-green-300">
                Conectado · {health?.intel_tables || 0} tabelas intel detectadas
              </p>
            </div>

            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Módulos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MODULES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModule(m.id)}
                  className="group text-left bg-[#131920] hover:bg-[#1a2128] border border-white/5 hover:border-violet-500/30 rounded-xl p-5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/20 transition-colors">
                      <m.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-white">{m.label}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-[10px] uppercase tracking-wider font-medium text-violet-400">
                    ativo
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 text-[11px] text-gray-600 leading-relaxed">
              <strong className="text-gray-500">Arquitetura:</strong> torre Intel roda em paralelo ao CRM,
              com banco e código isolados. Operações destrutivas em tabelas de produção são
              bloqueadas no nível do DB. Acesso restrito a <code className="bg-white/5 px-1 rounded">super_admin</code>.
            </div>
          </>
        )}

        {!connecting && !error && module && (
          <div>
            <button onClick={() => setModule(null)} className="text-xs text-gray-400 hover:text-white mb-4">
              ← Todos os módulos
            </button>
            <h2 className="text-lg font-bold mb-4">{MODULES.find(m => m.id === module)?.label}</h2>
            {module === 'niches' ? (
              <NichesView />
            ) : module === 'objections' ? (
              <ObjectionsView />
            ) : module === 'health' ? (
              <HealthView />
            ) : module === 'response' ? (
              <ResponseView />
            ) : module === 'insights' ? (
              <InsightsView />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

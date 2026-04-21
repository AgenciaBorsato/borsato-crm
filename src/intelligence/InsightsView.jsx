// intelligence/InsightsView.jsx — Módulo 5: pergunta livre ao Claude com dados cross-CRM
import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Clock, User } from 'lucide-react';
import intelApi from './api';

const SUGGESTIONS = [
  'Qual tenant teve maior crescimento de leads nos últimos 30 dias?',
  'Quais nichos têm maior volume de mensagens por lead?',
  'Quais tenants estão com a IA desligada mas volume alto de mensagens?',
  'Onde faz mais sentido focar esforço de otimização agora?',
  'Qual nicho tem a distribuição de leads mais saudável no kanban?',
];

export default function InsightsView() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState([]);

  async function loadRecent() {
    try {
      const r = await intelApi.recentInsights(10);
      setRecent(r);
    } catch (e) { /* silencioso */ }
  }

  useEffect(() => { loadRecent(); }, []);

  async function ask(q) {
    const question_ = (q || question).trim();
    if (question_.length < 5) return;
    setQuestion(question_);
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const r = await intelApi.askInsight(question_);
      setAnswer(r);
      loadRecent();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed max-w-3xl">
        Pergunte em linguagem natural. O Claude recebe um resumo agregado de todos os tenants
        (leads, mensagens, nichos, kanban) e responde com base só nesses dados. Sem acesso a
        mensagens individuais.
      </p>

      <div className="bg-[#131920] border border-white/5 rounded-xl p-4 mb-4">
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ex: quais tenants precisam de atenção urgente e por quê?"
          rows={3}
          className="w-full bg-[#0f1419] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:border-violet-500 outline-none resize-none"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) ask(); }}
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-[10px] text-gray-600">
            Cmd/Ctrl + Enter para enviar
          </div>
          <button
            onClick={() => ask()}
            disabled={loading || question.trim().length < 5}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Perguntar
          </button>
        </div>
      </div>

      {!answer && !loading && (
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Sugestões</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(s); ask(s); }}
                className="text-xs px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-violet-500/40 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300 mb-4">
          {error}
        </div>
      )}

      {answer && (
        <div className="bg-[#131920] border border-violet-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] uppercase tracking-wider text-violet-400 font-bold">Resposta</span>
            <span className="ml-auto text-[10px] text-gray-600 tabular-nums">
              {answer.elapsed_ms}ms · {answer.tokens_used} tokens · {answer.context_stats?.tenants} tenants no contexto
            </span>
          </div>
          <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
            {answer.answer}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">Últimas perguntas</div>
          <div className="space-y-2">
            {recent.map(r => (
              <button
                key={r.id}
                onClick={() => { setQuestion(r.question); setAnswer({ answer: r.answer_summary, elapsed_ms: r.elapsed_ms, tokens_used: r.tokens_used, context_stats: {} }); }}
                className="w-full text-left bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2.5 transition-colors group"
              >
                <div className="text-xs text-gray-300 group-hover:text-white line-clamp-1">{r.question}</div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-600">
                  <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {r.asked_by}</span>
                  <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(r.created_at).toLocaleString('pt-BR')}</span>
                  <span>{r.tokens_used} tokens</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

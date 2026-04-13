import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Clock, Users, TrendingUp, ChevronRight, Bell, Zap, RefreshCw } from 'lucide-react';
import { CM, daysAgo } from '../constants';
import api from '../api';

function greetByTime() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function timeUntil(dateStr) {
  if (!dateStr) return '';
  const diff = new Date(dateStr) - new Date();
  if (diff < 0) {
    const mins = Math.abs(Math.floor(diff / 60000));
    if (mins < 60) return `${mins}min atrasado`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrasado`;
    return `${Math.floor(hrs / 24)}d atrasado`;
  }
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `em ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `em ${hrs}h`;
  return `em ${Math.floor(hrs / 24)}d`;
}

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function HomeSimples({ tenant, columns, onRefresh, onOpenChat, currentUser, onNavigate }) {
  const [chats, setChats] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);
    try {
      const [chatsData, followUpsData, analyticsData] = await Promise.all([
        api.getChats(tenant.id),
        api.getFollowUps(tenant.id),
        api.getAnalytics(tenant.id, 7),
      ]);
      setChats(chatsData || []);
      setFollowUps(followUpsData || []);
      setAnalytics(analyticsData || null);
    } catch (e) {
      console.error('HomeSimples loadData error:', e);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh a cada 30s
  useEffect(() => {
    const i = setInterval(loadData, 30000);
    return () => clearInterval(i);
  }, [loadData]);

  // Conversas aguardando resposta: ultima mensagem nao e do operador
  const pendingChats = chats
    .filter(c => c.last_message_from_me === 0 || c.last_message_from_me === '0' || c.last_message_from_me === false)
    .sort((a, b) => new Date(b.last_message_at || b.updated_at) - new Date(a.last_message_at || a.updated_at))
    .slice(0, 5);

  // Follow-ups de hoje ou atrasados
  const todayFollowUps = followUps
    .filter(f => f.status !== 'completed' && f.status !== 'done' && (isToday(f.due_date || f.scheduled_at) || isOverdue(f.due_date || f.scheduled_at)))
    .sort((a, b) => new Date(a.due_date || a.scheduled_at) - new Date(b.due_date || b.scheduled_at))
    .slice(0, 5);

  // Leads recentes (ultimos 7 dias)
  const leads = tenant.leads || [];
  const recentLeads = leads
    .filter(l => daysAgo(l.created_at) <= 7)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Metricas resumidas
  const leadsCount = analytics?.leads?.period || 0;
  const convRate = analytics?.conversion?.rate || 0;
  const messagesCount = analytics?.messages?.total || 0;
  const pendingCount = analytics?.pendingChats || 0;

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const userName = currentUser?.name?.split(' ')[0] || '';

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header de boas-vindas */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{greetByTime()}{userName ? `, ${userName}` : ''}!</h1>
          <p className="text-xs text-gray-400 capitalize mt-0.5">{today}</p>
        </div>
        <button onClick={loadData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Atualizar">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Linha 1: Aguardando resposta + Follow-ups */}
      <div className="grid grid-cols-2 gap-4">
        {/* Card: Aguardando resposta */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Aguardando resposta</h3>
                <p className="text-[10px] text-gray-400">{pendingChats.length > 0 ? `${pendingChats.length} conversa${pendingChats.length > 1 ? 's' : ''}` : 'Tudo em dia'}</p>
              </div>
            </div>
            {pendingChats.length > 0 && (
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                {pendingChats.length}
              </span>
            )}
          </div>
          {pendingChats.length > 0 ? (
            <div className="space-y-2">
              {pendingChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => { if (chat.phone) onOpenChat(chat.phone); else if (onNavigate) onNavigate('chat'); }}
                  className="w-full flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-orange-50/50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                    {(chat.name || chat.phone || '?').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{chat.name || chat.phone || 'Sem nome'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{chat.last_message || ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{timeAgo(chat.last_message_at || chat.updated_at)}</span>
                    <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-orange-500 transition-colors" />
                  </div>
                </button>
              ))}
              {chats.filter(c => c.last_message_from_me === 0 || c.last_message_from_me === '0' || c.last_message_from_me === false).length > 5 && (
                <button onClick={() => onNavigate && onNavigate('chat')} className="w-full text-center text-[10px] font-bold text-orange-600 hover:text-orange-700 py-1.5">
                  Ver todas as conversas
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="w-8 h-8 text-green-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Nenhuma conversa pendente</p>
            </div>
          )}
        </div>

        {/* Card: Follow-ups de hoje */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Follow-ups de hoje</h3>
                <p className="text-[10px] text-gray-400">{todayFollowUps.length > 0 ? `${todayFollowUps.length} pendente${todayFollowUps.length > 1 ? 's' : ''}` : 'Nenhum para hoje'}</p>
              </div>
            </div>
            {todayFollowUps.length > 0 && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${todayFollowUps.some(f => isOverdue(f.due_date || f.scheduled_at)) ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>
                {todayFollowUps.length}
              </span>
            )}
          </div>
          {todayFollowUps.length > 0 ? (
            <div className="space-y-2">
              {todayFollowUps.map(f => {
                const dateField = f.due_date || f.scheduled_at;
                const overdue = isOverdue(dateField);
                return (
                  <button
                    key={f.id}
                    onClick={() => onNavigate && onNavigate('followup')}
                    className="w-full flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-blue-50/50 rounded-lg transition-colors text-left group"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{f.lead_name || f.title || f.note || 'Lembrete'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{f.note || f.description || ''}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-medium ${overdue ? 'text-red-500' : 'text-blue-500'}`}>
                        {timeUntil(dateField)}
                      </span>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Nenhum follow-up para hoje</p>
            </div>
          )}
        </div>
      </div>

      {/* Linha 2: Leads recentes + Resumo */}
      <div className="grid grid-cols-3 gap-4">
        {/* Card: Leads recentes */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Leads recentes</h3>
                <p className="text-[10px] text-gray-400">Ultimos 7 dias</p>
              </div>
            </div>
            <button onClick={() => onNavigate && onNavigate('leads')} className="text-[10px] font-bold text-green-600 hover:text-green-700 flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {recentLeads.length > 0 ? (
            <div className="space-y-2">
              {recentLeads.map(lead => {
                const col = columns.find(c => c.id === lead.stage || String(c.id) === String(lead.stage));
                const colColor = col ? (CM[col.color] || CM.zinc) : CM.zinc;
                return (
                  <button
                    key={lead.id}
                    onClick={() => { if (lead.phone) onOpenChat(lead.phone); else if (onNavigate) onNavigate('leads'); }}
                    className="w-full flex items-center gap-3 p-2.5 bg-gray-50 hover:bg-green-50/50 rounded-lg transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${colColor.bg}`}>
                      {(lead.name || '?').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{lead.name || 'Sem nome'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {lead.source === 'meta_ads' && (
                          <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Meta Ads</span>
                        )}
                        {lead.source === 'whatsapp' && (
                          <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">WhatsApp</span>
                        )}
                        {col && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${colColor.light} ${colColor.text}`}>{col.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{daysAgo(lead.created_at) === 0 ? 'Hoje' : `${daysAgo(lead.created_at)}d`}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Nenhum lead novo nos ultimos 7 dias</p>
            </div>
          )}
        </div>

        {/* Card: Resumo rapido */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" /> Resumo (7 dias)
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Novos leads</p>
                <p className="text-2xl font-black text-gray-800">{leadsCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Conversao</p>
                <p className="text-2xl font-black text-green-600">{convRate}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Mensagens</p>
                <p className="text-2xl font-black text-gray-800">{messagesCount}</p>
              </div>
            </div>
          </div>

          {/* Mini alerta se tem conversas pendentes */}
          {pendingCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-red-500" />
                <p className="text-xs font-bold text-red-700">Atencao</p>
              </div>
              <p className="text-[11px] text-red-600">
                {pendingCount} lead{pendingCount > 1 ? 's' : ''} aguardando resposta
              </p>
              <button
                onClick={() => onNavigate && onNavigate('chat')}
                className="mt-2 text-[10px] font-bold text-red-700 hover:text-red-800 flex items-center gap-0.5"
              >
                Ir para conversas <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

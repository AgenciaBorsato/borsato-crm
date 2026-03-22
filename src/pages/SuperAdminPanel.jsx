import React, { useState, useMemo } from 'react';
import {
  TrendingUp, Plus, Search,
  LogIn, Edit2, ChevronUp, ChevronDown,
  BarChart2, AlertCircle, CheckCircle, Users, X
} from 'lucide-react';
import CreateCrmModal from '../components/modals/CreateCrmModal.jsx';
import EditCrmModal from '../components/modals/EditCrmModal.jsx';
import api from '../api.js';

function fmt(n) {
  return `R$ ${Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

const PLAN_COLORS = {
  Enterprise: 'bg-purple-100 text-purple-700',
  Pro:        'bg-blue-100 text-blue-700',
  Starter:    'bg-gray-100 text-gray-500',
};

export default function SuperAdminPanel({ user, tenants = [], onLogout, onRefresh, onEnterTenant }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch]         = useState('');
  const [sort, setSort]             = useState('name');
  const [sortDir, setSortDir]       = useState('asc');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatus]   = useState('all');

  const mrr        = tenants.reduce((a, t) => a + (parseFloat(t.monthly_value) || 0), 0);
  const totalLeads = tenants.reduce((a, t) => a + (t.leadCount || 0), 0);
  const active     = tenants.filter(t => t.active !== false).length;
  const inactive   = tenants.length - active;
  const arr        = mrr * 12;
  const ticket     = tenants.length > 0 ? mrr / tenants.length : 0;

  const filtered = useMemo(() => {
    let list = tenants.filter(t => {
      const matchSearch = (t.name || '').toLowerCase().includes(search.toLowerCase());
      const matchPlan   = planFilter === 'all' || t.plan === planFilter;
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'active' && t.active !== false)
        || (statusFilter === 'inactive' && t.active === false);
      return matchSearch && matchPlan && matchStatus;
    });
    list = list.sort((a, b) => {
      let va, vb;
      if (sort === 'name')       { va = a.name || ''; vb = b.name || ''; }
      else if (sort === 'mrr')   { va = parseFloat(a.monthly_value) || 0; vb = parseFloat(b.monthly_value) || 0; }
      else if (sort === 'leads') { va = a.leadCount || 0; vb = b.leadCount || 0; }
      else if (sort === 'users') { va = a.userCount || 0; vb = b.userCount || 0; }
      else { va = a.name || ''; vb = b.name || ''; }
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [tenants, search, planFilter, statusFilter, sort, sortDir]);

  const toggleSort = (col) => {
    if (sort === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(col); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) => sort === col
    ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />)
    : null;

  const planDist = ['Starter', 'Pro', 'Enterprise'].map(p => ({
    plan: p,
    count: tenants.filter(t => (t.plan || 'Pro') === p).length,
    pct: tenants.length > 0 ? (tenants.filter(t => (t.plan || 'Pro') === p).length / tenants.length) * 100 : 0,
  }));

  const topByRev = [...tenants].sort((a, b) => (b.monthly_value || 0) - (a.monthly_value || 0)).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Top bar */}
      <div className="bg-[#075e54] text-white px-6 py-3 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center font-black text-base">BR</div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">Painel Mestre</h1>
            <p className="text-[10px] text-white/60">{user?.name} · Super Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/50">{new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
          <button onClick={onLogout} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition">Sair</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'MRR',          value: fmt(mrr),    color: 'text-[#075e54]' },
            { label: 'ARR',          value: fmt(arr),    color: 'text-indigo-600' },
            { label: 'Ticket Médio', value: fmt(ticket), color: 'text-amber-600' },
            { label: 'Clientes',     value: tenants.length, color: 'text-blue-600', sub: `${active} ativos · ${inactive} inativos` },
            { label: 'Leads Totais', value: totalLeads,  color: 'text-green-600' },
            { label: 'Leads/Cliente',value: tenants.length > 0 ? (totalLeads / tenants.length).toFixed(1) : '0', color: 'text-purple-600' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{m.label}</p>
              <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
              {m.sub && <p className="text-[9px] text-gray-400 mt-0.5">{m.sub}</p>}
            </div>
          ))}
        </div>

        {/* Plan dist + top revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-gray-400" /> Distribuicao por Plano</h3>
            <div className="space-y-3">
              {planDist.map(({ plan, count, pct }) => (
                <div key={plan}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${PLAN_COLORS[plan] || 'bg-gray-100 text-gray-500'}`}>{plan}</span>
                    <span className="text-xs text-gray-500">{count} clientes · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${
                      plan === 'Enterprise' ? 'bg-purple-400' : plan === 'Pro' ? 'bg-blue-400' : 'bg-gray-300'
                    }`} style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-gray-400" /> Maiores Receitas</h3>
            <div className="space-y-2">
              {topByRev.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs font-bold">{t.name}</span>
                      <span className="text-xs font-bold text-[#075e54]">{fmt(t.monthly_value)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#25d366] rounded-full" style={{ width: `${mrr > 0 ? (t.monthly_value / mrr) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {topByRev.length === 0 && <p className="text-xs text-gray-300 text-center py-4">Sem clientes ainda</p>}
            </div>
          </div>
        </div>

        {/* Client table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-4 py-2 text-xs w-52" />
                </div>
                <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs">
                  <option value="all">Todos os planos</option>
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <select value={statusFilter} onChange={e => setStatus(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs">
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
                <span className="text-[10px] text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
              </div>
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-4 py-2 bg-[#25d366] text-white text-xs font-bold rounded-lg hover:bg-[#1fb958] transition">
                <Plus className="w-3.5 h-3.5" /> Novo CRM
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase">
                <tr>
                  <th className="p-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('name')}>Cliente <SortIcon col="name" /></th>
                  <th className="p-3">Plano</th>
                  <th className="p-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('mrr')}>MRR <SortIcon col="mrr" /></th>
                  <th className="p-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('leads')}>Leads <SortIcon col="leads" /></th>
                  <th className="p-3 cursor-pointer hover:text-gray-600" onClick={() => toggleSort('users')}>Usuarios <SortIcon col="users" /></th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(t => (
                  <tr key={t.id} className={`hover:bg-gray-50/50 transition-colors ${t.active === false ? 'opacity-50' : ''}`}>
                    <td className="p-3">
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-[10px] text-gray-400">{t.email || '—'}</p>
                    </td>
                    <td className="p-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${PLAN_COLORS[t.plan] || 'bg-gray-100 text-gray-500'}`}>{t.plan || 'Pro'}</span>
                    </td>
                    <td className="p-3 font-bold text-sm text-[#075e54]">{fmt(t.monthly_value)}</td>
                    <td className="p-3 text-sm text-gray-600">{t.leadCount || 0}</td>
                    <td className="p-3 text-sm text-gray-600">{t.userCount || 0}</td>
                    <td className="p-3">
                      {t.active !== false
                        ? <span className="flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 rounded-full px-2 py-0.5 w-fit"><CheckCircle className="w-2.5 h-2.5" /> Ativo</span>
                        : <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 bg-red-50 rounded-full px-2 py-0.5 w-fit"><AlertCircle className="w-2.5 h-2.5" /> Inativo</span>}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => onEnterTenant && onEnterTenant(t.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-[#075e54] text-white rounded-lg text-[10px] font-bold hover:bg-[#064a43] transition">
                          <LogIn className="w-3 h-3" /> Entrar
                        </button>
                        <button
                          onClick={() => setEditTarget(t)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhum cliente encontrado</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400">
          Borsato CRM · Painel exclusivo · {tenants.length} CRM{tenants.length !== 1 ? 's' : ''} ativos · MRR {fmt(mrr)}
        </div>
      </div>

      {showCreate && (
        <CreateCrmModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); onRefresh?.(); }} />
      )}
      {editTarget && (
        <EditCrmModal tenant={editTarget} onClose={() => setEditTarget(null)} onSuccess={() => { setEditTarget(null); onRefresh?.(); }} />
      )}
    </div>
  );
}

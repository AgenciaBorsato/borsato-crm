import React, { useState } from 'react';
import { DollarSign, Users, MessageCircle, TrendingUp, Plus, Search } from 'lucide-react';
import MetricCard from '../components/cards/MetricCard.jsx';
import CreateCrmModal from '../components/modals/CreateCrmModal.jsx';

export default function SuperAdminPanel({
  user,
  tenants = [],
  onLogout,
  onRefresh,
}) {
  const [showCreateCrm, setShowCreateCrm] = useState(false);
  const [search, setSearch] = useState('');

  const rev = tenants.reduce((a, t) => a + (parseFloat(t.monthly_value) || 0), 0);
  const leads = tenants.reduce((a, t) => a + (t.leadCount || 0), 0);

  const filtered = tenants.filter((t) =>
    (t.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="bg-[#075e54] text-white px-6 py-3 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
            BR
          </div>
          <div>
            <h1 className="font-bold text-sm">Painel Mestre</h1>
            <p className="text-[10px] text-white/60">{user?.name}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition"
        >
          Sair
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="MRR"
            value={`R$ ${rev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<DollarSign />}
            color="green"
          />

          <MetricCard
            title="Clientes"
            value={tenants.length}
            icon={<Users />}
            color="blue"
          />

          <MetricCard
            title="Leads"
            value={leads}
            icon={<MessageCircle />}
            color="yellow"
          />

          <MetricCard
            title="Ticket"
            value={`R$ ${tenants.length > 0 ? (rev / tenants.length).toFixed(2) : '0.00'}`}
            icon={<TrendingUp />}
            color="purple"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Clientes</h2>

            <button
              onClick={() => setShowCreateCrm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg hover:scale-105 transition"
            >
              <Plus className="w-3 h-3" />
              Novo CRM
            </button>
          </div>

          <div className="mb-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`bg-gray-50 border border-gray-100 rounded-lg p-4 flex justify-between items-center ${
                  t.active === false ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <p className="font-bold">
                    {t.name}{' '}
                    <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded ml-1">
                      {t.plan || 'Pro'}
                    </span>
                  </p>

                  <div className="flex gap-4 text-xs text-gray-400 mt-1">
                    <span>R$ {parseFloat(t.monthly_value || 0).toFixed(2)}</span>
                    <span>{t.leadCount || 0} leads</span>
                    <span>{t.userCount || 0} usuários</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  {t.active === false ? 'Inativo' : 'Ativo'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateCrm && (
        <CreateCrmModal
          onClose={() => setShowCreateCrm(false)}
          onSuccess={() => {
            setShowCreateCrm(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

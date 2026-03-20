// ============================================================================
// SUPER ADMIN
// ============================================================================
function SuperAdminPanel({ user, tenants, onLogout, onAccessTenant, onRefresh }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const rev = tenants.reduce((a, t) => a + (parseFloat(t.monthly_value) || 0), 0);
  const leads = tenants.reduce((a, t) => a + (t.leadCount || 0), 0);
  const filtered = tenants.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="bg-[#075e54] text-white px-6 py-3 flex justify-between items-center shadow">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">BR</div>
          <div>
            <h1 className="font-bold text-sm">Painel Mestre</h1>
            <p className="text-[10px] text-white/60">{user.name}</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-3 py-1.5 bg-white/10 rounded-lg text-xs">
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
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"
            >
              <Plus className="w-3 h-3" />
              Novo
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
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(t);
                      setShowEdit(true);
                    }}
                    className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button onClick={() => onAccessTenant(t.id)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm('Deletar?') && prompt('SIM:') === 'SIM') {
                        await api.deleteTenant(t.id);
                        onRefresh();
                      }
                    }}
                    className="p-1.5 bg-red-50 text-red-500 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreate && <TenantModal onClose={() => setShowCreate(false)} onRefresh={onRefresh} />}
      {showEdit && editing && (
        <TenantModal
          tenant={editing}
          onClose={() => {
            setShowEdit(false);
            setEditing(null);
          }}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
}

function TenantModal({ tenant, onClose, onRefresh }) {
  const [f, setF] = useState(
    tenant
      ? {
          name: tenant.name,
          adminEmail: tenant.email,
          plan: tenant.plan || 'Pro',
          monthlyValue: parseFloat(tenant.monthly_value) || 497,
          aiPrompt: tenant.ai_prompt || '',
          active: tenant.active !== false
        }
      : {
          name: '',
          adminName: '',
          adminEmail: '',
          adminPassword: '',
          plan: 'Pro',
          monthlyValue: 497
        }
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold text-lg mb-4">{tenant ? 'Editar' : 'Novo'} Cliente</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (tenant) {
                await api.updateTenant(tenant.id, {
                  ...f,
                  customFields: JSON.parse(tenant.custom_fields || '[]')
                });
              } else {
                await api.createTenant(f);
              }
              onRefresh();
              onClose();
            } catch (err) {
              alert('Erro: ' + err.message);
            }
          }}
          className="space-y-3"
        >
          <input
            placeholder="Empresa"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required
          />

          {!tenant && (
            <>
              <input
                placeholder="Nome admin"
                value={f.adminName}
                onChange={(e) => setF({ ...f, adminName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={f.adminPassword}
                onChange={(e) => setF({ ...f, adminPassword: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="E-mail"
            value={f.adminEmail}
            onChange={(e) => setF({ ...f, adminEmail: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={f.plan}
              onChange={(e) => setF({ ...f, plan: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            >
              <option>Basic</option>
              <option>Pro</option>
              <option>Enterprise</option>
            </select>

            <input
              type="number"
              value={f.monthlyValue}
              onChange={(e) => setF({ ...f, monthlyValue: parseFloat(e.target.value) })}
              className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
            />
          </div>

          {tenant && (
            <>
              <textarea
                value={f.aiPrompt}
                onChange={(e) => setF({ ...f, aiPrompt: e.target.value })}
                rows={2}
                placeholder="Prompt IA"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={f.active}
                  onChange={(e) => setF({ ...f, active: e.target.checked })}
                />
                Ativo
              </label>
            </>
          )}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


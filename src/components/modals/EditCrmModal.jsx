import React, { useState, useEffect } from 'react';
import { X, Building2, User, Shield, Settings2, FileText, CreditCard, Eye, EyeOff, Loader, LayoutGrid, MessageSquare, Users, Smartphone, BarChart3, Brain, UserPlus, Settings } from 'lucide-react';
import api from '../../api';

const MODULE_OPTIONS = [
  { id: 'kanban',    label: 'Kanban',         icon: LayoutGrid },
  { id: 'chat',      label: 'Conversas',      icon: MessageSquare },
  { id: 'leads',     label: 'Leads',          icon: Users },
  { id: 'whatsapp',  label: 'WhatsApp',       icon: Smartphone },
  { id: 'analytics', label: 'Analytics',      icon: BarChart3 },
  { id: 'knowledge', label: 'Base de Conhecimento', icon: Brain },
  { id: 'team',      label: 'Equipe',         icon: UserPlus },
  { id: 'settings',  label: 'Configuracoes',  icon: Settings },
];

export default function EditCrmModal({ tenant, onClose, onSuccess }) {
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPw, setShowPw]   = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const [form, setForm] = useState({
    // Identificacao
    companyName:     tenant.name || '',
    contactEmail:    tenant.email || '',
    // Comercial
    plan:            tenant.plan || 'Pro',
    monthlyValue:    tenant.monthly_value || 497,
    status:          tenant.active !== false ? 'active' : 'paused',
    // Admin
    adminName:       '',
    adminEmail:      '',
    adminPassword:   '',
    accessEnabled:   true,
    // CRM
    aiPrompt:        tenant.ai_prompt || '',
    enabledModules:  ['kanban', 'chat', 'leads', 'whatsapp', 'analytics'],
  });

  // Carrega dados do usuario admin
  useEffect(() => {
    const load = async () => {
      try {
        const users = await api.getUsers(tenant.id);
        const admin = users?.find(u => u.role === 'client_admin');
        if (admin) {
          setAdminUser(admin);
          const perms = (() => { try { return JSON.parse(admin.permissions || '[]'); } catch { return []; } })();
          setForm(prev => ({
            ...prev,
            adminName:      admin.name || '',
            adminEmail:     admin.email || '',
            enabledModules: perms.length > 0 ? perms : prev.enabledModules,
          }));
        }
      } catch (e) {
        console.error('Erro ao carregar admin:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenant.id]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleModule = (id) => {
    setForm(prev => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(id)
        ? prev.enabledModules.filter(m => m !== id)
        : [...prev.enabledModules, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Atualiza tenant
      await api.updateTenant(tenant.id, {
        name:         form.companyName,
        plan:         form.plan,
        monthlyValue: Number(form.monthlyValue || 0),
        aiPrompt:     form.aiPrompt,
        customFields: (() => { try { return JSON.parse(tenant.custom_fields || '[]'); } catch { return []; } })(),
        active:       form.status === 'active',
      });

      // Atualiza admin se existir
      if (adminUser) {
        const payload = {
          name:        form.adminName || adminUser.name,
          email:       form.adminEmail || adminUser.email,
          role:        adminUser.role,
          permissions: form.enabledModules,
        };
        if (form.adminPassword) payload.password = form.adminPassword;
        await api.updateUser(adminUser.id, payload);
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.message || 'Tente novamente'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Editar CRM</h2>
            <p className="text-sm text-gray-500">{tenant.name} · Cadastro comercial + conta do cliente</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando dados...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* Identificacao */}
            <section className="space-y-4">
              <SectionTitle icon={<Building2 className="w-4 h-4 text-[#075e54]" />} title="Identificacao do cliente" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Field label="Nome da empresa" required>
                  <input value={form.companyName} onChange={e => update('companyName', e.target.value)} className={inputClass} required />
                </Field>
                <Field label="E-mail principal">
                  <input type="email" value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} className={inputClass} />
                </Field>
              </div>
            </section>

            {/* Comercial */}
            <section className="space-y-4">
              <SectionTitle icon={<CreditCard className="w-4 h-4 text-[#075e54]" />} title="Dados comerciais do contrato" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                <Field label="Plano" required>
                  <select value={form.plan} onChange={e => update('plan', e.target.value)} className={inputClass} required>
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </Field>
                <Field label="Valor mensal" required>
                  <input type="number" value={form.monthlyValue} onChange={e => update('monthlyValue', e.target.value)} className={inputClass} required />
                </Field>
                <Field label="Status do cliente">
                  <select value={form.status} onChange={e => update('status', e.target.value)} className={inputClass}>
                    <option value="active">Ativo</option>
                    <option value="trial">Teste</option>
                    <option value="paused">Pausado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Admin */}
            <section className="space-y-4">
              <SectionTitle icon={<Shield className="w-4 h-4 text-[#075e54]" />} title="Administrador do CRM" />
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                Preencha apenas o que quiser alterar. Campos vazios mantêm o valor atual.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Field label="Nome do admin">
                  <input
                    placeholder={adminUser?.name || 'Nome atual'}
                    value={form.adminName}
                    onChange={e => update('adminName', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="E-mail do admin">
                  <input
                    type="email"
                    placeholder={adminUser?.email || 'Email atual'}
                    value={form.adminEmail}
                    onChange={e => update('adminEmail', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Nova senha">
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Deixe vazio para nao alterar"
                      value={form.adminPassword}
                      onChange={e => update('adminPassword', e.target.value)}
                      className={inputClass + ' pr-10'}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Acesso liberado?">
                  <select value={String(form.accessEnabled)} onChange={e => update('accessEnabled', e.target.value === 'true')} className={inputClass}>
                    <option value="true">Sim</option>
                    <option value="false">Nao</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Estrutura */}
            <section className="space-y-4">
              <SectionTitle icon={<Settings2 className="w-4 h-4 text-[#075e54]" />} title="Estrutura do CRM" />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Field label="Prompt inicial da IA">
                  <input value={form.aiPrompt} onChange={e => update('aiPrompt', e.target.value)} className={inputClass} placeholder="Voce e um assistente..." />
                </Field>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Modulos liberados</label>
                <p className="text-xs text-gray-400 mb-3">Ative ou desative os modulos disponiveis para este CRM</p>
                <div className="bg-gray-50 rounded-xl border border-gray-200 divide-y divide-gray-200">
                  {MODULE_OPTIONS.map(module => {
                    const active = form.enabledModules.includes(module.id);
                    const Icon = module.icon;
                    return (
                      <div key={module.id} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-[#075e54]/10 text-[#075e54]' : 'bg-gray-200/60 text-gray-400'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{module.label}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleModule(module.id)}
                          className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${active ? 'bg-[#25d366]' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${active ? 'left-[20px]' : 'left-[2px]'}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#25d366] text-white font-semibold hover:bg-[#1fb85a] disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="font-bold text-gray-900">{title}</h3>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366]';

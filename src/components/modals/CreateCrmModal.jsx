import React, { useState } from 'react';
import { X, Building2, User, Shield, Settings2, FileText, CreditCard } from 'lucide-react';
import api from '../../api';

const MODULE_OPTIONS = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'chat', label: 'Conversas' },
  { id: 'leads', label: 'Leads' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'knowledge', label: 'Conhecimento' },
  { id: 'team', label: 'Equipe' },
  { id: 'settings', label: 'Configurações' },
];

export default function CreateCrmModal({ onClose, onSuccess }) {
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    document: '',
    niche: '',
    city: '',
    state: '',
    plan: 'Pro',
    monthlyValue: 497,
    dueDay: '10',
    status: 'active',
    trialDays: '',
    commercialNotes: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    accessEnabled: true,
    maxUsers: 3,
    pipelineModel: 'padrao',
    aiPrompt: '',
    enabledModules: ['kanban', 'chat', 'leads', 'whatsapp', 'analytics'],
    internalNotes: '',
  });

  const toggleModule = (moduleId) => {
    setForm((prev) => ({
      ...prev,
      enabledModules: prev.enabledModules.includes(moduleId)
        ? prev.enabledModules.filter((m) => m !== moduleId)
        : [...prev.enabledModules, moduleId],
    }));
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.companyName,
        plan: form.plan,
        monthlyValue: Number(form.monthlyValue || 0),
        adminName: form.adminName || form.contactName,
        adminEmail: form.adminEmail || form.contactEmail,
        adminPassword: form.adminPassword,
        aiPrompt: form.aiPrompt,
      };

      await api.createTenant(payload);

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      alert(error.message || 'Erro ao criar CRM');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Criar novo CRM</h2>
            <p className="text-sm text-gray-500">Cadastro comercial + criação da conta do cliente</p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#075e54]" />
              <h3 className="font-bold text-gray-900">Identificação do cliente</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Field label="Nome da empresa" required>
                <input value={form.companyName} onChange={(e) => updateField('companyName', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="Nome do responsável" required>
                <input value={form.contactName} onChange={(e) => updateField('contactName', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="E-mail principal" required>
                <input type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="Telefone do responsável">
                <input value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} className={inputClass} />
              </Field>

              <Field label="CPF/CNPJ">
                <input value={form.document} onChange={(e) => updateField('document', e.target.value)} className={inputClass} />
              </Field>

              <Field label="Nicho">
                <input value={form.niche} onChange={(e) => updateField('niche', e.target.value)} className={inputClass} />
              </Field>

              <Field label="Cidade">
                <input value={form.city} onChange={(e) => updateField('city', e.target.value)} className={inputClass} />
              </Field>

              <Field label="Estado">
                <input value={form.state} onChange={(e) => updateField('state', e.target.value)} className={inputClass} />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#075e54]" />
              <h3 className="font-bold text-gray-900">Dados comerciais do contrato</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
              <Field label="Plano" required>
                <select value={form.plan} onChange={(e) => updateField('plan', e.target.value)} className={inputClass} required>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </Field>

              <Field label="Valor mensal" required>
                <input type="number" value={form.monthlyValue} onChange={(e) => updateField('monthlyValue', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="Dia do vencimento">
                <input value={form.dueDay} onChange={(e) => updateField('dueDay', e.target.value)} className={inputClass} />
              </Field>

              <Field label="Status do cliente">
                <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}>
                  <option value="active">Ativo</option>
                  <option value="trial">Teste</option>
                  <option value="paused">Pausado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </Field>

              <Field label="Dias de teste">
                <input value={form.trialDays} onChange={(e) => updateField('trialDays', e.target.value)} className={inputClass} />
              </Field>
            </div>

            <Field label="Observação comercial">
              <textarea value={form.commercialNotes} onChange={(e) => updateField('commercialNotes', e.target.value)} className={textareaClass} rows={3} />
            </Field>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#075e54]" />
              <h3 className="font-bold text-gray-900">Administrador inicial do CRM</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Field label="Nome do admin" required>
                <input value={form.adminName} onChange={(e) => updateField('adminName', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="E-mail do admin" required>
                <input type="email" value={form.adminEmail} onChange={(e) => updateField('adminEmail', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="Senha inicial" required>
                <input type="password" value={form.adminPassword} onChange={(e) => updateField('adminPassword', e.target.value)} className={inputClass} required />
              </Field>

              <Field label="Acesso liberado?">
                <select value={String(form.accessEnabled)} onChange={(e) => updateField('accessEnabled', e.target.value === 'true')} className={inputClass}>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[#075e54]" />
              <h3 className="font-bold text-gray-900">Estrutura inicial do CRM</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Field label="Máximo de usuários">
                <input type="number" value={form.maxUsers} onChange={(e) => updateField('maxUsers', e.target.value)} className={inputClass} />
              </Field>

              <Field label="Modelo de funil">
                <select value={form.pipelineModel} onChange={(e) => updateField('pipelineModel', e.target.value)} className={inputClass}>
                  <option value="padrao">Padrão</option>
                  <option value="clinica">Clínica</option>
                  <option value="comercial">Comercial</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </Field>

              <Field label="Prompt inicial da IA">
                <input value={form.aiPrompt} onChange={(e) => updateField('aiPrompt', e.target.value)} className={inputClass} />
              </Field>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Módulos liberados</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MODULE_OPTIONS.map((module) => {
                  const active = form.enabledModules.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                        active
                          ? 'bg-[#25d366]/10 border-[#25d366] text-[#075e54]'
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {module.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#075e54]" />
              <h3 className="font-bold text-gray-900">Observações internas</h3>
            </div>

            <Field label="Anotações internas da Agência Borsato">
              <textarea value={form.internalNotes} onChange={(e) => updateField('internalNotes', e.target.value)} className={textareaClass} rows={4} />
            </Field>
          </section>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">
              Cancelar
            </button>

            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#25d366] text-white font-semibold hover:bg-[#1fb85a] disabled:opacity-60">
              {saving ? 'Criando...' : 'Criar CRM'}
            </button>
          </div>
        </form>
      </div>
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

const inputClass =
  'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366]';

const textareaClass =
  'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#25d366] resize-none';

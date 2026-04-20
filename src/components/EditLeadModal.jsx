import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../api';
import LeadSummaryCard from './LeadSummaryCard';

export default function EditLeadModal({ lead, columns, onClose, onSave, onRefresh }) {
  const [f, setF] = useState({ name: lead.name || '', phone: lead.phone || '', email: lead.email || '', stage: lead.stage || '', notes: lead.notes || '' });
  const [custom, setCustom] = useState(() => { try { return JSON.parse(lead.custom_data || '{}'); } catch { return {}; } });
  const [nf, setNf] = useState('');
  const [localLead, setLocalLead] = useState(lead);
  const handleRefreshContext = async () => { try { const result = await api.refreshLeadContext(lead.id); if (result?.lead) { setLocalLead(prev => ({ ...prev, ...result.lead })); onRefresh?.(); } } catch (e) { console.error('REFRESH_LEAD_CONTEXT_MODAL_ERROR:', e.message, 'leadId:', lead?.id); } };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="font-bold text-lg mb-4">Editar Lead</h2>
        <div className="space-y-3">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Telefone</label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          {columns.length > 0 && <div><label className="text-[10px] font-bold text-gray-400 uppercase">Etapa</label><select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm">{columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Observacoes</label><textarea value={f.notes} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" /></div>
          <LeadSummaryCard lead={localLead} onRefresh={handleRefreshContext} compact={false} />
          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Campos Personalizados</p>
            {Object.entries(custom).map(([k, v]) => (
              <div key={k} className="flex gap-2 mb-2 items-center">
                <span className="text-xs text-gray-500 w-28 truncate">{k}</span>
                <input value={v} onChange={e => setCustom({ ...custom, [k]: e.target.value })} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs" />
                <button onClick={() => { const c = { ...custom }; delete c[k]; setCustom(c); }}><X className="w-3 h-3 text-red-400" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={nf} onChange={e => setNf(e.target.value)} placeholder="Novo campo..." className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs" onKeyDown={e => { if (e.key === 'Enter' && nf.trim()) { setCustom({ ...custom, [nf.trim()]: '' }); setNf(''); } }} />
              <button onClick={() => { if (nf.trim()) { setCustom({ ...custom, [nf.trim()]: '' }); setNf(''); } }} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold"><Plus className="w-3 h-3" /></button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button>
            <button onClick={() => onSave({ ...f, customData: custom })} className="flex-1 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

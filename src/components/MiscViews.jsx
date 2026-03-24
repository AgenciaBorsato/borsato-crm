import React, { useState, useEffect } from 'react';
import { Brain, Bot, Plus, Trash2 } from 'lucide-react';
import { CM } from '../constants';
import api from '../api';

export function WhatsAppView({ tenant }) {
  const [status, setStatus] = useState(null);
  const [token, setToken] = useState('');
  const [ld, setLd] = useState(false);
  const nm = `tenant_${tenant.id}`;
  useEffect(() => { ck(); const i = setInterval(ck, 5000); return () => clearInterval(i); }, []);
  const ck = async () => { try { setStatus(await api.getWhatsAppStatus(tenant.id)); } catch {} };
  return (
    <div className="max-w-xl">
      <h2 className="font-bold text-lg mb-4">WhatsApp</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Status</h3>
          {status?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#25d366] rounded-full animate-pulse" /><span className="text-[#25d366] font-bold text-sm">Conectado</span></div>
              <button onClick={async () => { await api.disconnectWhatsApp(tenant.id); ck(); }} className="w-full py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold">Desconectar</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-gray-300 rounded-full" /><span className="text-gray-400 text-sm">Desconectado</span></div>
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="Token..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-mono" />
              <button onClick={async () => { setLd(true); try { await api.connectWhatsApp(tenant.id, token); setToken(''); ck(); } catch { alert('Erro'); } finally { setLd(false); } }} disabled={ld || !token.trim()} className="w-full py-2 bg-[#25d366] text-white rounded-lg text-xs font-bold disabled:opacity-50">{ld ? 'Salvando...' : 'Salvar'}</button>
              <button onClick={ck} className="w-full py-2 bg-gray-50 text-[#075e54] rounded-lg text-xs font-bold border border-gray-200">Verificar</button>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-3">Instancia</h3>
          <div className="bg-gray-50 rounded-lg p-2.5 flex justify-between items-center">
            <code className="text-[#075e54] text-xs font-bold">{nm}</code>
            <button onClick={() => navigator.clipboard.writeText(nm)} className="text-[10px] text-gray-400">Copiar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsView({ leads, columns }) {
  const t = leads.length;
  const bySource = { w: leads.filter(l => l.source === 'whatsapp').length };
  const byStage = columns.map(col => ({ ...col, count: leads.filter(l => l.stage === col.id).length }));
  const lostCount = leads.filter(l => { const col = columns.find(c => c.id === l.stage); return col?.color === 'red'; }).length;
  const wonCount = leads.filter(l => { const col = columns.find(c => c.id === l.stage); return col?.color === 'green'; }).length;
  const withSummary = leads.filter(l => l.conversation_summary).length;
  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Analytics</h2>
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[{l:'Total',v:t,color:'text-blue-600',bg:'bg-blue-50'},{l:'WhatsApp',v:bySource.w,color:'text-green-600',bg:'bg-green-50'},{l:'Clientes',v:wonCount,color:'text-emerald-700',bg:'bg-emerald-50'},{l:'Perdidos',v:lostCount,color:'text-red-600',bg:'bg-red-50'},{l:'Com Contexto',v:withSummary,color:'text-amber-700',bg:'bg-amber-50'}].map((m,i) => (
          <div key={i} className={`${m.bg} border border-gray-100 rounded-xl p-4 shadow-sm`}><p className={`text-[10px] font-bold uppercase mb-1 ${m.color}`}>{m.l}</p><p className={`text-3xl font-black ${m.color}`}>{m.v}</p></div>
        ))}
      </div>
      {columns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-bold text-sm mb-4">Por Etapa</h3>
          <div className="space-y-3">
            {byStage.map(col => {
              const p = t > 0 ? (col.count / t) * 100 : 0;
              const c = CM[col.color] || CM.zinc;
              return (
                <div key={col.id}>
                  <div className="flex justify-between mb-1"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${c.bg}`} /><span className="text-xs font-bold text-gray-600">{col.name}</span></div><span className="text-[10px] text-gray-400">{col.count} ({p.toFixed(0)}%)</span></div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${c.bg}`} style={{ width: `${Math.max(p, 1)}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KnowledgeForm({ tenant, onClose, onSuccess }) {
  const [f, setF] = useState({ category: 'FAQ', content: '' });
  return (
    <form onSubmit={async e => { e.preventDefault(); await api.createKnowledge({ category: f.category, question: f.category, answer: f.content, tenantId: tenant.id }); onSuccess(); }} className="space-y-3">
      <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option>Produtos/Servicos</option><option>Precos</option><option>Agendamento</option><option>FAQ</option></select>
      <textarea placeholder="Ex: Atendemos de segunda a sexta das 8h as 18h..." value={f.content} onChange={e => setF({ ...f, content: e.target.value })} rows={5} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
      <div className="flex gap-2"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button></div>
    </form>
  );
}

export function KnowledgeView({ knowledge, tenant, onRefresh }) {
  const [show, setShow] = useState(false);
  const cats = ['Produtos/Servicos', 'Precos', 'Agendamento', 'FAQ'];
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">Conhecimento</h2><button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Novo</button></div>
      <div className="grid grid-cols-2 gap-4">
        {cats.map(cat => (
          <div key={cat} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-sm mb-3">{cat}</h3>
            {knowledge.filter(k => k.category === cat).map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-3 mb-2 flex justify-between items-start gap-2">
                <p className="text-xs text-gray-700 leading-relaxed flex-1">{item.answer}</p>
                <button onClick={async () => { if (confirm('Deletar?')) { await api.deleteKnowledge(item.id); onRefresh(); } }} className="flex-shrink-0 mt-0.5"><Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" /></button>
              </div>
            ))}
            {knowledge.filter(k => k.category === cat).length === 0 && <p className="text-[10px] text-gray-300 text-center py-3">Vazio</p>}
          </div>
        ))}
      </div>
      {show && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"><h2 className="font-bold mb-1">Novo conteudo</h2><p className="text-[11px] text-gray-400 mb-4">Escreva qualquer informacao sobre o seu negocio. A IA decide o que usar em cada conversa.</p><KnowledgeForm tenant={tenant} onClose={() => setShow(false)} onSuccess={() => { setShow(false); onRefresh(); }} /></div></div>)}
    </div>
  );
}

function UserModal({ user, tenant, onClose, onSuccess }) {
  const allT = ['kanban','chat','leads','whatsapp','analytics','knowledge','team','settings'];
  const [f, setF] = useState({ name: user?.name||'', email: user?.email||'', password: '', role: user?.role||'client_user', permissions: (()=>{try{return JSON.parse(user?.permissions||'[]')}catch{return[]}})() });
  const tp = p => setF({...f, permissions: f.permissions.includes(p)?f.permissions.filter(x=>x!==p):[...f.permissions,p]});
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="font-bold mb-4">{user?'Editar':'Novo'} Usuario</h2>
        <form onSubmit={async e=>{e.preventDefault();try{if(user){await api.updateUser(user.id,{name:f.name,email:f.email,role:f.role,permissions:f.permissions,...(f.password?{password:f.password}:{})});}else{await api.createUser({...f,tenantId:tenant.id});}onSuccess();}catch(err){alert('Erro: '+err.message);}}} className="space-y-3">
          <input placeholder="Nome" value={f.name} onChange={e=>setF({...f,name:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="email" placeholder="E-mail" value={f.email} onChange={e=>setF({...f,email:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm" required />
          <input type="password" placeholder={user?'Nova senha (vazio=manter)':'Senha'} value={f.password} onChange={e=>setF({...f,password:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl text-sm p-2.5" required={!user} />
          <select value={f.role} onChange={e=>setF({...f,role:e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-sm"><option value="client_user">Usuario</option><option value="client_admin">Admin</option></select>
          {f.role==='client_user'&&(<div className="border border-gray-200 rounded-xl p-3"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Permissoes</p><div className="grid grid-cols-2 gap-1.5">{allT.map(tab=>(<label key={tab} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer ${f.permissions.includes(tab)?'bg-[#25d366]/10 text-[#075e54] font-bold':'bg-gray-50 text-gray-400'}`}><input type="checkbox" checked={f.permissions.includes(tab)} onChange={()=>tp(tab)} className="w-3 h-3" />{tab}</label>))}</div></div>)}
          <div className="flex gap-2 pt-1"><button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 rounded-xl text-sm font-bold">Cancelar</button><button type="submit" className="flex-1 py-2.5 bg-[#25d366] text-white rounded-xl text-sm font-bold">Salvar</button></div>
        </form>
      </div>
    </div>
  );
}

export function TeamView({ users, tenant, currentUser, onRefresh }) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  return (
    <div>
      <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">Equipe</h2><button onClick={() => setShow(true)} className="flex items-center gap-1 px-3 py-1.5 bg-[#25d366] text-white text-xs font-bold rounded-lg"><Plus className="w-3 h-3" /> Usuario</button></div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase"><tr><th className="p-3">Nome</th><th className="p-3">E-mail</th><th className="p-3">Funcao</th><th className="p-3">Permissoes</th><th className="p-3 text-right">Acoes</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => {
              const perms = (() => { try { return JSON.parse(u.permissions || '[]'); } catch { return []; } })();
              return (
                <tr key={u.id}>
                  <td className="p-3 font-bold text-xs">{u.name}</td>
                  <td className="p-3 text-xs text-gray-400">{u.email}</td>
                  <td className="p-3"><span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${u.role==='super_admin'?'bg-purple-50 text-purple-500':u.role==='client_admin'?'bg-amber-50 text-amber-600':'bg-blue-50 text-blue-500'}`}>{u.role==='super_admin'?'Mestre':u.role==='client_admin'?'Admin':'Usuario'}</span></td>
                  <td className="p-3 text-[9px] text-gray-400">{u.role==='client_user'?perms.join(', ')||'Nenhuma':''}</td>
                  <td className="p-3 text-right"><div className="flex gap-1 justify-end">{u.role==='client_user'&&<button onClick={()=>setEditing(u)} className="text-blue-400"><Edit2 className="w-3.5 h-3.5" /></button>}{u.id!==currentUser.id&&<button onClick={async()=>{if(confirm('Deletar?')){await api.deleteUser(u.id);onRefresh();}}} className="text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {(show||editing)&&<UserModal user={editing} tenant={tenant} onClose={()=>{setShow(false);setEditing(null);}} onSuccess={()=>{setShow(false);setEditing(null);onRefresh();}} />}
    </div>
  );
}

export function SettingsView({ tenant, onRefresh }) {
  const [prompt, setPrompt] = useState(tenant.ai_prompt || '');
  const [aiEnabled, setAiEnabled] = useState(Number(tenant.ai_enabled) === 1 || tenant.ai_enabled === true);
  const [saving, setSaving] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);

  const savePrompt = async () => {
    setSaving(true);
    try { await api.updateTenant(tenant.id, { name: tenant.name, plan: tenant.plan, monthlyValue: tenant.monthly_value, aiPrompt: prompt, customFields: JSON.parse(tenant.custom_fields || '[]'), active: tenant.active }); alert('Salvo!'); onRefresh(); }
    catch { alert('Erro'); } finally { setSaving(false); }
  };

  const toggleAI = async () => {
    setTogglingAI(true);
    try { await api.setTenantAI(tenant.id, !aiEnabled); setAiEnabled(!aiEnabled); onRefresh(); }
    catch { alert('Erro ao alterar IA'); } finally { setTogglingAI(false); }
  };

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="font-bold text-lg">Configuracoes</h2>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1"><Bot className="w-4 h-4 text-purple-600" /><h3 className="font-bold text-sm">Assistente IA</h3><span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${aiEnabled?'bg-purple-100 text-purple-700':'bg-gray-100 text-gray-400'}`}>{aiEnabled?'ATIVO':'DESLIGADO'}</span></div>
            <p className="text-xs text-gray-400 leading-relaxed">Quando ativo, a IA responde automaticamente mensagens recebidas de leads usando a base de conhecimento e o historico da conversa. Voce pode pausar individualmente por contato na tela de Conversas.</p>
          </div>
          <button onClick={toggleAI} disabled={togglingAI} className={`flex-shrink-0 w-12 h-6 rounded-full transition-all relative ${aiEnabled?'bg-purple-500':'bg-gray-300'} disabled:opacity-50`}><div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${aiEnabled?'left-6':'left-0.5'}`} /></button>
        </div>
        {aiEnabled&&<div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-[10px] text-purple-600 bg-purple-50 rounded-lg px-3 py-2"><Bot className="w-3 h-3 flex-shrink-0" />IA ativa — responde com memoria de sessao, resumo do lead e base de conhecimento</div>}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-sm mb-1 flex items-center gap-2"><Brain className="w-4 h-4 text-gray-400" /> Personalidade da IA</h3>
        <p className="text-[10px] text-gray-400 mb-3">Defina como a IA deve se apresentar. Se vazio, usa atendimento padrao cordial.</p>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={6} placeholder={"Exemplo:\nVoce e a assistente da Clinica Exemplo.\nSe apresente como Ana e seja sempre educada.\nNao marque consultas sem confirmar disponibilidade."} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3 font-mono text-xs leading-relaxed" />
        <button onClick={savePrompt} disabled={saving} className="px-5 py-2 bg-[#25d366] text-white font-bold rounded-xl text-sm disabled:opacity-50">{saving?'Salvando...':'Salvar prompt'}</button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-amber-700 uppercase mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> Memoria da IA</p>
        <div className="space-y-1 text-[11px] text-amber-800">
          <p>A IA mantem 3 camadas de contexto por lead:</p>
          <p>1. <b>Sessao ativa</b> — historico das ultimas mensagens (24h)</p>
          <p>2. <b>Resumo persistente</b> — contexto estrategico salvo no lead</p>
          <p>3. <b>Perfil estruturado</b> — objetivo, dor, estagio e interesse detectados automaticamente</p>
          <p className="mt-1 text-amber-600">O resumo aparece no modal do lead e no header do chat. Use o botao de atualizar para gerar um novo resumo manualmente.</p>
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Como funciona</p>
        <div className="space-y-1 text-[11px] text-gray-500">
          <p>1. IA ligada aqui responde todos os leads automaticamente</p>
          <p>2. Base de Conhecimento e a fonte das respostas</p>
          <p>3. Em Conversas: botao IA ativa/pausada por contato individual</p>
          <p>4. Mensagens da IA aparecem com badge roxo na conversa</p>
          <p>5. Resumo atualizado automaticamente na 3a, 7a e 15a mensagem do lead</p>
        </div>
      </div>
    </div>
  );
}

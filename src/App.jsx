import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, LayoutGrid, Users, Settings, Plus, Search, Send, Bot, User, 
  Circle, Clock, Phone, Mail, MapPin, Tag, ChevronDown, X, Check, Zap,
  Filter, MoreVertical, Archive, Trash2, TrendingUp, Target, DollarSign,
  BarChart3, Activity, Flame, Snowflake, ThermometerSun, BookOpen, 
  FileText, FolderOpen, AlertCircle, CheckCircle2, XCircle, Calendar,
  Bell, Repeat, Sparkles, Brain, Database, Save, Edit2, ChevronRight,
  Building2, Shield, Key, LogOut, Eye, Trash, UserPlus, Copy, ExternalLink
} from 'lucide-react';

// ============================================================================
// MOCK DATA - SISTEMA MULTI-TENANT
// ============================================================================

const MOCK_SYSTEM = {
  superAdmins: [
    { 
      id: 'sa1', 
      name: 'Wlad Borsato', 
      email: 'wlad@borsato.com', 
      password: 'borsato123',
      role: 'super_admin' 
    }
  ],
  
  tenants: [
    {
      id: 't1',
      name: 'Dr. Silva Clínica Estética',
      plan: 'Pro',
      monthlyValue: 497,
      createdAt: '2026-02-15',
      active: true,
      aiPrompt: 'Você é assistente virtual da Clínica Dr. Silva, especializada em harmonização facial, botox e preenchimentos. Seja cordial, profissional e sempre ofereça agendar avaliação gratuita.',
      customFields: [
        { id: 'f1', name: 'procedimento', label: 'Procedimento', type: 'text' },
        { id: 'f2', name: 'convenio', label: 'Convênio', type: 'select', options: ['Particular', 'Unimed', 'Bradesco', 'Amil'] },
        { id: 'f3', name: 'urgencia', label: 'Urgência', type: 'select', options: ['Baixa', 'Média', 'Alta'] }
      ],
      users: [
        { 
          id: 'u1', 
          name: 'Dr. Roberto Silva', 
          email: 'roberto@clinicasilva.com', 
          password: 'silva123',
          role: 'client_admin',
          tenantId: 't1'
        },
        { 
          id: 'u2', 
          name: 'Maria Santos', 
          email: 'maria@clinicasilva.com', 
          password: 'maria123',
          role: 'client_user',
          tenantId: 't1'
        }
      ],
      leads: [
        {
          id: 'l1',
          name: 'Ana Costa',
          phone: '+55 11 98765-4321',
          type: 'individual',
          stage: 'novo',
          lastMessage: 'Quanto custa harmonização facial?',
          lastMessageTime: '10:23',
          unreadCount: 2,
          aiEnabled: true,
          customFields: {
            procedimento: 'Harmonização Facial',
            convenio: 'Particular',
            urgencia: 'Alta'
          },
          conversations: [
            { sender: 'lead', message: 'Olá, gostaria de saber mais sobre harmonização', time: '10:20', isAI: false },
            { sender: 'ai', message: 'Olá! Na Clínica Dr. Silva fazemos harmonização facial completa. Gostaria de agendar uma avaliação gratuita?', time: '10:21', isAI: true, usedKnowledgeBase: true },
            { sender: 'lead', message: 'Quanto custa harmonização facial?', time: '10:23', isAI: false }
          ],
          createdAt: '2026-03-19T10:20:00'
        },
        {
          id: 'l2',
          name: 'Carlos Mendes',
          phone: '+55 11 97654-3210',
          type: 'individual',
          stage: 'qualificado',
          lastMessage: 'Aceita cartão?',
          lastMessageTime: '09:15',
          unreadCount: 0,
          aiEnabled: false,
          customFields: {
            procedimento: 'Botox',
            convenio: 'Unimed',
            urgencia: 'Média'
          },
          conversations: [
            { sender: 'lead', message: 'Fazem botox?', time: '08:30', isAI: false },
            { sender: 'ai', message: 'Sim! Fazemos aplicação de botox. O valor varia entre R$800 e R$1.500. Posso agendar avaliação?', time: '08:31', isAI: true },
            { sender: 'user', message: 'Temos agenda disponível essa semana!', time: '09:00', isAI: false },
            { sender: 'lead', message: 'Aceita cartão?', time: '09:15', isAI: false }
          ],
          createdAt: '2026-03-18T08:30:00'
        }
      ],
      groups: [
        {
          id: 'g1',
          name: 'Grupo: Projeto Clínica + Borsato',
          groupId: 'grupo-clinica-borsato@g.us',
          type: 'group',
          participants: ['Dr. Silva', 'Wlad Borsato', 'Maria Santos', 'Designer Borsato'],
          stage: 'negociacao',
          lastMessage: 'Wlad: Aprovado o layout da landing page!',
          lastMessageTime: '11:45',
          unreadCount: 3,
          aiEnabled: true,
          customFields: {
            procedimento: 'Marketing Digital',
            convenio: 'Particular',
            urgencia: 'Alta'
          },
          conversations: [
            { sender: 'Dr. Silva', message: 'Pessoal, precisamos definir a identidade visual da campanha', time: '10:00', isAI: false },
            { sender: 'Wlad Borsato', message: 'Vou pedir pro designer preparar 3 opções', time: '10:05', isAI: false },
            { sender: 'Designer Borsato', message: 'Enviando as artes...', time: '11:30', isAI: false },
            { sender: 'Wlad Borsato', message: 'Aprovado o layout da landing page!', time: '11:45', isAI: false }
          ],
          createdAt: '2026-03-15T10:00:00'
        },
        {
          id: 'g2',
          name: 'Grupo: Atendimento Clínica',
          groupId: 'atendimento-clinica@g.us',
          type: 'group',
          participants: ['Dr. Silva', 'Maria Santos', 'Recepção'],
          stage: 'qualificado',
          lastMessage: 'Recepção: Cliente confirmou consulta',
          lastMessageTime: 'Ontem',
          unreadCount: 0,
          aiEnabled: false,
          customFields: {
            procedimento: 'Gestão Interna',
            convenio: 'N/A',
            urgencia: 'Baixa'
          },
          conversations: [
            { sender: 'Maria Santos', message: 'Temos 5 agendamentos pra amanhã', time: '14:00', isAI: false },
            { sender: 'Recepção', message: 'Cliente confirmou consulta', time: '15:30', isAI: false }
          ],
          createdAt: '2026-03-10T14:00:00'
        }
      ],
      knowledgeBase: [
        {
          id: 'k1',
          category: 'servicos',
          question: 'Quais serviços vocês oferecem?',
          answer: 'Oferecemos harmonização facial, preenchimento labial, botox e lifting facial.',
          active: true
        },
        {
          id: 'k2',
          category: 'precos',
          question: 'Quanto custa harmonização facial?',
          answer: 'O valor varia entre R$2.500 e R$8.000 dependendo das áreas. Parcelamos em até 12x.',
          active: true
        }
      ]
    },
    {
      id: 't2',
      name: 'João Construções',
      plan: 'Basic',
      monthlyValue: 297,
      createdAt: '2026-03-01',
      active: true,
      aiPrompt: 'Você é assistente da João Construções. Trabalhamos com reformas, construção e manutenção predial. Seja direto e objetivo.',
      customFields: [
        { id: 'f1', name: 'tipo_obra', label: 'Tipo de Obra', type: 'select', options: ['Reforma', 'Construção', 'Manutenção'] },
        { id: 'f2', name: 'orcamento', label: 'Orçamento', type: 'text' },
        { id: 'f3', name: 'prazo', label: 'Prazo', type: 'text' }
      ],
      users: [
        { 
          id: 'u3', 
          name: 'João Pereira', 
          email: 'joao@construcoes.com', 
          password: 'joao123',
          role: 'client_admin',
          tenantId: 't2'
        }
      ],
      leads: [
        {
          id: 'l3',
          name: 'Pedro Oliveira',
          phone: '+55 11 96543-2109',
          type: 'individual',
          stage: 'novo',
          lastMessage: 'Preciso reformar minha casa',
          lastMessageTime: '14:30',
          unreadCount: 1,
          aiEnabled: true,
          customFields: {
            tipo_obra: 'Reforma',
            orcamento: 'R$ 50.000',
            prazo: '3 meses'
          },
          conversations: [
            { sender: 'lead', message: 'Preciso reformar minha casa', time: '14:30', isAI: false }
          ],
          createdAt: '2026-03-19T14:30:00'
        }
      ],
      groups: [
        {
          id: 'g3',
          name: 'Grupo: Obra Condomínio',
          groupId: 'obra-condominio@g.us',
          type: 'group',
          participants: ['João Pereira', 'Síndico', 'Arquiteto'],
          stage: 'negociacao',
          lastMessage: 'Síndico: Aprovaram o orçamento!',
          lastMessageTime: '16:00',
          unreadCount: 2,
          aiEnabled: false,
          customFields: {
            tipo_obra: 'Construção',
            orcamento: 'R$ 800.000',
            prazo: '12 meses'
          },
          conversations: [
            { sender: 'Síndico', message: 'João, a assembleia é amanhã', time: '10:00', isAI: false },
            { sender: 'João Pereira', message: 'Preparei a apresentação completa', time: '12:00', isAI: false },
            { sender: 'Síndico', message: 'Aprovaram o orçamento!', time: '16:00', isAI: false }
          ],
          createdAt: '2026-03-12T10:00:00'
        }
      ],
      knowledgeBase: [
        {
          id: 'k3',
          category: 'servicos',
          question: 'Que tipo de obra vocês fazem?',
          answer: 'Fazemos reformas residenciais e comerciais, construção de casas e prédios, e manutenção predial.',
          active: true
        }
      ]
    }
  ]
};

const STAGES = [
  { id: 'novo', label: 'Novo Lead', color: 'bg-blue-500' },
  { id: 'qualificado', label: 'Qualificado', color: 'bg-purple-500' },
  { id: 'negociacao', label: 'Negociação', color: 'bg-yellow-500' },
  { id: 'ganho', label: 'Ganho', color: 'bg-green-500' },
  { id: 'perdido', label: 'Perdido', color: 'bg-red-500' }
];

const KNOWLEDGE_BASE_CATEGORIES = [
  { id: 'servicos', label: 'Serviços', icon: Sparkles },
  { id: 'precos', label: 'Preços', icon: DollarSign },
  { id: 'procedimentos', label: 'Procedimentos', icon: FileText },
  { id: 'politicas', label: 'Políticas', icon: BookOpen }
];

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

const calculateLeadScore = (lead) => {
  let score = 0;
  const messages = lead.conversations;
  
  const urgencyWords = ['hoje', 'agora', 'urgente', 'rápido', 'essa semana'];
  const hasUrgency = messages.some(m => 
    urgencyWords.some(word => m.message.toLowerCase().includes(word))
  );
  if (hasUrgency) score += 25;
  
  const buyingPower = messages.some(m => 
    ['quanto', 'preço', 'valor', 'custo', 'aceita', 'cartão', 'parcelado'].some(word => 
      m.message.toLowerCase().includes(word)
    )
  );
  if (buyingPower) score += 30;
  
  score += Math.min(messages.length * 3, 25);
  
  const specificQuestions = messages.filter(m => 
    m.sender === 'lead' && m.message.includes('?')
  ).length;
  score += Math.min(specificQuestions * 5, 20);
  
  return Math.min(score, 100);
};

const getScoreLabel = (score) => {
  if (score >= 86) return { label: 'Muito Quente', color: 'from-red-500 to-orange-500', icon: Flame };
  if (score >= 61) return { label: 'Quente', color: 'from-orange-500 to-yellow-500', icon: ThermometerSun };
  if (score >= 31) return { label: 'Morno', color: 'from-yellow-500 to-blue-400', icon: Activity };
  return { label: 'Frio', color: 'from-blue-400 to-blue-600', icon: Snowflake };
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CRMSystem() {
  const [currentUser, setCurrentUser] = useState(null);
  const [systemData, setSystemData] = useState(MOCK_SYSTEM);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Se não tiver usuário logado, mostra login
  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} systemData={systemData} />;
  }

  // Se for Super Admin e não selecionou tenant, mostra painel super admin
  if (currentUser.role === 'super_admin' && !selectedTenant) {
    return (
      <SuperAdminPanel 
        systemData={systemData}
        setSystemData={setSystemData}
        onSelectTenant={setSelectedTenant}
        onLogout={() => setCurrentUser(null)}
      />
    );
  }

  // Se for Super Admin e selecionou tenant, mostra CRM desse tenant (modo God)
  if (currentUser.role === 'super_admin' && selectedTenant) {
    return (
      <CRMApp 
        currentUser={currentUser}
        tenant={selectedTenant}
        systemData={systemData}
        setSystemData={setSystemData}
        onBack={() => setSelectedTenant(null)}
        isGodMode={true}
      />
    );
  }

  // Se for Admin ou User do cliente, mostra CRM do tenant dele
  const userTenant = systemData.tenants.find(t => t.id === currentUser.tenantId);
  return (
    <CRMApp 
      currentUser={currentUser}
      tenant={userTenant}
      systemData={systemData}
      setSystemData={setSystemData}
      onLogout={() => setCurrentUser(null)}
      isGodMode={false}
    />
  );
}

// ============================================================================
// TELA DE LOGIN
// ============================================================================

function LoginScreen({ onLogin, systemData }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Verifica super admin
    const superAdmin = systemData.superAdmins.find(
      sa => sa.email === email && sa.password === password
    );
    if (superAdmin) {
      onLogin(superAdmin);
      return;
    }

    // Verifica usuários dos tenants
    for (const tenant of systemData.tenants) {
      const user = tenant.users.find(
        u => u.email === email && u.password === password
      );
      if (user) {
        onLogin(user);
        return;
      }
    }

    setError('Email ou senha incorretos');
  };

  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center font-bold text-black text-2xl mx-auto mb-4">
            BR
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Borsato CRM</h1>
          <p className="text-zinc-400">Sistema de gestão inteligente</p>
        </div>

        <div className="bg-black border border-zinc-800 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-all"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 rounded-lg transition-all"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 mb-2">Logins de teste:</p>
            <div className="space-y-1 text-xs text-zinc-600">
              <div>Super Admin: wlad@borsato.com / borsato123</div>
              <div>Cliente Admin: roberto@clinicasilva.com / silva123</div>
              <div>Usuário: maria@clinicasilva.com / maria123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAINEL SUPER ADMIN
// ============================================================================

function SuperAdminPanel({ systemData, setSystemData, onSelectTenant, onLogout }) {
  const [showNewTenantModal, setShowNewTenantModal] = useState(false);

  const totalRevenue = systemData.tenants.reduce((sum, t) => sum + t.monthlyValue, 0);
  const activeClients = systemData.tenants.filter(t => t.active).length;
  const totalLeads = systemData.tenants.reduce((sum, t) => sum + t.leads.length, 0);

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-black border-b border-zinc-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center font-bold text-black text-lg">
              BR
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel Super Admin</h1>
              <p className="text-sm text-zinc-400">Gestão de clientes Borsato</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all flex items-center space-x-2"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Métricas */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-black border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Clientes Ativos</span>
                <Building2 size={20} className="text-zinc-500" />
              </div>
              <div className="text-3xl font-bold">{activeClients}</div>
              <div className="text-xs text-green-400 mt-2">↑ 2 novos esse mês</div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Receita Mensal</span>
                <DollarSign size={20} className="text-zinc-500" />
              </div>
              <div className="text-3xl font-bold text-green-400">R$ {totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-zinc-500 mt-2">MRR recorrente</div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Total de Leads</span>
                <Users size={20} className="text-zinc-500" />
              </div>
              <div className="text-3xl font-bold">{totalLeads}</div>
              <div className="text-xs text-zinc-500 mt-2">Todos os clientes</div>
            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Ticket Médio</span>
                <TrendingUp size={20} className="text-zinc-500" />
              </div>
              <div className="text-3xl font-bold text-amber-400">
                R$ {(totalRevenue / activeClients).toFixed(0)}
              </div>
              <div className="text-xs text-zinc-500 mt-2">Por cliente</div>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Clientes</h2>
            <button
              onClick={() => setShowNewTenantModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Novo Cliente</span>
            </button>
          </div>

          <div className="grid gap-4">
            {systemData.tenants.map(tenant => {
              const totalUsers = tenant.users.length;
              const totalLeadsClient = tenant.leads.length;
              
              return (
                <div key={tenant.id} className="bg-black border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{tenant.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          tenant.active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {tenant.active ? 'Ativo' : 'Inativo'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                          {tenant.plan}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">Receita</span>
                          <p className="font-semibold text-green-400">R$ {tenant.monthlyValue}/mês</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Usuários</span>
                          <p className="font-semibold">{totalUsers}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Leads</span>
                          <p className="font-semibold">{totalLeadsClient}</p>
                        </div>
                        <div>
                          <span className="text-zinc-500">Cliente desde</span>
                          <p className="font-semibold text-zinc-400">
                            {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectTenant(tenant)}
                      className="ml-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all flex items-center space-x-2"
                    >
                      <Eye size={16} />
                      <span>Acessar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showNewTenantModal && (
        <NewTenantModal
          onClose={() => setShowNewTenantModal(false)}
          onSave={(newTenant) => {
            setSystemData({
              ...systemData,
              tenants: [...systemData.tenants, newTenant]
            });
            setShowNewTenantModal(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// MODAL NOVO CLIENTE
// ============================================================================

function NewTenantModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    plan: 'Basic',
    monthlyValue: 297,
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTenant = {
      id: `t${Date.now()}`,
      name: formData.name,
      plan: formData.plan,
      monthlyValue: formData.monthlyValue,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
      aiPrompt: 'Você é assistente virtual. Seja cordial e profissional.',
      customFields: [],
      users: [
        {
          id: `u${Date.now()}`,
          name: formData.adminName,
          email: formData.adminEmail,
          password: formData.adminPassword,
          role: 'client_admin',
          tenantId: `t${Date.now()}`
        }
      ],
      leads: [],
      groups: [],
      knowledgeBase: []
    };

    onSave(newTenant);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Novo Cliente</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Nome do Cliente</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Dr. Silva Clínica"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Plano</label>
              <select
                value={formData.plan}
                onChange={(e) => {
                  const plan = e.target.value;
                  setFormData({ 
                    ...formData, 
                    plan,
                    monthlyValue: plan === 'Basic' ? 297 : plan === 'Pro' ? 497 : 797
                  });
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
              >
                <option value="Basic">Basic - R$ 297/mês</option>
                <option value="Pro">Pro - R$ 497/mês</option>
                <option value="Enterprise">Enterprise - R$ 797/mês</option>
              </select>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-4 mt-4">
            <h3 className="font-medium mb-3">Administrador do Cliente</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Nome</label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                  placeholder="Ex: Dr. Roberto Silva"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Email</label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    placeholder="email@cliente.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Senha</label>
                  <input
                    type="text"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    placeholder="senha123"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all"
            >
              Criar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// CRM APP (usado por todos os tipos de usuário)
// ============================================================================

function CRMApp({ currentUser, tenant, systemData, setSystemData, onBack, onLogout, isGodMode }) {
  const [view, setView] = useState('inbox');
  const [selectedLead, setSelectedLead] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Permissões
  const canAccessConfig = currentUser.role === 'client_admin' || isGodMode;
  const canAccessAnalytics = currentUser.role === 'client_admin' || isGodMode;

  // Leads individuais com scores
  const leadsWithScores = tenant.leads.map(lead => ({
    ...lead,
    score: calculateLeadScore(lead),
    scoreData: getScoreLabel(calculateLeadScore(lead))
  }));

  // Grupos com scores
  const groupsWithScores = (tenant.groups || []).map(group => ({
    ...group,
    score: calculateLeadScore(group),
    scoreData: getScoreLabel(calculateLeadScore(group))
  }));

  const currentLead = selectedLead ? 
    [...leadsWithScores, ...groupsWithScores].find(l => l.id === selectedLead.id) : 
    null;

  // Analytics combinados
  const analytics = {
    totalLeads: leadsWithScores.length,
    totalGroups: groupsWithScores.length,
    hotLeads: leadsWithScores.filter(l => l.score >= 61).length,
    hotGroups: groupsWithScores.filter(g => g.score >= 61).length,
    conversionRate: leadsWithScores.length > 0 
      ? (leadsWithScores.filter(l => l.stage === 'ganho').length / leadsWithScores.length * 100).toFixed(1)
      : 0,
    avgScore: leadsWithScores.length > 0
      ? (leadsWithScores.reduce((sum, l) => sum + l.score, 0) / leadsWithScores.length).toFixed(0)
      : 0
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-16 bg-black border-r border-zinc-800 flex flex-col items-center py-6 space-y-8">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center font-bold text-black text-sm">
          BR
        </div>
        
        <div className="flex-1 flex flex-col space-y-6">
          <button 
            onClick={() => setView('inbox')}
            className={`p-3 rounded-lg transition-all relative ${
              view === 'inbox' 
                ? 'bg-zinc-800 text-amber-400' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <MessageSquare size={20} />
            {analytics.hotLeads > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {analytics.hotLeads}
              </span>
            )}
          </button>

          <button 
            onClick={() => setView('groups')}
            className={`p-3 rounded-lg transition-all relative ${
              view === 'groups' 
                ? 'bg-zinc-800 text-amber-400' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users size={20} />
            {groupsWithScores.filter(g => g.unreadCount > 0).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {groupsWithScores.filter(g => g.unreadCount > 0).length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setView('kanban')}
            className={`p-3 rounded-lg transition-all ${
              view === 'kanban' 
                ? 'bg-zinc-800 text-amber-400' 
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <LayoutGrid size={20} />
          </button>
          
          {canAccessAnalytics && (
            <button 
              onClick={() => setView('analytics')}
              className={`p-3 rounded-lg transition-all ${
                view === 'analytics' 
                  ? 'bg-zinc-800 text-amber-400' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <BarChart3 size={20} />
            </button>
          )}
          
          {canAccessConfig && (
            <button 
              onClick={() => setView('config')}
              className={`p-3 rounded-lg transition-all ${
                view === 'config' 
                  ? 'bg-zinc-800 text-amber-400' 
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Settings size={20} />
            </button>
          )}
        </div>

        <button 
          onClick={isGodMode ? onBack : onLogout}
          className="p-3 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all"
        >
          {isGodMode ? <ChevronRight size={20} className="rotate-180" /> : <LogOut size={20} />}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-black border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">{tenant.name}</h2>
              <p className="text-xs text-zinc-500">
                {currentUser.name} • {currentUser.role === 'client_admin' ? 'Administrador' : 'Usuário'}
                {isGodMode && <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Modo God</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-zinc-400">
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} />
                <span>{analytics.totalLeads} leads</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-blue-400" />
                <span>{analytics.totalGroups} grupos</span>
              </div>
              <Circle size={4} className="fill-current" />
              <div className="flex items-center space-x-2">
                <Flame size={16} className="text-orange-400" />
                <span>{analytics.hotLeads + analytics.hotGroups} quentes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {view === 'config' ? (
          <ConfigPanel 
            tenant={tenant}
            systemData={systemData}
            setSystemData={setSystemData}
          />
        ) : view === 'analytics' ? (
          <AnalyticsPanel analytics={analytics} tenant={tenant} />
        ) : (
          <InboxKanbanView
            view={view}
            leads={leadsWithScores}
            groups={groupsWithScores}
            selectedLead={currentLead}
            setSelectedLead={setSelectedLead}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            message={message}
            setMessage={setMessage}
            tenant={tenant}
            systemData={systemData}
            setSystemData={setSystemData}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAINEL DE CONFIGURAÇÕES
// ============================================================================

function ConfigPanel({ tenant, systemData, setSystemData }) {
  const [activeTab, setActiveTab] = useState('ai');
  const [aiPrompt, setAiPrompt] = useState(tenant.aiPrompt);
  const [customFields, setCustomFields] = useState(tenant.customFields);
  const [users, setUsers] = useState(tenant.users);

  const saveAIPrompt = () => {
    const updatedTenants = systemData.tenants.map(t =>
      t.id === tenant.id ? { ...t, aiPrompt } : t
    );
    setSystemData({ ...systemData, tenants: updatedTenants });
    alert('Prompt da IA salvo com sucesso!');
  };

  const addCustomField = () => {
    const newField = {
      id: `f${Date.now()}`,
      name: `campo_${customFields.length + 1}`,
      label: `Novo Campo ${customFields.length + 1}`,
      type: 'text'
    };
    setCustomFields([...customFields, newField]);
  };

  const saveCustomFields = () => {
    const updatedTenants = systemData.tenants.map(t =>
      t.id === tenant.id ? { ...t, customFields } : t
    );
    setSystemData({ ...systemData, tenants: updatedTenants });
    alert('Campos personalizados salvos!');
  };

  const addUser = () => {
    const newUser = {
      id: `u${Date.now()}`,
      name: 'Novo Usuário',
      email: `usuario${users.length + 1}@${tenant.name.toLowerCase().replace(/\s/g, '')}.com`,
      password: 'senha123',
      role: 'client_user',
      tenantId: tenant.id
    };
    setUsers([...users, newUser]);
  };

  const saveUsers = () => {
    const updatedTenants = systemData.tenants.map(t =>
      t.id === tenant.id ? { ...t, users } : t
    );
    setSystemData({ ...systemData, tenants: updatedTenants });
    alert('Usuários salvos!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'ai'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Bot size={16} />
              <span>Prompt da IA</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'fields'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Tag size={16} />
              <span>Campos Personalizados</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium transition-all ${
              activeTab === 'users'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users size={16} />
              <span>Usuários</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'ai' && (
          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Configurar Prompt da IA</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Defina como a IA deve se comportar ao responder seus clientes
            </p>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              rows={8}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-all resize-none"
            />
            <button
              onClick={saveAIPrompt}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all"
            >
              Salvar Prompt
            </button>
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Campos Personalizados</h3>
                <p className="text-sm text-zinc-400">Configure os campos do seu CRM</p>
              </div>
              <button
                onClick={addCustomField}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Adicionar Campo</span>
              </button>
            </div>

            <div className="space-y-3">
              {customFields.map((field, idx) => (
                <div key={field.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].label = e.target.value;
                        setCustomFields(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="Nome do campo"
                    />
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].name = e.target.value;
                        setCustomFields(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="ID do campo"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const updated = [...customFields];
                        updated[idx].type = e.target.value;
                        setCustomFields(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                    >
                      <option value="text">Texto</option>
                      <option value="select">Seleção</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveCustomFields}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all"
            >
              Salvar Campos
            </button>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Gerenciar Usuários</h3>
                <p className="text-sm text-zinc-400">Adicione ou remova acesso ao sistema</p>
              </div>
              <button
                onClick={addUser}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg text-sm font-medium flex items-center space-x-2"
              >
                <UserPlus size={16} />
                <span>Adicionar Usuário</span>
              </button>
            </div>

            <div className="space-y-3">
              {users.map((user, idx) => (
                <div key={user.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="grid grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={user.name}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[idx].name = e.target.value;
                        setUsers(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="Nome"
                    />
                    <input
                      type="email"
                      value={user.email}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[idx].email = e.target.value;
                        setUsers(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={user.password}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[idx].password = e.target.value;
                        setUsers(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                      placeholder="Senha"
                    />
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const updated = [...users];
                        updated[idx].role = e.target.value;
                        setUsers(updated);
                      }}
                      className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm"
                    >
                      <option value="client_admin">Administrador</option>
                      <option value="client_user">Usuário</option>
                    </select>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {user.role === 'client_admin' ? '👑 Admin - Acesso total' : '👤 Usuário - Apenas CRM'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveUsers}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium transition-all"
            >
              Salvar Usuários
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PAINEL DE ANALYTICS (simplificado)
// ============================================================================

function AnalyticsPanel({ analytics, tenant }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Total de Leads</span>
              <Users size={20} className="text-zinc-500" />
            </div>
            <div className="text-3xl font-bold">{analytics.totalLeads}</div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Leads Quentes</span>
              <Flame size={20} className="text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-orange-400">{analytics.hotLeads}</div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Taxa de Conversão</span>
              <Target size={20} className="text-zinc-500" />
            </div>
            <div className="text-3xl font-bold text-green-400">{analytics.conversionRate}%</div>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-zinc-400 text-sm">Score Médio</span>
              <Activity size={20} className="text-zinc-500" />
            </div>
            <div className="text-3xl font-bold text-amber-400">{analytics.avgScore}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INBOX/KANBAN VIEW (simplificado - usa o mesmo do MVP anterior)
// ============================================================================

function InboxKanbanView({ view, leads, groups, selectedLead, setSelectedLead, searchQuery, setSearchQuery, message, setMessage, tenant }) {
  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.phone.includes(searchQuery)
  );

  const filteredGroups = (groups || []).filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.groupId.includes(searchQuery)
  );

  // Combina leads e grupos para visualização
  const displayItems = view === 'groups' ? filteredGroups : filteredLeads;
  const allItems = [...leads, ...(groups || [])];

  if (view === 'inbox' || view === 'groups') {
    const isGroupView = view === 'groups';
    
    return (
      <div className="flex-1 flex">
        {/* List */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold mb-3 flex items-center space-x-2">
              {isGroupView ? (
                <>
                  <Users size={16} className="text-blue-400" />
                  <span>Grupos de WhatsApp</span>
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  <span>Conversas</span>
                </>
              )}
            </h3>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={isGroupView ? "Buscar grupos..." : "Buscar leads..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayItems.map(item => {
              const ScoreIcon = item.scoreData.icon;
              const isGroup = item.type === 'group';
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedLead(item)}
                  className={`w-full p-4 border-b border-zinc-800 hover:bg-zinc-900 transition-all text-left ${
                    selectedLead?.id === item.id ? 'bg-zinc-900 border-l-2 border-l-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      <div className={`w-10 h-10 ${isGroup ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-zinc-700 to-zinc-800'} rounded-full flex items-center justify-center text-sm font-semibold relative`}>
                        {isGroup ? (
                          <Users size={16} className="text-white" />
                        ) : (
                          item.name.split(' ').map(n => n[0]).join('')
                        )}
                        {item.score >= 61 && (
                          <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r ${item.scoreData.color} w-5 h-5 rounded-full flex items-center justify-center`}>
                            <ScoreIcon size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          {isGroup && (
                            <span className="bg-blue-500/20 text-blue-400 text-xs px-1.5 py-0.5 rounded flex-shrink-0">
                              Grupo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate">
                          {isGroup ? `${item.participants.length} participantes` : item.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <span className="text-xs text-zinc-500">{item.lastMessageTime}</span>
                      {item.unreadCount > 0 && (
                        <span className={`${isGroup ? 'bg-blue-500' : 'bg-amber-500'} text-white text-xs rounded-full px-2 py-0.5 font-semibold`}>
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-zinc-400 truncate mb-2">{item.lastMessage}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`${STAGES.find(s => s.id === item.stage)?.color} w-2 h-2 rounded-full`}></span>
                      <span className="text-xs text-zinc-500">{STAGES.find(s => s.id === item.stage)?.label}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs font-semibold text-zinc-400">Score:</span>
                      <span className={`text-xs font-bold bg-gradient-to-r ${item.scoreData.color} bg-clip-text text-transparent`}>
                        {item.score}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        {selectedLead ? (
          <div className="flex-1 flex flex-col bg-zinc-950">
            {/* Chat Header */}
            <div className="p-4 border-b border-zinc-800 bg-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${selectedLead.type === 'group' ? 'bg-gradient-to-br from-blue-600 to-blue-700' : 'bg-gradient-to-br from-zinc-700 to-zinc-800'} rounded-full flex items-center justify-center text-sm font-semibold relative`}>
                    {selectedLead.type === 'group' ? (
                      <Users size={16} className="text-white" />
                    ) : (
                      selectedLead.name.split(' ').map(n => n[0]).join('')
                    )}
                    {selectedLead.score >= 61 && (
                      <div className={`absolute -bottom-1 -right-1 bg-gradient-to-r ${selectedLead.scoreData.color} w-5 h-5 rounded-full flex items-center justify-center`}>
                        <selectedLead.scoreData.icon size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center space-x-2">
                      <span>{selectedLead.name}</span>
                      {selectedLead.type === 'group' && (
                        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">
                          Grupo
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center space-x-2">
                      {selectedLead.type === 'group' ? (
                        <>
                          <Users size={12} />
                          <span>{selectedLead.participants.join(', ')}</span>
                        </>
                      ) : (
                        <>
                          <span>{selectedLead.phone}</span>
                          <Circle size={4} className="fill-current" />
                          <span className={`${STAGES.find(s => s.id === selectedLead.stage)?.color.replace('bg-', 'text-')}`}>
                            {STAGES.find(s => s.id === selectedLead.stage)?.label}
                          </span>
                        </>
                      )}
                      <Circle size={4} className="fill-current" />
                      <span className={`bg-gradient-to-r ${selectedLead.scoreData.color} bg-clip-text text-transparent font-semibold`}>
                        {selectedLead.scoreData.label} ({selectedLead.score})
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
                      selectedLead.aiEnabled
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    <Bot size={14} />
                    <span>{selectedLead.aiEnabled ? 'IA Ativa' : 'IA Pausada'}</span>
                  </button>
                  
                  <button className="p-2 hover:bg-zinc-800 rounded-lg transition-all">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950">
              {selectedLead.conversations.map((msg, idx) => {
                const isGroupMessage = selectedLead.type === 'group';
                const senderName = isGroupMessage ? msg.sender : (msg.sender === 'lead' ? selectedLead.name : 'Você');
                
                return (
                  <div key={idx} className={`flex ${msg.sender === 'lead' || isGroupMessage ? 'justify-start' : 'justify-end'}`}>
                    <div className="max-w-md">
                      {isGroupMessage && msg.sender !== 'user' && msg.sender !== 'ai' && (
                        <div className="text-xs text-zinc-500 mb-1 px-2">
                          {senderName}
                        </div>
                      )}
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.sender === 'lead' || (isGroupMessage && msg.sender !== 'user' && msg.sender !== 'ai')
                          ? 'bg-zinc-800 text-white'
                          : msg.isAI
                            ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                            : 'bg-amber-500 text-black'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 px-2">
                        <span className="text-xs text-zinc-500">{msg.time}</span>
                        {msg.isAI && (
                          <span className="text-xs text-blue-400 flex items-center space-x-1">
                            <Bot size={10} />
                            <span>Auto</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-zinc-800 bg-black">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={selectedLead.type === 'group' ? "Mensagem para o grupo..." : "Digite sua mensagem..."}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-all"
                />
                <button className="bg-amber-500 hover:bg-amber-600 text-black p-3 rounded-lg transition-all">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-950">
            <div className="text-center">
              {isGroupView ? <Users size={48} className="text-zinc-700 mx-auto mb-4" /> : <MessageSquare size={48} className="text-zinc-700 mx-auto mb-4" />}
              <p className="text-zinc-500">Selecione {isGroupView ? 'um grupo' : 'uma conversa'}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Kanban view simplificado
  return (
    <div className="flex-1 overflow-x-auto p-6 bg-zinc-950">
      <div className="flex space-x-4 h-full min-w-max">
        {STAGES.map(stage => (
          <div key={stage.id} className="w-80 bg-black border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`${stage.color} w-3 h-3 rounded-full`}></div>
                <h3 className="font-semibold">{stage.label}</h3>
              </div>
              <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                {[...filteredLeads, ...filteredGroups].filter(l => l.stage === stage.id).length}
              </span>
            </div>
            <div className="space-y-2">
              {[...filteredLeads, ...filteredGroups]
                .filter(item => item.stage === stage.id)
                .map(item => (
                  <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      {item.type === 'group' && <Users size={12} className="text-blue-400" />}
                      <h4 className="font-medium text-sm">{item.name}</h4>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {item.type === 'group' ? `${item.participants.length} participantes` : item.phone}
                    </p>
                    <div className="mt-2 text-xs">
                      Score: <span className="font-bold">{item.score}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Styles
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
  
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #18181b;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #3f3f46;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #52525b;
  }
`;

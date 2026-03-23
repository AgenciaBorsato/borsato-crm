// Cache em memoria para midias enviadas pelo atendente nesta sessao
// Estrutura: { [msgId]: dataUrl }
// Este modulo e importado pelo App.jsx para compartilhar o cache entre renders
export const sentMediaCache = {};

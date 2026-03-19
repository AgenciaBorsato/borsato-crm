# Borsato CRM - Sistema Multi-Tenant

Sistema completo de CRM com IA, WhatsApp e gestão de grupos.

## 🚀 DEPLOY NO NAPOLEON - PASSO A PASSO

### PRÉ-REQUISITOS
- Napoleon com suporte a Node.js
- Acesso SSH ou painel de controle
- Node.js 18+ instalado no servidor

---

## 📦 PASSO 1: FAZER UPLOAD DOS ARQUIVOS

### Estrutura de pastas necessária:
```
borsato-crm/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    └── index.css
```

### Como fazer upload:
1. Compacte todos os arquivos em `borsato-crm.zip`
2. Faça upload via FTP/SFTP ou painel Napoleon
3. Extraia no diretório desejado (ex: `/home/usuario/borsato-crm`)

---

## ⚙️ PASSO 2: INSTALAR DEPENDÊNCIAS

Acesse via SSH e rode:

```bash
cd /home/usuario/borsato-crm
npm install
```

Isso vai instalar:
- React
- Vite
- Tailwind CSS
- Lucide React (ícones)

---

## 🔨 PASSO 3: BUILD DE PRODUÇÃO

Rode o comando de build:

```bash
npm run build
```

Isso cria a pasta `dist/` com arquivos otimizados.

---

## 🌐 PASSO 4: CONFIGURAR SERVIDOR

### OPÇÃO A: Servidor Node.js (Recomendado)

Crie arquivo `server.js` na raiz:

```javascript
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, 'dist')));

// Todas as rotas retornam o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Borsato CRM rodando em http://localhost:${PORT}`);
});
```

Adicione ao `package.json`:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

Instale Express:
```bash
npm install express
```

Rode o servidor:
```bash
npm start
```

### OPÇÃO B: Servir com Nginx

Configure virtual host:

```nginx
server {
    listen 80;
    server_name crm.borsato.com;
    root /home/usuario/borsato-crm/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Reinicie Nginx:
```bash
sudo systemctl restart nginx
```

---

## 🔐 PASSO 5: CONFIGURAR DOMÍNIO

No painel Napoleon:
1. Adicione domínio: `crm.borsato.com`
2. Aponte para pasta/aplicação Node.js
3. Ative SSL/HTTPS

---

## 🧪 PASSO 6: TESTAR

Acesse: `https://crm.borsato.com`

**Logins de teste:**
- Super Admin: `wlad@borsato.com` / `borsato123`
- Cliente: `roberto@clinicasilva.com` / `silva123`
- Usuário: `maria@clinicasilva.com` / `maria123`

---

## 📝 FUNCIONALIDADES IMPLEMENTADAS

✅ **Sistema Multi-Tenant completo**
✅ **3 níveis de permissão:**
   - Super Admin (Wlad)
   - Admin do Cliente (médico/pedreiro)
   - Usuário (secretária)

✅ **Gestão de Leads Individuais**
✅ **Gestão de Grupos WhatsApp**
✅ **Scoring inteligente (0-100)**
✅ **Dashboard Analytics**
✅ **Base de Conhecimento**
✅ **Configuração de IA personalizada**
✅ **Campos customizados por cliente**
✅ **Gerenciamento de usuários**

---

## 🔄 ATUALIZAÇÕES FUTURAS

Quando você quiser atualizar o sistema:

1. Edite o arquivo `src/App.jsx`
2. Rode `npm run build`
3. Reinicie o servidor

---

## 🐛 TROUBLESHOOTING

**Erro: "Cannot find module"**
→ Rode `npm install` novamente

**Página em branco**
→ Verifique console do navegador (F12)
→ Verifique se `dist/index.html` existe

**Porta já em uso**
→ Mude PORT no `server.js` ou mate processo:
```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📞 SUPORTE

Qualquer dúvida, fala com o Claude! 🔥

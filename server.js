import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, 'dist')));

// Todas as rotas retornam o index.html (SPA - Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Borsato CRM rodando em http://localhost:${PORT}`);
  console.log(`📱 Acesse externamente via domínio configurado`);
});

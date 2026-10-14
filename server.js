import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/**
 * Endpoint de status da integração MuscleWiki
 * Verifica se a chave comercial está presente nas variáveis de ambiente do backend
 * sem expor credenciais ao frontend React.
 */
app.get('/api/musclewiki/status', (req, res) => {
  const hasKey = !!process.env.MUSCLEWIKI_API_KEY;
  res.json({
    configured: hasKey,
    mode: hasKey ? 'active' : 'pending_license',
    status: hasKey ? 'Conectado à API Oficial' : 'Pendente de Chave / Licença Comercial',
    message: hasKey 
      ? 'Chave oficial MuscleWiki configurada com segurança no servidor proxy.'
      : 'Modo pendente ativo: o aplicativo opera com curadoria própria e cadastro manual de vídeos licenciados.'
  });
});

/**
 * Proxy seguro para busca autenticada na API MuscleWiki
 * Impede exposição de chaves no client-side React e não realiza web scraping.
 */
app.get('/api/musclewiki/search', async (req, res) => {
  const apiKey = process.env.MUSCLEWIKI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'API_KEY_NOT_CONFIGURED',
      message: 'Integração em modo pendente. Nenhuma chave MUSCLEWIKI_API_KEY configurada no servidor backend.'
    });
  }

  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'QUERY_REQUIRED', message: 'Parâmetro q é obrigatório.' });
  }

  try {
    const upstreamRes = await fetch(`https://musclewiki.com/api/v1/exercises?search=${encodeURIComponent(String(query))}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).json({
        error: 'UPSTREAM_ERROR',
        message: `MuscleWiki respondeu com status ${upstreamRes.status}`
      });
    }

    const data = await upstreamRes.json();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: 'PROXY_FETCH_ERROR',
      message: error instanceof Error ? error.message : 'Falha na comunicação com o servidor upstream'
    });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

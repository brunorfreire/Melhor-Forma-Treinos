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

/**
 * Proteção de Mídias Estáticas Físicas (/exercises/)
 * - Arquivos associados a treinos gratuitos aprovados são públicos (demonstração gratuita).
 * - Arquivos exclusivos de treinos Premium (ex: triceps-frances-halter) ou não aprovados (ex: mesa-flexora)
 *   são estritamente bloqueados para acessos anônimos não autorizados (retornam 403 Forbidden).
 */
const PUBLIC_APPROVED_MEDIA = [
  'agachamento-sumo-halter',
  'elevacao-pelvica-unilateral',
  'flexao-braco-inclinada',
  'remada-curvada-halteres',
  'subida-step-degrau'
];

app.use('/exercises', async (req, res, next) => {
  const filePath = req.path.replace(/^\//, '');
  const baseName = filePath.replace(/\.[^.]+$/, '');

  // Arquivos públicos aprovados são liberados para consumo na vitrine
  if (PUBLIC_APPROVED_MEDIA.includes(baseName)) {
    return next();
  }

  // Mídias exclusivas Premium ou pendentes exigem token de autorização real verificado
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({
      error: 'ACCESS_DENIED',
      message: 'Mídia protegida. O acesso a exercícios exclusivos Premium ou pendentes de validação requer autenticação com assinatura ativa ou compra avulsa.'
    });
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(403).json({
      error: 'STORAGE_LOCKED',
      message: 'Servidor Supabase pendente de configuração no backend. Arquivos protegidos permanecem bloqueados.'
    });
  }

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (!userRes.ok) {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Token de autenticação inválido ou expirado.'
      });
    }

    const userData = await userRes.json();
    if (!userData || (!userData.email_confirmed_at && !userData.confirmed_at)) {
      return res.status(403).json({
        error: 'EMAIL_NOT_CONFIRMED',
        message: 'Confirmação obrigatória de e-mail pendente.'
      });
    }

    // Consulta perfil autoritativo
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}&select=app_role,subscription_status`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
      }
    });

    if (profileRes.ok) {
      const profiles = await profileRes.json();
      const profile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;
      if (profile && (profile.app_role === 'trainer' || profile.app_role === 'admin' || profile.subscription_status === 'active')) {
        return next();
      }
    }

    return res.status(403).json({
      error: 'PREMIUM_SUBSCRIPTION_REQUIRED',
      message: 'Acesso negado: esta mídia requer assinatura Premium ativa ou autorização administrativa.'
    });
  } catch (err) {
    return res.status(500).json({
      error: 'AUTH_VERIFICATION_FAILED',
      message: 'Falha na verificação de autorização no Supabase.'
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

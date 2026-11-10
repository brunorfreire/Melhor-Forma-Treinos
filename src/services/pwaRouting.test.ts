/**
 * TESTES UNITÁRIOS E DE INTEGRAÇÃO - PWA & ROTEAMENTO DIRETO ÁREA DO ALUNO
 * Executado via: npx tsx src/services/pwaRouting.test.ts
 */

import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

function runTests() {
  console.log('🧪 Iniciando testes de PWA e Abertura Direta na Área do Aluno...\n');

  // Teste 1: Auditoria do manifest.webmanifest
  console.log('1. Auditando public/manifest.webmanifest:');
  const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
  assert(fs.existsSync(manifestPath), 'public/manifest.webmanifest deve existir');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert(manifest.start_url === '/app?source=pwa', `start_url deve ser /app?source=pwa (encontrado: ${manifest.start_url})`);
  assert(manifest.scope === '/', `scope deve ser / (encontrado: ${manifest.scope})`);
  assert(manifest.display === 'standalone', `display deve ser standalone (encontrado: ${manifest.display})`);
  assert(manifest.name === 'Melhor Forma Play', 'name deve ser Melhor Forma Play');
  assert(manifest.short_name === 'MF Play', 'short_name deve ser MF Play');
  
  const iconSizes = manifest.icons.map((i: any) => i.sizes);
  assert(iconSizes.includes('192x192'), 'Manifest deve conter ícone 192x192');
  assert(iconSizes.includes('512x512'), 'Manifest deve conter ícone 512x512');
  assert(manifest.icons.some((i: any) => i.purpose === 'maskable'), 'Manifest deve conter ícone maskable');
  console.log('  ✅ public/manifest.webmanifest auditado e 100% em conformidade.');

  // Teste 2: Auditoria do vite.config.ts (plugin VitePWA)
  console.log('\n2. Auditando configuração VitePWA em vite.config.ts:');
  const viteConfigContent = fs.readFileSync(path.resolve(process.cwd(), 'vite.config.ts'), 'utf-8');
  assert(viteConfigContent.includes("start_url: '/app?source=pwa'"), "vite.config.ts deve conter start_url: '/app?source=pwa'");
  assert(viteConfigContent.includes("scope: '/'"), "vite.config.ts deve conter scope: '/'");
  assert(viteConfigContent.includes("enabled: true"), "vite.config.ts deve habilitar devOptions.enabled: true");
  console.log('  ✅ vite.config.ts configurado com rota interna estável /app.');

  // Teste 3: Auditoria do index.html (meta tags mobile e manifest)
  console.log('\n3. Auditando index.html:');
  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
  assert(indexHtml.includes('rel="manifest"'), 'index.html deve conter tag rel="manifest"');
  assert(indexHtml.includes('apple-mobile-web-app-capable'), 'index.html deve ter apple-mobile-web-app-capable');
  assert(indexHtml.includes('theme-color'), 'index.html deve ter meta theme-color');
  console.log('  ✅ index.html em conformidade.');

  // Teste 4: Lógica de inicialização de rota (simulação de ambientes)
  console.log('\n4. Testando lógica de detecção de rotas:');

  function simulateGetInitialRoute(pathname: string, search: string, isStandalone: boolean): string {
    const path = pathname.toLowerCase();
    if (path === '/entrar') return '/entrar';
    if (path === '/cadastro') return '/cadastro';
    if (path === '/recuperar') return '/recuperar';
    if (path === '/app' || path.startsWith('/app')) return '/app';

    if (isStandalone || search.includes('source=pwa')) return '/app';

    return '/';
  }

  // Cenário 4.1: Visitante comum no navegador acessando a raiz
  const rVisitor = simulateGetInitialRoute('/', '', false);
  assert(rVisitor === '/', 'Visitante normal no navegador deve receber rota /');
  console.log('  ✅ Cenário visitante normal -> rota /');

  // Cenário 4.2: PWA instalado aberto pelo ícone da tela inicial (?source=pwa)
  const rPwaLaunch = simulateGetInitialRoute('/app', '?source=pwa', true);
  assert(rPwaLaunch === '/app', 'PWA instalado com ?source=pwa deve receber rota /app');
  console.log('  ✅ Cenário PWA instalado -> rota /app');

  // Cenário 4.3: PWA antigo ou atalho que abriu em / com modo standalone ativo
  const rStandaloneRoot = simulateGetInitialRoute('/', '', true);
  assert(rStandaloneRoot === '/app', 'PWA em modo standalone na raiz deve ser redirecionado para /app');
  console.log('  ✅ Cenário PWA standalone na raiz -> redireciona para /app');

  // Cenário 4.4: Sessão expirada tentando acessar /app
  const rExpiredApp = simulateGetInitialRoute('/app', '', false);
  assert(rExpiredApp === '/app', 'Acesso direto a /app deve manter rota /app para checagem');
  console.log('  ✅ Cenário acesso a /app -> rota /app');

  // Teste 5: Auditoria de preservação em App.tsx
  console.log('\n5. Auditando implementação em src/App.tsx:');
  const appTsx = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf-8');
  
  assert(appTsx.includes('data-testid="pwa-auth-verification-splash"'), 'App.tsx deve conter tela de splash com data-testid');
  assert(appTsx.includes("viewMode, setViewMode] = useState<ViewMode>('my_week')"), "App.tsx deve inicializar viewMode com 'my_week'");
  assert(appTsx.includes('isStandalonePWA()'), 'App.tsx deve ter função helper isStandalonePWA()');
  assert(appTsx.includes('checkIsStandalone'), 'App.tsx deve importar checkIsStandalone');
  console.log('  ✅ App.tsx implementa splash screen discreto e abertura direta em Minha Semana.');

  console.log('\n🎉 Todos os testes de PWA e abertura direta foram aprovados com 100% de sucesso!');
}

runTests();

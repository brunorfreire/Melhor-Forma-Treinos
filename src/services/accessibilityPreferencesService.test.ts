import {
  getStoredFontScale,
  setFontScalePreference,
  cycleFontScale,
  initFontScaleFromStorage,
  FONT_SCALE_METADATA,
  FontScaleLevel
} from './accessibilityPreferencesService';

function runTests() {
  console.log('--- TEST SUITE: Acessibilidade de Fonte & CTA Inicie Aqui ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // Mock localStorage and document for node environment
  const mockStorage: Record<string, string> = {};
  const mockDOMAttributes: Record<string, string> = {};

  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    }
  };

  (globalThis as any).document = {
    documentElement: {
      setAttribute: (name: string, value: string) => {
        mockDOMAttributes[name] = value;
      },
      getAttribute: (name: string) => mockDOMAttributes[name] || null
    }
  };

  (globalThis as any).window = {
    dispatchEvent: () => true
  };

  // 1. Nível padrão inicial
  const initial = getStoredFontScale();
  assert(initial === 'normal', 'Nível de fonte padrão inicial é "normal" (100%).');

  // 2. Metadados de escala
  assert(FONT_SCALE_METADATA.normal.percentage === 100, 'Escala normal tem percentage === 100.');
  assert(FONT_SCALE_METADATA.large.percentage === 110, 'Escala large tem percentage === 110 (+10%).');
  assert(FONT_SCALE_METADATA.xlarge.percentage === 120, 'Escala xlarge tem percentage === 120 (+20%).');
  assert(FONT_SCALE_METADATA.normal.shortBadge === 'Aa', 'Badge normal é "Aa".');
  assert(FONT_SCALE_METADATA.large.shortBadge === 'Aa+', 'Badge large é "Aa+".');
  assert(FONT_SCALE_METADATA.xlarge.shortBadge === 'Aa++', 'Badge xlarge é "Aa++".');

  // 3. Ciclo de estados (normal -> large -> xlarge -> normal)
  const step1 = cycleFontScale('normal');
  assert(step1 === 'large', 'cycleFontScale("normal") avança para "large".');

  const step2 = cycleFontScale('large');
  assert(step2 === 'xlarge', 'cycleFontScale("large") avança para "xlarge".');

  const step3 = cycleFontScale('xlarge');
  assert(step3 === 'normal', 'cycleFontScale("xlarge") retorna para "normal".');

  // 4. Persistência e aplicação no DOM via setFontScalePreference
  setFontScalePreference('large');
  assert(mockStorage['mf_font_scale_preference_v1'] === 'large', 'Salva preferência "large" no localStorage.');
  assert(mockDOMAttributes['data-font-scale'] === 'large', 'Aplica atributo data-font-scale="large" no elemento raiz.');

  setFontScalePreference('xlarge');
  assert(mockStorage['mf_font_scale_preference_v1'] === 'xlarge', 'Salva preferência "xlarge" no localStorage.');
  assert(mockDOMAttributes['data-font-scale'] === 'xlarge', 'Aplica atributo data-font-scale="xlarge" no elemento raiz.');

  // 5. Inicialização a partir do storage
  const loaded = initFontScaleFromStorage();
  assert(loaded === 'xlarge', 'initFontScaleFromStorage recupera o valor salvo "xlarge".');
  assert(mockDOMAttributes['data-font-scale'] === 'xlarge', 'initFontScaleFromStorage reaplica ao DOM imediatamente.');

  // 6. Teste da Lógica de Decisão do Botão "INICIE AQUI"
  // Simulação: se usuário não tem semana configurada
  function decideStartHereFlow(schedule: { configuredWeekdays?: number[] } | null): 'wizard' | 'my_week' {
    const hasConfiguredWeek = Boolean(
      schedule &&
      schedule.configuredWeekdays &&
      schedule.configuredWeekdays.length > 0
    );
    return hasConfiguredWeek ? 'my_week' : 'wizard';
  }

  assert(
    decideStartHereFlow(null) === 'wizard',
    'Quando o aluno ainda não tem semana (null), INICIE AQUI abre o assistente em 3 passos.'
  );
  assert(
    decideStartHereFlow({ configuredWeekdays: [] }) === 'wizard',
    'Quando o aluno tem configuredWeekdays vazio, INICIE AQUI abre o assistente em 3 passos.'
  );
  assert(
    decideStartHereFlow({ configuredWeekdays: [1, 3, 5] }) === 'my_week',
    'Quando o aluno já tem semana configurada ([1, 3, 5]), INICIE AQUI abre diretamente a Minha Semana.'
  );

  console.log(`\n========================================`);
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

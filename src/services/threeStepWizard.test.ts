import {
  getEducationalModelsForFrequency,
  applyEducationalModelToSchedule,
  EDUCATIONAL_MODELS
} from './educationalWorkoutModels';
import {
  initializePersonalWeeklySchedule,
  getWeeklySchedule,
  getMondayISO,
  setDemoScheduleOrigin
} from './weeklyScheduleService';

function runTests() {
  console.log('--- TEST SUITE: Minha Semana em 3 Passos & Modelos Educativos ---');
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

  // 1. Frequências 1 a 7 retornam modelos educativos
  for (let freq = 1; freq <= 7; freq++) {
    const models = getEducationalModelsForFrequency(freq);
    assert(
      Array.isArray(models) && models.length > 0,
      `Frequência ${freq} dias possui pelo menos 1 modelo educativo disponível.`
    );
    assert(
      models.every(m => m.frequency === freq),
      `Todos os modelos de frequência ${freq} têm m.frequency === ${freq}.`
    );
    assert(
      models.every(m => m.distribution.length > 0 && m.principles.length > 0),
      `Todos os modelos de frequência ${freq} têm princípios pedagógicos e distribuição definidos.`
    );
  }

  // 2. Modelo de 3 dias (frequência de ouro 40+)
  const models3d = getEducationalModelsForFrequency(3);
  const recommended3d = models3d.find(m => m.id === 'mod-3d-superior-inferior-full');
  assert(Boolean(recommended3d), 'Modelo recomendado 3 dias (Superior, Inferior e Full Body) existe.');
  if (recommended3d) {
    assert(
      recommended3d.distribution.length === 3,
      'Modelo recomendado 3 dias tem distribuição exatamente de 3 focos.'
    );
    assert(
      recommended3d.distribution[0].focusId === 'superiores',
      'Dia 1 do modelo 3d é Membros Superiores.'
    );
    assert(
      recommended3d.distribution[1].focusId === 'inferiores',
      'Dia 2 do modelo 3d é Membros Inferiores.'
    );
    assert(
      recommended3d.distribution[2].focusId === 'full_body',
      'Dia 3 do modelo 3d é Full Body Integrado.'
    );
  }

  // 3. Modelo de 7 dias possui dias de atividade leve (Recuperação Ativa / Mobilidade)
  const models7d = getEducationalModelsForFrequency(7);
  const longevidade7d = models7d[0];
  assert(Boolean(longevidade7d), 'Modelo de 7 dias existe.');
  if (longevidade7d) {
    const hasLight = longevidade7d.distribution.some(d => d.isLightActivity === true);
    assert(
      hasLight,
      'Modelo de 7 dias inclui dias educativos de atividade leve/mobilidade (Recuperação Ativa) sem sobrecarga.'
    );
    assert(
      Boolean(longevidade7d.consecutiveNotice),
      'Modelo de 7 dias possui aviso explícito de dias consecutivos e regeneração articular.'
    );
  }

  // 4. Teste de Inicialização de Disponibilidade Semanal (Etapa 3)
  const testWeek = '2026-11-09';
  const initialSchedule = initializePersonalWeeklySchedule({
    weekStartISO: testWeek,
    selectedWorkoutWeekdays: [1, 3, 5],
    activeRecoveryWeekdays: []
  });

  assert(
    initialSchedule.configuredWeekdays.length === 3,
    'Inicialização registra exatamente os 3 dias escolhidos pelo aluno.'
  );

  const daysList = Object.values(initialSchedule.days).sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  assert(daysList.length === 7, 'Agenda gerada contém exatamente 7 dias da semana.');

  const workoutDays = daysList.filter(d => d.dayType === 'workout');
  const restDays = daysList.filter(d => d.dayType === 'rest');
  assert(workoutDays.length === 3, 'Exatamente 3 dias foram marcados como workout (disponível para treino).');
  assert(restDays.length === 4, 'Exatamente 4 dias foram marcados como rest (sem treino programado).');

  // Garante que a disponibilidade inicial NÃO impõe treino de catálogo automaticamente
  assert(
    workoutDays.every(d => d.workoutId === undefined),
    'Nenhum treino específico é imposto automaticamente na confirmação de disponibilidade.'
  );

  // 5. Teste de Aplicação de Modelo Educativo (Pós-Confirmação)
  if (recommended3d) {
    const chosenDates = workoutDays.map(d => d.dateISO);
    const updatedWithModel = applyEducationalModelToSchedule({
      weekStartISO: testWeek,
      chosenDatesISO: chosenDates,
      model: recommended3d,
      isDemo: false
    });

    assert(Boolean(updatedWithModel), 'Modelo educativo aplicado com sucesso à agenda.');
    if (updatedWithModel) {
      const updatedWorkoutDays = Object.values(updatedWithModel.days)
        .filter(d => d.dayType === 'workout')
        .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

      assert(
        updatedWorkoutDays[0].plannedFocus === 'superiores',
        'Primeiro dia escolhido recebeu o foco "superiores" do modelo.'
      );
      assert(
        updatedWorkoutDays[1].plannedFocus === 'inferiores',
        'Segundo dia escolhido recebeu o foco "inferiores" do modelo.'
      );
      assert(
        updatedWorkoutDays[2].plannedFocus === 'full_body',
        'Terceiro dia escolhido recebeu o foco "full_body" do modelo.'
      );

      // Preservação: ainda não força exercícios nem workoutId fechado
      assert(
        updatedWorkoutDays.every(d => d.workoutId === undefined),
        'Foco pedagógico é atribuído sem forçar treino fechado ou exercício individual.'
      );
    }
  }

  // 6. Teste de Consulta de Plano do Treinador vs Pessoal
  const demoPersonal = setDemoScheduleOrigin(testWeek, 'personal');
  assert(demoPersonal.origin === 'personal', 'Ambiente pessoal configurado corretamente.');

  const demoTrainer = setDemoScheduleOrigin(testWeek, 'trainer');
  assert(demoTrainer.origin === 'trainer', 'Ambiente de treinador configurado corretamente.');
  assert(demoTrainer.trainerName === 'Bruno Freire', 'Nome do treinador preservado com segurança.');

  console.log(`\n========================================`);
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

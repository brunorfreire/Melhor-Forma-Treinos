/**
 * TESTES AUTOMATIZADOS DO COMPONENTE REACT WorkoutPicker
 * Valida a renderização real do seletor de treinos para garantir filtro exclusivo por foco muscular.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkoutPicker } from './WorkoutPicker';
import { getAllCatalogWorkouts } from '../../data/workoutCatalogService';
import { DayScheduleItem } from '../../types';
import { WeekCalendarDayMeta } from '../../services/weeklyScheduleService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(`Falha de asserção: ${message}`);
  }
  console.log(`✅ PASSOU: ${message}`);
}

function extractRenderedWorkoutIds(html: string): string[] {
  const matches = html.matchAll(/data-testid="picker-workout-option-([^"]+)"/g);
  return Array.from(matches, m => m[1]);
}

const baseDayMeta: WeekCalendarDayMeta = {
  dateISO: '2026-11-16',
  dayOfWeek: 1,
  shortName: 'Seg',
  fullName: 'Segunda-feira',
  dayNumber: '16',
  monthShort: 'Nov',
  formattedFullDate: 'Segunda-feira, 16 de Novembro',
  isToday: false,
  isPast: false
};

function makeDayItem(plannedFocus: string, plannedFocusLabel: string): DayScheduleItem {
  return {
    dateISO: '2026-11-16',
    dayOfWeek: 1,
    dayType: 'workout',
    plannedFocus,
    plannedFocusLabel,
    status: 'planned',
    origin: 'personal'
  };
}

console.log('====================================================');
console.log('TESTE DE RENDERIZAÇÃO DO COMPONENTE WorkoutPicker');
console.log('====================================================');

const allCatalog = getAllCatalogWorkouts();
const byId = new Map(allCatalog.map(w => [w.id, w]));

// CENÁRIO 1: Foco 'peitoral-ombro-triceps' (Peitoral, Ombro e Tríceps)
const pushHtml = renderToStaticMarkup(
  React.createElement(WorkoutPicker, {
    isOpen: true,
    dayItem: makeDayItem('peitoral-ombro-triceps', 'Peitoral, Ombro e Tríceps'),
    dayMeta: baseDayMeta,
    currentWorkout: null,
    userStatus: 'free',
    userRole: 'student',
    isDemoMode: false,
    onClose: () => {},
    onConfirmSelectWorkout: () => {}
  })
);

const pushIds = extractRenderedWorkoutIds(pushHtml);
assert(
  JSON.stringify(pushIds.slice().sort()) === JSON.stringify(['w-sup-01', 'w-sup-06']),
  `WorkoutPicker para 'Peitoral, Ombro e Tríceps' renderiza exclusivamente ['w-sup-01', 'w-sup-06'] (encontrado: [${pushIds.join(', ')}])`
);
assert(
  pushHtml.includes('picker-badge-free-w-sup-01') &&
    pushHtml.includes('picker-badge-free-w-sup-06') &&
    pushHtml.includes('>Gratuito<'),
  'Treinos gratuitos em PUSH exibem claramente o badge "Gratuito"'
);
assert(
  pushIds.every(id => byId.get(id)?.primaryFocus === 'peitoral-ombro-triceps'),
  'Todos os treinos renderizados no seletor PUSH possuem primaryFocus === "peitoral-ombro-triceps"'
);
assert(
  !pushIds.some(id => id.startsWith('w-inf') || id.startsWith('w-fb') || id.startsWith('w-40p') || id.startsWith('w-cardio') || id.startsWith('w-mob')),
  'Nenhum treino de pernas (w-inf-*), Full Body (w-fb-*), Força 40+, Cardio ou Mobilidade aparece no seletor PUSH'
);
assert(
  !pushIds.some(id => ['w-sup-02', 'w-sup-05', 'w-sup-07', 'w-sup-08', 'w-sup-09', 'w-sup-10', 'w-sup-12'].includes(id)),
  'Nenhum treino PULL (w-sup-02, w-sup-07) ou misto PUSH+PULL (w-sup-05, w-sup-08, w-sup-09, w-sup-12) aparece no seletor PUSH'
);
assert(
  pushHtml.includes('Foco exclusivo: Peitoral, Ombro e Tríceps'),
  'Cabeçalho exibe claramente o foco exclusivo selecionado'
);
assert(
  pushHtml.includes('2 treinos disponíveis'),
  'Contador de resultados exibe exatamente "2 treinos disponíveis"'
);
assert(
  !pushHtml.includes('toggle-other-focus-btn') &&
    !pushHtml.includes('Priorizando foco do dia no topo') &&
    !pushHtml.includes('Foco diferente do planejado'),
  'Controles showOtherFocus, botão "Priorizando foco do dia no topo" e avisos de foco diferente foram eliminados do DOM'
);

// CENÁRIO 2: Foco 'costas-biceps' (Costas, Bíceps e Trapézio) no modo normal e modo demo (2 gratuitos!)
const pullHtml = renderToStaticMarkup(
  React.createElement(WorkoutPicker, {
    isOpen: true,
    dayItem: makeDayItem('costas-biceps', 'Costas, Bíceps e Trapézio'),
    dayMeta: baseDayMeta,
    currentWorkout: null,
    userStatus: 'free',
    userRole: 'student',
    isDemoMode: false,
    onClose: () => {},
    onConfirmSelectWorkout: () => {}
  })
);
const pullIds = extractRenderedWorkoutIds(pullHtml);
assert(
  JSON.stringify(pullIds.slice().sort()) === JSON.stringify(['w-sup-02', 'w-sup-07']),
  `WorkoutPicker para 'Costas, Bíceps e Trapézio' renderiza exclusivamente ['w-sup-02', 'w-sup-07'] (encontrado: [${pullIds.join(', ')}])`
);

const pullDemoHtml = renderToStaticMarkup(
  React.createElement(WorkoutPicker, {
    isOpen: true,
    dayItem: makeDayItem('costas-biceps', 'Costas, Bíceps e Trapézio'),
    dayMeta: baseDayMeta,
    currentWorkout: null,
    userStatus: 'free',
    userRole: 'student',
    isDemoMode: true,
    onClose: () => {},
    onConfirmSelectWorkout: () => {}
  })
);
const pullDemoIds = extractRenderedWorkoutIds(pullDemoHtml);
assert(
  JSON.stringify(pullDemoIds.slice().sort()) === JSON.stringify(['w-sup-02', 'w-sup-07']) &&
    pullDemoHtml.includes('picker-badge-free-w-sup-02') &&
    pullDemoHtml.includes('picker-badge-free-w-sup-07'),
  'Aluno Free no modo apenas liberados em Costas, Bíceps e Trapézio agora recebe os 2 treinos Gratuitos (w-sup-02 e w-sup-07)'
);

// CENÁRIO 3: Foco sem resultados em busca incompatível mantém estado vazio sem vazar outros focos
const unmatchedFocusHtml = renderToStaticMarkup(
  React.createElement(WorkoutPicker, {
    isOpen: true,
    dayItem: makeDayItem('foco-inexistente-teste', 'Foco Inexistente'),
    dayMeta: baseDayMeta,
    currentWorkout: null,
    userStatus: 'free',
    userRole: 'student',
    isDemoMode: true,
    onClose: () => {},
    onConfirmSelectWorkout: () => {}
  })
);
assert(
  extractRenderedWorkoutIds(unmatchedFocusHtml).length === 0 &&
    unmatchedFocusHtml.includes('Não encontramos treinos para este grupamento com os filtros escolhidos.') &&
    unmatchedFocusHtml.includes('Limpar filtros de nível') &&
    unmatchedFocusHtml.includes('Limpar filtros de duração') &&
    unmatchedFocusHtml.includes('Limpar filtros de equipamentos'),
  'Quando não há treinos compatíveis no filtro ativo, exibe mensagem oficial e ações de limpeza sem misturar outros grupamentos'
);

// CENÁRIO 4: Foco 'inferiores' (Membros Inferiores) - Free primeiro mesmo para assinante Premium
const lowerHtml = renderToStaticMarkup(
  React.createElement(WorkoutPicker, {
    isOpen: true,
    dayItem: makeDayItem('inferiores', 'Membros Inferiores'),
    dayMeta: baseDayMeta,
    currentWorkout: null,
    userStatus: 'active',
    userRole: 'student',
    isDemoMode: false,
    onClose: () => {},
    onConfirmSelectWorkout: () => {}
  })
);
const lowerIds = extractRenderedWorkoutIds(lowerHtml);
assert(
  lowerIds.length === 8 &&
    lowerIds.every(id => id.startsWith('w-inf-')) &&
    byId.get(lowerIds[0])?.accessLevel === 'free' &&
    byId.get(lowerIds[1])?.accessLevel === 'free' &&
    lowerHtml.includes('picker-badge-free-w-inf-01') &&
    lowerHtml.includes('picker-badge-unlocked-w-inf-02'),
  `WorkoutPicker para 'Membros Inferiores' ordena os 2 Gratuitos primeiro e distingue "Gratuito" de "Premium • Liberado"`
);

// CENÁRIO 5: Foco 'full_body' (Full Body Integrado)
const fbHtml = renderToStaticMarkup(
  React.createElement(WorkoutPicker, {
    isOpen: true,
    dayItem: makeDayItem('full_body', 'Full Body Integrado'),
    dayMeta: baseDayMeta,
    currentWorkout: null,
    userStatus: 'active',
    userRole: 'student',
    isDemoMode: false,
    onClose: () => {},
    onConfirmSelectWorkout: () => {}
  })
);
const fbIds = extractRenderedWorkoutIds(fbHtml);
assert(
  fbIds.length === 8 && fbIds.every(id => id.startsWith('w-fb-')) && byId.get(fbIds[0])?.accessLevel === 'free' && byId.get(fbIds[1])?.accessLevel === 'free',
  `WorkoutPicker para 'Full Body Integrado' renderiza exclusivamente 8 treinos w-fb-* com os 2 Gratuitos no topo (encontrado: ${fbIds.length})`
);

// CENÁRIO 6: Todas as 7 divisões principais possuem >= 2 treinos Gratuitos para aluno Free
const divisionsToVerify: Array<[string, string]> = [
  ['peitoral-ombro-triceps', 'Peitoral, Ombro e Tríceps'],
  ['costas-biceps', 'Costas, Bíceps e Trapézio'],
  ['inferiores', 'Membros Inferiores'],
  ['full_body', 'Full Body Integrado'],
  ['forca_40_plus', 'Força para a Vida 40+'],
  ['cardiorespiratorio', 'Condicionamento & Fôlego'],
  ['mobilidade_equilibrio', 'Mobilidade & Equilíbrio']
];

divisionsToVerify.forEach(([focusId, focusLabel]) => {
  const html = renderToStaticMarkup(
    React.createElement(WorkoutPicker, {
      isOpen: true,
      dayItem: makeDayItem(focusId, focusLabel),
      dayMeta: baseDayMeta,
      currentWorkout: null,
      userStatus: 'free',
      userRole: 'student',
      isDemoMode: true,
      onClose: () => {},
      onConfirmSelectWorkout: () => {}
    })
  );
  const renderedIds = extractRenderedWorkoutIds(html);
  const freeRendered = renderedIds.filter(id => byId.get(id)?.accessLevel === 'free');
  assert(
    freeRendered.length >= 2,
    `Divisão '${focusId}' entrega pelo menos 2 treinos Gratuitos no WorkoutPicker para aluno Free (${freeRendered.join(', ')})`
  );
});

console.log('====================================================');
console.log('🎉 TODOS OS TESTES DO COMPONENTE WorkoutPicker PASSARAM!');
console.log('====================================================');

/**
 * TESTES AUTOMATIZADOS: FILTRO EXCLUSIVO DE GRUPAMENTO MUSCULAR EM MINHA SEMANA
 * Melhor Forma Play 40+
 */
import {
  getAllCatalogWorkouts,
  canUserAccessWorkout,
  convertCatalogWorkoutToWorkoutPlan
} from '../data/workoutCatalogService';
import {
  matchesClassificationFilter,
  isWorkoutClassificationReliable,
  auditCatalogClassification
} from './catalogClassificationService';
import {
  doesWorkoutMatchFocus,
  filterWorkoutsForDayFocus,
  initializePersonalWeeklySchedule,
  updateScheduledDay,
  getWeeklySchedule,
  markScheduledWorkoutCompleted,
  getMondayISO
} from './weeklyScheduleService';
import { CatalogWorkout } from '../types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(`Falha de asserção: ${message}`);
  }
  console.log(`✅ PASSOU: ${message}`);
}

console.log('====================================================');
console.log('TESTES DO FILTRO EXCLUSIVO DE GRUPAMENTO MUSCULAR');
console.log('====================================================');

const allWorkouts = getAllCatalogWorkouts();
const publishedWorkouts = allWorkouts.filter(w => w.status === 'publicado');

// 1. PUSH ('peitoral-ombro-triceps') nunca retorna PULL, pernas, Full Body ou mistos PUSH+PULL
const pushResults = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  accessFilter: 'todos'
});
assert(
  pushResults.length === 2,
  `PUSH publicado deve retornar exatamente 2 treinos (w-sup-01, w-sup-06), encontrado: ${pushResults.length}`
);
assert(
  pushResults.every(w => w.primaryFocus === 'peitoral-ombro-triceps'),
  `Todos os resultados de PUSH devem ter primaryFocus === 'peitoral-ombro-triceps'`
);
assert(
  !pushResults.some(w =>
    ['costas-biceps', 'inferiores', 'full_body', 'superiores_composto', 'forca_40_plus', 'cardiorespiratorio', 'mobilidade_equilibrio'].includes(
      w.primaryFocus || ''
    )
  ),
  'PUSH nunca retorna PULL, pernas, Full Body, Força 40+, Cardio, Mobilidade ou mistos PUSH+PULL'
);

// 2. PULL ('costas-biceps') nunca retorna PUSH, pernas ou Full Body
const pullResults = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'costas-biceps',
  accessFilter: 'todos'
});
assert(
  pullResults.length === 2,
  `PULL publicado deve retornar exatamente 2 treinos (w-sup-02, w-sup-07), encontrado: ${pullResults.length}`
);
assert(
  pullResults.every(w => w.primaryFocus === 'costas-biceps'),
  `Todos os resultados de PULL devem ter primaryFocus === 'costas-biceps'`
);
assert(
  !pullResults.some(w =>
    ['peitoral-ombro-triceps', 'inferiores', 'full_body', 'superiores_composto', 'forca_40_plus', 'cardiorespiratorio', 'mobilidade_equilibrio'].includes(
      w.primaryFocus || ''
    )
  ),
  'PULL nunca retorna PUSH, pernas, Full Body ou outros focos'
);

// 3. INFERIORES ('inferiores') nunca retorna treinos de superiores
const lowerResults = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'inferiores',
  accessFilter: 'todos'
});
assert(
  lowerResults.length === 8,
  `INFERIORES publicado deve retornar exatamente 8 treinos, encontrado: ${lowerResults.length}`
);
assert(
  lowerResults.every(w => w.category === 'inferiores' && w.primaryFocus === 'inferiores'),
  'INFERIORES retorna exclusivamente treinos de membros inferiores'
);
assert(
  !lowerResults.some(w => w.category === 'superiores' || w.id.startsWith('w-sup')),
  'INFERIORES nunca retorna treinos de superiores'
);

// 4. FULL BODY ('full_body') e MOBILIDADE ('mobilidade_equilibrio') retornam somente suas próprias categorias
const fullBodyResults = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'full_body',
  accessFilter: 'todos'
});
assert(
  fullBodyResults.length === 8 &&
    fullBodyResults.every(w => w.category === 'full_body' && w.primaryFocus === 'full_body'),
  `FULL BODY retorna somente sua própria categoria (8 publicados)`
);

const mobilityResults = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'mobilidade_equilibrio',
  accessFilter: 'todos'
});
assert(
  mobilityResults.length === 8 &&
    mobilityResults.every(w => w.category === 'mobilidade_equilibrio' && w.primaryFocus === 'mobilidade_equilibrio'),
  `MOBILIDADE & EQUILÍBRIO retorna somente sua própria categoria (8 publicados)`
);

// 5. Filtros de nível, duração, equipamento e busca não anulam o filtro muscular
const pushBeginnerHalteres = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  levelFilter: 'iniciante',
  equipmentFilter: 'Halteres leves',
  searchTerm: 'peitoral',
  accessFilter: 'todos'
});
assert(
  pushBeginnerHalteres.length === 1 && pushBeginnerHalteres[0].id === 'w-sup-01',
  'Filtros de nível/equipamento/busca dentro de PUSH refinam corretamente sem misturar focos'
);

const searchLegsInsidePush = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  searchTerm: 'agachamento',
  accessFilter: 'todos'
});
assert(
  searchLegsInsidePush.length === 0,
  'Buscar "agachamento" dentro do foco PUSH retorna 0 resultados (não reintroduz treinos de pernas)'
);

const emptyPushAdvancedShort = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  levelFilter: 'avancado',
  durationFilter: 'curto',
  accessFilter: 'todos'
});
assert(
  emptyPushAdvancedShort.length === 0,
  'Combinação sem resultados dentro de PUSH retorna lista vazia sem fallback de outros focos'
);

// 6. Limpar filtros (nível, duração, equipamentos, busca, acesso) mantém restrição muscular intacta
const afterClearingFilters = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  levelFilter: 'todos',
  durationFilter: 'todos',
  equipmentFilter: 'todos',
  searchTerm: '',
  accessFilter: 'todos'
});
assert(
  afterClearingFilters.length === 2 &&
    afterClearingFilters.every(w => w.primaryFocus === 'peitoral-ombro-triceps'),
  'Limpar filtros de nível/duração/equipamentos/busca mantém exclusivamente o foco peitoral-ombro-triceps'
);

// 7. Free e Premium respeitam permissões e "Todos (Free + Premium)" não expande para outros grupamentos
const pushFreeOnly = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  accessFilter: 'liberados',
  userStatus: 'free',
  userRole: 'student'
});
assert(
  pushFreeOnly.length === 2 &&
    pushFreeOnly.every(w => w.accessLevel === 'free' && w.primaryFocus === 'peitoral-ombro-triceps') &&
    pushFreeOnly.some(w => w.id === 'w-sup-01') &&
    pushFreeOnly.some(w => w.id === 'w-sup-06'),
  'Para aluno Free, "Apenas liberados" dentro de PUSH exibe os 2 treinos Free exclusivos de PUSH (w-sup-01 e w-sup-06)'
);

const pullFreeOnly = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'costas-biceps',
  accessFilter: 'liberados',
  userStatus: 'free',
  userRole: 'student'
});
assert(
  pullFreeOnly.length === 2 &&
    pullFreeOnly.every(w => w.accessLevel === 'free' && w.primaryFocus === 'costas-biceps') &&
    pullFreeOnly.some(w => w.id === 'w-sup-02') &&
    pullFreeOnly.some(w => w.id === 'w-sup-07'),
  'Para aluno Free, "Apenas liberados" dentro de PULL exibe os 2 treinos Free exclusivos de PULL (w-sup-02 e w-sup-07)'
);

const pushFilteredEmpty = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'peitoral-ombro-triceps',
  levelFilter: 'avancado',
  accessFilter: 'liberados',
  userStatus: 'free',
  userRole: 'student'
});
assert(
  pushFilteredEmpty.length === 0,
  'Quando filtros de nível não encontram treino Free em PUSH, retorna 0 sem vazar outros focos'
);

const premiumBlockedForFreeUser = allWorkouts.find(w => w.id === 'w-40p-07')!;
assert(
  canUserAccessWorkout(premiumBlockedForFreeUser, 'free', 'student') === false,
  'Treino Premium (w-40p-07) continua bloqueado para conta Free'
);
assert(
  convertCatalogWorkoutToWorkoutPlan(premiumBlockedForFreeUser, 'free', 'student') === null,
  'Conversão de treino Premium para Execução Guiada continua bloqueada para conta Free'
);
assert(
  canUserAccessWorkout(premiumBlockedForFreeUser, 'active', 'student') === true,
  'Treino Premium (w-40p-07) é liberado para assinante ativo'
);

const lowerOrderedForActiveUser = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: 'inferiores',
  accessFilter: 'todos',
  userStatus: 'active',
  userRole: 'student'
});
assert(
  lowerOrderedForActiveUser[0].accessLevel === 'free' && lowerOrderedForActiveUser[1].accessLevel === 'free',
  'Mesmo para assinante Premium, treinos Gratuitos aparecem primeiro dentro do foco selecionado'
);

// 8. Treinos sem classificação confiável não são incluídos indevidamente
const unverifiedWorkout: CatalogWorkout = {
  id: 'w-unverified-test',
  title: 'Treino Sem Classificação Oficial',
  description: 'Supino e remada misturados sem revisão',
  category: 'superiores',
  level: 'iniciante',
  duration: '30 min',
  equipments: ['Halteres'],
  objective: 'Teste de confiabilidade',
  coverImage: '',
  status: 'publicado',
  accessLevel: 'free',
  updatedAt: new Date().toISOString()
  // Sem primaryFocus!
};
assert(
  isWorkoutClassificationReliable(unverifiedWorkout).reliable === false,
  'Treino sem primaryFocus oficial é marcado como classificação não confiável'
);
assert(
  matchesClassificationFilter(unverifiedWorkout, 'peitoral-ombro-triceps') === false &&
    matchesClassificationFilter(unverifiedWorkout, 'superiores') === false,
  'Treino sem classificação confiável é excluído das listas específicas'
);

const flaggedWorkout: CatalogWorkout = {
  id: 'w-flagged-test',
  title: 'Treino Sinalizado Para Revisão',
  description: 'Aguardando revisão administrativa',
  category: 'superiores',
  primaryFocus: 'peitoral-ombro-triceps',
  level: 'iniciante',
  duration: '30 min',
  equipments: ['Halteres'],
  objective: 'Revisão pendente',
  coverImage: '',
  status: 'publicado',
  accessLevel: 'free',
  updatedAt: new Date().toISOString(),
  classificationReviewRequired: true,
  classificationReviewReason: 'Contém exercício de puxar'
};
assert(
  doesWorkoutMatchFocus(flaggedWorkout, 'peitoral-ombro-triceps') === false,
  'Treino sinalizado com classificationReviewRequired é retirado temporariamente da lista do foco'
);

const conflictingWorkout: CatalogWorkout = {
  id: 'w-conflict-test',
  title: 'Treino com Conflito Categoria x Foco',
  description: 'Teste de conflito',
  category: 'inferiores',
  primaryFocus: 'peitoral-ombro-triceps',
  level: 'iniciante',
  duration: '30 min',
  equipments: ['Halteres'],
  objective: 'Conflito',
  coverImage: '',
  status: 'publicado',
  accessLevel: 'free',
  updatedAt: new Date().toISOString()
};
assert(
  isWorkoutClassificationReliable(conflictingWorkout).reliable === false &&
    doesWorkoutMatchFocus(conflictingWorkout, 'peitoral-ombro-triceps') === false &&
    doesWorkoutMatchFocus(conflictingWorkout, 'inferiores') === false,
  'Treino com conflito entre categoria e primaryFocus é bloqueado em ambos os filtros'
);

// 9. Minha Semana e Execução Guiada permanecem funcionando
const mondayISO = getMondayISO('2026-11-16');
const createdWeek = initializePersonalWeeklySchedule({
  weekStartISO: mondayISO,
  selectedWorkoutWeekdays: [1, 3, 5],
  focusByWeekday: {
    1: 'peitoral-ombro-triceps',
    3: 'costas-biceps',
    5: 'inferiores'
  }
});
const mondayDateISO = Object.values(createdWeek.days).find(d => d.dayOfWeek === 1)!.dateISO;
const selectedForMonday = filterWorkoutsForDayFocus(publishedWorkouts, {
  plannedFocus: createdWeek.days[mondayDateISO].plannedFocus,
  accessFilter: 'todos'
})[0];
assert(
  selectedForMonday.id === 'w-sup-06' || selectedForMonday.id === 'w-sup-01',
  `Primeiro treino compatível e gratuito para segunda-feira (PUSH) é válido (${selectedForMonday.id})`
);

const updateRes = updateScheduledDay(mondayISO, mondayDateISO, {
  workoutId: selectedForMonday.id
});
assert(
  updateRes.success === true && updateRes.updatedDay?.workoutId === selectedForMonday.id,
  'Associação de treino na agenda semanal funciona corretamente'
);

const reloadedWeek = getWeeklySchedule(mondayISO);
assert(
  reloadedWeek?.days[mondayDateISO]?.workoutId === selectedForMonday.id,
  'Agenda semanal persistida mantém o treino associado'
);

const guidedPlan = convertCatalogWorkoutToWorkoutPlan(selectedForMonday, 'free', 'student');
assert(
  guidedPlan !== null && guidedPlan.sessions.length > 0 && guidedPlan.sessions[0].exercises.length > 0,
  'Execução Guiada gera WorkoutPlan válido com exercícios hidratados para treino Free selecionado'
);

const completionRes = markScheduledWorkoutCompleted({
  workoutId: selectedForMonday.id,
  scheduledDateISO: mondayDateISO
});
assert(
  completionRes.updated === true && completionRes.schedule?.days[mondayDateISO]?.status === 'completed',
  'Conclusão da sessão em Minha Semana continua registrando status completed corretamente'
);

const audit = auditCatalogClassification();
assert(
  audit.isValid === true && audit.workoutsNeedingReview.length === 0,
  'Auditoria global do catálogo permanece 100% válida'
);

console.log('====================================================');
console.log('🎉 TODOS OS 9 CENÁRIOS DE FILTRO EXCLUSIVO PASSARAM!');
console.log('====================================================');

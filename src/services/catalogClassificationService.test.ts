/**
 * TESTES AUTOMATIZADOS E AUDITORIA DE CLASSIFICAÇÃO DO CATÁLOGO
 * Melhor Forma Play 40+
 */
import { 
  CATALOG_CLASSIFICATIONS, 
  getWorkoutClassification, 
  getWorkoutExerciseCount, 
  isPushWorkout, 
  isPullWorkout, 
  matchesClassificationFilter, 
  auditCatalogClassification 
} from './catalogClassificationService';
import { getAllCatalogWorkouts } from '../data/workoutCatalogService';
import { INITIAL_CATALOG_WORKOUTS } from '../data/catalogWorkouts';
import { INITIAL_WORKOUT_EXERCISES } from '../data/workoutExercises';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FALHA: ${message}`);
    throw new Error(`Falha de asserção: ${message}`);
  }
  console.log(`✅ PASSOU: ${message}`);
}

console.log('====================================================');
console.log('INICIANDO AUDITORIA E TESTES DO CATÁLOGO 40+');
console.log('====================================================');

// 1. Total de treinos cadastrados
const allWorkouts = getAllCatalogWorkouts();
assert(allWorkouts.length === 72, `Total de treinos no catálogo deve ser 72 (encontrado: ${allWorkouts.length})`);
assert(INITIAL_CATALOG_WORKOUTS.length === 72, `INITIAL_CATALOG_WORKOUTS deve conter exatamente 72 treinos`);

// 2. Total de relações de exercícios prescritos
assert(INITIAL_WORKOUT_EXERCISES.length === 251, `Total de prescrições centrais deve ser 251 (encontrado: ${INITIAL_WORKOUT_EXERCISES.length})`);

// 3. Validação do card 'Empurrar & Puxar Seguro' (w-40p-07)
const empurrarPuxar = allWorkouts.find(w => w.id === 'w-40p-07');
assert(!!empurrarPuxar, `Treino 'Empurrar & Puxar Seguro' (w-40p-07) deve existir no catálogo`);
const empurrarPuxarCount = getWorkoutExerciseCount('w-40p-07');
assert(empurrarPuxarCount === 4, `Empurrar & Puxar Seguro deve ter exatamente 4 movimentos (encontrado: ${empurrarPuxarCount})`);
assert((empurrarPuxar?.exerciseCount || 0) === 4, `Propriedade exerciseCount de w-40p-07 deve ser 4 (encontrado: ${empurrarPuxar?.exerciseCount})`);
assert(empurrarPuxar?.accessLevel === 'premium', `w-40p-07 deve ser do nível de acesso Premium`);
assert(empurrarPuxar?.category === 'forca_40_plus', `w-40p-07 deve pertencer à categoria 'forca_40_plus'`);

// 4. Validação de que NENHUM treino tem 0 movimentos
allWorkouts.forEach(w => {
  const count = getWorkoutExerciseCount(w.id);
  assert(count > 0, `Treino ${w.id} (${w.title}) não pode ter 0 movimentos (tem ${count})`);
});

// 5. Auditoria da categoria 'Peitoral, Ombro e Tríceps' (PUSH)
const pushMatches = allWorkouts.filter(w => matchesClassificationFilter(w, 'peitoral-ombro-triceps'));
assert(pushMatches.length === 4, `Filtro 'Peitoral, Ombro e Tríceps' deve retornar exatamente 4 treinos genuínos de Push (encontrado: ${pushMatches.length})`);

const expectedPushIds = ['w-sup-01', 'w-sup-06', 'w-sup-09', 'w-sup-11'];
const actualPushIds = pushMatches.map(w => w.id).sort();
assert(
  JSON.stringify(actualPushIds) === JSON.stringify(expectedPushIds.sort()),
  `IDs de Push devem ser exatamente [${expectedPushIds.join(', ')}] (encontrado: [${actualPushIds.join(', ')}])`
);

// 6. Teste de NÃO-CONTAMINAÇÃO CRUZADA (Zero False Positives)
// Nenhum treino de inferiores (ex: w-inf-03) pode cair em push
const lowerContamination = pushMatches.filter(w => w.category === 'inferiores' || w.id.startsWith('w-inf'));
assert(lowerContamination.length === 0, `Nenhum treino de Inferiores pode cair no filtro Push (encontrados: ${lowerContamination.length})`);

// Nenhum treino de puxar puro (ex: w-sup-02, w-sup-07, w-sup-10) pode cair em push
const pullContamination = pushMatches.filter(w => ['w-sup-02', 'w-sup-07', 'w-sup-10'].includes(w.id));
assert(pullContamination.length === 0, `Nenhum treino de Costas/Puxar puro pode cair no filtro Push (encontrados: ${pullContamination.length})`);

// Nenhum treino de cardio (ex: w-cardio-01, w-cardio-09) pode cair em push
const cardioContamination = pushMatches.filter(w => w.category === 'cardiorespiratorio' || w.id.startsWith('w-cardio'));
assert(cardioContamination.length === 0, `Nenhum treino de Cardio pode cair no filtro Push (encontrados: ${cardioContamination.length})`);

// Nenhum treino de mobilidade (ex: w-mob-01, w-mob-04) pode cair em push
const mobContamination = pushMatches.filter(w => w.category === 'mobilidade_equilibrio' || w.id.startsWith('w-mob'));
assert(mobContamination.length === 0, `Nenhum treino de Mobilidade pura pode cair no filtro Push (encontrados: ${mobContamination.length})`);

// 7. Auditoria da categoria 'Costas, Bíceps e Trapézio' (PULL)
const pullMatches = allWorkouts.filter(w => matchesClassificationFilter(w, 'costas-biceps'));
assert(pullMatches.length === 3, `Filtro 'Costas, Bíceps e Trapézio' deve retornar exatamente 3 treinos de Pull puro (encontrado: ${pullMatches.length})`);
const expectedPullIds = ['w-sup-02', 'w-sup-07', 'w-sup-10'];
const actualPullIds = pullMatches.map(w => w.id).sort();
assert(
  JSON.stringify(actualPullIds) === JSON.stringify(expectedPullIds.sort()),
  `IDs de Pull devem ser exatamente [${expectedPullIds.join(', ')}]`
);

// 8. Distribuição equitativa por Coleção (6 x 12 = 72)
const categories = ['forca_40_plus', 'superiores', 'inferiores', 'full_body', 'cardiorespiratorio', 'mobilidade_equilibrio'];
let categorySum = 0;
categories.forEach(cat => {
  const count = allWorkouts.filter(w => w.category === cat).length;
  assert(count === 12, `Coleção '${cat}' deve conter exatamente 12 treinos (encontrado: ${count})`);
  categorySum += count;
});
assert(categorySum === 72, `A soma das coleções deve ser exatamente 72 (encontrado: ${categorySum})`);

// 9. Separação de Filtros Transversais (Níveis e Acesso)
const freeWorkouts = allWorkouts.filter(w => matchesClassificationFilter(w, 'gratis'));
const premiumWorkouts = allWorkouts.filter(w => matchesClassificationFilter(w, 'premium'));
assert(freeWorkouts.length === 12, `Devem existir exatamente 12 treinos gratuitos (encontrado: ${freeWorkouts.length})`);
assert(premiumWorkouts.length === 60, `Devem existir exatamente 60 treinos Premium (encontrado: ${premiumWorkouts.length})`);
assert(freeWorkouts.length + premiumWorkouts.length === 72, `A soma de Grátis + Premium deve ser 72`);

// 10. Relatório Global de Auditoria
const report = auditCatalogClassification();
assert(report.isValid === true, `auditCatalogClassification().isValid deve ser true`);
assert(report.crossContaminationPushViolations.length === 0, `Violações de contaminação cruzada devem ser 0`);
assert(report.workoutsWithZeroExercises.length === 0, `Treinos com 0 exercícios devem ser 0`);

console.log('====================================================');
console.log('🎉 TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
console.log('====================================================');

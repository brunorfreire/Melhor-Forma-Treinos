import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildExecutionSteps, validateExecutionGroups } from '../src/utils/workoutExecutionPlan';
import type { Exercise, WorkoutExecutionGroup, WorkoutSession } from '../src/types';

const exercise = (id: string, muscleGroup: string, sets = '3'): Exercise => ({
  id, name: id, muscleGroup, sets, reps: '12', rest: '60s'
});

const make = (exercises: Exercise[], groups: WorkoutExecutionGroup[] = []): WorkoutSession => ({
  id: 'sess-test', name: 'Teste', focus: 'Qualidade', exercises, executionGroups: groups
});

const group = (
  kind: WorkoutExecutionGroup['kind'], exerciseIds: string[], rounds: number,
  restBetweenExercisesSeconds: number, restBetweenRoundsSeconds: number
): WorkoutExecutionGroup => ({
  id: 'g1', kind, exerciseIds, rounds, restBetweenExercisesSeconds, restBetweenRoundsSeconds
});

test('ficha antiga: mantém sequência simples e intervalos entre séries', () => {
  const result = buildExecutionSteps(make([exercise('A', 'Peito'), exercise('B', 'Perna', '2')]));
  assert.equal(result.warnings.length, 0);
  assert.deepEqual(result.steps.map(x => x.exerciseId), ['A', 'A', 'A', 'B', 'B']);
  assert.deepEqual(result.steps.map(x => x.restAfterSeconds), [60, 60, 0, 60, 0]);
  assert.deepEqual(result.steps.map(x => x.isLastSetOfExercise), [false, false, true, false, true]);
});

test('combinado alterna peitoral e perna antes do descanso de rodada', () => {
  const plan = make([exercise('peito', 'Peito'), exercise('perna', 'Quadríceps')],
    [group('combinado', ['peito', 'perna'], 3, 0, 75)]);
  const result = buildExecutionSteps(plan);
  assert.deepEqual(result.steps.map(x => x.exerciseId),
    ['peito', 'perna', 'peito', 'perna', 'peito', 'perna']);
  assert.deepEqual(result.steps.map(x => x.restAfterSeconds), [0, 75, 0, 75, 0, 0]);
  assert.deepEqual(result.steps.map(x => x.roundNumber), [1,1,2,2,3,3]);
  assert.equal(result.steps[4].isLastSetOfExercise, true);
});

test('conjugado permite dois movimentos da mesma região', () => {
  const plan = make([exercise('supino', 'Peito', '2'), exercise('crucifixo', 'Peito', '2')],
    [group('conjugado', ['supino','crucifixo'], 2, 0, 90)]);
  const { steps } = buildExecutionSteps(plan);
  assert.deepEqual(steps.map(x => x.exerciseId), ['supino','crucifixo','supino','crucifixo']);
  assert.deepEqual(steps.map(x => x.restKind), ['entre_exercicios','entre_rodadas','entre_exercicios','nenhum']);
});

test('circuito de três movimentos e duas rodadas com 30s e 90s', () => {
  const plan = make([exercise('step','Perna','2'),exercise('flexao','Peito','2'),exercise('remada','Costas','2')],
    [group('circuitado',['step','flexao','remada'],2,30,90)]);
  const { steps, warnings } = buildExecutionSteps(plan);
  assert.equal(warnings.length,0);
  assert.deepEqual(steps.map(x => x.exerciseId), ['step','flexao','remada','step','flexao','remada']);
  assert.deepEqual(steps.map(x => x.restAfterSeconds), [30,30,90,30,30,0]);
});

test('bloco com séries diferentes não altera a prescrição, regride para modo simples', () => {
  const plan = make([exercise('A','Peito','3'),exercise('B','Perna','2')],
    [group('combinado',['A','B'],3,0,90)]);
  const { steps, warnings } = buildExecutionSteps(plan);
  assert.equal(warnings.length,1);
  assert.deepEqual(steps.map(x => x.exerciseId), ['A','A','A','B','B']);
  assert.equal(plan.exercises[1].sets,'2');
});

test('IDs não contíguos e exercícios em dois grupos são rejeitados sem apagar treinos', () => {
  const g1=group('circuitado',['A','C'],2,0,60);
  const g2={...g1,id:'g2',exerciseIds:['B','C']};
  const plan=make([exercise('A','Perna','2'),exercise('B','Costas','2'),exercise('C','Peito','2')],[g1,g2]);
  assert.equal(validateExecutionGroups(plan).warnings.length,1);
  assert.deepEqual(buildExecutionSteps(plan).steps.map(x=>x.exerciseId), ['A','A','B','C','B','C']);
});

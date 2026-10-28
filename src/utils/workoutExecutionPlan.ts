import { Exercise, WorkoutExecutionGroup, WorkoutSession } from '../types';

export type ExecutionStep = {
  key: string;
  exerciseId: string;
  exerciseIndex: number;
  setNumber: number;
  totalSets: number;
  groupId?: string;
  groupKind?: WorkoutExecutionGroup['kind'];
  roundNumber?: number;
  totalRounds?: number;
  groupExercisePosition?: number;
  groupExerciseCount?: number;
  restAfterSeconds: number;
  restKind: 'entre_series' | 'entre_exercicios' | 'entre_rodadas' | 'nenhum';
  isLastSetOfExercise: boolean;
};

export const methodLabels: Record<WorkoutExecutionGroup['kind'], string> = {
  combinado: 'Combinado • grupos diferentes',
  conjugado: 'Conjugado • mesmo grupamento',
  circuitado: 'Circuitado • sequência em rodadas'
};

export const getSets = (exercise: Exercise): number => {
  const count = Number(String(exercise.sets || '').match(/\d+/)?.[0] || 1);
  return Math.min(20, Math.max(1, count));
};

export const getRestSeconds = (rest: string): number => {
  const source = (rest || '').trim();
  const colon = source.match(/^(\d{1,2}):(\d{2})$/);
  if (colon) return Math.min(600, Number(colon[1]) * 60 + Number(colon[2]));
  const minutes = source.match(/(\d+(?:[,.]\d+)?)\s*(?:min|minuto)/i);
  const secondsSuffix = source.match(/(\d+)\s*(?:s|seg)/i);
  if (minutes) {
    const total = Number(minutes[1].replace(',', '.')) * 60 + Number(secondsSuffix?.[1] || 0);
    return Math.min(600, Math.max(0, Math.round(total)));
  }
  const count = Number(source.match(/\d+(?:[,.]\d+)?/)?.[0]?.replace(',', '.') || '60');
  return Math.min(600, Math.max(0, Math.round(count)));
};

const within = (v: number, min: number, max: number) =>
  Number.isInteger(v) && v >= min && v <= max;

export function validateExecutionGroups(session: WorkoutSession): {
  accepted: WorkoutExecutionGroup[];
  warnings: string[];
} {
  const all = session.executionGroups || [];
  const exercises = session.exercises || [];
  const byId = new Map(exercises.map((ex, i) => [ex.id, i]));
  const used = new Set<string>();
  const accepted: WorkoutExecutionGroup[] = [];
  const warnings: string[] = [];

  for (const group of all) {
    const title = group?.id || 'Grupo sem identificação';
    const ids = group?.exerciseIds;
    if (!group || !['combinado', 'conjugado', 'circuitado'].includes(group.kind) ||
        !Array.isArray(ids) || ids.length < (group.kind === 'circuitado' ? 3 : 2) ||
        new Set(ids).size !== ids.length ||
        ids.some(id => !byId.has(id) || used.has(id)) ||
        !within(group.rounds, 1, 20) ||
        !within(group.restBetweenExercisesSeconds, 0, 600) ||
        !within(group.restBetweenRoundsSeconds, 0, 600)) {
      warnings.push('Grupo ' + title + ' precisa ser revisado. A execução simples foi mantida para os exercícios desse grupo.');
      continue;
    }
    const indexes = ids.map(id => byId.get(id)!);
    if (indexes.some((index, i) => index !== indexes[0] + i) ||
        ids.some(id => getSets(exercises[byId.get(id)!]) !== group.rounds)) {
      warnings.push('Grupo ' + title + ': ordem não contígua ou séries diferentes das rodadas. Mantendo execução simples.');
      continue;
    }
    accepted.push(group);
    ids.forEach(id => used.add(id));
  }
  return { accepted, warnings };
}

export function buildExecutionSteps(session: WorkoutSession): {
  steps: ExecutionStep[];
  warnings: string[];
} {
  const { accepted, warnings } = validateExecutionGroups(session);
  const groupsByFirstExercise = new Map(accepted.map(group => [group.exerciseIds[0], group]));
  const steps: ExecutionStep[] = [];
  const exercises = session.exercises || [];

  for (let i = 0; i < exercises.length;) {
    const ex = exercises[i];
    const group = groupsByFirstExercise.get(ex.id);
    if (group) {
      for (let round = 1; round <= group.rounds; round++) {
        group.exerciseIds.forEach((exerciseId, groupIndex) => {
          const exerciseIndex = i + groupIndex;
          const lastWithinRound = groupIndex === group.exerciseIds.length - 1;
          const lastRound = round === group.rounds;
          const restKind = !lastWithinRound
            ? 'entre_exercicios'
            : !lastRound
              ? 'entre_rodadas'
              : 'nenhum';
          steps.push({
            key: group.id + ':' + round + ':' + exerciseId,
            exerciseId, exerciseIndex,
            setNumber: round,
            totalSets: group.rounds,
            groupId: group.id,
            groupKind: group.kind,
            roundNumber: round,
            totalRounds: group.rounds,
            groupExercisePosition: groupIndex + 1,
            groupExerciseCount: group.exerciseIds.length,
            restKind,
            restAfterSeconds: restKind === 'entre_exercicios'
              ? group.restBetweenExercisesSeconds
              : restKind === 'entre_rodadas'
                ? group.restBetweenRoundsSeconds
                : 0,
            isLastSetOfExercise: lastRound
          });
        });
      }
      i += group.exerciseIds.length;
    } else {
      const sets = getSets(ex);
      for (let set = 1; set <= sets; set++) {
        const last = set === sets;
        steps.push({
          key: 'simple:' + i + ':' + set,
          exerciseId: ex.id,
          exerciseIndex: i,
          setNumber: set,
          totalSets: sets,
          restKind: last ? 'nenhum' : 'entre_series',
          restAfterSeconds: last ? 0 : getRestSeconds(ex.rest),
          isLastSetOfExercise: last
        });
      }
      i++;
    }
  }
  return { steps, warnings };
}

import {
  Exercise,
  ExecutionMethodType,
  GuidedExecutionBlock,
  WorkoutSession
} from '../types';

export interface ExecutionMethodMetadata {
  id: ExecutionMethodType;
  label: string;
  shortLabel: string;
  minExercises: number;
  description: string;
  example: string;
  badgeClass: string;
  borderClass: string;
  accentTextClass: string;
}

export const EXECUTION_METHODS_META: Record<ExecutionMethodType, ExecutionMethodMetadata> = {
  simples: {
    id: 'simples',
    label: 'Simples (Tradicional)',
    shortLabel: 'Simples',
    minExercises: 1,
    description: 'Exercício A → descanso → próxima série do exercício A → próximo exercício.',
    example: 'Agachamento Goblet (Série 1 → Descanso → Série 2 → Próximo exercício)',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderClass: 'border-emerald-500/40',
    accentTextClass: 'text-emerald-400'
  },
  combinado: {
    id: 'combinado',
    label: 'Combinado (Músculos Diferentes)',
    shortLabel: 'Combinado',
    minExercises: 2,
    description: 'Dois ou mais exercícios de grupamentos musculares diferentes executados em sequência.',
    example: 'Supino → Agachamento → descanso → próxima rodada.',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    borderClass: 'border-cyan-500/40',
    accentTextClass: 'text-cyan-400'
  },
  conjugado: {
    id: 'conjugado',
    label: 'Conjugado (Mesmo Grupamento)',
    shortLabel: 'Conjugado',
    minExercises: 2,
    description: 'Dois ou mais exercícios para o mesmo grupamento muscular em sequência.',
    example: 'Supino com halteres → Crucifixo com halteres → descanso → próxima rodada.',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-500/40',
    accentTextClass: 'text-amber-400'
  },
  circuitado: {
    id: 'circuitado',
    label: 'Circuitado (3+ Exercícios)',
    shortLabel: 'Circuitado',
    minExercises: 3,
    description: 'Três ou mais exercícios em sequência com pouco ou nenhum descanso entre eles.',
    example: 'Agachamento → Remada → Flexão → Step-up → descanso de 90s → próxima rodada.',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    borderClass: 'border-purple-500/40',
    accentTextClass: 'text-purple-400'
  }
};

export interface BlockValidationWarning {
  blockId: string;
  blockName: string;
  message: string;
  severity: 'warning' | 'fallback';
}

export interface SessionBlockValidationResult {
  validBlocks: GuidedExecutionBlock[];
  warnings: BlockValidationWarning[];
  exerciseToBlockMap: Record<string, GuidedExecutionBlock>;
}

export interface GuidedStepNextPreview {
  exercise: Exercise;
  method: ExecutionMethodType;
  blockName?: string;
  currentSet: number;
  totalSets: number;
  currentRound?: number;
  totalRounds?: number;
  exerciseIndexInBlock?: number;
  totalExercisesInBlock?: number;
  transitionLabel: string;
}

export interface GuidedExecutionStep {
  stepId: string;
  stepIndex: number; // 0-based
  totalSteps: number;
  exercise: Exercise;
  exercisePositionInSession: number; // 1-based position in session.exercises
  totalExercisesInSession: number;
  method: ExecutionMethodType;
  blockId?: string;
  blockName?: string;
  blockExercises: Exercise[];
  exerciseIndexInBlock: number; // 1-based
  totalExercisesInBlock: number;
  // Series & Rounds
  currentSet: number; // 1-based
  totalSets: number;
  currentRound?: number; // 1-based (present for combinado, conjugado, circuitado, or explicit block)
  totalRounds?: number;
  // Rest configuration after completing this step
  restAfterSeconds: number;
  isRestBetweenRounds: boolean;
  isLastStepOfExercise: boolean;
  isLastStepOfWorkout: boolean;
  nextStepPreview?: GuidedStepNextPreview;
}

/**
 * Converte texto de descanso (ex: "60s", "90 seg", "0s", "1m30", "Sem descanso") em segundos numéricos.
 */
export function parseRestSeconds(restStr?: string | number | null, fallbackSeconds = 60): number {
  if (typeof restStr === 'number') {
    return Math.max(0, Math.round(restStr));
  }
  if (!restStr || typeof restStr !== 'string') {
    return fallbackSeconds;
  }
  const clean = restStr.trim().toLowerCase();
  if (!clean) return fallbackSeconds;

  if (
    clean === '0' ||
    clean === '0s' ||
    clean === '0 seg' ||
    clean.includes('sem descanso') ||
    clean.includes('direto') ||
    clean.includes('imediato')
  ) {
    return 0;
  }

  // Formato 1m30s ou 1min30
  const minSecMatch = clean.match(/(\d+)\s*(?:m|min|minuto|minutos)\s*(?:e\s*)?(\d+)?/);
  if (minSecMatch) {
    const mins = parseInt(minSecMatch[1], 10) || 0;
    const secs = minSecMatch[2] ? parseInt(minSecMatch[2], 10) || 0 : 0;
    return Math.max(0, mins * 60 + secs);
  }

  // Formato numérico em segundos (ex: "60s", "45 a 60s" -> pega o primeiro número ou maior)
  const numbers = clean.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    const val = parseInt(numbers[0], 10);
    if (!isNaN(val)) {
      // Se o número for muito pequeno (ex: "2" significando 2 min quando tem 'min'), já foi pego acima.
      return Math.max(0, val);
    }
  }

  return fallbackSeconds;
}

/**
 * Formata segundos para exibição amigável (ex: 0 -> "Sem descanso (0s)", 60 -> "60s", 90 -> "90s (1m30)")
 */
export function formatRestSecondsLabel(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s === 0) return '0s (Sem descanso)';
  if (s < 60) return `${s}s`;
  if (s % 60 === 0) return `${s}s (${s / 60} min)`;
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${s}s (${mins}m${rem.toString().padStart(2, '0')}s)`;
}

/**
 * Extrai a quantidade de séries prescrita sem modificar o texto original da ficha.
 */
export function parseSetsCount(setsStr?: string | number | null, fallbackSets = 3): number {
  if (typeof setsStr === 'number') {
    return Math.max(1, Math.min(20, Math.round(setsStr)));
  }
  if (!setsStr || typeof setsStr !== 'string') {
    return fallbackSets;
  }
  const matches = setsStr.match(/\d+/g);
  if (matches && matches.length > 0) {
    // Em casos como "3 a 4", considera o primeiro número prescrito (ex: 3) para não forçar séries extras sem confirmação
    const parsed = parseInt(matches[0], 10);
    if (!isNaN(parsed) && parsed > 0) {
      return Math.min(20, parsed);
    }
  }
  return fallbackSets;
}

/**
 * Valida os blocos de execução guiada configurados em uma sessão.
 * Caso haja alguma inconsistência (exercícios removidos, quantidade mínima insuficiente),
 * gera avisos claros e preserva a prescrição original funcionando como exercícios simples.
 */
export function validateSessionExecutionBlocks(session: WorkoutSession): SessionBlockValidationResult {
  const rawBlocks = session.executionBlocks || [];
  const warnings: BlockValidationWarning[] = [];
  const validBlocks: GuidedExecutionBlock[] = [];
  const exerciseToBlockMap: Record<string, GuidedExecutionBlock> = {};

  if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) {
    return { validBlocks, warnings, exerciseToBlockMap };
  }

  const sessionExercisesById = new Map<string, Exercise>();
  session.exercises.forEach((ex) => {
    sessionExercisesById.set(ex.id, ex);
  });

  const assignedExerciseIds = new Set<string>();

  rawBlocks.forEach((block, idx) => {
    const blockLabel = block.name?.trim() || `Bloco #${idx + 1} (${EXECUTION_METHODS_META[block.method]?.shortLabel || block.method})`;
    const rawIds = Array.isArray(block.exerciseIds) ? block.exerciseIds : [];

    // 1. Filtra exercícios que ainda existem na sessão e não estão duplicados
    const existingIds: string[] = [];
    rawIds.forEach((exId) => {
      if (!sessionExercisesById.has(exId)) {
        warnings.push({
          blockId: block.id,
          blockName: blockLabel,
          message: `${blockLabel}: Um exercício vinculado foi removido da ficha. Prescrição ajustada.`,
          severity: 'warning'
        });
        return;
      }
      if (assignedExerciseIds.has(exId)) {
        const exName = sessionExercisesById.get(exId)?.name || exId;
        warnings.push({
          blockId: block.id,
          blockName: blockLabel,
          message: `${blockLabel}: O exercício "${exName}" já pertence a outro bloco nesta sessão e foi ignorado neste bloco.`,
          severity: 'warning'
        });
        return;
      }
      existingIds.push(exId);
    });

    // 2. Verifica quantidade mínima de exercícios exigida pelo método
    const meta = EXECUTION_METHODS_META[block.method] || EXECUTION_METHODS_META.simples;
    if (existingIds.length < meta.minExercises) {
      warnings.push({
        blockId: block.id,
        blockName: blockLabel,
        message: `${blockLabel} (${meta.shortLabel}) requer pelo menos ${meta.minExercises} exercício(s), mas possui ${existingIds.length}. Os exercícios foram preservados no modo Simples original.`,
        severity: 'fallback'
      });
      return;
    }

    // 3. Avisos pedagógicos de grupamento muscular para Combinado e Conjugado (não bloqueiam, apenas orientam)
    const blockExercises = existingIds.map((id) => sessionExercisesById.get(id)!);
    const uniqueMuscles = new Set(
      blockExercises.map((e) => (e.muscleGroup || '').trim().toLowerCase()).filter(Boolean)
    );

    if (block.method === 'combinado' && uniqueMuscles.size === 1 && blockExercises.length >= 2) {
      warnings.push({
        blockId: block.id,
        blockName: blockLabel,
        message: `${blockLabel}: Configurado como Combinado, porém todos os exercícios são do mesmo grupamento (${blockExercises[0].muscleGroup}). Para mesmo músculo, recomenda-se o método Conjugado.`,
        severity: 'warning'
      });
    } else if (block.method === 'conjugado' && uniqueMuscles.size > 1 && blockExercises.length >= 2) {
      warnings.push({
        blockId: block.id,
        blockName: blockLabel,
        message: `${blockLabel}: Configurado como Conjugado, porém contém grupamentos musculares distintos (${Array.from(new Set(blockExercises.map(e => e.muscleGroup))).join(' + ')}). Para músculos diferentes, recomenda-se o método Combinado.`,
        severity: 'warning'
      });
    }

    const rawRestEx = Number(block.restBetweenExercisesSeconds);
    const rawRestRounds = Number(block.restBetweenRoundsSeconds);

    const sanitizedBlock: GuidedExecutionBlock = {
      ...block,
      exerciseIds: existingIds,
      rounds: Math.max(1, Math.min(20, Math.round(Number(block.rounds) || 3))),
      restBetweenExercisesSeconds: Number.isFinite(rawRestEx)
        ? Math.max(0, Math.round(rawRestEx))
        : 0,
      restBetweenRoundsSeconds: Number.isFinite(rawRestRounds)
        ? Math.max(0, Math.round(rawRestRounds))
        : 60
    };

    validBlocks.push(sanitizedBlock);
    existingIds.forEach((id) => {
      assignedExerciseIds.add(id);
      exerciseToBlockMap[id] = sanitizedBlock;
    });
  });

  return {
    validBlocks,
    warnings,
    exerciseToBlockMap
  };
}

/**
 * Compila a sessão de treino em uma fila sequencial de passos guiados (GuidedExecutionStep[]),
 * respeitando fielmente os métodos Simples, Combinado, Conjugado e Circuitado.
 */
export function compileGuidedSessionSteps(session: WorkoutSession): {
  steps: GuidedExecutionStep[];
  validation: SessionBlockValidationResult;
} {
  const validation = validateSessionExecutionBlocks(session);
  const { exerciseToBlockMap } = validation;

  const exercises = session.exercises || [];
  const totalExercisesInSession = exercises.length;

  const exercisePositionMap = new Map<string, number>();
  exercises.forEach((ex, i) => {
    exercisePositionMap.set(ex.id, i + 1);
  });

  const exerciseById = new Map<string, Exercise>();
  exercises.forEach((ex) => {
    exerciseById.set(ex.id, ex);
  });

  const processedExerciseIds = new Set<string>();
  const rawSteps: Omit<
    GuidedExecutionStep,
    'stepIndex' | 'totalSteps' | 'isLastStepOfWorkout' | 'nextStepPreview' | 'isLastStepOfExercise'
  >[] = [];

  for (const ex of exercises) {
    if (processedExerciseIds.has(ex.id)) continue;

    const block = exerciseToBlockMap[ex.id];

    // Caso 1: Exercício sem bloco ou bloco Simples de 1 exercício
    if (!block || (block.method === 'simples' && block.exerciseIds.length === 1)) {
      processedExerciseIds.add(ex.id);
      const totalSets = block ? block.rounds : parseSetsCount(ex.sets, 3);
      const restSeconds = block
        ? block.restBetweenRoundsSeconds
        : parseRestSeconds(ex.rest, 60);
      const pos = exercisePositionMap.get(ex.id) || 1;

      for (let setNum = 1; setNum <= totalSets; setNum++) {
        rawSteps.push({
          stepId: `step-${ex.id}-s${setNum}`,
          exercise: ex,
          exercisePositionInSession: pos,
          totalExercisesInSession,
          method: 'simples',
          blockId: block?.id,
          blockName: block?.name,
          blockExercises: [ex],
          exerciseIndexInBlock: 1,
          totalExercisesInBlock: 1,
          currentSet: setNum,
          totalSets,
          restAfterSeconds: restSeconds,
          isRestBetweenRounds: setNum === totalSets
        });
      }
    } else {
      // Caso 2: Bloco multi-exercício (Combinado, Conjugado, Circuitado ou Simples agrupado)
      const blockExercises = block.exerciseIds
        .map((id) => exerciseById.get(id))
        .filter((item): item is Exercise => !!item);

      blockExercises.forEach((bEx) => processedExerciseIds.add(bEx.id));

      const totalRounds = Math.max(1, block.rounds || 3);
      const totalInBlock = blockExercises.length;

      for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
        for (let bIdx = 0; bIdx < totalInBlock; bIdx++) {
          const bEx = blockExercises[bIdx];
          const isLastInRound = bIdx === totalInBlock - 1;
          const restAfter = isLastInRound
            ? block.restBetweenRoundsSeconds
            : block.restBetweenExercisesSeconds;
          const pos = exercisePositionMap.get(bEx.id) || 1;

          rawSteps.push({
            stepId: `step-${block.id}-r${roundNum}-e${bEx.id}`,
            exercise: bEx,
            exercisePositionInSession: pos,
            totalExercisesInSession,
            method: block.method,
            blockId: block.id,
            blockName:
              block.name?.trim() ||
              `${EXECUTION_METHODS_META[block.method].shortLabel} (${totalInBlock} exercícios)`,
            blockExercises,
            exerciseIndexInBlock: bIdx + 1,
            totalExercisesInBlock: totalInBlock,
            currentSet: roundNum,
            totalSets: totalRounds,
            currentRound: roundNum,
            totalRounds,
            restAfterSeconds: restAfter,
            isRestBetweenRounds: isLastInRound
          });
        }
      }
    }
  }

  // Identifica o último passo de cada exercício para marcar conclusão automática do exercício
  const lastStepIndexByExerciseId = new Map<string, number>();
  rawSteps.forEach((s, idx) => {
    lastStepIndexByExerciseId.set(s.exercise.id, idx);
  });

  const totalSteps = rawSteps.length;
  const steps: GuidedExecutionStep[] = rawSteps.map((s, idx) => {
    const isLastStepOfWorkout = idx === totalSteps - 1;
    const isLastStepOfExercise = lastStepIndexByExerciseId.get(s.exercise.id) === idx;

    let nextStepPreview: GuidedStepNextPreview | undefined;
    if (!isLastStepOfWorkout) {
      const next = rawSteps[idx + 1];
      let transitionLabel = 'Próximo exercício';

      if (next.exercise.id === s.exercise.id) {
        transitionLabel = `Série ${next.currentSet} de ${next.totalSets} do mesmo exercício`;
      } else if (next.blockId && next.blockId === s.blockId) {
        if (next.currentRound === s.currentRound) {
          transitionLabel = `Sequência do ${EXECUTION_METHODS_META[next.method].shortLabel} (${next.exerciseIndexInBlock}/${next.totalExercisesInBlock} da Rodada ${next.currentRound})`;
        } else {
          transitionLabel = `Início da Rodada ${next.currentRound} de ${next.totalRounds} (${EXECUTION_METHODS_META[next.method].shortLabel})`;
        }
      } else if (next.method !== 'simples') {
        transitionLabel = `Novo bloco ${EXECUTION_METHODS_META[next.method].shortLabel} (Rodada 1 de ${next.totalRounds})`;
      } else {
        transitionLabel = `Novo exercício (${next.exercisePositionInSession} de ${totalExercisesInSession})`;
      }

      nextStepPreview = {
        exercise: next.exercise,
        method: next.method,
        blockName: next.blockName,
        currentSet: next.currentSet,
        totalSets: next.totalSets,
        currentRound: next.currentRound,
        totalRounds: next.totalRounds,
        exerciseIndexInBlock: next.exerciseIndexInBlock,
        totalExercisesInBlock: next.totalExercisesInBlock,
        transitionLabel
      };
    }

    return {
      ...s,
      stepIndex: idx,
      totalSteps,
      isLastStepOfExercise,
      isLastStepOfWorkout,
      nextStepPreview
    };
  });

  return {
    steps,
    validation
  };
}

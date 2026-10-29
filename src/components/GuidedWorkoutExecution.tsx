import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Maximize2,
  AlertTriangle,
  Sparkles,
  Dumbbell,
  BookOpen,
  ShieldAlert,
  Trophy,
  ArrowRight,
  ListChecks,
  Layers,
  Send,
  SkipForward,
  SlidersHorizontal
} from 'lucide-react';
import { Exercise, WorkoutSession } from '../types';
import {
  compileGuidedSessionSteps,
  EXECUTION_METHODS_META,
  formatRestSecondsLabel,
  GuidedExecutionStep
} from '../utils/guidedExecutionEngine';
import { resolveExerciseMedia } from '../utils/exerciseMedia';
import { resolveIndexedDbMediaUrl } from '../utils/mediaStorageService';
import { buildYouTubeEmbedUrl } from '../utils/youtube';
import { playTimerCompletionSound } from '../utils/audio';

/**
 * Máquina de estados oficial da Execução Guiada:
 * - 'ready'      : ESTADO 1 — Aguardando início da série
 * - 'performing' : ESTADO 2 — Série em execução
 * - 'resting'    : ESTADO 3 — Descanso em andamento na mesma ExecutionActionArea (card já exibe upcomingStep)
 * - 'ready_next' : ESTADO 4 — Descanso concluído (ou descanso 0s), aguardando confirmação explícita do aluno para iniciar upcomingStep
 * - 'finished'   : ESTADO 5 — Todas as séries/blocos concluídos, pronto para finalizar treino
 */
export type GuidedStepPhase = 'ready' | 'performing' | 'resting' | 'ready_next' | 'finished';

export interface GuidedSessionRestState {
  totalSeconds: number;
  remainingMs: number;
  endTimeMs: number | null;
  isRunning: boolean;
  /** Tempo originalmente prescrito pelo treinador para a transição atual (preservado mesmo após ajustes do aluno) */
  prescribedSeconds?: number;
  /** Dados do passo recém-concluído (completedStep) para exibição clara durante a preparação do próximo movimento */
  completedStepId?: string;
  completedExerciseName?: string;
  completedSetNumber?: number;
  completedTotalSets?: number;
  isRestBetweenRounds?: boolean;
  transitionType?: 'same_exercise' | 'next_exercise';
}

const REST_PRESET_OPTIONS = [
  { label: '01:00', seconds: 60 },
  { label: '01:30', seconds: 90 },
  { label: '02:00', seconds: 120 }
] as const;

interface GuidedWorkoutExecutionProps {
  session: WorkoutSession;
  completedExerciseIds: Record<string, boolean>;
  onMarkExerciseComplete: (exerciseId: string, completed: boolean) => void;
  completedStepIds: Record<string, boolean>;
  onUpdateCompletedSteps: (updated: Record<string, boolean>) => void;
  currentStepIndex: number;
  onChangeStepIndex: (index: number) => void;
  stepPhase: GuidedStepPhase;
  onChangeStepPhase: (phase: GuidedStepPhase) => void;
  restState: GuidedSessionRestState;
  onChangeRestState: (nextRest: GuidedSessionRestState) => void;
  onPreviewExercise: (ex: Exercise) => void;
  onFinishWorkout: (notifyWhatsApp?: boolean) => void;
  onSwitchToOverview: () => void;
  isCompleting?: boolean;
  isDemoSession?: boolean;
  exerciseContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export const GuidedWorkoutExecution: React.FC<GuidedWorkoutExecutionProps> = ({
  session,
  onMarkExerciseComplete,
  completedStepIds,
  onUpdateCompletedSteps,
  currentStepIndex,
  onChangeStepIndex,
  stepPhase,
  onChangeStepPhase,
  restState,
  onChangeRestState,
  onPreviewExercise,
  onFinishWorkout,
  onSwitchToOverview,
  isCompleting = false,
  isDemoSession = false,
  exerciseContainerRef
}) => {
  const { steps, validation } = useMemo(() => compileGuidedSessionSteps(session), [session]);

  const safeStepIndex = Math.max(0, Math.min(steps.length - 1, currentStepIndex));
  const currentStep: GuidedExecutionStep | undefined = steps[safeStepIndex];

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  // Controle de entrada manual de tempo de descanso (MM:SS) sem alterar a prescrição da ficha
  const [showCustomTimeInput, setShowCustomTimeInput] = useState<boolean>(false);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('1');
  const [customSecondsInput, setCustomSecondsInput] = useState<string>('30');
  const [customTimeFeedback, setCustomTimeFeedback] = useState<string | null>(null);

  // Trava síncrona contra repetição rápida de cliques ao concluir série ou avançar etapa
  const actionLockRef = useRef<string | null>(null);

  // Estado para mídia inline (suporte a indexeddb://, fallback e YouTube)
  const [useFallbackMedia, setUseFallbackMedia] = useState(false);
  const [mediaLoadFailed, setMediaLoadFailed] = useState(false);
  const [showYoutubeInline, setShowYoutubeInline] = useState(false);
  const [resolvedPrimaryUrl, setResolvedPrimaryUrl] = useState<string | null>(null);
  const [resolvedFallbackUrl, setResolvedFallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    setUseFallbackMedia(false);
    setMediaLoadFailed(false);
    setShowYoutubeInline(false);
    actionLockRef.current = null;
  }, [currentStep?.stepId, stepPhase]);

  useEffect(() => {
    if (stepPhase !== 'resting') {
      setShowCustomTimeInput(false);
      setCustomTimeFeedback(null);
    }
  }, [stepPhase]);

  const media = useMemo(() => {
    return currentStep ? resolveExerciseMedia(currentStep.exercise) : null;
  }, [currentStep]);

  useEffect(() => {
    let isMounted = true;
    if (!media) return;

    if (media.primaryUrl && media.primaryUrl.startsWith('indexeddb://')) {
      resolveIndexedDbMediaUrl(media.primaryUrl).then((url) => {
        if (isMounted) setResolvedPrimaryUrl(url);
      });
    } else {
      setResolvedPrimaryUrl(media.primaryUrl);
    }

    if (media.fallbackUrl && media.fallbackUrl.startsWith('indexeddb://')) {
      resolveIndexedDbMediaUrl(media.fallbackUrl).then((url) => {
        if (isMounted) setResolvedFallbackUrl(url);
      });
    } else {
      setResolvedFallbackUrl(media.fallbackUrl);
    }

    return () => {
      isMounted = false;
    };
  }, [media?.primaryUrl, media?.fallbackUrl]);

  // Sincronização de contagem regressiva baseada em timestamp real (Date.now())
  // Evita deriva ou pausa indevida ao bloquear a tela do celular ou alternar de aba
  const syncRestWithClock = useCallback(() => {
    if (stepPhase !== 'resting' || !restState.isRunning || restState.endTimeMs === null) {
      return;
    }

    const now = Date.now();
    const msLeft = Math.max(0, restState.endTimeMs - now);

    if (msLeft <= 0) {
      if (soundEnabled) {
        playTimerCompletionSound();
      }
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([120, 60, 120]);
        }
      } catch {}

      onChangeRestState({
        ...restState,
        remainingMs: 0,
        endTimeMs: null,
        isRunning: false
      });
      // Transiciona para ESTADO 4 (Descanso finalizado) sem iniciar a próxima série automaticamente
      onChangeStepPhase('ready_next');
    } else {
      onChangeRestState({
        ...restState,
        remainingMs: msLeft
      });
    }
  }, [stepPhase, restState, soundEnabled, onChangeRestState, onChangeStepPhase]);

  useEffect(() => {
    if (stepPhase !== 'resting' || !restState.isRunning || restState.endTimeMs === null) {
      return;
    }

    // Verifica imediatamente e a cada 250ms usando timestamp real
    syncRestWithClock();
    const intervalId = window.setInterval(syncRestWithClock, 250);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        syncRestWithClock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [stepPhase, restState.isRunning, restState.endTimeMs, syncRestWithClock]);

  if (!currentStep || !media) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        Nenhum exercício disponível para execução guiada nesta sessão.
      </div>
    );
  }

  const methodMeta = EXECUTION_METHODS_META[currentStep.method] || EXECUTION_METHODS_META.simples;
  const completedStepsCount = steps.filter((s) => !!completedStepIds[s.stepId]).length;
  const overallProgressPercent =
    steps.length > 0 ? Math.round((completedStepsCount / steps.length) * 100) : 0;

  const restRemainingSeconds = Math.max(0, Math.ceil(restState.remainingMs / 1000));

  const formatClock = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ESTADO 1 -> ESTADO 2: Começar Série
  const handleStartSet = () => {
    const lockKey = `start-${currentStep.stepId}`;
    if (actionLockRef.current === lockKey) return;
    actionLockRef.current = lockKey;
    onChangeStepPhase('performing');
  };

  // ESTADO 2 -> Concluir Série:
  // 1. Registra completedStep uma única vez.
  // 2. Identifica upcomingStep na sequência (simples, combinado, conjugado ou circuitado).
  // 3. Se não houver próximo passo, encerra imediatamente em 'finished' sem descanso desnecessário.
  // 4. Se houver upcomingStep, atualiza imediatamente o card principal para exibir upcomingStep
  //    e inicia currentRest com o tempo prescrito da transição (completedStep.restAfterSeconds).
  const handleCompleteSet = () => {
    const completedStep = currentStep;
    const lockKey = `complete-${completedStep.stepId}`;
    if (actionLockRef.current === lockKey) return;
    actionLockRef.current = lockKey;

    // 1. Registra a conclusão da série (completedStep) uma única vez
    if (!completedStepIds[completedStep.stepId]) {
      const nextCompletedSteps = {
        ...completedStepIds,
        [completedStep.stepId]: true
      };
      onUpdateCompletedSteps(nextCompletedSteps);

      // Marca o exercício como concluído somente quando todos os passos daquele exercício forem concluídos
      const allStepsForExercise = steps.filter((s) => s.exercise.id === completedStep.exercise.id);
      const isExerciseFullyCompleted = allStepsForExercise.every(
        (s) => s.stepId === completedStep.stepId || !!nextCompletedSteps[s.stepId]
      );
      if (isExerciseFullyCompleted || completedStep.isLastStepOfExercise) {
        onMarkExerciseComplete(completedStep.exercise.id, true);
      }
    }

    // 2. Identifica upcomingStep
    const upcomingStepIndex = safeStepIndex + 1;
    const upcomingStep: GuidedExecutionStep | undefined =
      upcomingStepIndex < steps.length ? steps[upcomingStepIndex] : undefined;

    // 3. Se era a última série do último exercício do treino -> ESTADO 5 (finished) sem descanso desnecessário
    if (completedStep.isLastStepOfWorkout || !upcomingStep) {
      onChangeRestState({
        totalSeconds: 0,
        remainingMs: 0,
        endTimeMs: null,
        isRunning: false,
        prescribedSeconds: 0,
        completedStepId: completedStep.stepId,
        completedExerciseName: completedStep.exercise.name,
        completedSetNumber: completedStep.currentSet,
        completedTotalSets: completedStep.totalSets
      });
      onChangeStepPhase('finished');
      return;
    }

    // 4. Prepara automaticamente upcomingStep no card principal durante o descanso!
    const transitionType: 'same_exercise' | 'next_exercise' =
      upcomingStep.exercise.id === completedStep.exercise.id ? 'same_exercise' : 'next_exercise';
    const prescribedRest = Math.max(0, completedStep.restAfterSeconds);

    onChangeStepIndex(upcomingStepIndex);

    // Respeita rigorosamente o descanso prescrito da transição (incluindo 0s em Combinados/Conjugados)
    if (prescribedRest === 0) {
      onChangeRestState({
        totalSeconds: 0,
        remainingMs: 0,
        endTimeMs: null,
        isRunning: false,
        prescribedSeconds: 0,
        completedStepId: completedStep.stepId,
        completedExerciseName: completedStep.exercise.name,
        completedSetNumber: completedStep.currentSet,
        completedTotalSets: completedStep.totalSets,
        isRestBetweenRounds: completedStep.isRestBetweenRounds,
        transitionType
      });
      onChangeStepPhase('ready_next');
      return;
    }

    const durationMs = prescribedRest * 1000;
    onChangeRestState({
      totalSeconds: prescribedRest,
      remainingMs: durationMs,
      endTimeMs: Date.now() + durationMs,
      isRunning: true,
      prescribedSeconds: prescribedRest,
      completedStepId: completedStep.stepId,
      completedExerciseName: completedStep.exercise.name,
      completedSetNumber: completedStep.currentSet,
      completedTotalSets: completedStep.totalSets,
      isRestBetweenRounds: completedStep.isRestBetweenRounds,
      transitionType
    });
    onChangeStepPhase('resting');
  };

  // Pausar / Continuar descanso com preservação exata por timestamp (Date.now())
  const handleTogglePauseRest = () => {
    if (restState.isRunning && restState.endTimeMs !== null) {
      const msLeft = Math.max(0, restState.endTimeMs - Date.now());
      onChangeRestState({
        ...restState,
        remainingMs: msLeft,
        endTimeMs: null,
        isRunning: false
      });
    } else {
      const msToResume = Math.max(1000, restState.remainingMs);
      onChangeRestState({
        ...restState,
        remainingMs: msToResume,
        endTimeMs: Date.now() + msToResume,
        isRunning: true
      });
    }
  };

  // Selecionar preset de descanso (01:00, 01:30, 02:00) para o descanso atual sem alterar a ficha
  const handleSelectPresetRest = (presetSeconds: number) => {
    const safeSeconds = Math.max(5, Math.min(900, presetSeconds));
    const durationMs = safeSeconds * 1000;
    setCustomTimeFeedback(null);
    onChangeRestState({
      ...restState,
      totalSeconds: safeSeconds,
      remainingMs: durationMs,
      endTimeMs: Date.now() + durationMs,
      isRunning: true
    });
  };

  // Ajustar tempo restante do descanso ativo (-15s, +15s, +30s) sem permitir valor negativo
  const handleAdjustRestSeconds = (deltaSeconds: number) => {
    const deltaMs = deltaSeconds * 1000;
    const currentMs =
      restState.isRunning && restState.endTimeMs !== null
        ? Math.max(0, restState.endTimeMs - Date.now())
        : restState.remainingMs;

    const nextMs = Math.max(0, currentMs + deltaMs);
    if (nextMs <= 0) {
      onChangeRestState({
        ...restState,
        remainingMs: 0,
        endTimeMs: null,
        isRunning: false
      });
      onChangeStepPhase('ready_next');
      return;
    }

    const nextTotalSeconds = Math.max(restState.totalSeconds, Math.ceil(nextMs / 1000));
    onChangeRestState({
      ...restState,
      totalSeconds: nextTotalSeconds,
      remainingMs: nextMs,
      endTimeMs: restState.isRunning ? Date.now() + nextMs : null,
      isRunning: restState.isRunning
    });
  };

  // Definir tempo manual personalizado (MM:SS) para o descanso atual dentro de limites seguros (5s a 15min)
  const handleApplyCustomRestTime = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const mins = Math.max(0, Math.min(15, parseInt(customMinutesInput || '0', 10) || 0));
    const secs = Math.max(0, Math.min(59, parseInt(customSecondsInput || '0', 10) || 0));
    const totalCustomSeconds = mins * 60 + secs;

    if (totalCustomSeconds <= 0) {
      setCustomTimeFeedback('Informe um tempo acima de 00:05.');
      return;
    }

    const clampedSeconds = Math.max(5, Math.min(900, totalCustomSeconds));
    const durationMs = clampedSeconds * 1000;
    setCustomTimeFeedback(null);
    setShowCustomTimeInput(false);

    onChangeRestState({
      ...restState,
      totalSeconds: clampedSeconds,
      remainingMs: durationMs,
      endTimeMs: Date.now() + durationMs,
      isRunning: true
    });
  };

  // Pular descanso -> Vai imediatamente para ESTADO 4 (ready_next) sem iniciar série automaticamente
  const handleSkipRest = () => {
    onChangeRestState({
      ...restState,
      remainingMs: 0,
      endTimeMs: null,
      isRunning: false
    });
    onChangeStepPhase('ready_next');
  };

  // ESTADO 4 -> Inicia a execução de upcomingStep (já exibido no card) mediante confirmação explícita do aluno
  const handleConfirmNextMovement = () => {
    const lockKey = `next-${currentStep.stepId}`;
    if (actionLockRef.current === lockKey) return;
    actionLockRef.current = lockKey;

    onChangeRestState({
      totalSeconds: 0,
      remainingMs: 0,
      endTimeMs: null,
      isRunning: false
    });

    // Como o card já foi preparado para upcomingStep ao concluir a série anterior,
    // a confirmação do aluno inicia diretamente a execução ('performing') deste passo.
    onChangeStepPhase('performing');
  };

  // Navegação manual entre passos
  const handleJumpToStep = (targetIdx: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, targetIdx));
    onChangeRestState({
      totalSeconds: 0,
      remainingMs: 0,
      endTimeMs: null,
      isRunning: false
    });
    onChangeStepIndex(clamped);
    onChangeStepPhase('ready');
  };

  const restProgressPercent =
    restState.totalSeconds > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              ((restState.totalSeconds * 1000 - restState.remainingMs) /
                (restState.totalSeconds * 1000)) *
                100
            )
          )
        )
      : 100;

  const activeMediaUrl = useFallbackMedia
    ? resolvedFallbackUrl || media.fallbackUrl || resolvedPrimaryUrl || media.primaryUrl
    : resolvedPrimaryUrl || media.primaryUrl;

  const handleMediaError = () => {
    if (!useFallbackMedia && media.fallbackUrl) {
      setUseFallbackMedia(true);
    } else {
      setMediaLoadFailed(true);
    }
  };

  const inlineYoutubeEmbedUrl = currentStep.exercise.youtubeId
    ? buildYouTubeEmbedUrl(currentStep.exercise.youtubeId, true)
    : media.embedUrl;

  const isSameExerciseTransition = restState.transitionType === 'same_exercise';
  const activeTransitionPrescribedSeconds =
    typeof restState.prescribedSeconds === 'number'
      ? restState.prescribedSeconds
      : currentStep.restAfterSeconds;
  const activeTransitionIsRoundRest =
    typeof restState.isRestBetweenRounds === 'boolean'
      ? restState.isRestBetweenRounds
      : currentStep.isRestBetweenRounds;

  return (
    <div className="w-full min-w-0 space-y-3.5 animate-fadeIn">
      {/* Avisos de validação de blocos (se houver inconsistência na ficha) */}
      {validation.warnings.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Aviso de Prescrição (Ficha Preservada)</span>
          </div>
          <ul className="text-[11px] text-amber-200/90 space-y-1 pl-5 list-disc">
            {validation.warnings.map((w, idx) => (
              <li key={`${w.blockId}-${idx}`}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Barra Superior de Progresso Guiado e Indicadores */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${methodMeta.badgeClass}`}
            >
              Método {methodMeta.shortLabel}
            </span>
            {currentStep.blockName && (
              <span className="text-[11px] font-semibold text-slate-300 truncate max-w-[180px] sm:max-w-[240px]">
                {currentStep.blockName}
              </span>
            )}
          </div>

          <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
            Passo {safeStepIndex + 1}/{steps.length} ({overallProgressPercent}%)
          </span>
        </div>

        {/* Barra de progresso global dos passos */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${overallProgressPercent}%` }}
          />
        </div>

        {/* Contadores Obrigatórios: Exercício X/Y • Série X/Y • Rodada X/Y */}
        <div className="grid grid-cols-3 gap-1.5 pt-0.5 text-center">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl py-1.5 px-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
              Exercício
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              {currentStep.exercisePositionInSession}{' '}
              <span className="text-slate-400 font-normal">
                de {currentStep.totalExercisesInSession}
              </span>
            </span>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl py-1.5 px-2">
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 block font-semibold">
              Série Atual
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-300">
              {currentStep.currentSet}{' '}
              <span className="text-emerald-400/70 font-normal">
                de {currentStep.totalSets}
              </span>
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl py-1.5 px-2">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
              {currentStep.currentRound ? 'Rodada' : 'No Bloco'}
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              {currentStep.currentRound ? (
                <>
                  {currentStep.currentRound}{' '}
                  <span className="text-slate-400 font-normal">
                    de {currentStep.totalRounds}
                  </span>
                </>
              ) : (
                <>
                  {currentStep.exerciseIndexInBlock}{' '}
                  <span className="text-slate-400 font-normal">
                    de {currentStep.totalExercisesInBlock}
                  </span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Faixa de sequência do Bloco (quando Combinado, Conjugado ou Circuitado) */}
        {currentStep.totalExercisesInBlock > 1 && (
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                Sequência da Rodada {currentStep.currentRound}/{currentStep.totalRounds}:
              </span>
              <span className={methodMeta.accentTextClass}>
                Estação {currentStep.exerciseIndexInBlock} de {currentStep.totalExercisesInBlock}
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {currentStep.blockExercises.map((bEx, idx) => {
                const isCurrentStation = idx + 1 === currentStep.exerciseIndexInBlock;
                return (
                  <React.Fragment key={`${bEx.id}-${idx}`}>
                    <div
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 border transition ${
                        isCurrentStation
                          ? `${methodMeta.badgeClass} shadow-sm`
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {idx + 1}. {bEx.name}
                    </div>
                    {idx < currentStep.blockExercises.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* CARD DO EXERCÍCIO ATUAL + EXECUTION ACTION AREA ESTÁVEL             */}
      {/* =================================================================== */}
      <div
        ref={exerciseContainerRef}
        data-testid="guided-exercise-card"
        className={`scroll-mt-20 sm:scroll-mt-24 bg-slate-900/95 border rounded-2xl p-3.5 sm:p-4 space-y-3.5 shadow-xl transition ${
          stepPhase === 'performing'
            ? 'border-emerald-500/60 ring-1 ring-emerald-500/20'
            : stepPhase === 'resting' || stepPhase === 'ready_next'
            ? 'border-teal-500/50 ring-1 ring-teal-500/20'
            : 'border-slate-800'
        }`}
      >
        {/* Banner de Preparação Automática durante Descanso ou Pós-Descanso */}
        {(stepPhase === 'resting' || stepPhase === 'ready_next') && (
          <div
            data-testid="upcoming-step-prepared-banner"
            className="bg-teal-950/40 border border-teal-500/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
              <span className="font-bold text-teal-200 truncate">
                {isSameExerciseTransition
                  ? `Próxima série já preparada na tela (Série ${currentStep.currentSet} de ${currentStep.totalSets})`
                  : `Próximo exercício já preparado na tela`}
              </span>
            </div>
            {restState.completedExerciseName && (
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0 truncate max-w-[160px]">
                ✓ {restState.completedExerciseName} ({restState.completedSetNumber}/{restState.completedTotalSets})
              </span>
            )}
          </div>
        )}

        {/* Cabeçalho do Exercício Exibido no Card */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md">
                Exercício #{currentStep.exercisePositionInSession}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                {currentStep.exercise.muscleGroup}
              </span>
              {completedStepIds[currentStep.stepId] && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Série Concluída ✓
                </span>
              )}
            </div>
            <h3
              data-testid="guided-card-exercise-name"
              className="text-base sm:text-lg font-black text-white mt-1 leading-snug break-words"
            >
              {currentStep.exercise.name}
            </h3>
          </div>

          {media.hasVideo && (
            <button
              type="button"
              onClick={() => onPreviewExercise(currentStep.exercise)}
              className="min-h-[44px] px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shrink-0 transition"
              title="Expandir demonstração em tela cheia"
            >
              <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xs:inline">Tela cheia</span>
            </button>
          )}
        </div>

        {/* Demonstração Visual Integrada (WebP/GIF, MP4 ou YouTube/Vimeo) */}
        <div className="relative w-full aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {showYoutubeInline && inlineYoutubeEmbedUrl ? (
            <iframe
              src={inlineYoutubeEmbedUrl}
              title={currentStep.exercise.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (media.mediaType === 'image' || useFallbackMedia) && activeMediaUrl && !mediaLoadFailed ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
              <img
                src={activeMediaUrl}
                alt={`Execução de ${currentStep.exercise.name}`}
                className="w-full h-full object-contain"
                onError={handleMediaError}
              />
              <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 border border-emerald-500/30 text-[10px] font-semibold text-emerald-300">
                Demonstração em loop contínuo
              </span>
              {inlineYoutubeEmbedUrl && (
                <button
                  type="button"
                  onClick={() => setShowYoutubeInline(true)}
                  className="absolute bottom-2 right-2.5 min-h-[38px] px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 transition"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-current" />
                  <span>Vídeo c/ Áudio</span>
                </button>
              )}
            </div>
          ) : media.mediaType === 'video' && activeMediaUrl && !mediaLoadFailed ? (
            <video
              src={activeMediaUrl}
              poster={media.thumbnailUrl || undefined}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain bg-black"
              onError={handleMediaError}
            />
          ) : (media.mediaType === 'youtube' || media.mediaType === 'vimeo') && media.embedUrl ? (
            <iframe
              src={media.embedUrl}
              title={currentStep.exercise.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <div className="p-4 text-center space-y-1.5">
              <Dumbbell className="w-8 h-8 text-emerald-400/60 mx-auto" />
              <p className="text-xs font-bold text-slate-300">
                Siga as orientações técnicas abaixo para executar com segurança.
              </p>
            </div>
          )}
        </div>

        {/* Grade Principal de Prescrição (Série, Repetições, Carga, Descanso) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              Série Atual
            </span>
            <span
              data-testid="guided-card-set-counter"
              className="text-sm sm:text-base font-black text-white mt-0.5 block"
            >
              {currentStep.currentSet} de {currentStep.totalSets}
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Repetições
            </span>
            <span
              data-testid="guided-card-reps"
              className="text-sm sm:text-base font-black text-white mt-0.5 block truncate"
              title={currentStep.exercise.reps}
            >
              {currentStep.exercise.reps || '10 a 12'}
            </span>
          </div>

          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
              Carga Prescrita
            </span>
            <span
              data-testid="guided-card-weight"
              className="text-sm sm:text-base font-black text-amber-300 mt-0.5 block truncate"
              title={currentStep.exercise.weight || 'Ajustar carga'}
            >
              {currentStep.exercise.weight || 'Peso livre'}
            </span>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Descanso Após
            </span>
            <span className="text-sm sm:text-base font-black text-emerald-400 mt-0.5 block truncate">
              {formatRestSecondsLabel(currentStep.restAfterSeconds)}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* EXECUTION ACTION AREA (REGIÃO CONTEXTUAL ESTÁVEL NO MESMO LOCAL)  */}
        {/* ================================================================= */}
        <section
          aria-live="polite"
          aria-label="Área de controle da série e descanso"
          data-testid="execution-action-area"
          className="rounded-2xl border border-slate-800/90 bg-slate-950/85 p-3 sm:p-3.5 space-y-3 transition-all"
        >
          {/* ESTADO 1: Aguardando série (ready) */}
          {stepPhase === 'ready' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-xs px-0.5">
                <span className="text-slate-300 font-medium">
                  Posicione-se com a carga prescrita e toque para iniciar:
                </span>
                <span className="text-[10px] font-bold uppercase text-emerald-400 shrink-0">
                  Pronto
                </span>
              </div>

              <button
                type="button"
                onClick={handleStartSet}
                className="w-full min-h-[54px] py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950"
              >
                <Play className="w-5 h-5 fill-current shrink-0" />
                <span>
                  Começar Série {currentStep.currentSet} de {currentStep.totalSets}
                </span>
              </button>
            </div>
          )}

          {/* ESTADO 2: Série em execução (performing) */}
          {stepPhase === 'performing' && (
            <div className="space-y-2.5">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <span className="text-emerald-200 font-semibold flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="truncate">
                    Em execução: {currentStep.exercise.reps}{' '}
                    {currentStep.exercise.weight ? `(${currentStep.exercise.weight})` : ''}
                  </span>
                </span>
                <span className="text-[10px] font-black uppercase text-emerald-300 shrink-0">
                  Série {currentStep.currentSet}/{currentStep.totalSets}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCompleteSet}
                className="w-full min-h-[54px] py-3.5 px-4 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 active:scale-98 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Concluir Série {currentStep.currentSet} de {currentStep.totalSets}
                </span>
              </button>
            </div>
          )}

          {/* ESTADO 3: Descanso ativo no mesmo local (resting) */}
          {stepPhase === 'resting' && (
            <div className="space-y-3 animate-fadeIn">
              {/* Topo do painel de descanso */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Clock
                      className={`w-4 h-4 ${restState.isRunning ? 'animate-spin' : ''}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block truncate">
                      {activeTransitionIsRoundRest
                        ? 'Descanso Entre Séries / Rodadas'
                        : 'Descanso Entre Exercícios'}
                    </span>
                    <span className="text-[11px] text-slate-300 block truncate">
                      Prescrito na ficha: {formatRestSecondsLabel(activeTransitionPrescribedSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const nextOpen = !showCustomTimeInput;
                      setShowCustomTimeInput(nextOpen);
                      setCustomTimeFeedback(null);
                      if (nextOpen) {
                        const m = Math.floor(restRemainingSeconds / 60);
                        const s = restRemainingSeconds % 60;
                        setCustomMinutesInput(String(m));
                        setCustomSecondsInput(String(s).padStart(2, '0'));
                      }
                    }}
                    className={`min-h-[44px] px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition ${
                      showCustomTimeInput
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                    }`}
                    title="Definir outro tempo manual (MM:SS) para este descanso"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Definir MM:SS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="min-h-[44px] min-w-[44px] p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-center shrink-0 transition"
                    title={soundEnabled ? 'Silenciar alerta sonoro' : 'Ativar alerta sonoro'}
                    aria-label="Alternar som do cronômetro"
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Contagem regressiva grande e legível + Barra de Progresso */}
              <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-3 text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Descanso • Tempo Restante
                </span>
                <div
                  data-testid="rest-timer-countdown"
                  className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-white"
                >
                  {formatClock(restRemainingSeconds)}
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-200"
                    style={{ width: `${restProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Tempos Pré-definidos Obrigatórios: 01:00, 01:30, 02:00 */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-0.5">
                  Tempos Pré-definidos (apenas para este descanso):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {REST_PRESET_OPTIONS.map((preset) => {
                    const isPresetActive = restState.totalSeconds === preset.seconds;
                    return (
                      <button
                        key={preset.seconds}
                        type="button"
                        onClick={() => handleSelectPresetRest(preset.seconds)}
                        className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-black border transition active:scale-95 flex items-center justify-center ${
                          isPresetActive
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Entrada Manual de Tempo Personalizado (MM:SS) */}
              {showCustomTimeInput && (
                <form
                  onSubmit={handleApplyCustomRestTime}
                  className="bg-slate-900/95 border border-emerald-500/40 rounded-xl p-2.5 space-y-2 animate-fadeIn"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-bold text-emerald-300">
                      Definir tempo manual (00:05 a 15:00):
                    </span>
                    <span className="text-[10px] text-slate-400">Não altera a ficha</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Min</label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={customMinutesInput}
                        onChange={(e) => setCustomMinutesInput(e.target.value)}
                        className="w-full bg-transparent text-white font-mono font-bold text-sm text-center focus:outline-none"
                        aria-label="Minutos de descanso"
                      />
                    </div>
                    <span className="text-slate-400 font-black">:</span>
                    <div className="flex-1 flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                      <label className="text-[10px] text-slate-400 font-bold uppercase">Seg</label>
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={customSecondsInput}
                        onChange={(e) => setCustomSecondsInput(e.target.value)}
                        className="w-full bg-transparent text-white font-mono font-bold text-sm text-center focus:outline-none"
                        aria-label="Segundos de descanso"
                      />
                    </div>
                    <button
                      type="submit"
                      className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl transition active:scale-95 shrink-0"
                    >
                      Aplicar
                    </button>
                  </div>
                  {customTimeFeedback && (
                    <p className="text-[11px] text-amber-300 font-medium">{customTimeFeedback}</p>
                  )}
                </form>
              )}

              {/* Botões de Ajuste Rápido do Descanso Atual: -15s, +15s, +30s */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjustRestSeconds(-15)}
                  className="min-h-[44px] px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  -15s
                </button>

                <button
                  type="button"
                  onClick={() => handleAdjustRestSeconds(15)}
                  className="min-h-[44px] px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  +15s
                </button>

                <button
                  type="button"
                  onClick={() => handleAdjustRestSeconds(30)}
                  className="min-h-[44px] px-2.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold transition active:scale-95"
                >
                  +30s
                </button>
              </div>

              {/* Controles Principais de Descanso: Pausar/Continuar e Pular (Área de toque >= 44px) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTogglePauseRest}
                  className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 ${
                    restState.isRunning
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {restState.isRunning ? (
                    <>
                      <Pause className="w-4 h-4 shrink-0" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current shrink-0" />
                      <span>Continuar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkipRest}
                  className="min-h-[44px] px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <SkipForward className="w-4 h-4 shrink-0" />
                  <span>Pular descanso</span>
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 4: Descanso finalizado (ready_next) — Card já exibe upcomingStep */}
          {stepPhase === 'ready_next' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-black text-white block">
                      {activeTransitionPrescribedSeconds === 0
                        ? 'Intervalo 0s (Transição Imediata) — Exercício preparado'
                        : 'Descanso concluído — Exercício preparado'}
                    </span>
                    <span className="text-[11px] text-emerald-300 block truncate">
                      Confirme abaixo para iniciar a execução de {currentStep.exercise.name}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmNextMovement}
                className="w-full min-h-[54px] py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-lg shadow-emerald-950"
              >
                <Play className="w-5 h-5 fill-current shrink-0" />
                <span>
                  {isSameExerciseTransition
                    ? `Iniciar próxima série (Série ${currentStep.currentSet} de ${currentStep.totalSets})`
                    : `Iniciar próximo exercício (Série ${currentStep.currentSet} de ${currentStep.totalSets})`}
                </span>
              </button>
            </div>
          )}

          {/* ESTADO 5: Exercício ou circuito / treino concluído (finished) */}
          {stepPhase === 'finished' && (
            <div className="space-y-3 text-center animate-fadeIn py-1">
              <div className="flex items-center justify-center gap-2 text-emerald-400">
                <Trophy className="w-6 h-6 animate-bounce shrink-0" />
                <span className="text-sm sm:text-base font-black text-white">
                  Treino concluído! Todas as séries finalizadas 🎉
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Você completou todos os passos de <strong className="text-white">{session.name}</strong>.
              </p>

              <button
                type="button"
                onClick={() => onFinishWorkout(false)}
                disabled={isCompleting}
                className="w-full min-h-[54px] py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 active:scale-98 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{isCompleting ? 'Finalizando...' : 'Finalizar treino'}</span>
              </button>

              {!isDemoSession && (
                <button
                  type="button"
                  onClick={() => onFinishWorkout(true)}
                  disabled={isCompleting}
                  className="w-full min-h-[46px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>Finalizar e Avisar Treinador no WhatsApp</span>
                </button>
              )}
            </div>
          )}
        </section>

        {/* Instruções Técnicas, Recado do Treinador e Cuidados */}
        <div className="space-y-2 pt-1">
          {currentStep.exercise.notes && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Orientação do Treinador:
              </span>
              <p className="text-xs text-amber-100/90 leading-relaxed break-words">
                {currentStep.exercise.notes}
              </p>
            </div>
          )}

          {media.instructions && (
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                Como Executar:
              </span>
              <p
                data-testid="guided-card-instructions"
                className="text-xs text-slate-300 leading-relaxed break-words"
              >
                {media.instructions}
              </p>
            </div>
          )}

          {media.cautions && (
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Atenção à Postura & Articulação:
              </span>
              <p className="text-xs text-rose-200/90 leading-relaxed break-words">
                {media.cautions}
              </p>
            </div>
          )}
        </div>

        {/* Controles secundários de navegação entre passos + alternância para Visão Geral */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleJumpToStep(safeStepIndex - 1)}
            disabled={safeStepIndex === 0}
            className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToOverview}
            className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition"
          >
            <ListChecks className="w-4 h-4 text-emerald-400" />
            <span>Ver Ficha Completa</span>
          </button>

          <button
            type="button"
            onClick={() => handleJumpToStep(safeStepIndex + 1)}
            disabled={safeStepIndex >= steps.length - 1}
            className="min-h-[44px] px-3 py-2 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1 transition"
          >
            <span>Próximo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

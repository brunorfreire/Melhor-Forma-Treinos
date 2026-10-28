import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Dumbbell, Eye, Play, SkipForward } from 'lucide-react';
import { Exercise, WorkoutSession } from '../types';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { resolveExerciseMedia } from '../utils/exerciseMedia';
import { buildExecutionSteps, methodLabels } from '../utils/workoutExecutionPlan';

type Phase = 'ready' | 'performing' | 'resting' | 'ready_next' | 'finished';

interface GuidedWorkoutPlayerProps {
  session: WorkoutSession;
  completedExerciseIds: Record<string, boolean>;
  onCompleteExercise: (id: string) => void;
  onPreviewExercise: (exercise: Exercise) => void;
  onShowOverview: () => void;
  onFinishWorkout: () => void;
}

function formatTime(seconds: number): string {
  const value = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
}

export const GuidedWorkoutPlayer: React.FC<GuidedWorkoutPlayerProps> = ({
  session, completedExerciseIds, onCompleteExercise, onPreviewExercise, onShowOverview, onFinishWorkout
}) => {
  const { steps, warnings } = useMemo(() => buildExecutionSteps(session), [session]);
  const exercises = session.exercises;
  const [stepIndex, setStepIndex] = useState(() => Math.max(0, steps.findIndex(step => !completedExerciseIds[step.exerciseId])));
  const [phase, setPhase] = useState<Phase>('ready');
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [lastStepCompleted, setLastStepCompleted] = useState(false);

  const nextPendingIndex = (fromIndex: number) =>
    steps.findIndex((step, i) => i > fromIndex && !completedExerciseIds[step.exerciseId]);

  const step = steps[stepIndex];
  const exercise = step ? exercises[step.exerciseIndex] : undefined;
  const preview = exercise ? resolveExerciseMedia(exercise) : null;
  const nextIndex = nextPendingIndex(stepIndex);
  const nextStep = nextIndex >= 0 ? steps[nextIndex] : undefined;
  const nextExercise = nextStep ? exercises[nextStep.exerciseIndex] : undefined;
  const doneCount = exercises.filter(ex => completedExerciseIds[ex.id]).length;
  const allDone = exercises.length > 0 && doneCount === exercises.length;
  const timeLeft = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;

  useEffect(() => {
    if (phase !== 'resting' || deadline === null) return;
    const interval = window.setInterval(() => setNow(Date.now()), 400);
    return () => window.clearInterval(interval);
  }, [phase, deadline]);

  useEffect(() => {
    if (phase === 'resting' && deadline !== null && now >= deadline) {
      setDeadline(null);
      setPhase(nextStep ? 'ready_next' : 'finished');
    }
  }, [phase, deadline, now, nextStep]);

  const startSet = () => {
    if (!exercise || completedExerciseIds[exercise.id]) {
      if (allDone) setPhase('finished');
      else goNext();
      return;
    }
    setPhase('performing');
  };

  const goNext = () => {
    if (nextIndex < 0) {
      setPhase('finished');
      return;
    }
    setStepIndex(nextIndex);
    setDeadline(null);
    setLastStepCompleted(false);
    setPhase('performing');
  };

  const finishSet = () => {
    if (!step || phase !== 'performing') return;
    // A série atual é confirmada exclusivamente após o toque em "Concluir série".
    if (step.isLastSetOfExercise && !completedExerciseIds[step.exerciseId]) {
      onCompleteExercise(step.exerciseId);
    }
    setLastStepCompleted(true);
    const future = nextPendingIndex(stepIndex);
    if (future < 0) {
      setDeadline(null);
      setPhase('finished');
      return;
    }
    if (step.restAfterSeconds > 0) {
      const time = Date.now();
      setNow(time);
      setDeadline(time + step.restAfterSeconds * 1000);
      setPhase('resting');
    } else {
      setDeadline(null);
      setPhase('ready_next');
    }
  };

  const skipRest = () => {
    setDeadline(null);
    setPhase(nextStep ? 'ready_next' : 'finished');
  };

  if (!exercise || !step) {
    return <div className="p-4 rounded-xl bg-slate-900 text-sm text-slate-300">
      Nenhum exercício disponível para execução.
    </div>;
  }

  const nextIsNewExercise = nextStep?.exerciseId !== step.exerciseId;
  const actionLabel = phase === 'performing' ? 'Concluir série'
    : phase === 'resting' ? 'Encerrar descanso'
    : phase === 'ready_next' ? (nextIsNewExercise ? 'Iniciar próximo exercício' : 'Iniciar próxima série')
    : phase === 'finished' ? 'Finalizar treino'
    : 'Começar série';

  const onPrimary = () => {
    if (phase === 'performing') finishSet();
    else if (phase === 'resting') skipRest();
    else if (phase === 'ready_next') goNext();
    else if (phase === 'finished') onFinishWorkout();
    else startSet();
  };

  const restLabel = step.restKind === 'entre_exercicios' ? 'Intervalo entre exercícios'
    : step.restKind === 'entre_rodadas' ? 'Intervalo entre rodadas'
    : 'Descanso entre séries';

  const nextLabel = nextExercise ? (
    nextIsNewExercise
      ? 'Próximo: ' + nextExercise.name
      : 'Próxima: série ' + (nextStep?.setNumber || 1) + ' de ' + (nextStep?.totalSets || 1)
  ) : 'Treino pronto para finalizar';

  return (
    <section className="space-y-3" aria-label="Execução guiada">
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">Execução guiada</span>
            <h2 className="font-bold text-white text-sm mt-1 break-words">{session.name}</h2>
            <p className="text-xs text-slate-400 mt-1">{doneCount} de {exercises.length} exercícios concluídos</p>
          </div>
          <button type="button" onClick={onShowOverview}
            className="min-h-[44px] px-3 rounded-xl border border-slate-600 text-xs font-semibold text-slate-200 shrink-0">
            <Eye className="w-4 h-4 inline mr-1"/> Lista
          </button>
        </div>
        <div className="h-2 rounded-full bg-slate-950 overflow-hidden" role="progressbar"
          aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={exercises.length}>
          <div className="h-full bg-emerald-500 transition-all"
            style={{ width: (exercises.length ? doneCount / exercises.length * 100 : 0) + '%' }}/>
        </div>
      </div>

      {warnings.length > 0 && warnings.map((warning, i) => (
        <p key={i} role="alert" className="border border-amber-800 bg-amber-950/30 text-amber-200 rounded-xl px-3 py-2 text-xs">
          {warning}
        </p>
      ))}

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3">
        {step.groupKind ? (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-700/40 px-3 py-2 text-xs space-y-1">
            <strong className="text-emerald-200">{methodLabels[step.groupKind]}</strong>
            <p className="text-slate-300">Rodada {step.roundNumber} de {step.totalRounds}
              {' '}• Movimento {step.groupExercisePosition} de {step.groupExerciseCount}</p>
          </div>
        ) : <p className="text-xs text-emerald-300 font-bold">Séries simples</p>}

        <div className="flex justify-between items-center gap-2 text-xs text-slate-400">
          <span>Exercício {step.exerciseIndex + 1} de {exercises.length}</span>
          <span>Série {step.setNumber} de {step.totalSets}</span>
        </div>

        <h3 className="text-xl font-black text-white leading-snug">{exercise.name}</h3>
        <span className="text-xs font-bold text-emerald-300">{exercise.muscleGroup}</span>

        <div className="flex items-center gap-3">
          <div className="w-28 sm:w-36 shrink-0">
            <ExerciseThumbnail exercise={exercise} aspectRatio="16:9" showPlayBadge={true}
              onClick={preview?.isValidated ? () => onPreviewExercise(exercise) : undefined}/>
          </div>
          <div className="space-y-2 min-w-0 text-xs text-slate-300">
            <p>Repetições / tempo: <strong className="text-white">{exercise.reps}</strong></p>
            <p>Carga: <strong className="text-amber-200">{exercise.weight || 'Conforme orientação'}</strong></p>
            {preview?.isValidated && (
              <button type="button" onClick={() => onPreviewExercise(exercise)}
                className="min-h-[44px] px-3 border border-emerald-700 rounded-lg text-emerald-200 font-bold">
                Ver execução
              </button>
            )}
          </div>
        </div>

        {(exercise.notes || preview?.instructions || exercise.cautions) && (
          <p className="bg-slate-950/80 border-l-2 border-emerald-500 p-3 text-xs text-slate-300 rounded-r-lg">
            {exercise.notes || preview?.instructions || exercise.cautions}
          </p>
        )}

        {phase === 'resting' ? (
          <div className="rounded-xl border border-teal-600/50 bg-teal-950/40 p-4 text-center space-y-2">
            <p className="text-sm font-bold text-teal-200">{restLabel}</p>
            <p className="font-mono font-black text-4xl text-white tabular-nums">{formatTime(timeLeft)}</p>
            <p className="text-xs text-slate-300">{nextLabel}</p>
          </div>
        ) : (
          <p className="bg-slate-950/70 text-xs text-slate-300 rounded-xl p-3" aria-live="polite">
            {phase === 'performing' ? 'Execute com controle. Toque em Concluir série quando terminar.'
              : phase === 'ready_next' ? nextLabel + '. Avance quando estiver pronto.'
              : phase === 'finished' ? 'Sequência concluída. Registre o treino para sua evolução.'
              : 'Confira a demonstração e comece quando estiver pronto.'}
          </p>
        )}
      </div>

      <div className="sticky bottom-2 z-20 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-xl space-y-2">
        <button type="button" onClick={onPrimary}
          className="w-full min-h-[54px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2">
          {phase === 'performing' ? <CheckCircle2 className="w-5 h-5"/> :
            phase === 'resting' ? <SkipForward className="w-5 h-5"/> : <Play className="w-5 h-5"/>}
          {actionLabel}
        </button>
        <p className="text-center text-[11px] text-slate-400">
          {phase === 'resting' ? 'O descanso começou automaticamente' :
            phase === 'ready_next' ? 'Você decide quando iniciar o próximo movimento' :
              lastStepCompleted ? 'Série registrada' : 'Seu ritmo, com orientação em cada etapa'}
        </p>
      </div>
    </section>
  );
};

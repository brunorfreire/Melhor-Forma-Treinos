import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronLeft, Clock, Dumbbell, Eye, Pause, Play, SkipForward } from 'lucide-react';
import { Exercise, WorkoutSession } from '../types';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import { resolveExerciseMedia } from '../utils/exerciseMedia';

type Phase = 'ready' | 'performing' | 'resting' | 'exercise_done' | 'all_done';

interface GuidedWorkoutPlayerProps {
  session: WorkoutSession;
  completedExerciseIds: Record<string, boolean>;
  onCompleteExercise: (id: string) => void;
  onPreviewExercise: (exercise: Exercise) => void;
  onShowOverview: () => void;
  onFinishWorkout: () => void;
}

const parseSets = (sets: string): number => {
  const first = Number((sets || '').match(/\d+/)?.[0] || 1);
  return Math.min(12, Math.max(1, first));
};

const parseRestSeconds = (rest: string): number => {
  const value = Number((rest || '').match(/\d+/)?.[0] || 60);
  const seconds = /min/i.test(rest || '') ? value * 60 : value;
  return Math.min(600, Math.max(0, seconds));
};

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
};

export const GuidedWorkoutPlayer: React.FC<GuidedWorkoutPlayerProps> = ({
  session, completedExerciseIds, onCompleteExercise, onPreviewExercise, onShowOverview, onFinishWorkout
}) => {
  const exercises = session.exercises;
  const [index, setIndex] = useState(() => {
    const first = exercises.findIndex(exercise => !completedExerciseIds[exercise.id]);
    return Math.max(0, first);
  });
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>('ready');
  const [restDeadline, setRestDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [restJustFinished, setRestJustFinished] = useState(false);

  const exercise = exercises[index];
  const total = exercises.length;
  const complete = exercises.filter(ex => completedExerciseIds[ex.id]).length;
  const totalSets = exercise ? parseSets(exercise.sets) : 0;
  const doneSets = exercise ? (completedSets[exercise.id] || (completedExerciseIds[exercise.id] ? totalSets : 0)) : 0;
  const nextSet = Math.min(totalSets, doneSets + 1);
  const restRemaining = restDeadline ? Math.max(0, Math.ceil((restDeadline - now) / 1000)) : 0;
  const currentMedia = useMemo(() => exercise ? resolveExerciseMedia(exercise) : null, [exercise]);

  useEffect(() => {
    if (phase !== 'resting' || !restDeadline) return;
    const interval = window.setInterval(() => setNow(Date.now()), 400);
    return () => window.clearInterval(interval);
  }, [phase, restDeadline]);

  useEffect(() => {
    if (phase === 'resting' && restDeadline != null && restDeadline <= now) {
      setRestDeadline(null);
      setRestJustFinished(true);
      setPhase('ready');
      // Descanso finalizado: não inicia a próxima série sem ação do aluno.
    }
  }, [phase, restDeadline, now]);

  const startSet = () => {
    if (!exercise || completedExerciseIds[exercise.id]) return;
    setRestJustFinished(false);
    setPhase('performing');
  };

  const finishSet = () => {
    if (!exercise || phase !== 'performing') return;
    const newlyCompleted = Math.min(totalSets, doneSets + 1);
    setCompletedSets(previous => ({ ...previous, [exercise.id]: newlyCompleted }));

    if (newlyCompleted >= totalSets) {
      onCompleteExercise(exercise.id);
      setPhase('exercise_done');
      setRestDeadline(null);
    } else {
      const duration = parseRestSeconds(exercise.rest);
      if (duration === 0) {
        setRestJustFinished(true);
        setPhase('ready');
      } else {
        const start = Date.now();
        setNow(start);
        setRestDeadline(start + duration * 1000);
        setPhase('resting');
      }
    }
  };

  const nextExercise = () => {
    const next = exercises.findIndex((item, itemIndex) =>
      itemIndex > index && !completedExerciseIds[item.id]
    );
    if (next < 0) {
      const pending = exercises.findIndex(item => !completedExerciseIds[item.id]);
      if (pending < 0) {
        setPhase('all_done');
        return;
      }
      setIndex(pending);
    } else {
      setIndex(next);
    }
    setRestDeadline(null);
    setRestJustFinished(false);
    setPhase('ready');
  };

  const movePrevious = () => {
    if (index === 0) return;
    setIndex(index - 1);
    setRestDeadline(null);
    setRestJustFinished(false);
    setPhase('ready');
  };

  const skipRest = () => {
    setRestDeadline(null);
    setRestJustFinished(true);
    setPhase('ready');
  };

  if (!exercise) {
    return <div className="p-4 text-sm text-slate-300">Nenhum exercício disponível para execução.</div>;
  }

  const isCurrentDone = Boolean(completedExerciseIds[exercise.id]);
  const allCompleted = total > 0 && complete === total;
  const primaryLabel = phase === 'performing'
    ? 'Concluir série'
    : phase === 'resting'
      ? 'Encerrar descanso e continuar'
      : phase === 'exercise_done' || (isCurrentDone && phase !== 'all_done')
        ? allCompleted ? 'Finalizar treino' : 'Próximo exercício'
        : phase === 'all_done'
          ? 'Finalizar treino'
          : 'Começar série';

  const onPrimaryAction = () => {
    if (phase === 'performing') finishSet();
    else if (phase === 'resting') skipRest();
    else if (phase === 'all_done' || ((phase === 'exercise_done' || isCurrentDone) && allCompleted)) onFinishWorkout();
    else if (phase === 'exercise_done' || isCurrentDone) nextExercise();
    else startSet();
  };

  return (
    <section className="space-y-3" aria-label="Execução guiada">
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">Modo execução guiada</span>
            <h2 className="font-bold text-white text-sm mt-1 break-words">{session.name}</h2>
            <p className="text-xs text-slate-400 mt-1">{complete} de {total} exercícios concluídos</p>
          </div>
          <button onClick={onShowOverview} type="button"
            className="min-h-[44px] rounded-xl border border-slate-600 px-3 text-xs font-semibold text-slate-200 shrink-0">
            <Eye className="w-4 h-4 inline mr-1" /> Lista
          </button>
        </div>
        <div className="h-2 rounded-full bg-slate-950 overflow-hidden" role="progressbar"
          aria-valuenow={complete} aria-valuemin={0} aria-valuemax={total}>
          <div className="h-full bg-emerald-500 transition-all" style={{ width: (total ? (complete / total) * 100 : 0) + '%' }} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Exercício {index + 1} de {total}</span>
          <span>{isCurrentDone ? 'Concluído' : 'Série ' + nextSet + ' de ' + totalSets}</span>
        </div>
        <h3 className="text-xl font-black leading-snug text-white">{exercise.name}</h3>
        <p className="text-xs text-emerald-300 font-bold">{exercise.muscleGroup}</p>
        <div className="flex items-center gap-3">
          <div className="w-28 sm:w-36 shrink-0">
            <ExerciseThumbnail
              exercise={exercise}
              aspectRatio="16:9"
              showPlayBadge={true}
              onClick={currentMedia?.isValidated ? () => onPreviewExercise(exercise) : undefined}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2 text-xs text-slate-200">
            <p><strong className="text-white">{exercise.reps}</strong> repetições / tempo</p>
            <p>Carga: <strong className="text-amber-200">{exercise.weight || 'Conforme orientação'}</strong></p>
            <p>Intervalo: <strong className="text-emerald-200">{exercise.rest || '60s'}</strong></p>
            {currentMedia?.isValidated && (
              <button onClick={() => onPreviewExercise(exercise)} type="button"
                className="min-h-[44px] rounded-lg border border-emerald-700 px-3 text-emerald-300 font-bold">
                Ver execução
              </button>
            )}
          </div>
        </div>
        {(exercise.notes || currentMedia?.instructions || exercise.cautions) && (
          <p className="rounded-xl border-l-2 border-emerald-600 bg-slate-950/70 p-3 text-xs text-slate-300 leading-relaxed">
            {exercise.notes || currentMedia?.instructions || exercise.cautions}
          </p>
        )}

        <div className="flex gap-2 flex-wrap" aria-label="Progresso das séries">
          {Array.from({ length: totalSets }, (_, setIndex) => (
            <span key={setIndex}
              className={'px-3 py-2 rounded-lg text-xs font-bold border ' +
                (setIndex < doneSets ? 'border-emerald-600 bg-emerald-900/40 text-emerald-300' :
                  setIndex === doneSets && !isCurrentDone ? 'border-emerald-400 bg-emerald-950 text-white' :
                    'border-slate-700 bg-slate-950 text-slate-400')}>
              {setIndex < doneSets ? '✓ ' : ''}{setIndex + 1}
            </span>
          ))}
        </div>

        {phase === 'resting' ? (
          <div className="rounded-xl border border-teal-600/50 bg-teal-950/40 p-4 text-center space-y-2" aria-live="polite">
            <p className="font-bold text-teal-200 text-sm">Descanse. A próxima série vem depois.</p>
            <p className="font-mono font-black text-4xl text-white tabular-nums">{formatTime(restRemaining)}</p>
            <p className="text-xs text-slate-300">Série {nextSet} de {totalSets} será a próxima</p>
          </div>
        ) : (
          <p className="text-xs text-slate-300 bg-slate-950/50 rounded-lg p-3" aria-live="polite">
            {phase === 'performing'
              ? 'Execute com controle e toque em Concluir série quando terminar.'
              : phase === 'all_done' || (isCurrentDone && allCompleted)
                ? 'Todas as séries foram registradas. Você já pode finalizar.'
                : isCurrentDone || phase === 'exercise_done'
                  ? 'Exercício concluído! Confira o próximo movimento.'
                  : restJustFinished
                    ? 'Descanso finalizado. Quando estiver pronto, comece a próxima série.'
                    : 'Confira a execução e toque em Começar série quando estiver preparado.'}
          </p>
        )}
      </div>

      <div className="sticky bottom-2 z-20 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-xl space-y-2">
        <button onClick={onPrimaryAction} type="button"
          className="w-full min-h-[54px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2">
          {phase === 'performing' ? <CheckCircle2 className="w-5 h-5" /> :
            phase === 'resting' ? <SkipForward className="w-5 h-5" /> :
              <Play className="w-5 h-5" />}
          {primaryLabel}
          {phase === 'exercise_done' && <ArrowRight className="w-4 h-4" />}
        </button>
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={movePrevious} disabled={index === 0 || phase === 'performing' || phase === 'resting'}
            className="min-h-[44px] px-3 text-xs font-semibold text-slate-300 disabled:opacity-40">
            <ChevronLeft className="w-4 h-4 inline" /> Anterior
          </button>
          <span className="text-[11px] text-slate-400 text-center">
            {phase === 'resting' ? 'Descanso iniciado automaticamente' : 'Você controla o ritmo do treino'}
          </span>
          <Dumbbell className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

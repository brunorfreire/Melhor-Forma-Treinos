import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Share2,
  Edit3,
  Clock,
  Send,
  Trophy,
  Layers,
  VideoOff,
  Target,
  ListChecks,
  Compass,
  FlaskConical,
  X
} from 'lucide-react';
import { WorkoutPlan, WorkoutSession, Exercise } from '../types';
import { formatStudentFinishedMessage, createWhatsAppShareLink } from '../utils/whatsapp';
import { resolveExerciseMedia } from '../utils/exerciseMedia';
import { MelhorFormaLogo } from './MelhorFormaLogo';
import {
  saveActiveWorkoutSession,
  clearActiveWorkoutSession,
  recordCompletedWorkout
} from '../utils/studentProgressService';
import { ExerciseThumbnail } from './ExerciseThumbnail';
import {
  GuidedWorkoutExecution,
  GuidedStepPhase,
  GuidedSessionRestState
} from './GuidedWorkoutExecution';
import {
  compileGuidedSessionSteps,
  EXECUTION_METHODS_META,
  validateSessionExecutionBlocks
} from '../utils/guidedExecutionEngine';
import { DEMO_GUIDED_WORKOUT_PLAN } from '../data/guidedDemoPlan';

interface StudentWorkoutViewProps {
  plan: WorkoutPlan;
  onEditPlan: () => void;
  onOpenShareModal: () => void;
  onPreviewExercise: (ex: Exercise) => void;
  onBackToCatalog?: () => void;
  onOpenTodayRecommender?: () => void;
  onOpenEvolution?: () => void;
  onGuidedModeChange?: (isGuided: boolean) => void;
}

const DEFAULT_REST_STATE: GuidedSessionRestState = {
  totalSeconds: 0,
  remainingMs: 0,
  endTimeMs: null,
  isRunning: false
};

export const StudentWorkoutView: React.FC<StudentWorkoutViewProps> = ({
  plan,
  onEditPlan,
  onOpenShareModal,
  onPreviewExercise,
  onBackToCatalog,
  onOpenTodayRecommender,
  onOpenEvolution,
  onGuidedModeChange
}) => {
  // Quando a ficha inicial é a ficha demonstrativa padrão ('mf-treino-sample'),
  // inicia exibindo a sessão demonstrativa dos 4 métodos em Execução Guiada para validação imediata na prévia.
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(
    () => plan.id === 'mf-treino-sample' || !!plan.isDemoSession
  );

  // Modo de visualização: 'overview' (Visão Geral) | 'guided' (Execução Guiada)
  const [workoutViewMode, setWorkoutViewMode] = useState<'overview' | 'guided'>(() =>
    plan.id === 'mf-treino-sample' || !!plan.isDemoSession ? 'guided' : 'overview'
  );

  // Índices de sessão separados para a ficha real e a ficha de demonstração
  const [realSessionIndex, setRealSessionIndex] = useState(0);
  const [demoSessionIndex, setDemoSessionIndex] = useState(0);

  // Estado de exercícios concluídos separado entre ficha real e demonstração
  const [realCompletedExerciseIds, setRealCompletedExerciseIds] = useState<Record<string, boolean>>({});
  const [demoCompletedExerciseIds, setDemoCompletedExerciseIds] = useState<Record<string, boolean>>({});

  // Estado de passos guiados concluídos, posição atual, fase e cronômetro por sessão
  // Garante preservação integral do progresso ao alternar entre Visão Geral e Execução Guiada
  const [completedStepIdsBySession, setCompletedStepIdsBySession] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [stepIndexBySession, setStepIndexBySession] = useState<Record<string, number>>({});
  const [stepPhaseBySession, setStepPhaseBySession] = useState<Record<string, GuidedStepPhase>>({});
  const [restStateBySession, setRestStateBySession] = useState<
    Record<string, GuidedSessionRestState>
  >({});

  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [lastRecordedSummary, setLastRecordedSummary] = useState<{
    title: string;
    muscles: string[];
    duration: number;
    isDemo?: boolean;
  } | null>(null);

  useEffect(() => {
    if (onGuidedModeChange) {
      onGuidedModeChange(workoutViewMode === 'guided');
    }
    return () => {
      if (onGuidedModeChange) {
        onGuidedModeChange(false);
      }
    };
  }, [workoutViewMode, onGuidedModeChange]);

  const effectivePlan: WorkoutPlan = isDemoModeActive ? DEMO_GUIDED_WORKOUT_PLAN : plan;
  const activeSessionIndex = isDemoModeActive ? demoSessionIndex : realSessionIndex;
  const setActiveSessionIndex = isDemoModeActive ? setDemoSessionIndex : setRealSessionIndex;

  const completedExerciseIds = isDemoModeActive ? demoCompletedExerciseIds : realCompletedExerciseIds;
  const setCompletedExerciseIds = isDemoModeActive
    ? setDemoCompletedExerciseIds
    : setRealCompletedExerciseIds;

  const activeSession: WorkoutSession | undefined =
    effectivePlan.sessions[activeSessionIndex] || effectivePlan.sessions[0];

  const sessionValidation = useMemo(() => {
    if (!activeSession) return null;
    return validateSessionExecutionBlocks(activeSession);
  }, [activeSession]);

  const compiledSession = useMemo(() => {
    if (!activeSession) return null;
    return compileGuidedSessionSteps(activeSession);
  }, [activeSession]);

  if (!activeSession) {
    return (
      <div className="p-6 text-center text-slate-400">
        Nenhum treino cadastrado nesta ficha.
      </div>
    );
  }

  const sessionKey = `${effectivePlan.id || 'plan'}-${activeSession.id}`;
  const currentSessionStepMap = completedStepIdsBySession[sessionKey] || {};
  const currentStepIndex = stepIndexBySession[sessionKey] || 0;
  const currentStepPhase: GuidedStepPhase = stepPhaseBySession[sessionKey] || 'ready';
  const currentRestState: GuidedSessionRestState =
    restStateBySession[sessionKey] || DEFAULT_REST_STATE;

  const handleUpdateSessionCompletedSteps = (updatedStepsMap: Record<string, boolean>) => {
    setCompletedStepIdsBySession((prev) => ({
      ...prev,
      [sessionKey]: updatedStepsMap
    }));
  };

  const handleUpdateSessionStepIndex = (nextIdx: number) => {
    setStepIndexBySession((prev) => ({
      ...prev,
      [sessionKey]: nextIdx
    }));
  };

  const handleUpdateSessionStepPhase = (nextPhase: GuidedStepPhase) => {
    setStepPhaseBySession((prev) => ({
      ...prev,
      [sessionKey]: nextPhase
    }));
  };

  const handleUpdateSessionRestState = (nextRest: GuidedSessionRestState) => {
    setRestStateBySession((prev) => ({
      ...prev,
      [sessionKey]: nextRest
    }));
  };

  const persistRealActiveSessionProgress = (updatedExerciseMap: Record<string, boolean>) => {
    if (isDemoModeActive || effectivePlan.isDemoSession) return;
    const completedList = Object.keys(updatedExerciseMap).filter((k) => updatedExerciseMap[k]);
    saveActiveWorkoutSession({
      workoutId: effectivePlan.id,
      workoutTitle: activeSession.name,
      category: 'forca_40_plus',
      duration: '30 min',
      coverImage:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      completedExercisesIds: completedList,
      totalExercises: activeSession.exercises.length,
      currentExerciseIndex: activeSessionIndex,
      plan: effectivePlan
    });
  };

  const markExerciseComplete = (exerciseId: string, forceCompleted?: boolean) => {
    const nextState =
      typeof forceCompleted === 'boolean' ? forceCompleted : !completedExerciseIds[exerciseId];
    const updated = {
      ...completedExerciseIds,
      [exerciseId]: nextState
    };
    setCompletedExerciseIds(updated);

    // Sincroniza passos guiados daquele exercício quando marcado/desmarcado na Visão Geral
    if (compiledSession) {
      const nextStepsMap = { ...currentSessionStepMap };
      compiledSession.steps.forEach((s) => {
        if (s.exercise.id === exerciseId) {
          nextStepsMap[s.stepId] = nextState;
        }
      });
      handleUpdateSessionCompletedSteps(nextStepsMap);
    }

    persistRealActiveSessionProgress(updated);
  };

  const totalExercises = activeSession.exercises.length;
  const completedCount = activeSession.exercises.filter((e) => !!completedExerciseIds[e.id]).length;
  const progressPercent =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const isSessionFinished = totalExercises > 0 && completedCount === totalExercises;

  const handleCompleteWorkout = (notifyWhatsApp: boolean = false) => {
    if (isCompleting) return;
    setIsCompleting(true);

    const uniqueMuscles = Array.from(
      new Set(activeSession.exercises.map((e) => e.muscleGroup).filter(Boolean))
    );
    const goalsList = effectivePlan.goal ? [effectivePlan.goal] : ['Força e Autonomia 40+'];
    const estimatedMinutes = Math.max(15, Math.min(50, (completedCount || totalExercises) * 3));

    // IMPORTANTE: Sessão de demonstração nunca grava no histórico real nem apaga sessão ativa real
    if (!isDemoModeActive && !effectivePlan.isDemoSession) {
      recordCompletedWorkout(
        effectivePlan.id,
        activeSession.name,
        'forca_40_plus',
        estimatedMinutes,
        goalsList,
        uniqueMuscles,
        'iniciante',
        undefined,
        'app_session'
      );
      clearActiveWorkoutSession();
    }

    setLastRecordedSummary({
      title: activeSession.name,
      muscles: uniqueMuscles,
      duration: estimatedMinutes,
      isDemo: isDemoModeActive || !!effectivePlan.isDemoSession
    });
    setShowFinishedModal(true);
    setTimeout(() => setIsCompleting(false), 2000);

    if (notifyWhatsApp && !isDemoModeActive && !effectivePlan.isDemoSession) {
      const text = formatStudentFinishedMessage(effectivePlan, activeSession);
      const url = createWhatsAppShareLink(effectivePlan.trainerPhone || '', text);
      window.open(url, '_blank');
    }
  };

  const handleActivateDemoSession = () => {
    setIsDemoModeActive(true);
    setDemoSessionIndex(0);
    setWorkoutViewMode('guided');
  };

  const handleExitDemoSession = () => {
    setIsDemoModeActive(false);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-44">
      {/* Student App Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 pt-[max(0.625rem,env(safe-area-inset-top,0.625rem))] pb-2.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <MelhorFormaLogo size={32} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight truncate">
                Melhor Forma Play
              </h1>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                40+
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              {workoutViewMode === 'guided' ? 'Execução Guiada' : 'Ficha com Vídeos'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {onBackToCatalog && (
            <button
              onClick={onBackToCatalog}
              className="min-h-[44px] px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1 transition"
              title="Explorar mais treinos no Catálogo Play"
            >
              <span>Catálogo</span>
            </button>
          )}
          {onOpenEvolution && (
            <button
              onClick={onOpenEvolution}
              className="min-h-[44px] px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-teal-300 hover:text-white flex items-center gap-1 transition"
              title="Acompanhar meus treinos concluídos e frequência semanal"
            >
              <Trophy className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Evolução</span>
            </button>
          )}
          {onOpenTodayRecommender && (
            <button
              onClick={onOpenTodayRecommender}
              className="min-h-[44px] px-2.5 sm:px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 transition"
              title="Descobrir o treino ideal para os objetivos de hoje"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Treino de Hoje</span>
            </button>
          )}
          <button
            onClick={onOpenShareModal}
            className="min-h-[44px] min-w-[44px] p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition flex items-center justify-center"
            title="Compartilhar no WhatsApp"
            aria-label="Compartilhar treino"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
          </button>
          <button
            onClick={onEditPlan}
            className="min-h-[44px] px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1 transition"
            title="Editar ficha (Modo Treinador)"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xs:inline">Editar</span>
          </button>
        </div>
      </header>

      {/* Main Student Container */}
      <div className="p-3 sm:p-4 space-y-3.5 flex-1 min-w-0">
        {/* Banner da Sessão de Demonstração Isolada (4 Métodos Guiados) */}
        {isDemoModeActive ? (
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-500/40 rounded-2xl p-3 space-y-2 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                    Modo Demonstração Isolado Ativo
                  </span>
                  <p className="text-xs font-bold text-white leading-snug">
                    Testando: Simples (30s), Combinado (0s/60s), Conjugado (0s/60s) e Circuito (30s/90s)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExitDemoSession}
                className="min-h-[40px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold text-slate-200 flex items-center gap-1 shrink-0 transition"
              >
                <X className="w-3.5 h-3.5 text-rose-400" />
                <span>Sair da Demo</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Esta sessão usa dados fictícios em memória. Sua ficha real e seu histórico de evolução não são alterados.
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FlaskConical className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">
                  Demonstração dos 4 Métodos Guiados
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Simples • Combinado • Conjugado • Circuitado
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleActivateDemoSession}
              className="min-h-[40px] px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-xl text-[11px] font-bold text-emerald-300 shrink-0 transition active:scale-95"
            >
              Abrir Demo
            </button>
          </div>
        )}

        {/* Student & Trainer Identification Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-emerald-400 tracking-wider uppercase">
                Aluno(a)
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                {effectivePlan.studentName || 'Aluno'}
              </h2>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 block">Treinador</span>
              <span className="text-xs font-semibold text-slate-200">
                {effectivePlan.trainerName || 'Bruno Freire'}
              </span>
            </div>
          </div>

          {/* Goal & Frequency */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 min-w-0">
              <span className="text-[10px] text-slate-400 block">Objetivo</span>
              <span className="font-semibold text-emerald-300 truncate block">
                {effectivePlan.goal || 'Condicionamento'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 min-w-0">
              <span className="text-[10px] text-slate-400 block">Frequência</span>
              <span className="font-semibold text-slate-200 truncate block">
                {effectivePlan.frequency || 'Livre'}
              </span>
            </div>
          </div>

          {/* General Coach Instructions */}
          {effectivePlan.generalNotes && (
            <div className="mt-3 text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-200 leading-relaxed">
              <span className="font-bold text-emerald-300 block mb-0.5">Recado do Treinador:</span>
              {effectivePlan.generalNotes}
            </div>
          )}
        </div>

        {/* Workout Session Switcher (Tabs) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Escolha o Treino de Hoje:
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              {effectivePlan.sessions.length} divisões
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {effectivePlan.sessions.map((session, idx) => (
              <button
                key={session.id || idx}
                onClick={() => setActiveSessionIndex(idx)}
                className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs transition border flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-98 ${
                  idx === activeSessionIndex
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="truncate max-w-[130px]">
                  {session.name.split('-')[0].trim() || `Treino ${idx + 1}`}
                </span>
                <span className="text-[10px] opacity-80 font-normal">
                  {session.exercises.length} exercícios
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* SELETOR DE MODO DE VISUALIZAÇÃO: VISÃO GERAL vs EXECUÇÃO GUIADA       */}
        {/* ===================================================================== */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-1.5 grid grid-cols-2 gap-1.5 shadow-md">
          <button
            type="button"
            onClick={() => setWorkoutViewMode('overview')}
            className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
              workoutViewMode === 'overview'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                : 'bg-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListChecks className="w-4 h-4 shrink-0" />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setWorkoutViewMode('guided')}
            className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition ${
              workoutViewMode === 'guided'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950'
                : 'bg-transparent text-emerald-300 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Execução Guiada</span>
          </button>
        </div>

        {/* ===================================================================== */}
        {/* MODO 2: EXECUÇÃO GUIADA (1 EXERCÍCIO POR VEZ + DESCANSO NO CARD)      */}
        {/* ===================================================================== */}
        {workoutViewMode === 'guided' ? (
          <GuidedWorkoutExecution
            session={activeSession}
            completedExerciseIds={completedExerciseIds}
            onMarkExerciseComplete={markExerciseComplete}
            completedStepIds={currentSessionStepMap}
            onUpdateCompletedSteps={handleUpdateSessionCompletedSteps}
            currentStepIndex={currentStepIndex}
            onChangeStepIndex={handleUpdateSessionStepIndex}
            stepPhase={currentStepPhase}
            onChangeStepPhase={handleUpdateSessionStepPhase}
            restState={currentRestState}
            onChangeRestState={handleUpdateSessionRestState}
            onPreviewExercise={onPreviewExercise}
            onFinishWorkout={handleCompleteWorkout}
            onSwitchToOverview={() => setWorkoutViewMode('overview')}
            isCompleting={isCompleting}
            isDemoSession={isDemoModeActive || !!effectivePlan.isDemoSession}
          />
        ) : (
          /* =================================================================== */
          /* MODO 1: VISÃO GERAL (FICHA COMPLETA, LISTA E FERRAMENTAS)           */
          /* =================================================================== */
          <>
            {/* Active Session Focus & Progress */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-tight truncate">
                    {activeSession.name}
                  </h3>
                  {activeSession.focus && (
                    <p className="text-xs text-emerald-400 mt-0.5 truncate">
                      Foco: {activeSession.focus}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-400">
                    {completedCount}/{totalExercises}
                  </span>
                  <span className="text-[10px] text-slate-400 block">concluídos</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* CTA Rápido para Iniciar Execução Guiada */}
              <button
                type="button"
                onClick={() => setWorkoutViewMode('guided')}
                className="w-full min-h-[44px] py-2.5 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 hover:text-white flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" />
                <span>Abrir Modo de Execução Guiada Passo a Passo</span>
              </button>
            </div>

            {/* Exercises List */}
            <div className="space-y-3 pt-1">
              {activeSession.exercises.map((exercise, idx) => {
                const isCompleted = !!completedExerciseIds[exercise.id];
                const media = resolveExerciseMedia(exercise);
                const blockForExercise = sessionValidation?.exerciseToBlockMap[exercise.id];
                const blockMethodMeta = blockForExercise
                  ? EXECUTION_METHODS_META[blockForExercise.method]
                  : null;

                return (
                  <div
                    key={exercise.id}
                    className={`transition-all rounded-2xl border p-3 sm:p-3.5 space-y-3 ${
                      isCompleted
                        ? 'bg-slate-950/50 border-emerald-900/40 opacity-80'
                        : 'bg-slate-900/90 border-slate-800/90 shadow-md hover:border-slate-700'
                    }`}
                  >
                    {/* Top Section: Checkbox + Title + Muscle Badge + Block Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => markExerciseComplete(exercise.id)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 -mt-1 text-slate-400 hover:text-emerald-400 transition shrink-0 rounded-xl"
                          aria-label={
                            isCompleted
                              ? `Desmarcar ${exercise.name}`
                              : `Marcar ${exercise.name} como concluído`
                          }
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-600 hover:text-emerald-400 transition" />
                          )}
                        </button>

                        <div className="min-w-0 pt-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              {exercise.muscleGroup}
                            </span>
                            {blockMethodMeta && (
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${blockMethodMeta.badgeClass}`}
                              >
                                {blockMethodMeta.shortLabel}
                              </span>
                            )}
                            {isCompleted && (
                              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                                Feito
                              </span>
                            )}
                          </div>
                          <h4
                            className={`text-sm sm:text-base font-bold mt-0.5 leading-snug break-words ${
                              isCompleted ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            {exercise.name}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Main Row: Miniatura Horizontal à Esquerda & Informações à Direita */}
                    <div className="flex items-center gap-3">
                      <div className="w-24 xs:w-28 sm:w-32 shrink-0">
                        <ExerciseThumbnail
                          exercise={exercise}
                          onClick={
                            media.hasVideo ? () => onPreviewExercise(exercise) : undefined
                          }
                          aspectRatio="16:9"
                          showPlayBadge={true}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        {media.isValidated ? (
                          <button
                            type="button"
                            onClick={() => onPreviewExercise(exercise)}
                            className="w-full min-h-[44px] py-2 px-3 bg-emerald-600/15 hover:bg-emerald-600/25 active:scale-98 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-xl transition flex items-center justify-center gap-2 text-xs font-bold shadow-sm shadow-emerald-950/30"
                            title="Abrir vídeo demonstrativo validado em tela cheia"
                            aria-label={`Ver execução validada de ${exercise.name}`}
                          >
                            <Play className="w-3.5 h-3.5 fill-current text-emerald-400 shrink-0" />
                            <span className="tracking-wide">Ver execução</span>
                          </button>
                        ) : media.status === 'pendente' ? (
                          <div
                            className="w-full min-h-[44px] py-2 px-3 bg-amber-950/20 border border-amber-800/40 text-amber-300/80 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold select-none"
                            title="Demonstração em revisão técnica pelo treinador"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Em revisão técnica</span>
                          </div>
                        ) : (
                          <div
                            className="w-full min-h-[44px] py-2 px-3 bg-slate-950 border border-slate-800 text-slate-500 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold select-none opacity-75"
                            title="Nenhum vídeo demonstrativo disponível para este movimento"
                          >
                            <VideoOff className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>Sem vídeo</span>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-300 font-medium leading-tight flex items-center gap-2 flex-wrap">
                          <span className="text-white font-bold">{exercise.sets} séries</span>
                          <span className="text-slate-500">•</span>
                          <span>{exercise.reps}</span>
                          {exercise.weight && (
                            <>
                              <span className="text-slate-500">•</span>
                              <span className="text-amber-300 font-bold">{exercise.weight}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Métricas detalhadas (Séries, Repetições/Duração, Descanso, Carga) */}
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
                      <div className="p-1">
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Séries
                        </span>
                        <span className="text-xs font-bold text-white block truncate">
                          {exercise.sets || '3'}
                        </span>
                      </div>
                      <div className="p-1 border-l border-slate-800/80">
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Reps / Tempo
                        </span>
                        <span
                          className="text-xs font-bold text-white block truncate"
                          title={exercise.reps}
                        >
                          {exercise.reps || '10'}
                        </span>
                      </div>
                      <div className="p-1 border-t xs:border-t-0 xs:border-l border-slate-800/80">
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Intervalo
                        </span>
                        <span className="text-xs font-bold text-emerald-400 block truncate">
                          {exercise.rest || '60s'}
                        </span>
                      </div>
                      <div className="p-1 border-t xs:border-t-0 border-l border-slate-800/80">
                        <span className="text-[9px] text-slate-400 uppercase block font-semibold">
                          Carga
                        </span>
                        <span
                          className="text-xs font-bold text-amber-300 truncate block px-0.5"
                          title={exercise.weight || '-'}
                        >
                          {exercise.weight || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Orientações técnicas resumidas & Recado do Treinador */}
                    {(exercise.notes || media.instructions) && (
                      <div className="bg-slate-950/70 border-l-2 border-emerald-500/80 pl-2.5 py-1.5 pr-2 rounded-r-lg text-xs space-y-1">
                        {exercise.notes ? (
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 block uppercase">
                              Dica do Treinador:
                            </span>
                            <p className="text-[11px] leading-relaxed text-slate-300 mt-0.5 break-words">
                              {exercise.notes}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                              Orientações Técnicas:
                            </span>
                            <p className="text-[11px] leading-relaxed text-slate-300 mt-0.5 break-words">
                              {media.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Workout Finished Trophy Card */}
            {isSessionFinished && (
              <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 text-center space-y-3 animate-fadeIn shadow-xl">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Trophy className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">
                    Treino Finalizado com Sucesso! 🎉
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto">
                    Você concluiu todos os exercícios do {activeSession.name}.
                  </p>
                </div>

                <button
                  onClick={() => handleCompleteWorkout(!isDemoModeActive)}
                  disabled={isCompleting}
                  className="w-full min-h-[46px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isCompleting
                      ? 'Registrando...'
                      : isDemoModeActive
                      ? 'Concluir Sessão de Demonstração'
                      : 'Concluir e Avisar Treinador no WhatsApp'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Bottom Bar with Share & Finish */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={onOpenShareModal}
            className="min-h-[46px] flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 active:scale-98 text-slate-200 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Compartilhar</span>
          </button>

          <button
            onClick={() => handleCompleteWorkout(false)}
            disabled={isCompleting}
            className="min-h-[46px] flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 active:scale-98 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleting ? 'Salvando...' : 'Concluir Treino'}</span>
          </button>
        </div>
      </div>

      {/* Modal de Celebração & Conclusão de Treino */}
      {showFinishedModal && lastRecordedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl space-y-4 text-center animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                {lastRecordedSummary.isDemo
                  ? 'Demonstração Concluída (Sem Alterar Histórico)'
                  : 'Registrado na Sua Evolução'}
              </span>
              <h3 className="text-lg font-black text-white pt-1">
                Treino Concluído! 🎉
              </h3>
              <p className="text-xs text-slate-300">
                {lastRecordedSummary.isDemo
                  ? `${lastRecordedSummary.title} foi concluído em modo de demonstração isolada.`
                  : `${lastRecordedSummary.title} foi salvo no seu histórico de longevidade.`}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Duração estimada:</span>
                <span className="font-bold text-white">{lastRecordedSummary.duration} min</span>
              </div>
              {lastRecordedSummary.muscles.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    Músculos estimulados:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {lastRecordedSummary.muscles.slice(0, 4).map((m, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {onOpenEvolution && !lastRecordedSummary.isDemo && (
                <button
                  onClick={() => {
                    setShowFinishedModal(false);
                    onOpenEvolution();
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md shadow-emerald-950"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Ver Minha Evolução</span>
                </button>
              )}

              {!lastRecordedSummary.isDemo && (
                <button
                  onClick={() => {
                    const text = formatStudentFinishedMessage(effectivePlan, activeSession);
                    const url = createWhatsAppShareLink(effectivePlan.trainerPhone || '', text);
                    window.open(url, '_blank');
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-700 text-emerald-300 hover:text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Avisar Treinador no WhatsApp</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowFinishedModal(false);
                }}
                className="w-full min-h-[40px] text-xs text-slate-400 hover:text-white transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

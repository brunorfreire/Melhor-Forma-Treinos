import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Share2, 
  Edit3, 
  Dumbbell, 
  Clock, 
  Send, 
  Trophy, 
  Layers,
  Sparkles,
  AlertTriangle,
  BookOpen,
  ShieldAlert,
  VideoOff,
  Target
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

interface StudentWorkoutViewProps {
  plan: WorkoutPlan;
  onEditPlan: () => void;
  onOpenShareModal: () => void;
  onPreviewExercise: (ex: Exercise) => void;
  onBackToCatalog?: () => void;
  onOpenTodayRecommender?: () => void;
  onOpenEvolution?: () => void;
}

export const StudentWorkoutView: React.FC<StudentWorkoutViewProps> = ({
  plan,
  onEditPlan,
  onOpenShareModal,
  onPreviewExercise,
  onBackToCatalog,
  onOpenTodayRecommender,
  onOpenEvolution
}) => {
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  // Track completed exercise IDs per session (local state in browser session)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Record<string, boolean>>({});
  const [showFinishedModal, setShowFinishedModal] = useState(false);
  const [lastRecordedSummary, setLastRecordedSummary] = useState<{
    title: string;
    muscles: string[];
    duration: number;
  } | null>(null);

  const activeSession: WorkoutSession | undefined = plan.sessions[activeSessionIndex] || plan.sessions[0];

  if (!activeSession) {
    return (
      <div className="p-6 text-center text-slate-400">
        Nenhum treino cadastrado nesta ficha.
      </div>
    );
  }

  const toggleExerciseComplete = (exerciseId: string) => {
    const updated = {
      ...completedExerciseIds,
      [exerciseId]: !completedExerciseIds[exerciseId]
    };
    setCompletedExerciseIds(updated);

    // Salva progresso na sessão ativa para "Continue de onde parou"
    const completedList = Object.keys(updated).filter(k => updated[k]);
    saveActiveWorkoutSession({
      workoutId: plan.id,
      workoutTitle: activeSession.name,
      category: 'forca_40_plus',
      duration: '30 min',
      coverImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      startedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      completedExercisesIds: completedList,
      totalExercises: activeSession.exercises.length,
      currentExerciseIndex: activeSessionIndex,
      plan
    });
  };

  const totalExercises = activeSession.exercises.length;
  const completedCount = activeSession.exercises.filter(e => !!completedExerciseIds[e.id]).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const isSessionFinished = totalExercises > 0 && completedCount === totalExercises;

  const handleCompleteWorkout = (notifyWhatsApp: boolean = false) => {
    // Extrai grupos musculares únicos trabalhados
    const uniqueMuscles = Array.from(new Set(activeSession.exercises.map(e => e.muscleGroup).filter(Boolean)));
    const goalsList = plan.goal ? [plan.goal] : ['Força e Autonomia 40+'];
    const estimatedMinutes = Math.max(15, Math.min(50, (completedCount || totalExercises) * 3));

    // Registra no histórico real de conclusão
    recordCompletedWorkout(
      plan.id,
      activeSession.name,
      'forca_40_plus',
      estimatedMinutes,
      goalsList,
      uniqueMuscles,
      'iniciante'
    );
    clearActiveWorkoutSession();

    setLastRecordedSummary({
      title: activeSession.name,
      muscles: uniqueMuscles,
      duration: estimatedMinutes
    });
    setShowFinishedModal(true);

    if (notifyWhatsApp) {
      const text = formatStudentFinishedMessage(plan, activeSession);
      const url = createWhatsAppShareLink(plan.trainerPhone || '', text);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-44">
      {/* Student App Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-1.5">
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
              Ficha com Vídeos
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
      <div className="p-3 sm:p-4 space-y-4 flex-1">
        {/* Student & Trainer Identification Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-medium text-emerald-400 tracking-wider uppercase">
                Aluno(a)
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                {plan.studentName || 'Aluno'}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Treinador</span>
              <span className="text-xs font-semibold text-slate-200">
                {plan.trainerName || 'Professor'}
              </span>
            </div>
          </div>

          {/* Goal & Frequency */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Objetivo</span>
              <span className="font-semibold text-emerald-300 truncate block">
                {plan.goal || 'Condicionamento'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Frequência</span>
              <span className="font-semibold text-slate-200 truncate block">
                {plan.frequency || 'Livre'}
              </span>
            </div>
          </div>

          {/* General Coach Instructions */}
          {plan.generalNotes && (
            <div className="mt-3 text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-200 leading-relaxed">
              <span className="font-bold text-emerald-300 block mb-0.5">Recado do Treinador:</span>
              {plan.generalNotes}
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
              {plan.sessions.length} divisões
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {plan.sessions.map((session, idx) => (
              <button
                key={session.id || idx}
                onClick={() => setActiveSessionIndex(idx)}
                className={`flex-1 min-w-[105px] py-2.5 px-3 rounded-xl font-bold text-xs transition border flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-98 ${
                  idx === activeSessionIndex
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                <span className="truncate max-w-[120px]">
                  {session.name.split('-')[0].trim() || `Treino ${idx + 1}`}
                </span>
                <span className="text-[10px] opacity-80 font-normal">
                  {session.exercises.length} exercícios
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Session Focus & Progress */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {activeSession.name}
              </h3>
              {activeSession.focus && (
                <p className="text-xs text-emerald-400 mt-0.5">
                  Foco: {activeSession.focus}
                </p>
              )}
            </div>

            <div className="text-right">
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
        </div>

        {/* Exercises List */}
        <div className="space-y-3 pt-1">
          {activeSession.exercises.map((exercise, idx) => {
            const isCompleted = !!completedExerciseIds[exercise.id];
            const media = resolveExerciseMedia(exercise);

            return (
              <div
                key={exercise.id}
                className={`transition-all rounded-2xl border p-3 sm:p-3.5 space-y-3 ${
                  isCompleted
                    ? 'bg-slate-950/50 border-emerald-900/40 opacity-80'
                    : 'bg-slate-900/90 border-slate-800/90 shadow-md hover:border-slate-700'
                }`}
              >
                {/* Top Section: Checkbox + Title + Muscle Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {/* Botão independente para marcar exercício como concluído (Min 44x44px touch) */}
                    <button
                      onClick={() => toggleExerciseComplete(exercise.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 -mt-1 text-slate-400 hover:text-emerald-400 transition shrink-0 rounded-xl"
                      aria-label={isCompleted ? `Desmarcar ${exercise.name}` : `Marcar ${exercise.name} como concluído`}
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
                        {isCompleted && (
                          <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded">
                            Feito
                          </span>
                        )}
                      </div>
                      <h4 className={`text-sm sm:text-base font-bold mt-0.5 leading-snug break-words ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {exercise.name}
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Main Row: Miniatura Horizontal à Esquerda & Informações à Direita */}
                <div className="flex items-center gap-3">
                  {/* Miniatura 16:9 clicável com ícone de reprodução sobreposto */}
                  <div className="w-24 xs:w-28 sm:w-32 shrink-0">
                    <ExerciseThumbnail
                      exercise={exercise}
                      onClick={media.hasVideo ? () => onPreviewExercise(exercise) : undefined}
                      aspectRatio="16:9"
                      showPlayBadge={true}
                    />
                  </div>

                  {/* Informações à direita + Botão "Ver execução" */}
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Botão visível "Ver execução" ou Indicação Discreta (Prompt Regras 2 e 7) */}
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

                    {/* Resumo rápido do estímulo */}
                    <div className="text-[11px] text-slate-300 font-medium leading-tight flex items-center gap-2 flex-wrap">
                      <span className="text-white font-bold">{exercise.sets} séries</span>
                      <span className="text-slate-500">•</span>
                      <span>{exercise.reps} reps</span>
                      {exercise.weight && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-amber-300 font-bold">{exercise.weight}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métricas detalhadas (Séries, Repetições/Duração, Descanso, Carga) - Adaptável para 320px */}
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div className="p-1">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Séries</span>
                    <span className="text-xs font-bold text-white block truncate">{exercise.sets || '3'}</span>
                  </div>
                  <div className="p-1 border-l border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Reps / Tempo</span>
                    <span className="text-xs font-bold text-white block truncate" title={exercise.reps}>{exercise.reps || '10'}</span>
                  </div>
                  <div className="p-1 border-t xs:border-t-0 xs:border-l border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Intervalo</span>
                    <span className="text-xs font-bold text-emerald-400 block truncate">{exercise.rest || '60s'}</span>
                  </div>
                  <div className="p-1 border-t xs:border-t-0 border-l border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">Carga</span>
                    <span className="text-xs font-bold text-amber-300 truncate block px-0.5" title={exercise.weight || '-'}>
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
                Você concluiu todos os exercícios do {activeSession.name}. Envie o feedback para seu treinador!
              </p>
            </div>

            <button
              onClick={() => handleCompleteWorkout(true)}
              className="w-full min-h-[46px] py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
              <span>Concluir e Avisar Treinador no WhatsApp</span>
            </button>
          </div>
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
            className="min-h-[46px] flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/60"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Concluir Treino</span>
          </button>
        </div>
      </div>

      {/* Modal de Celebração & Conclusão de Treino com Integração à Evolução */}
      {showFinishedModal && lastRecordedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl space-y-4 text-center animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Registrado na Sua Evolução
              </span>
              <h3 className="text-lg font-black text-white pt-1">
                Treino Concluído! 🎉
              </h3>
              <p className="text-xs text-slate-300">
                {lastRecordedSummary.title} foi salvo no seu histórico de longevidade.
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Duração registrada:</span>
                <span className="font-bold text-white">{lastRecordedSummary.duration} min</span>
              </div>
              {lastRecordedSummary.muscles.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block mb-1">Músculos estimulados:</span>
                  <div className="flex flex-wrap gap-1">
                    {lastRecordedSummary.muscles.slice(0, 4).map((m, i) => (
                      <span key={i} className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {onOpenEvolution && (
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

              <button
                onClick={() => {
                  const text = formatStudentFinishedMessage(plan, activeSession);
                  const url = createWhatsAppShareLink(plan.trainerPhone || '', text);
                  window.open(url, '_blank');
                }}
                className="w-full min-h-[44px] py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-700 text-emerald-300 hover:text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                <span>Avisar Treinador no WhatsApp</span>
              </button>

              <button
                onClick={() => {
                  setShowFinishedModal(false);
                  if (onBackToCatalog) onBackToCatalog();
                }}
                className="w-full min-h-[40px] text-xs text-slate-400 hover:text-white transition"
              >
                Voltar ao Catálogo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

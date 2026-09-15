import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Youtube,
  Play,
  ChevronDown,
  ChevronUp,
  Share2, 
  Edit3, 
  Dumbbell, 
  Clock, 
  Send, 
  Flame, 
  Trophy, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';
import { WorkoutPlan, WorkoutSession, Exercise } from '../types';
import { formatStudentFinishedMessage, createWhatsAppShareLink } from '../utils/whatsapp';
import { resolveExerciseYouTubeId, buildYouTubeEmbedUrl } from '../utils/youtube';

interface StudentWorkoutViewProps {
  plan: WorkoutPlan;
  onEditPlan: () => void;
  onOpenShareModal: () => void;
  onPreviewExercise: (ex: Exercise) => void;
}

export const StudentWorkoutView: React.FC<StudentWorkoutViewProps> = ({
  plan,
  onEditPlan,
  onOpenShareModal,
  onPreviewExercise
}) => {
  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  // Track completed exercise IDs per session (local state in browser session)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<Record<string, boolean>>({});
  // Track which exercise card has its inline video expanded
  const [expandedInlineVideoId, setExpandedInlineVideoId] = useState<string | null>(null);

  const activeSession: WorkoutSession | undefined = plan.sessions[activeSessionIndex] || plan.sessions[0];

  if (!activeSession) {
    return (
      <div className="p-6 text-center text-slate-400">
        Nenhum treino cadastrado nesta ficha.
      </div>
    );
  }

  const toggleExerciseComplete = (exerciseId: string) => {
    setCompletedExerciseIds(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const toggleInlineVideo = (exerciseId: string) => {
    setExpandedInlineVideoId(prev => (prev === exerciseId ? null : exerciseId));
  };

  const totalExercises = activeSession.exercises.length;
  const completedCount = activeSession.exercises.filter(e => !!completedExerciseIds[e.id]).length;
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const isSessionFinished = totalExercises > 0 && completedCount === totalExercises;

  const handleNotifyTrainer = () => {
    const text = formatStudentFinishedMessage(plan, activeSession);
    const url = createWhatsAppShareLink(plan.trainerPhone || '', text);
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-28">
      {/* Student App Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
              Melhor Forma Treino
            </h1>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ficha do Aluno
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenShareModal}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition"
            title="Compartilhar no WhatsApp"
            aria-label="Compartilhar treino"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={onEditPlan}
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
            title="Editar ficha (Modo Treinador)"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Editar</span>
          </button>
        </div>
      </header>

      {/* Main Student Container */}
      <div className="p-4 space-y-4 flex-1">
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
            <span className="text-[11px] text-emerald-400">
              {plan.sessions.length} divisões
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {plan.sessions.map((session, idx) => (
              <button
                key={session.id || idx}
                onClick={() => {
                  setActiveSessionIndex(idx);
                  setExpandedInlineVideoId(null);
                }}
                className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl font-bold text-xs transition border flex flex-col items-center justify-center gap-0.5 shadow-sm active:scale-98 ${
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
              <span className="text-[10px] text-slate-400 block">feitos</span>
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
            const isInlineVideoOpen = expandedInlineVideoId === exercise.id;
            const videoId = resolveExerciseYouTubeId(
              exercise.name,
              exercise.youtubeId || exercise.youtubeUrl,
              exercise.muscleGroup
            );

            return (
              <div
                key={exercise.id}
                className={`transition rounded-2xl border p-4 space-y-3 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-emerald-900/40 opacity-75'
                    : 'bg-slate-900/90 border-slate-800 shadow-md'
                }`}
              >
                {/* Exercise Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => toggleExerciseComplete(exercise.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0"
                      aria-label={isCompleted ? "Marcar como não feito" : "Marcar como concluído"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-emerald-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                          {exercise.muscleGroup}
                        </span>
                      </div>
                      <h4 className={`text-sm sm:text-base font-bold mt-0.5 leading-snug truncate ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                        {exercise.name}
                      </h4>
                    </div>
                  </div>

                  {/* Video Actions: YouTube Modal & Inline Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Primary Button: Opens In-App YouTube Modal */}
                    <button
                      onClick={() => onPreviewExercise(exercise)}
                      className="px-2.5 py-1.5 bg-red-600/15 hover:bg-red-600/25 active:scale-95 border border-red-500/30 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-sm shadow-red-950/40"
                      title="Abrir vídeo demonstrativo no YouTube"
                      aria-label={`Ver vídeo de execução de ${exercise.name}`}
                    >
                      <Youtube className="w-4 h-4 text-red-500 fill-current" />
                      <span className="text-[11px] text-slate-100">Vídeo</span>
                    </button>

                    {/* Secondary Quick Toggle: Embeds directly inside card */}
                    <button
                      onClick={() => toggleInlineVideo(exercise.id)}
                      className={`p-1.5 rounded-xl border transition text-xs flex items-center justify-center ${
                        isInlineVideoOpen
                          ? 'bg-red-500/20 text-red-400 border-red-500/40'
                          : 'bg-slate-800/80 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-700'
                      }`}
                      title={isInlineVideoOpen ? "Recolher vídeo" : "Expandir vídeo no card"}
                      aria-label="Alternar vídeo no card"
                    >
                      {isInlineVideoOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Inline YouTube Player if expanded inside the card */}
                {isInlineVideoOpen && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-red-500/30 shadow-xl animate-fadeIn">
                    <iframe
                      src={buildYouTubeEmbedUrl(videoId, true)}
                      title={`Vídeo: ${exercise.name}`}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Metrics Badges (Séries, Reps, Descanso, Carga) */}
                <div className="grid grid-cols-4 gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block">Séries</span>
                    <span className="text-xs font-bold text-white">{exercise.sets}</span>
                  </div>
                  <div className="border-l border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Reps</span>
                    <span className="text-xs font-bold text-white">{exercise.reps}</span>
                  </div>
                  <div className="border-l border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Pausa</span>
                    <span className="text-xs font-bold text-emerald-400">{exercise.rest}</span>
                  </div>
                  <div className="border-l border-slate-800/80">
                    <span className="text-[9px] text-slate-400 uppercase block">Carga</span>
                    <span className="text-xs font-bold text-amber-300 truncate block px-0.5">
                      {exercise.weight || '-'}
                    </span>
                  </div>
                </div>

                {/* Trainer Notes */}
                {exercise.notes && (
                  <div className="bg-slate-950/70 border-l-2 border-amber-500/80 pl-2.5 py-1.5 pr-2 rounded-r-lg text-xs text-slate-300">
                    <span className="text-[10px] font-bold text-amber-400 block uppercase">
                      Observação:
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-300 mt-0.5">
                      {exercise.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Workout Finished Celebration Banner */}
        {isSessionFinished && (
          <div className="bg-gradient-to-br from-emerald-950/70 to-slate-900 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-3 animate-fadeIn mt-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Treino Concluído com Sucesso! 🔥
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Você completou todos os {totalExercises} exercícios de {activeSession.name}!
              </p>
            </div>

            <button
              onClick={handleNotifyTrainer}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950"
            >
              <Send className="w-4 h-4" />
              Avisar Treinador no WhatsApp
            </button>
          </div>
        )}

        {/* Bottom Helper Bar */}
        <div className="pt-4 text-center space-y-2">
          <p className="text-[11px] text-slate-500">
            Ficha gerada por <strong>Melhor Forma Treino V1 Lite</strong>
            <br />
            Vídeos demonstrativos em alta definição integrados via YouTube
          </p>
        </div>
      </div>
    </div>
  );
};

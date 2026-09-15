import React from 'react';
import { X, Dumbbell, AlertTriangle, Youtube, CheckCircle2, RotateCcw } from 'lucide-react';
import { Exercise } from '../types';
import { resolveExerciseYouTubeId, buildYouTubeEmbedUrl } from '../utils/youtube';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  const videoId = resolveExerciseYouTubeId(
    exercise.name,
    exercise.youtubeId || exercise.youtubeUrl,
    exercise.muscleGroup
  );

  const embedUrl = buildYouTubeEmbedUrl(videoId, true);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Youtube className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {exercise.muscleGroup}
                </span>
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-semibold">
                  YouTube
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                {exercise.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition shrink-0 ml-2"
            aria-label="Fechar vídeo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded YouTube Player Container */}
        <div className="relative w-full aspect-video bg-black border-b border-slate-800">
          <iframe
            src={embedUrl}
            title={`Execução: ${exercise.name}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Body Content & Technical Guidance */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-slate-200">
          {/* Target Metrics */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Séries</span>
              <span className="text-xs sm:text-sm font-bold text-white">{exercise.sets}</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Reps</span>
              <span className="text-xs sm:text-sm font-bold text-white">{exercise.reps}</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Descanso</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">{exercise.rest}</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Carga</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 truncate block px-0.5">
                {exercise.weight || '-'}
              </span>
            </div>
          </div>

          {/* Coach's Notes */}
          {exercise.notes && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-xs uppercase mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Dica do Treinador:
              </div>
              <p className="text-xs leading-relaxed">{exercise.notes}</p>
            </div>
          )}

          {/* Execution Checklist */}
          <div className="bg-slate-950/70 border border-slate-800/80 p-3 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Pontos de Atenção na Execução:
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Mantenha a postura alinhada e abdômen contraído durante todo o movimento.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Controle a fase excêntrica (descida do peso), evitando deixar a carga cair.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Respire soltando o ar no esforço e inspirando no retorno.</span>
              </li>
            </ul>
          </div>

          {/* Action Button: Voltar para o Treino */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950"
          >
            Voltar para o Treino
          </button>
        </div>
      </div>
    </div>
  );
};

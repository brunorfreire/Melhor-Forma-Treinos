import React, { useState } from 'react';
import { Play, VideoOff, Dumbbell, Clock } from 'lucide-react';
import { Exercise } from '../types';
import { resolveExerciseMedia } from '../utils/exerciseMedia';

interface ExerciseThumbnailProps {
  exercise: Exercise;
  onClick?: () => void;
  className?: string;
  aspectRatio?: '16:9' | '4:3';
  showPlayBadge?: boolean;
}

export const ExerciseThumbnail: React.FC<ExerciseThumbnailProps> = ({
  exercise,
  onClick,
  className = '',
  aspectRatio = '16:9',
  showPlayBadge = true
}) => {
  const [imageError, setImageError] = useState(false);
  const media = resolveExerciseMedia(exercise);

  const isValidated = media.isValidated;
  const thumbnailUrl = !imageError ? media.thumbnailUrl : null;
  const isClickable = isValidated && !!onClick;

  const aspectClass = aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-video';

  // Quando não há miniatura ou ocorreu erro ao carregar a imagem
  if (!thumbnailUrl) {
    return (
      <div
        onClick={isClickable ? onClick : undefined}
        className={`relative ${aspectClass} rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center p-1.5 select-none shrink-0 ${
          isClickable ? 'cursor-pointer hover:border-emerald-500/50 transition-colors group' : ''
        } ${className}`}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={
          isClickable
            ? `Assistir demonstração de ${exercise.name}`
            : `Exercício ${exercise.name}`
        }
      >
        {/* Placeholder padronizado Melhor Forma Play */}
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-105 transition">
            {isValidated ? (
              <Play className="w-3.5 h-3.5 fill-current text-emerald-400 ml-0.5" />
            ) : media.status === 'pendente' ? (
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Dumbbell className="w-3.5 h-3.5 text-slate-500" />
            )}
          </div>
          <span className="text-[9px] font-bold text-slate-400 tracking-tight leading-tight line-clamp-1">
            {isValidated ? 'Ver Vídeo' : media.status === 'pendente' ? 'Em Revisão' : 'Sem Vídeo'}
          </span>
        </div>

        {/* Badge inferior para claridade */}
        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-[8px] font-mono font-medium text-slate-400">
          MF PLAY
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`relative ${aspectClass} rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 select-none shrink-0 group ${
        isClickable ? 'cursor-pointer hover:border-emerald-500/60 transition-all active:scale-[0.98]' : ''
      } ${className}`}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={
        isClickable
          ? `Assistir vídeo demonstrativo de ${exercise.name}`
          : `Demonstração visual de ${exercise.name}`
      }
    >
      {/* Imagem real correspondente ao vídeo do exercício */}
      <img
        src={thumbnailUrl}
        alt={`Miniatura demonstrativa: ${exercise.name}`}
        loading="lazy"
        decoding="async"
        onError={() => setImageError(true)}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
      />

      {/* Gradiente de contraste para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/60 transition-colors" />

      {/* Ícone de reprodução Play para vídeos validados */}
      {showPlayBadge && isValidated && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/85 border border-white/25 backdrop-blur-sm flex items-center justify-center text-white shadow-lg shadow-black/80 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:border-emerald-400 transition-all duration-200">
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Caso o vídeo esteja em revisão técnica */}
      {media.status === 'pendente' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
          <div className="px-1.5 py-0.5 rounded bg-amber-950/90 border border-amber-500/40 text-[9px] font-semibold text-amber-300 flex items-center gap-1 shadow-md">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Em revisão</span>
          </div>
        </div>
      )}

      {/* Caso o exercício esteja sem vídeo */}
      {media.status === 'sem_video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
          <div className="px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[9px] font-semibold text-slate-300 flex items-center gap-1">
            <VideoOff className="w-3 h-3 text-slate-400" />
            <span>Sem vídeo</span>
          </div>
        </div>
      )}

      {/* Marca d'água sutil Melhor Forma Play no canto inferior */}
      <div className="absolute bottom-1 left-1.5 px-1 py-0.2 bg-black/75 rounded text-[8px] font-bold text-emerald-400 uppercase tracking-wider backdrop-blur-xs">
        PLAY
      </div>
    </div>
  );
};

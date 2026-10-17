import React, { useRef, useState, useEffect } from 'react';
import { 
  X, 
  Dumbbell, 
  AlertTriangle, 
  Play, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  ShieldAlert,
  BookOpen,
  VideoOff
} from 'lucide-react';
import { Exercise } from '../types';
import { resolveExerciseMedia } from '../utils/exerciseMedia';
import { resolveIndexedDbMediaUrl } from '../utils/mediaStorageService';

interface ExerciseVideoModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({ exercise, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const media = exercise ? resolveExerciseMedia(exercise) : null;
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (media?.primaryUrl) {
      if (media.primaryUrl.startsWith('indexeddb://')) {
        resolveIndexedDbMediaUrl(media.primaryUrl).then((resolved) => {
          if (!isCancelled) {
            if (media.mediaType === 'video') {
              setCurrentVideoSrc(resolved);
            } else {
              setCurrentImageSrc(resolved);
            }
            setImageFailed(false);
          }
        });
      } else {
        if (media.mediaType === 'video') {
          setCurrentVideoSrc(media.primaryUrl);
        } else {
          setCurrentImageSrc(media.primaryUrl);
        }
        setImageFailed(false);
      }
    } else {
      setCurrentImageSrc(null);
      setCurrentVideoSrc(null);
      setImageFailed(false);
    }
    return () => {
      isCancelled = true;
    };
  }, [exercise?.id, media?.primaryUrl, media?.mediaType]);

  if (!exercise || !media) return null;

  const handleImageError = () => {
    // Se o WebP falhar e houver GIF de fallback original, tenta uma única vez sem loop
    if (media.fallbackUrl && currentImageSrc !== media.fallbackUrl) {
      setCurrentImageSrc(media.fallbackUrl);
    } else {
      setImageFailed(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vídeo demonstrativo de ${exercise.name}`}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh] animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/95">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400 ml-0.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {exercise.muscleGroup}
                </span>
                {exercise.equipment && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                    {exercise.equipment}
                  </span>
                )}
                {exercise.movementPattern && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                    {exercise.movementPattern}
                  </span>
                )}
                {exercise.videoValidationStatus === 'validado' ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Técnica Validada
                  </span>
                ) : exercise.videoValidationStatus === 'pendente_revisao' ? (
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="w-2.5 h-2.5" /> Revisão Pendente
                  </span>
                ) : null}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate leading-snug">
                {exercise.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            {media.hasVideo && (
              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                aria-label="Alternar tela cheia"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fechar vídeo e voltar para o treino"
              title="Voltar ao treino"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video / Animated Media Player / Fallback Container */}
        <div 
          ref={containerRef}
          className="relative w-full aspect-video bg-black border-b border-slate-800 flex items-center justify-center overflow-hidden"
        >
          {media.mediaType === 'image' && currentImageSrc && !imageFailed ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/95 p-1 select-none">
              <img
                src={currentImageSrc}
                alt={`Demonstração técnica: ${exercise.name}`}
                className="max-h-full max-w-full object-contain rounded-lg motion-reduce:transform-none"
                loading="eager"
                decoding="async"
                onError={handleImageError}
              />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded border border-slate-700/60 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider pointer-events-none">
                {currentImageSrc.endsWith('.gif') ? 'GIF 40+' : 'WebP 40+'}
              </div>
            </div>
          ) : media.mediaType === 'video' && (currentVideoSrc || media.primaryUrl) ? (
            <video
              src={currentVideoSrc || media.primaryUrl!}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : media.mediaType === 'youtube' && media.embedUrl ? (
            <iframe
              src={media.embedUrl}
              title={`Demonstração técnica: ${exercise.name}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              allowFullScreen
            />
          ) : media.mediaType === 'vimeo' && media.embedUrl ? (
            <iframe
              src={media.embedUrl}
              title={`Demonstração técnica: ${exercise.name}`}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="p-6 text-center space-y-2 text-slate-400">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <VideoOff className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-300">
                {imageFailed 
                  ? 'Arquivo demonstrativo não localizado no servidor.' 
                  : 'Nenhum vídeo demonstrativo vinculado a este exercício.'}
              </p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {imageFailed
                  ? 'Consulte as orientações técnicas e cuidados de postura descritos abaixo.'
                  : 'Consulte as orientações técnicas e cuidados de postura descritos abaixo.'}
              </p>
            </div>
          )}
        </div>

        {/* Body Content & Technical Guidance */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-slate-200">
          
          {/* Target Metrics Row */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
            <div>
              <span className="text-[9px] text-slate-400 uppercase block">Séries</span>
              <span className="text-xs sm:text-sm font-bold text-white">{exercise.sets || '3'}</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Reps / Duração</span>
              <span className="text-xs sm:text-sm font-bold text-white">{exercise.reps || '10'}</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Intervalo</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-400">{exercise.rest || '60s'}</span>
            </div>
            <div className="border-l border-slate-800">
              <span className="text-[9px] text-slate-400 uppercase block">Carga / Intens.</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300 truncate block px-0.5">
                {exercise.weight || '-'}
              </span>
            </div>
          </div>

          {/* Coach's Notes */}
          {exercise.notes && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 text-xs uppercase mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Recado do Treinador:
              </div>
              <p className="text-xs leading-relaxed">{exercise.notes}</p>
            </div>
          )}

          {/* Technical Instructions */}
          {media.instructions && (
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Orientações Técnicas:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {media.instructions}
              </p>
            </div>
          )}

          {/* Execution Cautions */}
          {media.cautions && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl space-y-1 text-rose-200">
              <div className="flex items-center gap-1.5 font-bold text-rose-300 text-xs uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Cuidados de Execução:</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {media.cautions}
              </p>
            </div>
          )}

          {/* Universal Checklist */}
          <div className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Padrão de Movimento Seguro:
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Execute em velocidade controlada (foco na fase excêntrica de descida).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>Mantenha o core (abdômen) contraído para proteger a coluna.</span>
              </li>
            </ul>
          </div>

          {/* Action Button: Voltar para o Treino (Min Touch 44px) */}
          <button
            onClick={onClose}
            className="w-full min-h-[46px] py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
          >
            <span>Voltar para o Treino</span>
          </button>
        </div>
      </div>
    </div>
  );
};

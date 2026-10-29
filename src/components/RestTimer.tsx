import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { playTimerCompletionSound } from '../utils/audio';

interface RestTimerProps {
  hidden?: boolean;
}

const PRESET_OPTIONS = [
  { label: '01:00', seconds: 60 },
  { label: '01:30', seconds: 90 },
  { label: '02:00', seconds: 120 }
] as const;

export const RestTimer: React.FC<RestTimerProps> = ({ hidden = false }) => {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingMs, setRemainingMs] = useState(60 * 1000);
  const [endTimeMs, setEndTimeMs] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Inicia sempre recolhido como barra compacta conforme diretriz mobile-first
  const [isMinimized, setIsMinimized] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMin, setCustomMin] = useState('1');
  const [customSec, setCustomSec] = useState('30');
  const timerRef = useRef<number | null>(null);

  const syncClock = useCallback(() => {
    if (!isActive || endTimeMs === null) return;
    const msLeft = Math.max(0, endTimeMs - Date.now());
    if (msLeft <= 0) {
      if (soundEnabled) {
        playTimerCompletionSound();
      }
      setRemainingMs(0);
      setEndTimeMs(null);
      setIsActive(false);
    } else {
      setRemainingMs(msLeft);
    }
  }, [isActive, endTimeMs, soundEnabled]);

  useEffect(() => {
    if (!isActive || endTimeMs === null) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    syncClock();
    timerRef.current = window.setInterval(syncClock, 250);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncClock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [isActive, endTimeMs, syncClock]);

  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  const handleStartPreset = (seconds: number) => {
    const safeSec = Math.max(5, Math.min(900, seconds));
    const ms = safeSec * 1000;
    setTotalSeconds(safeSec);
    setRemainingMs(ms);
    setEndTimeMs(Date.now() + ms);
    setIsActive(true);
  };

  const handleTogglePlay = () => {
    if (isActive && endTimeMs !== null) {
      const msLeft = Math.max(0, endTimeMs - Date.now());
      setRemainingMs(msLeft);
      setEndTimeMs(null);
      setIsActive(false);
    } else {
      const msToRun = remainingMs <= 0 ? totalSeconds * 1000 : remainingMs;
      setRemainingMs(msToRun);
      setEndTimeMs(Date.now() + msToRun);
      setIsActive(true);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setEndTimeMs(null);
    setRemainingMs(totalSeconds * 1000);
  };

  const addTime = (deltaSeconds: number) => {
    const currentMs =
      isActive && endTimeMs !== null ? Math.max(0, endTimeMs - Date.now()) : remainingMs;
    const nextMs = Math.max(0, currentMs + deltaSeconds * 1000);
    if (nextMs <= 0) {
      setRemainingMs(0);
      setEndTimeMs(null);
      setIsActive(false);
      return;
    }
    const nextTotalSec = Math.max(totalSeconds, Math.ceil(nextMs / 1000));
    setTotalSeconds(nextTotalSec);
    setRemainingMs(nextMs);
    if (isActive) {
      setEndTimeMs(Date.now() + nextMs);
    }
  };

  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = Math.max(0, Math.min(15, parseInt(customMin || '0', 10) || 0));
    const secs = Math.max(0, Math.min(59, parseInt(customSec || '0', 10) || 0));
    const total = mins * 60 + secs;
    if (total <= 0) return;
    handleStartPreset(total);
    setShowCustomInput(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    totalSeconds > 0
      ? Math.min(100, Math.max(0, ((totalSeconds * 1000 - remainingMs) / (totalSeconds * 1000)) * 100))
      : 0;

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-3 left-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-80 z-30 transition-all duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl shadow-black/70 overflow-hidden transition-all">
        {/* Minimized Compact Bar */}
        {isMinimized ? (
          <div className="px-3 py-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2 min-w-0 text-left py-1"
              aria-label="Abrir cronômetro de descanso"
            >
              <Clock className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  Cronômetro Manual
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {isActive ? 'Em andamento' : 'Toque em Abrir para usar'}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-sm font-mono font-black px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 ${isActive ? 'text-emerald-400' : 'text-slate-200'}`}>
                {formatTime(remainingSeconds)}
              </span>
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`min-h-[38px] min-w-[38px] px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition active:scale-95 ${
                  isActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                aria-label={isActive ? 'Pausar descanso' : 'Iniciar descanso'}
              >
                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(false)}
                className="min-h-[38px] px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-slate-700"
                aria-label="Abrir cronômetro"
              >
                <span>Abrir</span>
                <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Header Bar (Expanded) */}
            <div 
              onClick={() => setIsMinimized(true)}
              className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${isActive ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-200">
                  Cronômetro de Descanso
                </span>
                {isActive && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded-full">
                    {formatTime(remainingSeconds)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCustomInput(!showCustomInput);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title="Definir tempo manual (MM:SS)"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSoundEnabled(!soundEnabled);
                  }}
                  className="p-1 text-slate-400 hover:text-white rounded"
                  title={soundEnabled ? 'Silenciar bip' : 'Ativar bip'}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                </button>
                <button 
                  type="button"
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 rounded-lg flex items-center gap-1"
                  aria-label="Recolher"
                >
                  <span>Recolher</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Full Expanded Timer Controls */}
            <div className="p-3.5 space-y-3">
              {/* Display and Main Action */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tempo Restante</span>
                  <span className={`text-3xl font-mono font-black tracking-tight ${remainingSeconds === 0 ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white transition active:scale-95 shadow-md ${
                      isActive 
                        ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950' 
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                    }`}
                    aria-label={isActive ? 'Pausar' : 'Iniciar'}
                  >
                    {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition active:scale-95"
                    title="Reiniciar"
                    aria-label="Reiniciar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Quick Presets: 01:00, 01:30, 02:00 */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Tempos Pré-definidos:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {PRESET_OPTIONS.map((preset) => (
                    <button
                      key={preset.seconds}
                      type="button"
                      onClick={() => handleStartPreset(preset.seconds)}
                      className={`min-h-[40px] py-1.5 px-2 rounded-lg text-xs font-bold border transition ${
                        totalSeconds === preset.seconds && isActive
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/50 text-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {showCustomInput && (
                  <form onSubmit={handleApplyCustomTime} className="pt-1 flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-14 min-h-[38px] bg-slate-950 border border-slate-700 rounded-lg text-xs text-white text-center font-mono font-bold"
                      aria-label="Minutos"
                    />
                    <span className="text-slate-400 font-bold">:</span>
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={customSec}
                      onChange={(e) => setCustomSec(e.target.value)}
                      className="w-14 min-h-[38px] bg-slate-950 border border-slate-700 rounded-lg text-xs text-white text-center font-mono font-bold"
                      aria-label="Segundos"
                    />
                    <button
                      type="submit"
                      className="flex-1 min-h-[38px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => addTime(-15)}
                    className="min-h-[38px] py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition"
                  >
                    -15s
                  </button>
                  <button
                    type="button"
                    onClick={() => addTime(15)}
                    className="min-h-[38px] py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition"
                  >
                    +15s
                  </button>
                  <button
                    type="button"
                    onClick={() => addTime(30)}
                    className="min-h-[38px] py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition"
                  >
                    +30s
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

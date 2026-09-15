import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { playTimerCompletionSound } from '../utils/audio';

export const RestTimer: React.FC = () => {
  const [totalSeconds, setTotalSeconds] = useState(60);
  const [remainingSeconds, setRemainingSeconds] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && remainingSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (soundEnabled) {
              playTimerCompletionSound();
            }
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, remainingSeconds, soundEnabled]);

  const handleStartPreset = (seconds: number) => {
    setTotalSeconds(seconds);
    setRemainingSeconds(seconds);
    setIsActive(true);
  };

  const handleTogglePlay = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(totalSeconds);
      setIsActive(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setRemainingSeconds(totalSeconds);
  };

  const addTime = (delta: number) => {
    setRemainingSeconds(prev => Math.max(5, prev + delta));
    setTotalSeconds(prev => Math.max(5, prev + delta));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:right-6 sm:w-80 z-40">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-xl shadow-black/50 overflow-hidden transition-all">
        {/* Top Header Bar */}
        <div 
          onClick={() => setIsMinimized(!isMinimized)}
          className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between cursor-pointer select-none"
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
              className="p-1 text-slate-400 hover:text-white rounded"
              aria-label={isMinimized ? "Expandir" : "Recolher"}
            >
              {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Minimized Quick Bar */}
        {isMinimized ? (
          <div className="p-2.5 flex items-center justify-between">
            <span className="text-xl font-mono font-black text-white pl-2">
              {formatTime(remainingSeconds)}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={handleTogglePlay}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                  isActive ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isActive ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Full Expanded Timer Controls */
          <div className="p-3.5 space-y-3">
            {/* Display and Main Action */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tempo Restante</span>
                <span className={`text-3xl font-mono font-black tracking-tight ${remainingSeconds === 0 ? 'text-emerald-400 animate-pulse' : 'text-white'}`}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleTogglePlay}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white transition active:scale-95 shadow-md ${
                    isActive 
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-950' 
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950'
                  }`}
                  aria-label={isActive ? 'Pausar' : 'Iniciar'}
                >
                  {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={handleReset}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
                  title="Reiniciar"
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

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Intervalos Rápidos:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 45, 60, 90].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleStartPreset(sec)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      totalSeconds === sec && isActive
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/50 text-slate-300'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => addTime(-15)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px] font-medium transition"
                >
                  -15s
                </button>
                <button
                  onClick={() => addTime(15)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px] font-medium transition"
                >
                  +15s
                </button>
                <button
                  onClick={() => handleStartPreset(120)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition"
                >
                  120s
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

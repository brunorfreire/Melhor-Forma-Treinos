import React, { useState, useEffect } from 'react';
import { Type, Check, Sparkles } from 'lucide-react';
import {
  FontScaleLevel,
  FONT_SCALE_METADATA,
  getStoredFontScale,
  setFontScalePreference,
  cycleFontScale
} from '../../services/accessibilityPreferencesService';

interface AccessibilityTextSizeToggleProps {
  variant?: 'compact' | 'full';
  onShowFeedback?: (message: string) => void;
  className?: string;
}

export const AccessibilityTextSizeToggle: React.FC<AccessibilityTextSizeToggleProps> = ({
  variant = 'compact',
  onShowFeedback,
  className = ''
}) => {
  const [currentScale, setCurrentScale] = useState<FontScaleLevel>(() => getStoredFontScale());

  useEffect(() => {
    const handleScaleChanged = (e: Event) => {
      const custom = e as CustomEvent<{ scale: FontScaleLevel }>;
      if (custom.detail?.scale) {
        setCurrentScale(custom.detail.scale);
      }
    };

    window.addEventListener('mf:font-scale-changed', handleScaleChanged);
    return () => window.removeEventListener('mf:font-scale-changed', handleScaleChanged);
  }, []);

  const meta = FONT_SCALE_METADATA[currentScale];

  const handleCycle = () => {
    const next = cycleFontScale(currentScale);
    setFontScalePreference(next);
    setCurrentScale(next);
    const nextMeta = FONT_SCALE_METADATA[next];
    if (onShowFeedback) {
      onShowFeedback(nextMeta.toastMessage);
    }
  };

  const handleSetScale = (target: FontScaleLevel) => {
    if (target === currentScale) return;
    setFontScalePreference(target);
    setCurrentScale(target);
    const targetMeta = FONT_SCALE_METADATA[target];
    if (onShowFeedback) {
      onShowFeedback(targetMeta.toastMessage);
    }
  };

  // =========================================================================
  // VARIANTE 1: COMPACT (Topo da Home / Header ao lado do perfil)
  // =========================================================================
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleCycle}
        data-testid="accessibility-font-scale-btn"
        className={`min-h-[44px] min-w-[44px] sm:min-h-[38px] px-2.5 py-1.5 rounded-xl border flex items-center justify-center gap-1.5 transition active:scale-95 ${
          currentScale !== 'normal'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-black shadow-md shadow-emerald-950/40'
            : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
        } ${className}`}
        aria-label={`Acessibilidade: ${meta.label}. Toque para alternar o tamanho das letras.`}
        title={`Tamanho das letras: ${meta.label}. Toque para alternar entre Padrão, Maior e Muito Maior.`}
      >
        <Type className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-xs font-black tracking-tight font-mono">
          {meta.shortBadge}
        </span>
        {currentScale !== 'normal' && (
          <span className="hidden sm:inline text-[10px] text-emerald-300 font-bold">
            {currentScale === 'large' ? '+10%' : '+20%'}
          </span>
        )}
      </button>
    );
  }

  // =========================================================================
  // VARIANTE 2: FULL (Dentro do Menu Mais)
  // =========================================================================
  return (
    <div
      data-testid="accessibility-font-scale-full-panel"
      className={`bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <span>Tamanho das Letras</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                40+
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Ajuste o tamanho de leitura ideal para seus olhos
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-emerald-400 font-mono px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
          {meta.label}
        </span>
      </div>

      {/* Seletor Segmentado de 3 Estados (100% | 110% | 120%) */}
      <div className="grid grid-cols-3 gap-1.5 pt-0.5">
        {(['normal', 'large', 'xlarge'] as FontScaleLevel[]).map((lvl) => {
          const itemMeta = FONT_SCALE_METADATA[lvl];
          const isSelected = currentScale === lvl;
          return (
            <button
              key={lvl}
              type="button"
              onClick={() => handleSetScale(lvl)}
              data-testid={`font-scale-option-${lvl}`}
              aria-pressed={isSelected}
              className={`min-h-[46px] px-2 py-2 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-950/60'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold">
                  {lvl === 'normal' ? 'Padrão' : lvl === 'large' ? 'Maior' : 'Muito maior'}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isSelected ? 'text-emerald-100 font-bold' : 'text-slate-400'
                }`}
              >
                {itemMeta.percentage}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

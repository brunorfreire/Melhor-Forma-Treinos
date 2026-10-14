import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MelhorFormaLogo } from './MelhorFormaLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface PWAInstallBannerProps {
  className?: string;
}

/**
 * Faixa de Instalação Mobile (PWAInstallBanner)
 * Oferece uma chamada de instalação nativa e clara no mobile sem comprometer
 * o espaço restrito da linha do logotipo no cabeçalho nem causar overflow.
 */
export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const { isInstalled, isIOS, isInstallable, triggerNativePrompt } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showModalFromBanner, setShowModalFromBanner] = useState<boolean>(false);

  useEffect(() => {
    // Verificar se o usuário já dispensou temporariamente nesta sessão
    try {
      const dismissed = sessionStorage.getItem('mf_pwa_banner_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('mf_pwa_banner_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  // Se já estiver instalado em modo standalone ou tiver sido dispensado na sessão, oculta a faixa
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div
      className={`sm:hidden bg-gradient-to-r from-[#0A182F] via-[#0E2445] to-[#0A182F] border-b border-cyan-500/20 px-3 py-2 shadow-md relative z-30 transition-all ${className}`}
      role="banner"
      aria-label="Opção de instalação do aplicativo no celular"
    >
      <div className="flex items-center justify-between gap-2.5 max-w-7xl mx-auto">
        {/* Lado Esquerdo: Ícone Oficial e Texto de Chamada */}
        <div className="flex items-center gap-2.5 min-w-0">
          <MelhorFormaLogo size={32} className="shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-black text-white leading-tight truncate">
              Instalar Melhor Forma Play
            </span>
            <span className="text-[10px] text-cyan-300/90 font-medium leading-tight truncate">
              Treinos na sua tela inicial
            </span>
          </div>
        </div>

        {/* Lado Direito: Botão "Instalar App" e Botão Fechar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <PWAInstallButton
            variant="compact"
            showLabelOnMobile={true}
            className="!px-3 !py-1 !text-xs !bg-[#FF6B6B] !text-white !border-transparent hover:!bg-[#ff5252] shadow-sm shadow-[#FF6B6B]/30 font-bold"
          />

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition active:scale-95"
            aria-label="Dispensar aviso de instalação"
            title="Dispensar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallBanner;

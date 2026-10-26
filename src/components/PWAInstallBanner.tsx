import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  X, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  Copy, 
  Check, 
  HelpCircle 
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MelhorFormaLogo } from './MelhorFormaLogo';

interface PWAInstallBannerProps {
  className?: string;
}

const DISMISS_STORAGE_KEY = 'mf_pwa_banner_dismissed_v3';

/**
 * Banner Oficial de Instalação Mobile (PWA) do Melhor Forma Play 40+
 * 
 * Atende com prioridade total aos dispositivos móveis (320px, 360px, 375px, 390px, 412px):
 * 1. Posição dedicada logo abaixo do menu principal de navegação.
 * 2. Botão "Instalar" com área de toque mínima de 44px de altura, 100% visível e sem cortes.
 * 3. Botão "X" de fechar com área de toque mínima de 44x44px.
 * 4. Layout flexível com flex-wrap: em telas menores que 480px, empilha organizadamente
 *    o bloco de texto e a linha de ações (Instalar + Fechar), preenchendo a largura com segurança.
 * 5. Respeita as safe areas móveis (notch, barra superior e insets laterais).
 * 6. Suporte nativo ao evento 'beforeinstallprompt' e guia visual para iOS Safari / Pré-visualização.
 */
export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ className = '' }) => {
  const { 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isInIframe, 
    isInstallable, 
    triggerNativePrompt 
  } = usePWAInstall();

  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Ignora erro de acesso a storage
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    } catch {}
  };

  const handleInstallClick = async () => {
    // 1. Se o navegador capturou o evento nativo beforeinstallprompt
    if (isInstallable) {
      const outcome = await triggerNativePrompt();
      if (outcome === 'accepted') {
        setIsDismissed(true);
        try {
          sessionStorage.setItem(DISMISS_STORAGE_KEY, 'true');
        } catch {}
        return;
      }
      if (outcome === 'dismissed') {
        return;
      }
    }

    // 2. Se for iOS, Safari ou ambiente iframe onde o prompt automático não é disparado diretamente:
    setShowInstructionsModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(false);
    }
  };

  // Se o aplicativo já estiver instalado em modo standalone ou tiver sido fechado nesta sessão, não renderiza
  if (isInstalled || isDismissed) {
    return null;
  }

  // Verifica disponibilidade: evento nativo retido, iOS (onde o PWA é adicionado via Safari) ou ambiente de teste
  const isPromptAvailable = isInstallable || isIOS || isInIframe;
  if (!isPromptAvailable) {
    return null;
  }

  return (
    <>
      <aside
        className={`w-full bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-emerald-500/25 shadow-lg shadow-black/40 relative z-30 transition-all ${className}`}
        role="banner"
        aria-label="Opção de instalação do aplicativo no celular"
        style={{
          paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
          paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
        }}
      >
        <div className="max-w-7xl mx-auto py-2.5 sm:py-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
            {/* Bloco 1: Ícone do App + Título e Subtítulo Curtos */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-[200px] flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-950/40">
                <MelhorFormaLogo size={28} className="sm:w-8 sm:h-8 shrink-0" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight truncate">
                    Instalar Melhor Forma Play
                  </h2>
                  <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 shrink-0 leading-none">
                    40+
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-tight mt-0.5 truncate">
                  Treinos na sua tela inicial
                </p>
              </div>
            </div>

            {/* Bloco 2 & 3: Botão Principal "Instalar" + Botão de Fechar "X" */}
            <div className="flex items-center gap-2 w-full min-[460px]:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={handleInstallClick}
                className="min-h-[44px] flex-1 min-[460px]:flex-initial px-4 sm:px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-black text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer select-none"
                aria-label="Instalar Melhor Forma Play na tela inicial"
              >
                {isIOS ? (
                  <Smartphone className="w-4 h-4 shrink-0 stroke-[2.5]" />
                ) : (
                  <Download className="w-4 h-4 shrink-0 stroke-[2.5]" />
                )}
                <span>Instalar</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="min-h-[44px] min-w-[44px] p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition flex items-center justify-center active:scale-95 cursor-pointer shrink-0 border border-transparent hover:border-slate-700/60"
                aria-label="Fechar aviso de instalação"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal Guiado de Instalação (Disparado quando o navegador não aceita prompt nativo automático) */}
      {showInstructionsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowInstructionsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-[#0A182F] border border-emerald-500/30 p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))',
              paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
            }}
          >
            {/* Fechar */}
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 min-w-[44px] min-h-[44px] text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition flex items-center justify-center cursor-pointer"
              aria-label="Fechar janela de instruções"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-4 pr-8">
              <MelhorFormaLogo size={42} className="shrink-0" />
              <div>
                <h3 id="pwa-install-title" className="text-base font-black text-white leading-tight">
                  Instalar Melhor Forma Play
                </h3>
                <p className="text-xs text-emerald-400 font-medium mt-0.5">
                  Treinos na sua tela inicial
                </p>
              </div>
            </div>

            {/* Aviso especial quando em Pré-visualização / Iframe */}
            {isInIframe && (
              <div className="mb-4 bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <p className="font-bold text-amber-300">Ambiente de Pré-visualização</p>
                    <p className="mt-1 text-[11px] text-amber-200/90 leading-relaxed">
                      Por segurança dos navegadores, a instalação nativa é ativada ao abrir o endereço oficial no Safari ou Chrome do seu celular.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Guia Específico por Plataforma */}
            {isIOS ? (
              /* Passo a passo iOS Safari */
              <div className="bg-[#051322] border border-cyan-950/80 p-4 rounded-2xl space-y-3 mb-4 text-xs text-slate-200">
                <p className="text-emerald-300 font-bold text-xs">
                  Passo a passo no iPhone / iPad (Safari):
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span className="leading-snug">
                    No Safari, toque no ícone de <strong>Compartilhar</strong> (<Share2 className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />) na barra inferior.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="leading-snug">
                    Role as opções e toque em <strong>Adicionar à Tela de Início</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />).
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span className="leading-snug">
                    Toque em <strong>Adicionar</strong> no canto superior direito. Pronto! O app aparecerá na sua tela inicial.
                  </span>
                </div>
              </div>
            ) : isAndroid ? (
              /* Passo a passo Android Chrome */
              <div className="bg-[#051322] border border-cyan-950/80 p-4 rounded-2xl space-y-3 mb-4 text-xs text-slate-200">
                <p className="text-emerald-300 font-bold text-xs">
                  Passo a passo no Android (Google Chrome):
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span className="leading-snug">
                    Abra o site no navegador <strong>Google Chrome</strong>.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="leading-snug">
                    Toque no menu (<strong>⋮</strong> <MoreVertical className="w-3.5 h-3.5 inline text-emerald-300 mx-0.5" />) no canto superior direito.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span className="leading-snug">
                    Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </span>
                </div>
              </div>
            ) : (
              /* Passo a passo Desktop */
              <div className="bg-[#051322] border border-cyan-950/80 p-4 rounded-2xl space-y-3 mb-4 text-xs text-slate-200">
                <p className="text-emerald-300 font-bold text-xs">
                  No Computador (Chrome / Edge):
                </p>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span className="leading-snug">
                    Clique no ícone de <strong>Instalar</strong> no lado direito da barra de endereços do navegador.
                  </span>
                </div>
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Link copiado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar link para abrir no celular</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white transition active:scale-98 shadow-md shadow-emerald-950/40 cursor-pointer flex items-center justify-center"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;

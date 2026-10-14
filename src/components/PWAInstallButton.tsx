import React, { useState } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare, MoreVertical, Copy, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { MelhorFormaLogo } from './MelhorFormaLogo';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'compact' | 'full';
  showLabelOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  showLabelOnMobile = true,
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    triggerNativePrompt,
  } = usePWAInstall();

  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 1. Quando em modo standalone (já instalado e aberto como aplicativo nativo), oculta completamente
  if (isInstalled) {
    return null;
  }

  // 2. Ação de clique no botão "Instalar App"
  const handleInstallClick = async () => {
    // Se o evento nativo beforeinstallprompt foi capturado pelo navegador:
    if (isInstallable) {
      const outcome = await triggerNativePrompt();
      // Não fazemos falsas afirmações: apenas tratamos o aceite ou recusa nativa
      if (outcome === 'accepted') {
        console.log('[PWA] Usuário confirmou a instalação.');
        return;
      }
      if (outcome === 'dismissed') {
        console.log('[PWA] Usuário dispensou o prompt nativo.');
        return;
      }
    }

    // Se o evento nativo não estiver disponível (iOS, Safari, Preview do AI Studio, ou navegador sem prompt automático):
    setShowInstructionsModal(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(false);
    }
  };

  // Estilização responsiva do botão
  const isCompact = variant === 'compact';

  return (
    <>
      {/* Botão de Instalar App (Pill Ghost / Outline Oficial) */}
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#FF6B6B] border border-[#FF6B6B]/40 bg-white/5 hover:bg-[#FF6B6B]/15 hover:border-[#FF6B6B] hover:text-[#ff8585] active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap backdrop-blur-xs shrink-0 select-none ${className}`}
        aria-label="Instalar aplicativo Melhor Forma Play"
        title="Instalar Melhor Forma Play na tela inicial"
      >
        {isIOS ? (
          <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B6B] shrink-0" />
        ) : (
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B6B] shrink-0" />
        )}
        <span className="font-semibold tracking-tight">
          {showLabelOnMobile ? (
            <>
              <span className="inline sm:hidden">{isCompact ? 'Instalar' : 'Instalar App'}</span>
              <span className="hidden sm:inline">Instalar App</span>
            </>
          ) : (
            <span className="hidden sm:inline">Instalar App</span>
          )}
        </span>
      </button>

      {/* Modal Guiado de Instalação (Sem promessas falsas, orientações precisas por plataforma) */}
      {showInstructionsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setShowInstructionsModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-[#0A182F] border border-cyan-900/60 p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fechar */}
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho Oficial do Aplicativo */}
            <div className="flex items-center gap-3 mb-4">
              <MelhorFormaLogo size={42} />
              <div>
                <h3 id="pwa-install-title" className="text-base font-black text-white leading-tight">
                  Melhor Forma Play
                </h3>
                <p className="text-[11px] text-cyan-300 font-medium">
                  Instalar aplicativo oficial no celular
                </p>
              </div>
            </div>

            {/* Aviso especial quando visualizado no ambiente de Pré-visualização / Iframe */}
            {isInIframe && (
              <div className="mb-4 bg-amber-500/15 border border-amber-500/40 rounded-xl p-3 text-xs text-amber-200">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <p className="font-bold text-amber-300">Ambiente de Pré-visualização</p>
                    <p className="mt-1 text-[11px] text-amber-200/90">
                      Por segurança dos navegadores, a instalação automática só é executada ao acessar o site publicado via HTTPS diretamente no Chrome ou Safari do seu celular.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Guia Específico por Plataforma */}
            {isIOS ? (
              /* ================= iOS Safari ================= */
              <div className="bg-[#051322] border border-cyan-950 p-4 rounded-xl space-y-3 mb-4 text-xs text-slate-200">
                <p className="text-cyan-300 font-bold text-xs">
                  Passo a passo no iPhone / iPad (Safari):
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/25 text-[#FF8E8E] font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span className="leading-snug">
                    No Safari, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta <Share2 className="w-3.5 h-3.5 inline text-[#FF8E8E] mx-0.5" />) na barra inferior.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/25 text-[#FF8E8E] font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="leading-snug">
                    Role a folha de opções e toque em <strong>Adicionar à Tela de Início</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-[#FF8E8E] mx-0.5" />).
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/25 text-[#FF8E8E] font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span className="leading-snug">
                    Confirme tocando em <strong>Adicionar</strong> no canto superior direito. O ícone oficial aparecerá na tela do seu iPhone!
                  </span>
                </div>
              </div>
            ) : isAndroid ? (
              /* ================= Android Chrome ================= */
              <div className="bg-[#051322] border border-cyan-950 p-4 rounded-xl space-y-3 mb-4 text-xs text-slate-200">
                <p className="text-cyan-300 font-bold text-xs">
                  Passo a passo no Android (Google Chrome):
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span className="leading-snug">
                    Abra o site no navegador <strong>Google Chrome</strong> oficial.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="leading-snug">
                    Toque no menu de três pontinhos (<strong>⋮</strong> <MoreVertical className="w-3.5 h-3.5 inline text-cyan-300 mx-0.5" />) no canto superior direito do Chrome.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/25 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span className="leading-snug">
                    Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
                  💡 <em>Se você abriu o link dentro do WhatsApp ou Instagram, toque nos três pontinhos e selecione <strong>"Abrir no Chrome"</strong> primeiro.</em>
                </p>
              </div>
            ) : (
              /* ================= Desktop / Computador ================= */
              <div className="bg-[#051322] border border-cyan-950 p-4 rounded-xl space-y-3 mb-4 text-xs text-slate-200">
                <p className="text-cyan-300 font-bold text-xs">
                  Instalação no Computador (Chrome / Edge):
                </p>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span className="leading-snug">
                    Observe a barra de endereços do seu navegador (onde fica a URL do site).
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span className="leading-snug">
                    Clique no ícone de <strong>Instalar</strong> (monitor com seta para baixo) no lado direito da barra de endereços.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span className="leading-snug">
                    Ou acerte pelo menu do Chrome: <strong>⋮ &gt; Salvar e compartilhar &gt; Instalar Melhor Forma Play</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Ações: Copiar Link e Fechar */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition active:scale-98"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Link copiado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copiar link do app para abrir no celular</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition active:scale-98 shadow-md shadow-emerald-950/40"
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

export default PWAInstallButton;

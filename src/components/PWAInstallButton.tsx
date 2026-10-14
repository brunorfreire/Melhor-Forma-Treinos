import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';

// Tipagem para o evento nativo BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Detectar se o aplicativo já está instalado / rodando em tela cheia (standalone)
    const checkStandalone = () => {
      const isMediaStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      return isMediaStandalone || isNavigatorStandalone;
    };

    setIsStandalone(checkStandalone());

    // 2. Detectar se é dispositivo iOS (iPhone, iPad, iPod)
    const checkIsIOS = () => {
      const ua = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(ua);
    };

    setIsIOS(checkIsIOS());

    // 3. Capturar o evento nativo de instalação no Android/Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Evita a barra padrão automática
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. Ouvir evento de app instalado com sucesso
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Se o aplicativo já estiver instalado e aberto em modo standalone, oculta o botão
  if (isStandalone) {
    return null;
  }

  // Handler de clique do botão
  const handleInstallClick = async () => {
    if (isIOS) {
      // No iOS, abre o modal instrutivo
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      // No Android/Chrome, dispara a caixa de diálogo nativa
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    } else {
      // Caso o navegador não suporte o evento automático ou ainda não tenha disparado
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Botão de Instalação Estilo Pill / Ghost Outline */}
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-[#FF6B6B] border border-[#FF6B6B]/40 bg-white/5 hover:bg-[#FF6B6B]/15 hover:border-[#FF6B6B] hover:text-[#ff8585] active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap backdrop-blur-xs ${className}`}
        aria-label="Instalar Guia 7 Passos no celular"
      >
        {isIOS ? (
          <Smartphone className="w-4 h-4 text-[#FF6B6B] shrink-0" />
        ) : (
          <Download className="w-4 h-4 text-[#FF6B6B] shrink-0" />
        )}
        <span>Instalar App</span>
      </button>

      {/* Modal Amigável de Instruções para iPhone / iPad (iOS Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0A2540] border border-cyan-900/60 p-6 shadow-2xl text-slate-100 relative">
            {/* Botão de Fechar */}
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#FF6B6B] flex items-center justify-center text-white shadow-md shadow-[#FF6B6B]/30 font-black text-xl shrink-0">
                7
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">
                  Guia 7 Passos - Menopausa
                </h3>
                <p className="text-[11px] text-coral-200 text-[#FF8E8E]">
                  Instalar no seu celular
                </p>
              </div>
            </div>

            {/* Mensagem Principal */}
            <div className="bg-[#051322] border border-cyan-950 p-4 rounded-xl space-y-3 mb-5 text-xs text-slate-200">
              <p className="text-slate-300 font-medium">
                Para instalar no iPhone:
              </p>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/25 text-[#FF8E8E] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <span className="leading-snug">
                  Toque no ícone de <strong>Compartilhar</strong> (quadrado com seta para cima <Share2 className="w-3.5 h-3.5 inline text-[#FF8E8E] mx-0.5" />) na barra inferior do Safari.
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/25 text-[#FF8E8E] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <span className="leading-snug">
                  Role a lista e selecione <strong>Adicionar à Tela de Início</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-[#FF8E8E] mx-0.5" />).
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FF6B6B]/25 text-[#FF8E8E] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <span className="leading-snug">
                  Toque em <strong>Adicionar</strong> no canto superior direito. Pronto!
                </span>
              </div>
            </div>

            {/* Botão de Fechar Modal */}
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition active:scale-98"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;

import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __mfDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

/**
 * Detecção precisa do modo Standalone (PWA instalado e aberto como aplicativo).
 * Segue estritamente a especificação W3C e a detecção de iOS Safari:
 * - window.matchMedia('(display-mode: standalone)').matches
 * - window.matchMedia('(display-mode: minimal-ui)').matches
 * - navigator.standalone === true (iOS Safari)
 * 
 * Evita falsos positivos:
 * - NÃO utiliza document.referrer
 * - NÃO assume que tela cheia (fullscreen) é PWA
 */
export const checkIsStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Padrão W3C oficial para PWA rodando em modo independente
    const isStandaloneMQ = window.matchMedia('(display-mode: standalone)').matches;

    // 2. Modo Minimal-UI (utilizado por alguns navegadores móveis para PWA)
    const isMinimalUIMQ = window.matchMedia('(display-mode: minimal-ui)').matches;

    // 3. Comportamento específico do iOS Safari quando instalado na Tela de Início
    const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean })?.standalone === true;

    return isStandaloneMQ || isMinimalUIMQ || isIOSStandalone;
  } catch (err) {
    console.warn('[PWA] Erro ao verificar modo standalone:', err);
    return false;
  }
};

// Armazenamento em memória do evento 'beforeinstallprompt'
let globalDeferredPrompt: BeforeInstallPromptEvent | null = 
  (typeof window !== 'undefined' && window.__mfDeferredPrompt) || null;

const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();
const installListeners = new Set<(isInstalled: boolean) => void>();

const updatePromptState = (prompt: BeforeInstallPromptEvent | null) => {
  if (globalDeferredPrompt === prompt) return;
  globalDeferredPrompt = prompt;
  if (typeof window !== 'undefined') {
    window.__mfDeferredPrompt = prompt;
  }
  promptListeners.forEach((listener) => listener(prompt));
};

// Registra listeners globais uma única vez no escopo do módulo
if (typeof window !== 'undefined') {
  // Sincroniza se o script do index.html já capturou antes do bundle
  if (window.__mfDeferredPrompt && !globalDeferredPrompt) {
    globalDeferredPrompt = window.__mfDeferredPrompt;
  }

  // Captura do evento customizado emitido pelo script inline do index.html
  window.addEventListener('mf:beforeinstallprompt', ((e: CustomEvent<BeforeInstallPromptEvent>) => {
    if (e.detail) {
      updatePromptState(e.detail);
    }
  }) as EventListener);

  // Listener nativo padrão caso o evento dispare após o carregamento do bundle
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    updatePromptState(e as BeforeInstallPromptEvent);
  });

  // Confirmação nativa de instalação concluída pelo sistema operacional
  window.addEventListener('appinstalled', () => {
    updatePromptState(null);
    installListeners.forEach((listener) => listener(true));
  });

  // Monitora alterações dinâmicas de display-mode
  try {
    const mq = window.matchMedia('(display-mode: standalone)');
    const handleMQChange = (e: MediaQueryListEvent) => {
      installListeners.forEach((listener) => listener(e.matches));
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handleMQChange);
    } else if ('addListener' in mq) {
      (mq as any).addListener(handleMQChange);
    }
  } catch {
    // Ignora em ambientes sem suporte
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    () => globalDeferredPrompt || (typeof window !== 'undefined' ? window.__mfDeferredPrompt || null : null)
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => checkIsStandalone());
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    // Sincroniza estados
    setDeferredPrompt(globalDeferredPrompt || (typeof window !== 'undefined' ? window.__mfDeferredPrompt || null : null));
    setIsInstalled(checkIsStandalone());

    const handlePromptChange = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
    };

    const handleInstallChange = (installed: boolean) => {
      setIsInstalled(installed);
    };

    promptListeners.add(handlePromptChange);
    installListeners.add(handleInstallChange);

    // Identificação de plataforma
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(ua));
      setIsAndroid(/android/.test(ua));
    }

    // Detecção segura de ambiente iframe (ex: preview do AI Studio)
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }

    return () => {
      promptListeners.delete(handlePromptChange);
      installListeners.delete(handleInstallChange);
    };
  }, []);

  /**
   * Dispara o prompt nativo oficial do navegador retido em memória.
   * Não afirma que a instalação ocorreu sem confirmação real do usuário.
   */
  const triggerNativePrompt = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const promptEvent = deferredPrompt || globalDeferredPrompt || (typeof window !== 'undefined' ? window.__mfDeferredPrompt : null);
    if (!promptEvent) {
      return 'unavailable';
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      // Limpa a retenção do evento imediatamente (Chromium só aceita um disparo por evento)
      updatePromptState(null);
      setDeferredPrompt(null);

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        installListeners.forEach((fn) => fn(true));
        return 'accepted';
      } else {
        // Usuário dispensou: não simulamos conclusão
        return 'dismissed';
      }
    } catch (err) {
      console.warn('[PWA] Erro ao disparar prompt nativo:', err);
      updatePromptState(null);
      setDeferredPrompt(null);
      return 'unavailable';
    }
  };

  return {
    isInstallable: !!(deferredPrompt || globalDeferredPrompt),
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    triggerNativePrompt,
    deferredPrompt: deferredPrompt || globalDeferredPrompt,
  };
}

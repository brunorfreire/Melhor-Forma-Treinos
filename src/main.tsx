import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initFontScaleFromStorage } from './services/accessibilityPreferencesService';

// Inicializa imediatamente a preferência de tamanho de fonte salva pelo aluno
initFontScaleFromStorage();

// Registra o Service Worker com proteção contra sandboxed iframes
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    import('virtual:pwa-register').then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onNeedRefresh() {
          console.log('[PWA] Nova versão disponível.');
        },
        onOfflineReady() {
          console.log('[PWA] Pronto para funcionamento offline.');
        },
      });
    }).catch((err) => {
      console.warn('[PWA] Service worker registration ignored:', err);
    });
  } catch (err) {
    console.warn('[PWA] Service worker not available in sandbox:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

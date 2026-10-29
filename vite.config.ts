import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'favicon-32x32.png',
          'apple-touch-icon.png',
          'icon.svg',
          'icon-192.png',
          'icon-512.png',
          'icon-maskable-512.png',
        ],
        manifest: {
          id: '/',
          name: 'Melhor Forma Play',
          short_name: 'MF Play',
          description: 'Plataforma oficial de treinos sob demanda, longevidade e força para a vida 40+.',
          theme_color: '#0A182F',
          background_color: '#0A182F',
          display: 'standalone',
          start_url: './?source=pwa',
          scope: './',
          icons: [
            {
              src: './favicon-32x32.png',
              sizes: '32x32',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: './icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: './icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: './icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        },
        devOptions: {
          enabled: false,
        },
      }),
      {
        name: 'exercise-media-protection',
        configureServer(server) {
          const PUBLIC_APPROVED = [
            'agachamento-sumo-halter',
            'elevacao-pelvica-unilateral',
            'flexao-braco-inclinada',
            'remada-curvada-halteres',
            'subida-step-degrau'
          ];
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.startsWith('/exercises/')) {
              const file = req.url.replace(/^\/exercises\//, '').split('?')[0];
              const baseName = file.replace(/\.[^.]+$/, '');
              if (!PUBLIC_APPROVED.includes(baseName)) {
                const auth = req.headers['authorization'];
                if (!auth || !auth.startsWith('Bearer ')) {
                  res.statusCode = 403;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    error: 'ACCESS_DENIED',
                    message: 'Mídia exclusiva Premium protegida contra acesso público'
                  }));
                  return;
                }
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

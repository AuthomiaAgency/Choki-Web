import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Choki - Chocotejas y Dulces Artesanales',
          short_name: 'Choki',
          description: 'Descubre las mejores chocotejas y dulces artesanales. Calidad premium y sabor inigualable.',
          theme_color: '#f59e0b',
          background_color: '#0a0a0a',
          display: 'standalone',
          orientation: 'portrait',
          categories: ['shopping', 'food'],
          icons: [
            {
              src: 'https://copilot.microsoft.com/th/id/BCO.0422c8a8-09b8-4328-bec7-f147697257f1.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'https://copilot.microsoft.com/th/id/BCO.0422c8a8-09b8-4328-bec7-f147697257f1.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

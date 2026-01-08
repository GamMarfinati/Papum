import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');
    
    // Fallback to process.env if variables are not in the .env file (common in Railway/Vercel)
    const SUPABASE_URL = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
          manifest: {
            name: 'PaPum - Divisor de Contas',
            short_name: 'PaPum',
            description: 'Divisão de contas justa e simplificada.',
            theme_color: '#059669',
            icons: [
              {
                src: 'icon-192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'icon-512.png',
                sizes: '512x512',
                type: 'image/png'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

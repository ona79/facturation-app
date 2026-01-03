import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cette ligne permet de charger les variables du fichier .env
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Le proxy est actif UNIQUEMENT en développement local
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // On définit process.env pour éviter des erreurs avec certaines bibliothèques
    define: {
      'process.env': env,
    },
  };
});
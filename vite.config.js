import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stringPlugin from 'vite-plugin-string'; // use default import

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === 'worker';

  return {
    plugins: [
      !isWorkerBuild && react(),
      isWorkerBuild && stringPlugin()
    ].filter(Boolean),
    build: isWorkerBuild
      ? {
          target: 'esnext',
          outDir: 'dist',
          lib: {
            entry: 'src/worker.js',
            formats: ['es'],
            fileName: () => 'worker.js'
          },
          rollupOptions: {
            external: [],
          }
        }
      : {}
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from 'vite-plugin-yaml2';

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === 'worker';

  return {
    plugins: [
      react(),
      isWorkerBuild && yaml()
    ].filter(Boolean),
    build: isWorkerBuild
      ? {
          target: 'esnext',
          outDir: 'dist',
          lib: {
            entry: 'index.mjs',
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

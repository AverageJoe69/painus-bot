import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { string } from 'vite-plugin-string'; // ✅ this line is valid

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === 'worker';

  return {
    plugins: [
      !isWorkerBuild && react(),
      isWorkerBuild && string() // ✅ Enables YAML loading as raw string
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

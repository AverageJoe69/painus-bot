import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stringPlugin from 'vite-plugin-string'; // <— THIS IS CORRECT

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === 'worker';

  return {
    plugins: [
      !isWorkerBuild && react(),
      isWorkerBuild &&
        stringPlugin({
          include: ["**/*.yaml", "**/*.yml"],
        })
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

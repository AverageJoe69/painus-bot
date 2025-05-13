import { defineConfig } from 'vite';
import yaml from 'vite-plugin-yaml2';

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === 'worker';

  return {
    plugins: [isWorkerBuild && yaml()].filter(Boolean),
    build: isWorkerBuild
      ? {
          target: 'esnext',
          outDir: 'dist',
          minify: false, // 👈 DO NOT STRIP LOGS
          lib: {
            entry: 'src/worker.js',
            formats: ['es'],
            fileName: () => 'worker.js'
          },
          rollupOptions: {
            external: []
          }
        }
      : {}
  };
});

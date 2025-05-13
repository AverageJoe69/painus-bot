import { defineConfig } from 'vite';
import stringPlugin from 'vite-plugin-string';

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === 'worker';

  return {
    plugins: [
      isWorkerBuild && stringPlugin({
        include: ['**/*.yaml'], // tell it what files to load
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
        }
      : {}
  };
});

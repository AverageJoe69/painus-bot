import { defineConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const isWorkerBuild = process.env.BUILD_TARGET === "worker";

  return {
    build: isWorkerBuild
      ? {
          target: "esnext",
          outDir: "dist",
          lib: {
            entry: "src/worker.js",
            formats: ["es"],
            fileName: () => "worker.js"
          },
          rollupOptions: {
            external: [],
          },
        }
      : {}
  };
});
